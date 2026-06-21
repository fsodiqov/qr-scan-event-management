import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Card, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { Html5Qrcode } from 'html5-qrcode';
import { extractQrToken } from '@/utils/helpers';

interface QRScannerProps {
  onScan: (token: string) => void;
  disabled?: boolean;
}

const SCANNER_ID = 'qr-scanner-region';

export function QRScanner({ onScan, disabled }: QRScannerProps) {
  const { t } = useTranslation();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopScanner = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
      scannerRef.current.clear();
    }
    scannerRef.current = null;
    setIsRunning(false);
  };

  const startScanner = async () => {
    setError(null);

    try {
      const scanner = new Html5Qrcode(SCANNER_ID);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          const token = extractQrToken(decodedText);
          if (token) {
            onScan(token);
          }
        },
        () => {
          // Ignore scan failures between frames
        },
      );

      setIsRunning(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('scanner.cameraFailed'));
    }
  };

  useEffect(() => {
    return () => {
      void stopScanner();
    };
  }, []);

  return (
    <Card>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div
          id={SCANNER_ID}
          style={{
            width: '100%',
            minHeight: 300,
            overflow: 'hidden',
            borderRadius: 8,
            background: '#000',
          }}
        />
        {error && <Alert type="error" message={error} showIcon />}
        <Space>
          {!isRunning ? (
            <Button type="primary" onClick={startScanner} disabled={disabled}>
              {t('scanner.startCamera')}
            </Button>
          ) : (
            <Button onClick={stopScanner} disabled={disabled}>
              {t('scanner.stopCamera')}
            </Button>
          )}
        </Space>
      </Space>
    </Card>
  );
}
