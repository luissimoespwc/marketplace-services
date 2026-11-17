export interface Principal {
  readonly id: string;
  readonly displayName: string;
}

// Fixed identity for local development only. Configuration validation
// rejects AUTH_MODE=dev-stub when NODE_ENV is production.
export const DEV_PRINCIPAL: Principal = {
  id: 'dev-user',
  displayName: 'Dev User',
};
