import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  DataHubAdapterError,
  toDataHubClientError,
} from '../../integrations/datahub/datahub.errors.js';
import type { MarketplaceRequest } from '../http/marketplace-request.js';

interface ErrorBody {
  statusCode: number;
  error: string;
  message: string | string[];
  requestId: string | null;
}

function isHealthCheckBody(body: unknown): boolean {
  if (typeof body !== 'object' || body === null) {
    return false;
  }
  const candidate = body as {
    status?: unknown;
    details?: unknown;
    info?: unknown;
  };
  return (
    (candidate.status === 'error' || candidate.status === 'shutting_down') &&
    typeof candidate.details === 'object' &&
    candidate.details !== null &&
    typeof candidate.info === 'object' &&
    candidate.info !== null
  );
}

function statusText(statusCode: number): string {
  const name = HttpStatus[statusCode];
  if (typeof name !== 'string') {
    return 'Error';
  }
  return name
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function normalizeMessage(
  message: unknown,
  fallback: string,
): string | string[] {
  if (typeof message === 'string') {
    return message;
  }
  if (
    Array.isArray(message) &&
    message.every((item) => typeof item === 'string')
  ) {
    return message;
  }
  return fallback;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<MarketplaceRequest>();
    const requestId = request.requestId ?? null;

    if (exception instanceof DataHubAdapterError) {
      if (exception.kind !== 'NotFound') {
        this.logger.warn(`DataHub adapter returned ${exception.kind}`);
      }
      const mapped = toDataHubClientError(exception);
      response.status(mapped.statusCode).json({ ...mapped, requestId });
      return;
    }

    if (exception instanceof HttpException) {
      const responseBody = exception.getResponse();
      // Terminus already chooses the status and payload for a failed probe.
      if (isHealthCheckBody(responseBody)) {
        response.status(exception.getStatus()).json(responseBody);
        return;
      }

      const statusCode = exception.getStatus();
      const message =
        typeof responseBody === 'string'
          ? responseBody
          : normalizeMessage(
              (responseBody as { message?: unknown }).message,
              exception.message,
            );
      const body: ErrorBody = {
        statusCode,
        error: statusText(statusCode),
        message,
        requestId,
      };
      response.status(statusCode).json(body);
      return;
    }

    this.logger.error(
      exception instanceof Error ? exception.stack : 'Unhandled exception',
    );
    const body: ErrorBody = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'Internal server error',
      requestId,
    };
    response.status(body.statusCode).json(body);
  }
}
