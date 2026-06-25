import { useEffect } from 'react';
import { Alert, Button, Card, Form, Input, Space, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useCreateUser, useUpdateUser, useUser } from '@/hooks/useUsers';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { ROUTES } from '@/utils/constants';
import { getApiErrorMessage } from '@/utils/helpers';
import type { CreateUserPayload } from '@/types';

interface UserFormValues {
  name: string;
  phone: string;
  email?: string;
  organization?: string;
  photoUrl?: string;
  password?: string;
}

export function UserFormPage() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form] = Form.useForm<UserFormValues>();

  const { data: user, isLoading } = useUser(id);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        phone: user.phone,
        email: user.email,
        organization: user.organization,
        photoUrl: user.photoUrl,
      });
    }
  }, [user, form]);

  const handleSubmit = async (values: UserFormValues) => {
    try {
      if (isEdit && id) {
        await updateUser.mutateAsync({ id, payload: values });
        message.success(t('users.updated'));
        navigate(ROUTES.USERS);
        return;
      }

      const payload: CreateUserPayload = {
        ...values,
        role: 'participant',
      };

      const result = await createUser.mutateAsync(payload);

      if (result.tempPassword) {
        message.success(t('users.createdWithPassword', { password: result.tempPassword }), 8);
      } else {
        message.success(t('users.created'));
      }

      navigate(ROUTES.USER_QR(result.user._id));
    } catch (error) {
      message.error(getApiErrorMessage(error, t('users.saveFailed')));
    }
  };

  if (isEdit && isLoading) {
    return <LoadingSpinner tip={t('common.loading')} />;
  }

  return (
    <div>
      <PageHeader
        title={isEdit ? t('users.editTitle') : t('users.addTitle')}
        subtitle={isEdit ? t('users.editSubtitle') : t('users.addSubtitle')}
      />

      <Card style={{ maxWidth: 640, width: '100%' }}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label={t('users.fullName')}
            name="name"
            rules={[{ required: true, message: t('users.nameRequired') }]}
          >
            <Input placeholder={t('users.namePlaceholder')} />
          </Form.Item>

          <Form.Item
            label={t('common.phone')}
            name="phone"
            rules={[{ required: true, message: t('users.phoneRequired') }]}
          >
            <Input placeholder={t('users.phonePlaceholder')} />
          </Form.Item>

          <Form.Item label={t('common.email')} name="email" rules={[{ type: 'email' }]}>
            <Input placeholder={t('users.emailPlaceholder')} />
          </Form.Item>

          <Form.Item label={t('common.organization')} name="organization">
            <Input placeholder={t('users.orgPlaceholder')} />
          </Form.Item>

          <Form.Item label={t('users.photoUrl')} name="photoUrl" rules={[{ type: 'url' }]}>
            <Input placeholder={t('users.photoPlaceholder')} />
          </Form.Item>

          {!isEdit && (
            <Form.Item label={t('users.passwordOptional')} name="password">
              <Input.Password placeholder={t('users.passwordAuto')} />
            </Form.Item>
          )}

          {isEdit && (
            <Form.Item label={t('users.newPasswordOptional')} name="password">
              <Input.Password placeholder={t('users.passwordKeep')} />
            </Form.Item>
          )}

          <Space direction={isMobile ? 'vertical' : 'horizontal'} style={{ width: isMobile ? '100%' : undefined }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={createUser.isPending || updateUser.isPending}
              block={isMobile}
            >
              {isEdit ? t('users.saveChanges') : t('users.createUser')}
            </Button>
            <Button onClick={() => navigate(ROUTES.USERS)} block={isMobile}>
              {t('common.cancel')}
            </Button>
          </Space>
        </Form>

        {!isEdit && (
          <Alert
            style={{ marginTop: 24 }}
            type="info"
            showIcon
            message={t('users.qrInfo')}
          />
        )}
      </Card>
    </div>
  );
}
