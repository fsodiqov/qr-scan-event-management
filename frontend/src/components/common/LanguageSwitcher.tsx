import { useEffect } from 'react';
import { Select } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import 'dayjs/locale/ru';
import 'dayjs/locale/uz-latn';
import { useIsMobile } from '@/hooks/useBreakpoint';
import type { AppLanguage } from '@/i18n';

const LANGUAGE_OPTIONS: { value: AppLanguage; labelKey: string }[] = [
  { value: 'en', labelKey: 'language.en' },
  { value: 'ko', labelKey: 'language.ko' },
  { value: 'uz', labelKey: 'language.uz' },
  { value: 'ru', labelKey: 'language.ru' },
];

const DAYJS_LOCALES: Record<AppLanguage, string> = {
  en: 'en',
  ko: 'ko',
  uz: 'uz-latn',
  ru: 'ru',
};

export function syncDayjsLocale(language: string): void {
  const locale = DAYJS_LOCALES[language as AppLanguage] ?? 'en';
  dayjs.locale(locale);
}

interface LanguageSwitcherProps {
  size?: 'small' | 'middle' | 'large';
  compact?: boolean;
}

export function LanguageSwitcher({ size = 'middle', compact }: LanguageSwitcherProps) {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const isCompact = compact ?? isMobile;

  useEffect(() => {
    syncDayjsLocale(i18n.language);
    document.documentElement.lang = i18n.language;
    document.title = t('app.title');
  }, [i18n.language, t]);

  return (
    <Select
      size={size}
      value={i18n.language.split('-')[0] as AppLanguage}
      onChange={(value: AppLanguage) => i18n.changeLanguage(value)}
      style={{ minWidth: isCompact ? 100 : 130 }}
      suffixIcon={<GlobalOutlined />}
      options={LANGUAGE_OPTIONS.map((option) => ({
        value: option.value,
        label: t(option.labelKey),
      }))}
    />
  );
}
