import { useEffect, useMemo, useState } from "react";

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export type ClientPaginationOptions = {
  pageSize?: number;
  pageSizeOptions?: number[];
};

export type ListPaginationControlProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  rangeStart: number;
  rangeEnd: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  pageSizeOptions: number[];
  onPageSizeChange: (size: number) => void;
};

export function useClientPagination<T>(
  items: T[],
  options?: ClientPaginationOptions,
): {
  paginatedItems: T[];
  paginationProps: ListPaginationControlProps;
} {
  const pageSizeOptions =
    options?.pageSizeOptions ?? DEFAULT_PAGE_SIZE_OPTIONS;
  const [pageSize, setPageSize] = useState(
    options?.pageSize ?? DEFAULT_PAGE_SIZE,
  );
  const [page, setPage] = useState(1);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize) || 1);

  useEffect(() => {
    setPage(1);
  }, [totalItems, pageSize]);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const rangeStart = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalItems);

  return {
    paginatedItems,
    paginationProps: {
      page,
      totalPages,
      totalItems,
      rangeStart,
      rangeEnd,
      onPageChange: setPage,
      pageSize,
      pageSizeOptions,
      onPageSizeChange: setPageSize,
    },
  };
}
