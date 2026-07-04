import { apiRequest, unwrapData } from './apiClient';
import {
  CreateTrustedContactInput,
  TrustedContact,
} from '../types/trustedContact';

type ListResponse = {
  status: string;
  resource: string;
  data: TrustedContact[];
};

type SingleResponse = {
  status: string;
  resource: string;
  data: TrustedContact;
};

export async function listTrustedContacts(token: string) {
  const response = await apiRequest<ListResponse>('/trusted-contacts', {
    token,
  });
  return unwrapData(response);
}

export async function createTrustedContact(
  token: string,
  input: CreateTrustedContactInput,
) {
  const response = await apiRequest<SingleResponse>('/trusted-contacts', {
    method: 'POST',
    token,
    body: {
      ...input,
      canReceiveAlerts: input.canReceiveAlerts ?? true,
    },
  });
  return unwrapData(response);
}
