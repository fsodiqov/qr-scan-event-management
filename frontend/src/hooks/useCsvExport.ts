import { useState } from 'react';
import { message } from 'antd';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { downloadCsv, toCsv } from '@/utils/csv';

type CsvRow = Array<string | number | null | undefined>;

interface ExportCsvBuildResult {
  headers: string[];
  rows: CsvRow[];
  filenamePrefix: string;
}

/**
 * Fetches paginated API results up to a safe cap for CSV export.
 */
export async function fetchAllForExport<T>(
  fetchPage: (page: number, limit: number) => Promise<{ items: T[]; total: number }>,
  pageSize = 200,
  maxItems = 2000,
): Promise<T[]> {
  const first = await fetchPage(1, pageSize);
  const items = [...first.items];
  const total = Math.min(first.total || items.length, maxItems);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  for (let page = 2; page <= totalPages && items.length < maxItems; page += 1) {
    const next = await fetchPage(page, pageSize);
    items.push(...next.items);
    if (next.items.length === 0) break;
  }

  return items.slice(0, maxItems);
}

export function useCsvExport() {
  const { t } = useTranslation();
  const [exporting, setExporting] = useState(false);

  const runExport = async (build: () => Promise<ExportCsvBuildResult>) => {
    setExporting(true);
    try {
      const { headers, rows, filenamePrefix } = await build();
      const filename = `${filenamePrefix}-${dayjs().format('YYYY-MM-DD')}.csv`;
      downloadCsv(filename, toCsv(headers, rows));
      message.success(t('common.exportSuccess'));
    } catch {
      message.error(t('common.exportFailed'));
    } finally {
      setExporting(false);
    }
  };

  return { exporting, runExport };
}
