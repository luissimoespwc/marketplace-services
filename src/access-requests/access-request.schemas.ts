import { z } from 'zod';
import type { AccessRequestStatus } from './access-request.status.js';

export const createAccessRequestSchema = z.strictObject({
  dataProductUrn: z.string().trim().min(1).max(256),
  justification: z.string().trim().min(1).max(2_000),
});

export type CreateAccessRequestDto = z.infer<typeof createAccessRequestSchema>;

export const accessRequestIdSchema = z.uuid();

export interface AccessRequestResponse {
  id: string;
  dataProductUrn: string;
  justification: string;
  status: AccessRequestStatus;
  requestedBy: string;
  createdAt: string;
}
