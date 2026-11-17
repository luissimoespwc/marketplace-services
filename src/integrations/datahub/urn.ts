const DATA_PRODUCT_URN_PATTERN =
  /^urn:li:dataProduct:([A-Za-z0-9][A-Za-z0-9._-]{0,127})$/;

declare const dataProductUrnBrand: unique symbol;

export type DataProductUrn = string & {
  readonly [dataProductUrnBrand]: true;
};

export class InvalidDataProductUrnError extends Error {
  constructor() {
    super('dataProductUrn must match urn:li:dataProduct:<id>');
    this.name = 'InvalidDataProductUrnError';
  }
}

export function parseDataProductUrn(value: string): DataProductUrn {
  if (!DATA_PRODUCT_URN_PATTERN.test(value)) {
    throw new InvalidDataProductUrnError();
  }
  return value as DataProductUrn;
}
