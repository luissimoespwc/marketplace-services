import { HttpStatus } from '@nestjs/common';

export type DataHubErrorKind =
  'NotFound' | 'Unavailable' | 'Timeout' | 'Unauthorized';

export class DataHubAdapterError extends Error {
  readonly kind: DataHubErrorKind;

  constructor(kind: DataHubErrorKind, message: string) {
    super(message);
    this.name = 'DataHubAdapterError';
    this.kind = kind;
  }
}

export interface DataHubClientError {
  statusCode: number;
  error: string;
  message: string;
}

// Client messages are fixed. Adapter messages can contain downstream URLs
// or credential failures and must not be returned.
export function toDataHubClientError(
  error: DataHubAdapterError,
): DataHubClientError {
  switch (error.kind) {
    case 'NotFound':
      return {
        statusCode: HttpStatus.NOT_FOUND,
        error: 'Not Found',
        message: 'Data product not found',
      };
    case 'Timeout':
      return {
        statusCode: HttpStatus.GATEWAY_TIMEOUT,
        error: 'Gateway Timeout',
        message: 'DataHub request timed out',
      };
    case 'Unavailable':
    case 'Unauthorized':
      return {
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        error: 'Service Unavailable',
        message: 'DataHub is unavailable',
      };
    default: {
      const unsupported: never = error.kind;
      return {
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        error: 'Service Unavailable',
        message: `DataHub is unavailable (${String(unsupported)})`,
      };
    }
  }
}
