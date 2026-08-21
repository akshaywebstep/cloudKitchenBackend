// src/core/helpers/string.helper.ts
// ================== String Helpers ==================

type BigIntConversionType = 'string' | 'number';

/**
 * Mask sensitive strings (e.g., passwords, tokens)
 * Example: "Rohit@6488" → "R*******8"
 */
export function maskString(value: string, start = 1, end = 1, maskChar = '*'): string {
  if (!value || typeof value !== 'string') return '';

  if (value.length <= start + end) {
    return maskChar.repeat(value.length);
  }

  return value.slice(0, start) + maskChar.repeat(value.length - start - end) + value.slice(-end);
}

/**
 * Capitalize first letter of a string
 * Example: "hello" → "Hello"
 */
export function capitalize(value: string): string {
  if (!value || typeof value !== 'string') return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Convert a string to kebab-case
 * Example: "Hello World" → "hello-world"
 */
export function toKebabCase(value: string): string {
  if (!value || typeof value !== 'string') return '';
  return value
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

/**
 * Convert all BigInt values in an object/array to string or number
 */
export function convertBigInt<T>(input: T, type: BigIntConversionType = 'string'): T {
  if (type !== 'string' && type !== 'number') {
    throw new Error("Type must be 'string' or 'number'");
  }

  const seen = new WeakMap<object, any>();

  function _convert(value: any): any {
    // Preserve Date objects
    if (value instanceof Date) {
      return value;
    }

    if (typeof value === 'bigint') {
      return type === 'string' ? value.toString() : Number(value);
    }

    if (Array.isArray(value)) {
      if (seen.has(value)) return seen.get(value);
      const arr: any[] = [];
      seen.set(value, arr);
      for (let i = 0; i < value.length; i++) {
        arr[i] = _convert(value[i]);
      }
      return arr;
    }

    if (value && typeof value === 'object') {
      if (seen.has(value)) return seen.get(value);
      const obj: Record<string, any> = {};
      seen.set(value, obj);
      for (const key of Object.keys(value)) {
        obj[key] = _convert(value[key]);
      }
      return obj;
    }

    return value; // Leave other types untouched
  }

  return _convert(input);
}

/**
 * Convert string to Title Case
 * Example: "rohit sisodia" → "Rohit Sisodia"
 */
export function toTitleCase(value: string): string {
  if (!value || typeof value !== 'string') return '';

  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Export all string helpers as a single object
 */
const stringHelper = {
  maskString,
  capitalize,
  toKebabCase,
  convertBigInt,
  toTitleCase
};

export default stringHelper;
