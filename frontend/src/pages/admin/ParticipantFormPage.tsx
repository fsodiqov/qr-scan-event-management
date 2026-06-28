import { useEffect } from 'react';
import { Alert, Button, Card, Form, Input, Select, Space, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useCreateParticipant, useParticipant, useUpdateParticipant } from '@/hooks/useParticipants';
import { useEvents } from '@/hooks/useEvents';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { ROUTES } from '@/utils/constants';
import { getApiErrorMessage } from '@/utils/helpers';

interface ParticipantFormValues {
  eventId: string;
  name: string;
  phone?: string;
  email?: string;
  photoUrl?: string;
}

export function ParticipantFormPage() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form] = Form.useForm<ParticipantFormValues>();

  const { data: participant, isLoading } = useParticipant(id);
  const { data: eventsData } = useEvents({ limit: 100 });
  const createParticipant = useCreateParticipant();
  const updateParticipant = useUpdateParticipant();

  useEffect(() => {
    if (participant) {
      form.setFieldsValue({
        eventId: typeof participant.eventId === 'string' ? participant.eventId : participant.eventId._id,
        name: participant.name,
        phone: participant.phone,
        email: participant.email,
        photoUrl: participant.photoUrl,
      });
    }
  }, [participant, form]);

  const handleSubmit = async (values: ParticipantFormValues) => {
    try {
      if (isEdit && id) {
        const { eventId: _eventId, ...payload } = values;
        await updateParticipant.mutateAsync({ id, payload });
        message.success(t('participants.updated'));
        navigate(ROUTES.PARTICIPANTS);
        return;
      }

      const result = await createParticipant.mutateAsync(values);
      message.success(t('participants.created'));
      navigate(ROUTES.PARTICIPANT_QR(result._id));
    } catch (error) {
      message.error(getApiErrorMessage(error, t('participants.saveFailed')));
    }
  };

  if (isEdit && isLoading) {
    return <LoadingSpinner tip={t('common.loading')} />;
  }

  return (
    <div>
      <PageHeader
        title={isEdit ? t('participants.editTitle') : t('participants.addTitle')}
        subtitle={isEdit ? t('participants.editSubtitle') : t('participants.addSubtitle')}
      />

      <Card style={{ maxWidth: 640, width: '100%' }}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {!isEdit && (
            <Form.Item
              label={t('common.event')}
              name="eventId"
              rules={[{ required: true, message: t('participants.eventRequired') }]}
            >
              <Select
                placeholder={t('participants.selectEvent')}
                options={(eventsData?.events ?? []).map((event) => ({
                  value: event._id,
                  label: event.title,
                }))}
              />
            </Form.Item>
          )}

          <Form.Item
            label={t('participants.fullName')}
            name="name"
            rules={[{ required: true, message: t('participants.nameRequired') }]}
          >
            <Input placeholder={t('participants.namePlaceholder')} />
          </Form.Item>

          <Form.Item label={t('common.phone')} name="phone">
            <Input placeholder={t('participants.phonePlaceholder')} />
          </Form.Item>

          <Form.Item label={t('common.email')} name="email" rules={[{ type: 'email' }]}>
            <Input placeholder={t('participants.emailPlaceholder')} />
          </Form.Item>

          <Form.Item label={t('participants.photoUrl')} name="photoUrl" rules={[{ type: 'url' }]}>
            <Input placeholder={t('participants.photoPlaceholder')} />
          </Form.Item>

          <Space direction={isMobile ? 'vertical' : 'horizontal'} style={{ width: isMobile ? '100%' : undefined }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={createParticipant.isPending || updateParticipant.isPending}
              block={isMobile}
            >
              {isEdit ? t('participants.saveChanges') : t('participants.createParticipant')}
            </Button>
            <Button onClick={() => navigate(ROUTES.PARTICIPANTS)} block={isMobile}>
              {t('common.cancel')}
            </Button>
          </Space>
        </Form>

        {!isEdit && (
          <Alert
            style={{ marginTop: 24 }}
            type="info"
            showIcon
            message={t('participants.qrInfo')}
          />
        )}
      </Card>
    </div>
  );
}
