import { Button, Tooltip } from 'antd';
import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeToggleProps {
  size?: 'small' | 'middle' | 'large';
}

export function ThemeToggle({ size = 'middle' }: ThemeToggleProps) {
  const { t } = useTranslation();
  const { mode, toggleMode } = useTheme();
  const isDark = mode === 'dark';

  return (
    <Tooltip title={isDark ? t('theme.toLight') : t('theme.toDark')}>
      <Button
        type="text"
        size={size}
        aria-label={isDark ? t('theme.toLight') : t('theme.toDark')}
        aria-pressed={isDark}
        icon={isDark ? <SunOutlined /> : <MoonOutlined />}
        onClick={toggleMode}
        className="theme-toggle-btn"
      />
    </Tooltip>
  );
}
