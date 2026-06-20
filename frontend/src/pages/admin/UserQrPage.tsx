import { Button, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { QRDisplay } from '@/components/qr/QRDisplay';
import { useRegenerateQr, useUser, useUserQr } from '@/hooks/useUsers';
import { ROUTES } from '@/utils/constants';
import { getApiErrorMessage } from '@/utils/helpers';

export function UserQrPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: user, isLoading: userLoading } = useUser(id);
  const { data: qr, isLoading: qrLoading, refetch } = useUserQr(id);
  const regenerateQr = useRegenerateQr();

  const handleRegenerate = async () => {
    if (!id) return;

    try {
      await regenerateQr.mutateAsync(id);
      await refetch();
      message.success('QR token regenerated');
    } catch (error) {
      message.error(getApiErrorMessage(error, 'Failed to regenerate QR'));
    }
  };

  if (userLoading || qrLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <PageHeader
        title="User QR Code"
        subtitle={user?.name}
        extra={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTES.USERS)}>
            Back to Users
          </Button>
        }
      />

      {qr && (
        <QRDisplay
          qrDataUrl={qr.qrDataUrl}
          qrUrl={qr.qrUrl}
          name={user?.name}
          onRegenerate={handleRegenerate}
          isRegenerating={regenerateQr.isPending}
        />
      )}
    </div>
  );
}
