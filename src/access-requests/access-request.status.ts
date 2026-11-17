export const AccessRequestStatus = {
  Submitted: 'SUBMITTED',
  Approved: 'APPROVED',
  Rejected: 'REJECTED',
  Cancelled: 'CANCELLED',
  Provisioning: 'PROVISIONING',
  Provisioned: 'PROVISIONED',
  ProvisioningFailed: 'PROVISIONING_FAILED',
} as const;

export type AccessRequestStatus =
  (typeof AccessRequestStatus)[keyof typeof AccessRequestStatus];

// PROVISIONED is only reachable from PROVISIONING. Approval alone is not
// treated as access granted.
const allowedTransitions: Record<
  AccessRequestStatus,
  readonly AccessRequestStatus[]
> = {
  SUBMITTED: [
    AccessRequestStatus.Approved,
    AccessRequestStatus.Rejected,
    AccessRequestStatus.Cancelled,
  ],
  APPROVED: [AccessRequestStatus.Provisioning, AccessRequestStatus.Cancelled],
  REJECTED: [],
  CANCELLED: [],
  PROVISIONING: [
    AccessRequestStatus.Provisioned,
    AccessRequestStatus.ProvisioningFailed,
  ],
  PROVISIONED: [],
  PROVISIONING_FAILED: [AccessRequestStatus.Provisioning],
};

export class InvalidAccessRequestTransitionError extends Error {
  readonly from: AccessRequestStatus;
  readonly to: AccessRequestStatus;

  constructor(from: AccessRequestStatus, to: AccessRequestStatus) {
    super(`Cannot transition access request from ${from} to ${to}`);
    this.name = 'InvalidAccessRequestTransitionError';
    this.from = from;
    this.to = to;
  }
}

export function canTransition(
  from: AccessRequestStatus,
  to: AccessRequestStatus,
): boolean {
  return allowedTransitions[from].includes(to);
}

export function assertTransition(
  from: AccessRequestStatus,
  to: AccessRequestStatus,
): void {
  if (!canTransition(from, to)) {
    throw new InvalidAccessRequestTransitionError(from, to);
  }
}
