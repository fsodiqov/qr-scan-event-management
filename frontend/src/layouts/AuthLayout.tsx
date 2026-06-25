import { Layout, Typography } from 'antd';
import { QrcodeOutlined } from '@ant-design/icons';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const { Content } = Layout;

export function AuthLayout() {
  const { t } = useTranslation();

  return (
    <Layout style={{ height: '100dvh', overflow: 'hidden', background: '#f1f5f9' }}>
      <Content
        style={{
          height: '100%',
          overflow: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(16px, 4vw, 24px)',
          background:
            'radial-gradient(circle at top, #ffffff 0%, #f1f5f9 45%, #e8edf3 100%)',
        }}
      >
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div
              style={{
                width: 52,
                height: 52,
                margin: '0 auto 16px',
                borderRadius: 14,
                background: '#fff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 14px rgba(15, 23, 42, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <QrcodeOutlined style={{ fontSize: 26, color: '#3b6fd9' }} />
            </div>
            <Typography.Title
              level={3}
              style={{
                margin: 0,
                color: '#0f172a',
                fontWeight: 700,
                letterSpacing: '-0.02em',
              }}
            >
              {t('app.title')}
            </Typography.Title>
            <Typography.Text type="secondary" style={{ fontSize: 14 }}>
              {t('app.adminPanel')}
            </Typography.Text>
          </div>
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
}
