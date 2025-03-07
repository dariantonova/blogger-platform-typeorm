export abstract class PaginatedViewDto<T> {
  abstract items: T;
  totalCount: number;
  pagesCount: number;
  page: number;
  pageSize: number;

  static mapToView<T>(data: {
    items: T;
    totalCount: number;
    page: number;
    pageSize: number;
  }): PaginatedViewDto<T> {
    return {
      items: data.items,
      totalCount: data.totalCount,
      pagesCount: Math.ceil(data.totalCount / data.pageSize),
      page: data.page,
      pageSize: data.pageSize,
    };
  }
}
