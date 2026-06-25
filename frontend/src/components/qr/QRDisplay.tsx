import { Button, Card, Image, Space, Typography } from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/useBreakpoint';

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
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `${name ?? t('common.participant')}-qr.png`;
    link.click();
  };

  return (
    <Card style={{ maxWidth: 420, width: '100%', margin: '0 auto', textAlign: 'center' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {name && <Typography.Title level={4}>{name}</Typography.Title>}
        <Image
          src={qrDataUrl}
          alt={t('users.qrAlt')}
          preview={false}
          style={{ width: '100%', maxWidth: 280 }}
        />
        {qrUrl && (
          <Typography.Text type="secondary" copyable style={{ wordBreak: 'break-all' }}>
            {qrUrl}
          </Typography.Text>
        )}
        <Space
          direction={isMobile ? 'vertical' : 'horizontal'}
          wrap
          style={{ width: isMobile ? '100%' : undefined, justifyContent: 'center' }}
        >
          <Button icon={<DownloadOutlined />} onClick={handleDownload} block={isMobile}>
            {t('common.download')}
          </Button>
          {onRegenerate && (
            <Button
              icon={<ReloadOutlined />}
              onClick={onRegenerate}
              loading={isRegenerating}
              block={isMobile}
            >
              {t('common.regenerate')}
            </Button>
          )}
        </Space>
      </Space>
    </Card>
  );
}
