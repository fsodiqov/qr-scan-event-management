import { Button, Card, Form, Input, message } from 'antd';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useMyOrganization, useUpdateMyOrganization } from '@/hooks/useOrganizations';
import { useMySubscription } from '@/hooks/useSubscriptions';
import { getApiErrorMessage } from '@/utils/helpers';

interface SettingsFormValues {
  name: string;
  logo?: string;
}

export function OrganizationSettingsPage() {
  const { t } = useTranslation();
  const [form] = Form.useForm<SettingsFormValues>();
  const { data: organization, isLoading } = useMyOrganization();
  const { data: subscription } = useMySubscription();
  const updateOrg = useUpdateMyOrganization();

  useEffect(() => {
    if (organization) {
      form.setFieldsValue({
        name: organization.name,
        logo: organization.logo,
      });
    }
  }, [organization, form]);

  const handleSubmit = async (values: SettingsFormValues) => {
    try {
      await updateOrg.mutateAsync(values);
      message.success(t('orgSettings.updated'));
    } catch (error) {
      message.error(getApiErrorMessage(error, t('orgSettings.saveFailed')));
    }
  };

  if (isLoading) {
    return <LoadingSpinner tip={t('common.loading')} />;
  }

  return (
    <div>
      <PageHeader title={t('orgSettings.title')} subtitle={t('orgSettings.subtitle')} />

      <Card style={{ maxWidth: 640 }}>
        {subscription && (
          <p style={{ marginBottom: 16 }}>
            <strong>{t('orgSettings.subscription')}:</strong> {subscription.name}
          </p>
        )}
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label={t('common.name')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="logo" label={t('orgSettings.logoUrl')} rules={[{ type: 'url' }]}>
            <Input placeholder="https://..." />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={updateOrg.isPending}>
            {t('common.save')}
          </Button>
        </Form>
      </Card>
    </div>
  );
}
