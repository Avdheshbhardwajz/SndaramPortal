type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig {
  column: string | null;
  direction: SortDirection;
}

export const sortData = <T extends Record<string, any>>(
  data: T[],
  sortConfig: SortConfig
): T[] => {
  if (!sortConfig.column || !sortConfig.direction) {
    return data;
  }

  return [...data].sort((a, b) => {
    const aValue = a[sortConfig.column!];
    const bValue = b[sortConfig.column!];

    // Handle null/undefined values
    if (aValue == null) return 1;
    if (bValue == null) return -1;

    // Handle different data types
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }

    if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
      return sortConfig.direction === 'asc'
        ? aValue === bValue ? 0 : aValue ? 1 : -1
        : aValue === bValue ? 0 : aValue ? -1 : 1;
    }

    // Convert to strings for comparison
    const aString = String(aValue).toLowerCase();
    const bString = String(bValue).toLowerCase();

    return sortConfig.direction === 'asc'
      ? aString.localeCompare(bString)
      : bString.localeCompare(aString);
  });
};
