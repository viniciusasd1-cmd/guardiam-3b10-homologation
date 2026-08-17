import * as SecureStore from 'expo-secure-store';

export type SosQueueStatus = 'PENDING' | 'SENDING' | 'CONFIRMED' | 'FAILED';

export type SosQueueEvent = {
  eventId: string;
  safeTripId: string;
  createdAt: string;
  status: SosQueueStatus;
  lastAttemptAt: string | null;
  attemptCount: number;
  payload: {
    triggerType: 'MANUAL';
    message: string;
  };
  confirmedAt: string | null;
};

const KEY_PREFIX = 'xguardiam.sos.queue.';
const locks = new Map<string, Promise<void>>();

export async function loadPendingSos(safeTripId: string): Promise<SosQueueEvent | null> {
  return withLock(safeTripId, async () => {
    const stored = await SecureStore.getItemAsync(getKey(safeTripId));

    if (!stored) return null;

    try {
      const event = JSON.parse(stored) as SosQueueEvent;

      if (event.safeTripId !== safeTripId || event.status === 'CONFIRMED') {
        return null;
      }

      if (event.status === 'SENDING') {
        event.status = 'PENDING';
        await save(event);
      }

      return event;
    } catch {
      await SecureStore.deleteItemAsync(getKey(safeTripId));
      return null;
    }
  });
}

export async function createOrLoadSos(
  safeTripId: string,
  eventId: string,
): Promise<SosQueueEvent> {
  return withLock(safeTripId, async () => {
    const existing = await read(safeTripId);
    if (existing?.status === 'PENDING' || existing?.status === 'SENDING' || existing?.status === 'FAILED') {
      return existing;
    }

    if (existing?.status === 'CONFIRMED') {
      const cleaned = await cleanupConfirmedSos(safeTripId);
      if (!cleaned) {
        throw new Error('O alerta confirmado ainda está sendo finalizado. Tente novamente.');
      }
    }

    const event: SosQueueEvent = {
      eventId,
      safeTripId,
      createdAt: new Date().toISOString(),
      status: 'PENDING',
      lastAttemptAt: null,
      attemptCount: 0,
      payload: {
        triggerType: 'MANUAL',
        message: 'Alerta silencioso acionado pelo app',
      },
      confirmedAt: null,
    };

    await save(event);
    return event;
  });
}

export async function markSosSending(event: SosQueueEvent): Promise<SosQueueEvent | null> {
  return withLock(event.safeTripId, async () => {
    const current = await read(event.safeTripId);
    if (!current || current.eventId !== event.eventId) return null;

    if (
      current.status === 'SENDING' &&
      current.lastAttemptAt &&
      Date.now() - Date.parse(current.lastAttemptAt) < 60_000
    ) {
      return null;
    }

    const next: SosQueueEvent = {
      ...current,
      status: 'SENDING',
      lastAttemptAt: new Date().toISOString(),
      attemptCount: event.attemptCount + 1,
    };
    await save(next);
    return next;
  });
}

export async function markSosPending(event: SosQueueEvent): Promise<void> {
  await withLock(event.safeTripId, async () => {
    await save({ ...event, status: 'PENDING' });
  });
}

export async function markSosConfirmed(event: SosQueueEvent): Promise<void> {
  await withLock(event.safeTripId, async () => {
    await save({
      ...event,
      status: 'CONFIRMED',
      confirmedAt: new Date().toISOString(),
    });
    await cleanupConfirmedSos(event.safeTripId);
  });
}

async function cleanupConfirmedSos(safeTripId: string): Promise<boolean> {
  try {
    await SecureStore.deleteItemAsync(getKey(safeTripId));
    return true;
  } catch {
    console.warn('[SOS_QUEUE_CLEANUP_FAILED]');
    return false;
  }
}

async function read(safeTripId: string): Promise<SosQueueEvent | null> {
  const stored = await SecureStore.getItemAsync(getKey(safeTripId));
  if (!stored) return null;

  try {
    return JSON.parse(stored) as SosQueueEvent;
  } catch {
    await SecureStore.deleteItemAsync(getKey(safeTripId));
    return null;
  }
}

async function save(event: SosQueueEvent): Promise<void> {
  await SecureStore.setItemAsync(getKey(event.safeTripId), JSON.stringify(event));
}

function getKey(safeTripId: string): string {
  return `${KEY_PREFIX}${safeTripId}`;
}

async function withLock<T>(safeTripId: string, operation: () => Promise<T>): Promise<T> {
  const previous = locks.get(safeTripId) ?? Promise.resolve();
  let release!: () => void;
  const current = new Promise<void>((resolve) => { release = resolve; });
  locks.set(safeTripId, current);

  await previous;
  try {
    return await operation();
  } finally {
    release();
    if (locks.get(safeTripId) === current) locks.delete(safeTripId);
  }
}
