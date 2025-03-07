import { Type } from 'class-transformer';

class PaginationParams {
  @Type(() => Number)
  pageNumber: number = 1;

  @Type(() => Number)
  pageSize: number = 10;

  calculateSkip(): number {
    return (this.pageNumber - 1) * this.pageSize;
  }
}

export enum SortDirection {
  Asc = 'asc',
  Desc = 'desc',
}

export abstract class BaseSortablePaginationParams<T> extends PaginationParams {
  abstract sortBy: T;
  sortDirection: SortDirection = SortDirection.Desc;
}
