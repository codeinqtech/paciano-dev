import { useEffect, useMemo, useState } from "react";

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export type ClientPaginationOptions<T = unknown> = {
  pageSize?: number;
  pageSizeOptions?: number[];
  /** Custom text for list search; defaults to all string/number fields on the item. */
  getSearchText?: (item: T) => string;
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

export type ListSearchControlProps = {
  value: string;
  onChange: (value: string) => void;
};

export function collectSearchText(value: unknown, depth = 0): string {
  if (depth > 5) return "";
  if (value == null) return "";
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map((v) => collectSearchText(v, depth + 1)).join(" ");
  }
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>)
      .map((v) => collectSearchText(v, depth + 1))
      .join(" ");
  }
  return "";
}

export function defaultItemSearchText<T>(item: T): string {
  return collectSearchText(item);
}

export function useClientPagination<T>(
  items: T[],
  options?: ClientPaginationOptions<T>,
): {
  paginatedItems: T[];
  paginationProps: ListPaginationControlProps;
  listSearch: ListSearchControlProps;
} {
  const pageSizeOptions =
    options?.pageSizeOptions ?? DEFAULT_PAGE_SIZE_OPTIONS;
  const [pageSize, setPageSize] = useState(
    options?.pageSize ?? DEFAULT_PAGE_SIZE,
  );
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const getSearchText =
    options?.getSearchText ??
    ((item: T) => defaultItemSearchText(item));

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      getSearchText(item).toLowerCase().includes(q),
    );
  }, [items, searchQuery, getSearchText]);

  const totalItems = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize) || 1);

  useEffect(() => {
    setPage(1);
  }, [totalItems, pageSize, searchQuery]);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, page, pageSize]);

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
    listSearch: {
      value: searchQuery,
      onChange: setSearchQuery,
    },
  };
}