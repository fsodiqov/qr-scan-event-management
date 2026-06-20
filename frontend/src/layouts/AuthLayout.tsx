import { Layout, Typography } from 'antd';
import { Outlet } from 'react-router-dom';

const { Content } = Layout;

export function AuthLayout() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)',
          padding: 24,
        }}
      >
        <div style={{ width: '100%', maxWidth: 420 }}>
          <Typography.Title
            level={2}
            style={{ color: '#fff', textAlign: 'center', marginBottom: 24 }}
          >
            QR Event Attendance
          </Typography.Title>
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
}
