import type { TablePaginationConfig } from 'antd/es/table';

export const TABLE_PAGE_SIZE_OPTIONS = ['10', '20', '50', '100'];

/** Shared Ant Design table pagination — centered, with size + quick jump. */
export function tablePagination(
  page: number,
  pageSize: number,
  total: number,
  onChange: (page: number, pageSize: number) => void,
): TablePaginationConfig {
  return {
    current: page,
    pageSize,
    total,
    onChange,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: TABLE_PAGE_SIZE_OPTIONS,
    align: 'center',
    className: 'app-table-pagination',
  };
}
