import { getColumnNamesFromDtoToUpdate } from './get-column-names-from-dto-to-update';

export const buildUpdateSetClause = (dtoToUpdate: object): string => {
  const columnNames = getColumnNamesFromDtoToUpdate(dtoToUpdate);

  const parts = columnNames.map((colName, i) => `${colName} = $${i + 1}`);
  return 'SET ' + parts.join(',\n');
};
