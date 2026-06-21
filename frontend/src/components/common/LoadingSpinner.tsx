import { Spin } from 'antd';

export function LoadingSpinner({ tip }: { tip?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
      <Spin size="large" tip={tip} />
    </div>
  );
}
