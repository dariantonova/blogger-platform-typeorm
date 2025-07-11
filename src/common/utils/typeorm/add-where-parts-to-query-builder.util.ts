import { SelectQueryBuilder } from 'typeorm';
import { WherePart } from '../../types/typeorm/where-part';

export const addWherePartsToQueryBuilder = (
  qb: SelectQueryBuilder<any>,
  whereParts: WherePart[],
) => {
  for (const wherePart of whereParts) {
    qb.andWhere(wherePart.expression, wherePart.params);
  }
};
