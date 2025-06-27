import { SelectQueryBuilder } from 'typeorm';

export class CtePart {
  qb: SelectQueryBuilder<any>;
  alias: string;
}
