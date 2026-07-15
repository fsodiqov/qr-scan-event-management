import { Layout, Typography } from 'antd';
import { QrcodeOutlined } from '@ant-design/icons';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { useThemeTokens } from '@/contexts/ThemeContext';

const { Content } = Layout;

/** Soft tiled QR motif — brand cue without visual noise */
const QR_PATTERN_SVG = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72" fill="none">
  <g fill="#2563EB">
    <rect x="6" y="6" width="18" height="18" rx="1" fill="none" stroke="#2563EB" stroke-width="2.5"/>
    <rect x="11" y="11" width="8" height="8" rx="0.5"/>
    <rect x="48" y="6" width="18" height="18" rx="1" fill="none" stroke="#2563EB" stroke-width="2.5"/>
    <rect x="53" y="11" width="8" height="8" rx="0.5"/>
    <rect x="6" y="48" width="18" height="18" rx="1" fill="none" stroke="#2563EB" stroke-width="2.5"/>
    <rect x="11" y="53" width="8" height="8" rx="0.5"/>
    <rect x="32" y="10" width="4" height="4" rx="0.5"/>
    <rect x="40" y="10" width="4" height="4" rx="0.5"/>
    <rect x="32" y="18" width="4" height="4" rx="0.5"/>
    <rect x="40" y="26" width="4" height="4" rx="0.5"/>
    <rect x="48" y="32" width="4" height="4" rx="0.5"/>
    <rect x="56" y="32" width="4" height="4" rx="0.5"/>
    <rect x="32" y="32" width="4" height="4" rx="0.5"/>
    <rect x="32" y="40" width="4" height="4" rx="0.5"/>
    <rect x="40" y="40" width="4" height="4" rx="0.5"/>
    <rect x="48" y="40" width="4" height="4" rx="0.5"/>
    <rect x="56" y="48" width="4" height="4" rx="0.5"/>
    <rect x="32" y="56" width="4" height="4" rx="0.5"/>
    <rect x="40" y="56" width="4" height="4" rx="0.5"/>
    <rect x="48" y="56" width="4" height="4" rx="0.5"/>
    <rect x="56" y="56" width="4" height="4" rx="0.5"/>
  </g>
</svg>
`.trim());

export function AuthLayout() {
  const { t } = useTranslation();
  const { background, border, brand, radius, shadow, text } = useThemeTokens();

  return (
    <Layout style={{ position: 'relative', height: '100dvh', overflow: 'hidden', background: background.layout }}>
      <div className="auth-theme-toggle">
        <ThemeToggle />
      </div>
      <Content className="auth-layout">
        <div className="auth-layout__backdrop" aria-hidden>
          <div className="auth-layout__gradient" />
          <div className="auth-layout__grid" />
          <div
            className="auth-layout__qr"
            style={{
              backgroundImage: `url("data:image/svg+xml,${QR_PATTERN_SVG}")`,
            }}
          />
        </div>

        <div className="auth-layout__content">
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div
              style={{
                width: 56,
                height: 56,
                margin: '0 auto 16px',
                borderRadius: radius.card,
                background: background.card,
                border: `1px solid ${border.default}`,
                boxShadow: shadow.card,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <QrcodeOutlined style={{ fontSize: 28, color: brand.primary }} />
            </div>
            <Typography.Title
              level={3}
              style={{
                margin: '0 0 8px',
                color: text.primary,
                fontWeight: 700,
                letterSpacing: '-0.02em',
              }}
            >
              {t('app.title')}
            </Typography.Title>
            <Typography.Text
              style={{
                fontSize: 14,
                color: text.secondary,
                lineHeight: 1.5,
              }}
            >
              {t('app.adminPanel')}
            </Typography.Text>
          </div>
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
}
