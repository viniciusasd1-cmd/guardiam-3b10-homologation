export type GuardianProtectionStatus = 'INACTIVE' | 'ACTIVE' | 'ALERTED' | 'ENDED';

export type GuardianControllerDependencies = {
  getProtectionStatus: () => GuardianProtectionStatus;
  startProtection: () => Promise<void>;
  stopProtection: () => Promise<void>;
  requestSOS: () => Promise<void>;
};

/**
 * Stable orchestration contract for internal and future native Guardian triggers.
 * SOS creation, queueing, retry and transport remain owned by the existing flow.
 */
export class GuardianController {
  constructor(private readonly dependencies: GuardianControllerDependencies) {}

  getProtectionStatus(): GuardianProtectionStatus {
    return this.dependencies.getProtectionStatus();
  }

  startProtection(): Promise<void> {
    return this.dependencies.startProtection();
  }

  stopProtection(): Promise<void> {
    return this.dependencies.stopProtection();
  }

  requestSOS(): Promise<void> {
    return this.dependencies.requestSOS();
  }
}
