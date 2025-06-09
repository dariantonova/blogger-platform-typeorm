export function camelCaseToSnakeCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2') // вставить _ между маленькой и большой буквой
    .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2') // вставить _ между заглавными, если за второй идёт маленькая
    .toLowerCase();
}
