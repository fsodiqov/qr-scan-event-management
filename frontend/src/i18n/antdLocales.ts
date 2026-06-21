import enUS from 'antd/locale/en_US';
import koKR from 'antd/locale/ko_KR';
import ruRU from 'antd/locale/ru_RU';
import type { Locale } from 'antd/es/locale';
import type { AppLanguage } from './index';

const uzUZ: Locale = {
  ...enUS,
  locale: 'uz',
  Pagination: {
    ...enUS.Pagination!,
    items_per_page: '/ sahifa',
  },
  Table: {
    ...enUS.Table!,
    filterConfirm: 'Filtrlash',
    filterReset: 'Tozalash',
    emptyText: "Ma'lumot yo'q",
  },
  Modal: {
    ...enUS.Modal!,
    okText: 'OK',
    cancelText: 'Bekor qilish',
  },
  Popconfirm: {
    ...enUS.Popconfirm!,
    okText: 'Ha',
    cancelText: "Yo'q",
  },
};

const antdLocales: Record<AppLanguage, Locale> = {
  en: enUS,
  ko: koKR,
  uz: uzUZ,
  ru: ruRU,
};

export function getAntdLocale(language: string): Locale {
  if (language in antdLocales) {
    return antdLocales[language as AppLanguage];
  }
  return enUS;
}
