export const buildWhereClause = (whereParts: string[]) =>
  whereParts.length > 0 ? 'WHERE ' + whereParts.join(' AND ') : '';
