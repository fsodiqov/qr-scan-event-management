import { useEffect, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Divider,
  Form,
  Input,
  Space,
  Tag,
  Typography,
  Upload,
  message,
} from 'antd';
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { ActiveSessionsCard } from '@/components/account/ActiveSessionsCard';
import { useAuth } from '@/contexts/AuthContext';
import { useUpdateProfile, useUploadMyPhoto } from '@/hooks/useProfile';
import { getApiErrorMessage } from '@/utils/helpers';
import { roleTagColors } from '@/theme/statusColors';
import { useThemeTokens } from '@/contexts/ThemeContext';

interface AccountFormValues {
  name: string;
  login: string;
  /** Optional public URL only — never prefilled with stored photo data. */
  photoUrl?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const MAX_PHOTO_UPLOAD_BYTES = 20 * 1024 * 1024;

function isValidHttpPhotoUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function AccountSettingsPage() {
  const { t } = useTranslation();
  const { user, role, isSuperAdmin } = useAuth();
  const [form] = Form.useForm<AccountFormValues>();
  const [photoPreview, setPhotoPreview] = useState<string | undefined>();
  const [photoCleared, setPhotoCleared] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const updateProfile = useUpdateProfile();
  const uploadPhoto = useUploadMyPhoto();
  const { border, radius, shadow, text } = useThemeTokens();

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        login: user.login ?? '',
        photoUrl: undefined,
      });
      setPhotoPreview(user.photoUrl);
      setPhotoCleared(false);
    }
  }, [user, form]);

  const handleSubmit = async (values: AccountFormValues) => {
    if (values.newPassword && values.newPassword !== values.confirmPassword) {
      message.error(t('accountSettings.passwordMismatch'));
      return;
    }

    const payload: {
      name?: string;
      login?: string;
      currentPassword?: string;
      newPassword?: string;
      photoUrl?: string | null;
    } = {};

    if (values.name !== user?.name) {
      payload.name = values.name;
    }

    const loginChanged = values.login !== (user?.login ?? '');
    if (loginChanged) {
      payload.login = values.login;
    }

    if (values.newPassword) {
      payload.newPassword = values.newPassword;
    }

    if (loginChanged || values.newPassword) {
      payload.currentPassword = values.currentPassword;
    }

    const photoUrl = values.photoUrl?.trim();
    if (photoUrl) {
      payload.photoUrl = photoUrl;
    } else if (photoCleared) {
      payload.photoUrl = null;
    }

    if (Object.keys(payload).length === 0) {
      message.info(t('accountSettings.noChanges'));
      return;
    }

    try {
      const updated = await updateProfile.mutateAsync(payload);
      setPhotoPreview(updated.photoUrl);
      setPhotoCleared(false);
      message.success(t('accountSettings.updated'));
      form.setFieldsValue({
        photoUrl: undefined,
        currentPassword: undefined,
        newPassword: undefined,
        confirmPassword: undefined,
      });
    } catch (error) {
      message.error(getApiErrorMessage(error, t('accountSettings.saveFailed')));
    }
  };

  const handlePhotoUpload: UploadProps['beforeUpload'] = (file) => {
    if (!file.type.startsWith('image/')) {
      message.error(t('accountSettings.photoInvalidType'));
      return Upload.LIST_IGNORE;
    }

    if (file.size > MAX_PHOTO_UPLOAD_BYTES) {
      message.error(t('accountSettings.photoTooLarge'));
      return Upload.LIST_IGNORE;
    }

    setUploadingPhoto(true);
    void uploadPhoto
      .mutateAsync(file)
      .then((updatedUser) => {
        setPhotoPreview(updatedUser.photoUrl);
        setPhotoCleared(false);
        form.setFieldsValue({ photoUrl: undefined });
        message.success(t('accountSettings.photoUploaded'));
      })
      .catch((error) => {
        message.error(getApiErrorMessage(error, t('accountSettings.photoUploadFailed')));
      })
      .finally(() => {
        setUploadingPhoto(false);
      });

    return false;
  };

  const clearPhoto = () => {
    setPhotoPreview(undefined);
    setPhotoCleared(true);
    form.setFieldsValue({ photoUrl: undefined });
  };

  const previewLetter = (user?.name ?? 'U').charAt(0).toUpperCase();

  return (
    <div className="account-settings-page">
      <PageHeader
        title={t('accountSettings.title')}
        subtitle={t('accountSettings.subtitle')}
      />

      <Card
        bordered={false}
        className="account-settings-card"
        style={{
          maxWidth: 640,
          borderRadius: radius.card,
          border: `1px solid ${border.default}`,
          boxShadow: shadow.small,
        }}
        styles={{
          body: {
            padding: '24px',
          },
        }}
      >
        <Form
          form={form}
          layout="vertical"
          className="account-settings-form"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          {role && (
            <Form.Item label={t('accountSettings.role')} style={{ marginBottom: 20 }}>
              <div
                className="account-role-field"
                role="status"
                aria-label={`${t('accountSettings.role')}: ${t(`roles.${role}`)}`}
              >
                <Tag
                  className="account-role-badge"
                  color={isSuperAdmin ? roleTagColors.superAdmin : roleTagColors.default}
                >
                  {t(`roles.${role}`)}
                </Tag>
              </div>
            </Form.Item>
          )}

          <Form.Item
            label={t('accountSettings.photo')}
            className="account-settings-photo-item"
            style={{ marginBottom: 8 }}
          >
            <div className="account-settings-photo">
              <Avatar
                size={72}
                src={photoPreview}
                className="account-settings-photo-avatar"
                alt={t('accountSettings.photoPreview')}
              >
                {previewLetter}
              </Avatar>

              <div className="account-settings-photo-actions">
                <Space size={8} wrap>
                  <Upload
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                    showUploadList={false}
                    beforeUpload={handlePhotoUpload}
                    maxCount={1}
                    disabled={uploadingPhoto || uploadPhoto.isPending}
                  >
                    <Button
                      icon={<UploadOutlined />}
                      loading={uploadingPhoto || uploadPhoto.isPending}
                    >
                      {t('accountSettings.uploadPhoto')}
                    </Button>
                  </Upload>
                  {photoPreview && (
                    <Button
                      icon={<DeleteOutlined />}
                      onClick={clearPhoto}
                      aria-label={t('accountSettings.removePhoto')}
                      disabled={uploadingPhoto || uploadPhoto.isPending}
                    >
                      {t('accountSettings.removePhoto')}
                    </Button>
                  )}
                </Space>
                <Typography.Text type="secondary" className="account-settings-photo-hint">
                  {t('accountSettings.photoHint')}
                </Typography.Text>
              </div>
            </div>
          </Form.Item>

          <Form.Item
            name="photoUrl"
            label={t('accountSettings.photoUrlOptional')}
            rules={[
              {
                validator: async (_, value?: string) => {
                  if (!value || !value.trim()) return;
                  if (!isValidHttpPhotoUrl(value.trim())) {
                    throw new Error(t('accountSettings.photoInvalid'));
                  }
                },
              },
            ]}
            style={{ marginBottom: 20 }}
          >
            <Input size="large" placeholder="https://..." allowClear autoComplete="off" />
          </Form.Item>

          <Form.Item
            name="name"
            label={t('common.name')}
            rules={[{ required: true, message: t('accountSettings.nameRequired') }]}
            style={{ marginBottom: 20 }}
          >
            <Input size="large" />
          </Form.Item>

          <Form.Item
            name="login"
            label={t('common.login')}
            rules={[{ required: true, message: t('accountSettings.loginRequired') }]}
            style={{ marginBottom: 8 }}
          >
            <Input size="large" autoComplete="username" />
          </Form.Item>

          <Divider style={{ margin: '24px 0 20px' }} />

          <div style={{ marginBottom: 16 }}>
            <Typography.Title
              level={5}
              style={{
                margin: '0 0 8px',
                fontWeight: 600,
                color: text.primary,
                letterSpacing: '-0.01em',
              }}
            >
              {t('accountSettings.changePassword')}
            </Typography.Title>
            <Typography.Text
              style={{
                display: 'block',
                fontSize: 13,
                lineHeight: 1.5,
                color: text.secondary,
              }}
            >
              {t('accountSettings.passwordHint')}
            </Typography.Text>
          </div>

          <Form.Item
            name="currentPassword"
            label={t('accountSettings.currentPassword')}
            style={{ marginBottom: 20 }}
          >
            <Input.Password size="large" autoComplete="current-password" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label={t('accountSettings.newPassword')}
            rules={[
              {
                validator: async (_, value?: string) => {
                  if (!value) return;
                  if (
                    value.length < 12 ||
                    !/[A-Z]/.test(value) ||
                    !/[a-z]/.test(value) ||
                    !/[0-9]/.test(value) ||
                    !/[^A-Za-z0-9]/.test(value)
                  ) {
                    throw new Error(t('accountSettings.passwordPolicy'));
                  }
                },
              },
            ]}
            style={{ marginBottom: 20 }}
          >
            <Input.Password size="large" autoComplete="new-password" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label={t('accountSettings.confirmPassword')}
            dependencies={['newPassword']}
            style={{ marginBottom: 24 }}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const newPassword = getFieldValue('newPassword');
                  if (!newPassword || !value || newPassword === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t('accountSettings.passwordMismatch')));
                },
              }),
            ]}
          >
            <Input.Password size="large" autoComplete="new-password" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={updateProfile.isPending}
              style={{
                height: 44,
                minWidth: 160,
                paddingInline: 24,
                borderRadius: 10,
                fontWeight: 600,
                fontSize: 15,
              }}
            >
              {t('common.save')}
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <ActiveSessionsCard />
    </div>
  );
}
