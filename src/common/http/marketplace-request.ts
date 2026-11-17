import type { Request } from 'express';
import type { Principal } from '../auth/principal.js';

export interface MarketplaceRequest extends Request {
  requestId?: string;
  principal?: Principal;
}
