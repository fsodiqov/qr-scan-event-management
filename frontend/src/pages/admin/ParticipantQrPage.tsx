import { Button, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { QRDisplay } from '@/components/qr/QRDisplay';
import { useParticipant, useParticipantQr, useRegenerateParticipantQr } from '@/hooks/useParticipants';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { ROUTES } from '@/utils/constants';
import { getApiErrorMessage } from '@/utils/helpers';

export function ParticipantQrPage() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: participant, isLoading: participantLoading } = useParticipant(id);
  const { data: qr, isLoading: qrLoading, refetch } = useParticipantQr(id);
  const regenerateQr = useRegenerateParticipantQr();

  const handleRegenerate = async () => {
    if (!id) return;

    try {
      await regenerateQr.mutateAsync(id);
      await refetch();
      message.success(t('participants.qrRegenerated'));
    } catch (error) {
      message.error(getApiErrorMessage(error, t('participants.qrRegenerateFailed')));
    }
  };

  if (participantLoading || qrLoading) {
    return <LoadingSpinner tip={t('common.loading')} />;
  }

  return (
    <div>
      <PageHeader
        title={t('participants.qrTitle')}
        subtitle={participant?.name}
        extra={
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTES.PARTICIPANTS)}
            block={isMobile}
            aria-label={t('participants.backToList')}
          >
            {isMobile ? null : t('participants.backToList')}
          </Button>
        }
      />

      {qr && (
        <QRDisplay
          qrDataUrl={qr.qrDataUrl}
          qrUrl={qr.qrUrl}
          name={participant?.name}
          onRegenerate={handleRegenerate}
          isRegenerating={regenerateQr.isPending}
        />
      )}
    </div>
  );
}
