import { useEffect, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Form,
  Input,
  Space,
  Typography,
  Upload,
  message,
} from 'antd';
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import {
  useMyOrganization,
  useUpdateMyOrganization,
  useUploadMyOrganizationLogo,
} from '@/hooks/useOrganizations';
import { useMySubscription } from '@/hooks/useSubscriptions';
import { getApiErrorMessage } from '@/utils/helpers';

interface SettingsFormValues {
  name: string;
  /** Optional public URL only — never prefilled with stored logo data. */
  logoUrl?: string;
}

const MAX_LOGO_UPLOAD_BYTES = 20 * 1024 * 1024;

function isValidHttpLogoUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function OrganizationSettingsPage() {
  const { t } = useTranslation();
  const [form] = Form.useForm<SettingsFormValues>();
  const [logoPreview, setLogoPreview] = useState<string | undefined>();
  const [logoCleared, setLogoCleared] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const { data: organization, isLoading } = useMyOrganization();
  const { data: subscription } = useMySubscription();
  const updateOrg = useUpdateMyOrganization();
  const uploadLogo = useUploadMyOrganizationLogo();

  useEffect(() => {
    if (organization) {
      form.setFieldsValue({
        name: organization.name,
        logoUrl: undefined,
      });
      setLogoPreview(organization.logo);
      setLogoCleared(false);
    }
  }, [organization, form]);

  const handleSubmit = async (values: SettingsFormValues) => {
    const logoUrl = values.logoUrl?.trim();

    try {
      const payload: {
        name: string;
        logo?: string | null;
      } = { name: values.name };

      if (logoUrl) {
        payload.logo = logoUrl;
      } else if (logoCleared) {
        payload.logo = null;
      }

      await updateOrg.mutateAsync(payload);
      form.setFieldsValue({ logoUrl: undefined });
      message.success(t('orgSettings.updated'));
    } catch (error) {
      message.error(getApiErrorMessage(error, t('orgSettings.saveFailed')));
    }
  };

  const handleLogoUpload: UploadProps['beforeUpload'] = (file) => {
    if (!file.type.startsWith('image/')) {
      message.error(t('orgSettings.logoInvalidType'));
      return Upload.LIST_IGNORE;
    }

    if (file.size > MAX_LOGO_UPLOAD_BYTES) {
      message.error(t('orgSettings.logoTooLarge'));
      return Upload.LIST_IGNORE;
    }

    setUploadingLogo(true);
    void uploadLogo
      .mutateAsync(file)
      .then((org) => {
        setLogoPreview(org.logo);
        setLogoCleared(false);
        form.setFieldsValue({ logoUrl: undefined });
        message.success(t('orgSettings.logoUploaded'));
      })
      .catch((error) => {
        message.error(getApiErrorMessage(error, t('orgSettings.logoUploadFailed')));
      })
      .finally(() => {
        setUploadingLogo(false);
      });

    return false;
  };

  const clearLogo = () => {
    setLogoPreview(undefined);
    setLogoCleared(true);
    form.setFieldsValue({ logoUrl: undefined });
  };

  if (isLoading) {
    return <LoadingSpinner tip={t('common.loading')} />;
  }

  const previewLetter = (organization?.name ?? 'O').charAt(0).toUpperCase();

  return (
    <div className="org-settings-page">
      <PageHeader title={t('orgSettings.title')} subtitle={t('orgSettings.subtitle')} />

      <Card className="org-settings-card">
        {subscription && (
          <div className="org-settings-meta">
            <Typography.Text type="secondary">{t('orgSettings.subscription')}</Typography.Text>
            <Typography.Text strong>{subscription.name}</Typography.Text>
          </div>
        )}

        <Form
          form={form}
          layout="vertical"
          className="org-settings-form"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <Form.Item
            name="name"
            label={t('common.name')}
            rules={[{ required: true, message: t('orgSettings.nameRequired') }]}
          >
            <Input size="large" />
          </Form.Item>

          <Form.Item
            label={t('orgSettings.logo')}
            className="org-settings-logo-item"
            style={{ marginBottom: 8 }}
          >
            <div className="org-settings-logo">
              <Avatar
                size={72}
                src={logoPreview}
                className="org-settings-logo-avatar"
                alt={t('orgSettings.logoPreview')}
              >
                {previewLetter}
              </Avatar>

              <div className="org-settings-logo-actions">
                <Space size={8} wrap>
                  <Upload
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                    showUploadList={false}
                    beforeUpload={handleLogoUpload}
                    maxCount={1}
                    disabled={uploadingLogo || uploadLogo.isPending}
                  >
                    <Button
                      icon={<UploadOutlined />}
                      loading={uploadingLogo || uploadLogo.isPending}
                    >
                      {t('orgSettings.uploadLogo')}
                    </Button>
                  </Upload>
                  {logoPreview && (
                    <Button
                      icon={<DeleteOutlined />}
                      onClick={clearLogo}
                      aria-label={t('orgSettings.removeLogo')}
                      disabled={uploadingLogo || uploadLogo.isPending}
                    >
                      {t('orgSettings.removeLogo')}
                    </Button>
                  )}
                </Space>
                <Typography.Text type="secondary" className="org-settings-logo-hint">
                  {t('orgSettings.logoHint')}
                </Typography.Text>
              </div>
            </div>
          </Form.Item>

          <Form.Item
            name="logoUrl"
            label={t('orgSettings.logoUrlOptional')}
            rules={[
              {
                validator: async (_, value?: string) => {
                  if (!value || !value.trim()) return;
                  if (!isValidHttpLogoUrl(value.trim())) {
                    throw new Error(t('orgSettings.logoInvalid'));
                  }
                },
              },
            ]}
          >
            <Input size="large" placeholder="https://..." allowClear autoComplete="off" />
          </Form.Item>

          <Form.Item className="org-settings-submit">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={updateOrg.isPending}
              className="org-settings-save"
            >
              {t('common.save')}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
