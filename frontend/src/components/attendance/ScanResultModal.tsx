import { Modal, Result, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { AttendanceStatusTag } from '@/components/attendance/AttendanceStatusTag';
import { useStatusLabels } from '@/hooks/useStatusLabels';
import { translateApiMessage } from '@/utils/helpers';
import type { ScanResponse } from '@/types';

interface ScanResultModalProps {
  open: boolean;
  result?: ScanResponse | null;
  errorMessage?: string;
  onClose: () => void;
}

export function ScanResultModal({
  open,
  result,
  errorMessage,
  onClose,
}: ScanResultModalProps) {
  const { t } = useTranslation();
  const { scanResult } = useStatusLabels();
  const isSuccess = Boolean(result);
  const isWarning = result?.result === 'already_out';

  return (
    <Modal open={open} onCancel={onClose} onOk={onClose} footer={null} centered>
      {errorMessage ? (
        <Result status="error" title={t('scanner.scanFailedTitle')} subTitle={errorMessage} />
      ) : result ? (
        <Result
          status={isWarning ? 'warning' : 'success'}
          title={scanResult(result.result)}
          subTitle={translateApiMessage(undefined, result.message)}
          extra={
            <div style={{ textAlign: 'left' }}>
              <Typography.Paragraph>
                <strong>{t('common.name')}:</strong> {result.user.name}
              </Typography.Paragraph>
              {result.user.phone && (
                <Typography.Paragraph>
                  <strong>{t('common.phone')}:</strong> {result.user.phone}
                </Typography.Paragraph>
              )}
              {result.user.organization && (
                <Typography.Paragraph>
                  <strong>{t('common.organization')}:</strong> {result.user.organization}
                </Typography.Paragraph>
              )}
              <Typography.Paragraph>
                <strong>{t('common.status')}:</strong>{' '}
                <AttendanceStatusTag status={result.attendance.status} />
              </Typography.Paragraph>
            </div>
          }
        />
      ) : (
        <Result status={isSuccess ? 'success' : 'info'} title={t('scanner.processing')} />
      )}
    </Modal>
  );
}
