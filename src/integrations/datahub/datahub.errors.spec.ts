import { DataHubAdapterError, toDataHubClientError } from './datahub.errors.js';

describe('toDataHubClientError', () => {
  it('maps each adapter error kind to a stable client error', () => {
    expect(
      toDataHubClientError(new DataHubAdapterError('NotFound', 'secret urn')),
    ).toEqual({
      statusCode: 404,
      error: 'Not Found',
      message: 'Data product not found',
    });
    expect(
      toDataHubClientError(new DataHubAdapterError('Timeout', 'token=secret')),
    ).toEqual({
      statusCode: 504,
      error: 'Gateway Timeout',
      message: 'DataHub request timed out',
    });
    expect(
      toDataHubClientError(
        new DataHubAdapterError('Unavailable', 'connection reset'),
      ),
    ).toEqual({
      statusCode: 503,
      error: 'Service Unavailable',
      message: 'DataHub is unavailable',
    });
    expect(
      toDataHubClientError(
        new DataHubAdapterError('Unauthorized', 'token=secret'),
      ),
    ).toEqual({
      statusCode: 503,
      error: 'Service Unavailable',
      message: 'DataHub is unavailable',
    });
  });
});
