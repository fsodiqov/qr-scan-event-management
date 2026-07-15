import { useState } from 'react';
import { Alert, Button, Card, Checkbox, Form, Input, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { getApiErrorMessage } from '@/utils/helpers';
import { getDefaultRouteForRole } from '@/utils/authRedirect';
import { useThemeTokens } from '@/contexts/ThemeContext';

interface LoginFormValues {
  login: string;
  password: string;
  rememberMe?: boolean;
}

// Demo convenience — seed owner credentials (see delete.md / npm run seed)
const DEMO_LOGIN_DEFAULTS: LoginFormValues = {
  login: 'owner',
  password: 'owner123456',
  rememberMe: false,
};

export function LoginPage() {
  const { t } = useTranslation();
  const [form] = Form.useForm<LoginFormValues>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { border, text } = useThemeTokens();

  const handleSubmit = async (values: LoginFormValues) => {
    setError(null);
    setLoading(true);

    try {
      const profile = await login({
        login: values.login,
        password: values.password,
        rememberMe: Boolean(values.rememberMe),
      });
      navigate(getDefaultRouteForRole(profile.role));
    } catch (err) {
      setError(getApiErrorMessage(err, t('auth.loginFailed')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      bordered={false}
      className="login-card"
      style={{
        borderRadius: 14,
        border: `1px solid ${border.default}`,
        boxShadow: 'var(--login-card-shadow)',
      }}
      styles={{
        body: {
          padding: 'clamp(24px, 5vw, 32px)',
        },
      }}
    >
      <Typography.Title
        level={4}
        style={{ marginTop: 0, marginBottom: 8, color: text.primary, fontWeight: 600 }}
      >
        {t('auth.signIn')}
      </Typography.Title>
      <Typography.Paragraph
        type="secondary"
        style={{ marginBottom: 24, marginTop: 0, lineHeight: 1.5 }}
      >
        {t('auth.signInSubtitle')}
      </Typography.Paragraph>

      {error && (
        <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />
      )}

      <Form
        form={form}
        layout="vertical"
        className="login-form"
        onFinish={handleSubmit}
        requiredMark={false}
        initialValues={DEMO_LOGIN_DEFAULTS}
        style={{ marginBottom: 0 }}
      >
        <Form.Item
          label={t('common.login')}
          name="login"
          rules={[{ required: true, message: t('auth.loginRequired') }]}
          style={{ marginBottom: 20 }}
        >
          <Input placeholder={t('auth.loginPlaceholder')} size="large" />
        </Form.Item>

        <Form.Item
          label={t('auth.password')}
          name="password"
          rules={[{ required: true, message: t('auth.passwordRequired') }]}
          style={{ marginBottom: 16 }}
        >
          <Input.Password placeholder={t('auth.passwordPlaceholder')} size="large" />
        </Form.Item>

        <Form.Item name="rememberMe" valuePropName="checked" style={{ marginBottom: 24 }}>
          <Checkbox>{t('auth.rememberMe')}</Checkbox>
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          block
          loading={loading}
          style={{
            height: 44,
            borderRadius: 10,
            fontWeight: 600,
            fontSize: 15,
          }}
        >
          {t('auth.signIn')}
        </Button>
      </Form>

      <div
        className="login-lang"
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: 24,
          paddingTop: 20,
          borderTop: `1px solid ${border.divider}`,
        }}
      >
        <LanguageSwitcher size="middle" />
      </div>
    </Card>
  );
}
