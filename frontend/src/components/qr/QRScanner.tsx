import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Card, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { Html5Qrcode, type CameraDevice } from 'html5-qrcode';
import { extractQrToken } from '@/utils/helpers';

interface QRScannerProps {
  onScan: (token: string) => void;
  disabled?: boolean;
}

const SCANNER_ID = 'qr-scanner-region';

function getQrBoxSize(): number {
  const viewportMin = Math.min(window.innerWidth, window.innerHeight);
  return Math.min(250, Math.max(180, Math.floor(viewportMin * 0.65)));
}

function pickCameraId(cameras: CameraDevice[]): string | { facingMode: string } {
  const backCamera = cameras.find((camera) => /back|rear|environment/i.test(camera.label));
  if (backCamera) return backCamera.id;

  const frontCamera = cameras.find((camera) => /front|user|selfie/i.test(camera.label));
  if (frontCamera) return frontCamera.id;

  if (cameras.length > 0) return cameras[0].id;

  return { facingMode: 'environment' };
}

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

  const resolveCameraError = (err: unknown): string => {
    if (!(err instanceof Error)) {
      return t('scanner.cameraFailed');
    }

    const name = err.name;
    const message = err.message.toLowerCase();

    if (
      !window.isSecureContext &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      return t('scanner.cameraHttpsRequired');
    }

    if (name === 'NotAllowedError' || message.includes('permission')) {
      return t('scanner.cameraPermissionDenied');
    }

    if (name === 'NotFoundError' || message.includes('not found')) {
      return t('scanner.cameraNotFound');
    }

    return err.message || t('scanner.cameraFailed');
  };

  const startScanner = async () => {
    setError(null);

    if (
      !window.isSecureContext &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      setError(t('scanner.cameraHttpsRequired'));
      return;
    }

    try {
      const scanner = new Html5Qrcode(SCANNER_ID);
      scannerRef.current = scanner;

      const qrbox = getQrBoxSize();
      const scanConfig = { fps: 10, qrbox: { width: qrbox, height: qrbox } };
      const onDecode = (decodedText: string) => {
        const token = extractQrToken(decodedText);
        if (token) {
          onScan(token);
        }
      };

      let cameras: CameraDevice[] = [];
      try {
        cameras = await Html5Qrcode.getCameras();
      } catch {
        // Some browsers block enumeration until permission is granted.
      }

      const cameraConfig = cameras.length > 0
        ? pickCameraId(cameras)
        : { facingMode: 'environment' };

      try {
        await scanner.start(cameraConfig, scanConfig, onDecode, () => undefined);
      } catch {
        await scanner.start({ facingMode: 'user' }, scanConfig, onDecode, () => undefined);
      }

      setIsRunning(true);
    } catch (err) {
      setError(resolveCameraError(err));
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
