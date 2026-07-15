import { Tag } from 'antd';
import { useStatusLabels } from '@/hooks/useStatusLabels';
import { scanResultColors } from '@/theme/statusColors';
import type { ScanResult } from '@/types';

interface ScanResultTagProps {
  result: ScanResult;
}

export function ScanResultTag({ result }: ScanResultTagProps) {
  const { scanResult } = useStatusLabels();

  return (
    <Tag
      color={scanResultColors[result]}
      style={{ margin: 0, borderRadius: 6, fontWeight: 500 }}
    >
      {scanResult(result)}
    </Tag>
  );
}
