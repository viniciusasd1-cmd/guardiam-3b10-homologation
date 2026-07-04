export type TrustedContactRelationship =
  | 'FAMILY'
  | 'FRIEND'
  | 'COMPANY'
  | 'HOTEL'
  | 'OTHER';

export type TrustedContact = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  relationship: TrustedContactRelationship;
  priority: number;
  canReceiveLocation: boolean;
  canReceiveAlerts: boolean;
  canReceiveEvidenceLinks: boolean;
  status: string;
};

export type CreateTrustedContactInput = {
  name: string;
  phone: string;
  email?: string;
  relationship?: TrustedContactRelationship;
  canReceiveAlerts?: boolean;
};
