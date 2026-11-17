import {
  AccessRequestStatus,
  assertTransition,
  canTransition,
  InvalidAccessRequestTransitionError,
} from './access-request.status.js';

describe('access request status transitions', () => {
  it.each([
    [AccessRequestStatus.Submitted, AccessRequestStatus.Approved],
    [AccessRequestStatus.Submitted, AccessRequestStatus.Rejected],
    [AccessRequestStatus.Submitted, AccessRequestStatus.Cancelled],
    [AccessRequestStatus.Approved, AccessRequestStatus.Provisioning],
    [AccessRequestStatus.Provisioning, AccessRequestStatus.Provisioned],
    [AccessRequestStatus.Provisioning, AccessRequestStatus.ProvisioningFailed],
    [AccessRequestStatus.ProvisioningFailed, AccessRequestStatus.Provisioning],
  ])('allows %s -> %s', (from, to) => {
    expect(canTransition(from, to)).toBe(true);
    expect(() => assertTransition(from, to)).not.toThrow();
  });

  it.each([
    [AccessRequestStatus.Submitted, AccessRequestStatus.Provisioned],
    [AccessRequestStatus.Approved, AccessRequestStatus.Provisioned],
    [AccessRequestStatus.Provisioned, AccessRequestStatus.Cancelled],
    [AccessRequestStatus.Rejected, AccessRequestStatus.Approved],
  ])('rejects %s -> %s', (from, to) => {
    expect(canTransition(from, to)).toBe(false);
    expect(() => assertTransition(from, to)).toThrow(
      InvalidAccessRequestTransitionError,
    );
  });
});
