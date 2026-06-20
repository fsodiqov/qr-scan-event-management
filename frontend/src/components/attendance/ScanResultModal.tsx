import { Modal, Result, Typography } from 'antd';
import { AttendanceStatusTag } from '@/components/attendance/AttendanceStatusTag';
import { SCAN_RESULT_LABELS } from '@/utils/constants';
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
  const isSuccess = Boolean(result);
  const isWarning = result?.result === 'already_out';

  return (
    <Modal open={open} onCancel={onClose} onOk={onClose} footer={null} centered>
      {errorMessage ? (
        <Result status="error" title="Scan Failed" subTitle={errorMessage} />
      ) : result ? (
        <Result
          status={isWarning ? 'warning' : 'success'}
          title={SCAN_RESULT_LABELS[result.result]}
          subTitle={result.message}
          extra={
            <div style={{ textAlign: 'left' }}>
              <Typography.Paragraph>
                <strong>Name:</strong> {result.user.name}
              </Typography.Paragraph>
              {result.user.phone && (
                <Typography.Paragraph>
                  <strong>Phone:</strong> {result.user.phone}
                </Typography.Paragraph>
              )}
              {result.user.organization && (
                <Typography.Paragraph>
                  <strong>Organization:</strong> {result.user.organization}
                </Typography.Paragraph>
              )}
              <Typography.Paragraph>
                <strong>Status:</strong>{' '}
                <AttendanceStatusTag status={result.attendance.status} />
              </Typography.Paragraph>
            </div>
          }
        />
      ) : (
        <Result status={isSuccess ? 'success' : 'info'} title="Processing scan..." />
      )}
    </Modal>
  );
}
