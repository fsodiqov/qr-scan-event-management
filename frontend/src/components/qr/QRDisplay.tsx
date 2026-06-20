import { Button, Card, Image, Space, Typography } from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';

interface QRDisplayProps {
  qrDataUrl: string;
  qrUrl?: string;
  name?: string;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

export function QRDisplay({
  qrDataUrl,
  qrUrl,
  name,
  onRegenerate,
  isRegenerating,
}: QRDisplayProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `${name ?? 'participant'}-qr.png`;
    link.click();
  };

  return (
    <Card style={{ maxWidth: 420, margin: '0 auto', textAlign: 'center' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {name && <Typography.Title level={4}>{name}</Typography.Title>}
        <Image src={qrDataUrl} alt="QR Code" preview={false} width={280} />
        {qrUrl && (
          <Typography.Text type="secondary" copyable style={{ wordBreak: 'break-all' }}>
            {qrUrl}
          </Typography.Text>
        )}
        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleDownload}>
            Download
          </Button>
          {onRegenerate && (
            <Button
              icon={<ReloadOutlined />}
              onClick={onRegenerate}
              loading={isRegenerating}
            >
              Regenerate
            </Button>
          )}
        </Space>
      </Space>
    </Card>
  );
}
