// src/core/helper.number.helper.ts
import Decimal from "decimal.js";

type DecimalInstance = InstanceType<typeof Decimal>;

export function convertDecimalToNumber(
  dbDecimal: { d?: number[]; s?: number } | null | undefined,
  asDecimal = false
): number | DecimalInstance {
  if (!dbDecimal || !Array.isArray(dbDecimal.d)) {
    return asDecimal ? new Decimal(0) : 0;
  }

  const sign = dbDecimal.s === -1 ? -1 : 1;

  const integerPart = new Decimal(dbDecimal.d?.[0] ?? 0);

  const fractionalPart = dbDecimal.d?.[1]
    ? new Decimal(dbDecimal.d[1]).div(1e7)
    : new Decimal(0);

  const result = integerPart.plus(fractionalPart).times(sign);

  return asDecimal ? result : result.toNumber();
}