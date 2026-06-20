import { useRef, useState } from 'react';
import { Alert, Button, Card, Input, Select, Space, Typography, message } from 'antd';
import { PageHeader } from '@/components/common/PageHeader';
import { ScanResultModal } from '@/components/attendance/ScanResultModal';
import { QRScanner } from '@/components/qr/QRScanner';
import { useScanQr } from '@/hooks/useAttendance';
import { useEvents } from '@/hooks/useEvents';
import { extractQrToken, getApiErrorMessage } from '@/utils/helpers';
import type { ScanResponse } from '@/types';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types';

export function ScannerPage() {
  const [eventId, setEventId] = useState<string>();
  const [manualToken, setManualToken] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const processingRef = useRef(false);

  const { data: eventsData } = useEvents({ status: 'active', limit: 100 });
  const scanQr = useScanQr();

  const activeEvents = eventsData?.events ?? [];

  const processScan = async (token: string) => {
    if (!eventId) {
      message.warning('Please select an active event first');
      return;
    }

    if (processingRef.current) return;
    processingRef.current = true;

    setScanResult(null);
    setScanError(null);
    setModalOpen(true);

    try {
      const result = await scanQr.mutateAsync({ qrToken: token, eventId });
      setScanResult(result);
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const details = axiosError.response?.data?.details as
        | {
            result?: string;
            user?: ScanResponse['user'];
            attendance?: ScanResponse['attendance'];
          }
        | undefined;

      if (
        axiosError.response?.status === 409 &&
        details?.result === 'already_out' &&
        details.user &&
        details.attendance
      ) {
        setScanResult({
          result: 'already_out',
          message: axiosError.response.data.message,
          user: details.user,
          attendance: details.attendance,
        });
      } else {
        setScanError(getApiErrorMessage(error, 'Scan failed'));
      }
    } finally {
      processingRef.current = false;
    }
  };

  const handleManualScan = () => {
    const token = extractQrToken(manualToken);
    if (!token) {
      message.error('Invalid QR token or URL');
      return;
    }
    void processScan(token);
  };

  return (
    <div>
      <PageHeader
        title="QR Scanner"
        subtitle="Scan participant QR codes for check-in and check-out"
      />

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <Typography.Text strong>Select Active Event</Typography.Text>
              <Select
                style={{ width: '100%', marginTop: 8 }}
                placeholder="Choose an event"
                value={eventId}
                onChange={setEventId}
                options={activeEvents.map((event) => ({
                  value: event._id,
                  label: event.title,
                }))}
              />
            </div>

            {activeEvents.length === 0 && (
              <Alert
                type="warning"
                showIcon
                message="No active events found. Activate an event before scanning."
              />
            )}
          </Space>
        </Card>

        <QRScanner onScan={processScan} disabled={!eventId || scanQr.isPending} />

        <Card title="Manual Token Entry">
          <Space.Compact style={{ width: '100%' }}>
            <Input
              placeholder="Paste QR URL or token"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              onPressEnter={handleManualScan}
            />
            <Button type="primary" onClick={handleManualScan}>
              Scan
            </Button>
          </Space.Compact>
        </Card>
      </Space>

      <ScanResultModal
        open={modalOpen}
        result={scanResult}
        errorMessage={scanError ?? undefined}
        onClose={() => {
          setModalOpen(false);
          setScanResult(null);
          setScanError(null);
        }}
      />
    </div>
  );
}
