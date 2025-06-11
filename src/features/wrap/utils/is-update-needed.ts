import { isObjectEmpty } from '../../../common/utils/is-object-empty';

export const isUpdateNeeded = <T extends { dtoToUpdate: object }>(
  entity: T,
): boolean => {
  return !isObjectEmpty(entity.dtoToUpdate);
};
