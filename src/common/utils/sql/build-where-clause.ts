export const buildWhereClause = (whereParts: string[]): string =>
  whereParts.length > 0 ? 'WHERE ' + whereParts.join(' AND ') : '';
