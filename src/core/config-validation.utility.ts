import { validateSync } from 'class-validator';

export const configValidationUtility = {
  convertToBoolean(value?: string): boolean | null {
    const trimmed = value?.trim();
    if (trimmed === 'true') return true;
    if (trimmed === 'false') return false;
    return null;
  },

  convertToNumber(value?: string): number | null {
    if (!value?.trim()) return null; // undefined, пустая строка или строка из пробелов → null

    const num = Number(value);
    return isNaN(num) ? null : num;
  },

  getEnumValuesString<T extends Record<string, string>>(enumObj: T): string {
    return Object.values(enumObj).join(', ');
  },

  validateConfig(config: any) {
    const errors = validateSync(config);
    if (errors.length > 0) {
      const errorMessages = errors
        .map((err) => Object.values(err.constraints || {}).join(', '))
        .join('; ');
      throw new Error('Config validation failed: ' + errorMessages);
    }
  },
};
