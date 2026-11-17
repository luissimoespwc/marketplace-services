import { InvalidDataProductUrnError, parseDataProductUrn } from './urn.js';

describe('parseDataProductUrn', () => {
  it('accepts a data product URN', () => {
    expect(parseDataProductUrn('urn:li:dataProduct:sample_sales')).toBe(
      'urn:li:dataProduct:sample_sales',
    );
  });

  it('rejects a malformed URN', () => {
    expect(() => parseDataProductUrn('not-a-urn')).toThrow(
      InvalidDataProductUrnError,
    );
    expect(() => parseDataProductUrn('urn:li:dataProduct:')).toThrow(
      InvalidDataProductUrnError,
    );
  });

  it('rejects a URN for a different entity type', () => {
    expect(() =>
      parseDataProductUrn(
        'urn:li:dataset:(urn:li:dataPlatform:mysql,db.table,PROD)',
      ),
    ).toThrow(InvalidDataProductUrnError);
  });
});
