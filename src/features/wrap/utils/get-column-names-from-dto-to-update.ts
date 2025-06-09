import { camelCaseToSnakeCase } from '../../../common/utils/camel-case-to-snake-case';

export const getColumnNamesFromDtoToUpdate = (dtoToUpdate: object) => {
  const propertyNames = Object.keys(dtoToUpdate);
  return propertyNames.map(camelCaseToSnakeCase);
};
