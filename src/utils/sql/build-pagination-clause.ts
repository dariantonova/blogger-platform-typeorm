export const buildPaginationClause = (paramsLength: number) =>
  `LIMIT $${paramsLength - 1} OFFSET $${paramsLength}`;
