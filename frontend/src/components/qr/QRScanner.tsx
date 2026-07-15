import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Card, Space, Typography } from 'antd';
import { CameraOutlined, StopOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Html5Qrcode, type CameraDevice } from 'html5-qrcode';
import { extractQrToken } from '@/utils/helpers';

export type ScannerFeedback = 'success' | 'duplicate' | 'invalid' | null;

interface QRScannerProps {
  onScan: (token: string) => void;
  disabled?: boolean;
  feedback?: ScannerFeedback;
}

const SCANNER_ID = 'qr-scanner-region';

type UiStatus = 'ready' | 'scanning' | 'success' | 'duplicate' | 'invalid';

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

export function QRScanner({ onScan, disabled, feedback = null }: QRScannerProps) {
  const { t } = useTranslation();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uiStatus: UiStatus = feedback
    ?? (isRunning ? 'scanning' : 'ready');

  const statusLabel = {
    ready: t('scanner.statusReady'),
    scanning: t('scanner.statusScanning'),
    success: t('scanner.statusSuccess'),
    duplicate: t('scanner.statusDuplicate'),
    invalid: t('scanner.statusInvalid'),
  }[uiStatus];

  const stopScanner = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
    }
    scannerRef.current?.clear();
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
    <Card className="qr-scanner-card">
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <div
          className={`qr-scanner-status qr-scanner-status--${uiStatus}`}
          role="status"
          aria-live="polite"
        >
          <span className="qr-scanner-status-dot" aria-hidden />
          <Typography.Text className="qr-scanner-status-label">{statusLabel}</Typography.Text>
        </div>

        <div className={`qr-scanner-viewport${isRunning ? ' is-running' : ''}`}>
          <div id={SCANNER_ID} className="qr-scanner-frame" />

          {!isRunning && (
            <div className="qr-scanner-idle" aria-hidden={!isRunning}>
              <CameraOutlined className="qr-scanner-idle-icon" />
              <Typography.Text className="qr-scanner-idle-text">
                {t('scanner.cameraIdleHint')}
              </Typography.Text>
            </div>
          )}

          <div className="qr-scanner-overlay" aria-hidden>
            <div className="qr-scanner-reticle">
              <span className="qr-scanner-corner qr-scanner-corner--tl" />
              <span className="qr-scanner-corner qr-scanner-corner--tr" />
              <span className="qr-scanner-corner qr-scanner-corner--bl" />
              <span className="qr-scanner-corner qr-scanner-corner--br" />
              {isRunning && <span className="qr-scanner-scanline" />}
            </div>
          </div>
        </div>

        {error && <Alert type="error" message={error} showIcon />}

        <div className="qr-scanner-actions">
          {!isRunning ? (
            <Button
              type="primary"
              size="large"
              icon={<CameraOutlined />}
              onClick={startScanner}
              disabled={disabled}
              className="qr-scanner-cta"
              block
            >
              {t('scanner.startCamera')}
            </Button>
          ) : (
            <Button
              size="large"
              icon={<StopOutlined />}
              onClick={stopScanner}
              disabled={disabled}
              className="qr-scanner-stop"
              block
            >
              {t('scanner.stopCamera')}
            </Button>
          )}
        </div>
      </Space>
    </Card>
  );
}
