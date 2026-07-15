import { theme, type ThemeConfig } from 'antd';

/** Design System v1.0 — single source of truth for brand & UI colors */

export type ColorMode = 'light' | 'dark';

export const brand = {
  primary: '#2563EB',
  primarySoft: '#EFF6FF',
  primaryBorder: '#BFDBFE',
} as const;

export const brandDark = {
  primary: '#3B82F6',
  primarySoft: 'rgba(59, 130, 246, 0.15)',
  primaryBorder: 'rgba(59, 130, 246, 0.4)',
} as const;

export const semantic = {
  success: '#059669',
  successBg: '#ECFDF5',
  successBorder: '#A7F3D0',
  warning: '#D97706',
  warningBg: '#FFF7ED',
  warningBorder: '#FED7AA',
  error: '#DC2626',
  errorBg: '#FEF2F2',
  errorBorder: '#FECACA',
  info: '#0EA5E9',
} as const;

export const semanticDark = {
  success: '#34D399',
  successBg: 'rgba(5, 150, 105, 0.18)',
  successBorder: 'rgba(52, 211, 153, 0.35)',
  warning: '#FBBF24',
  warningBg: 'rgba(217, 119, 6, 0.18)',
  warningBorder: 'rgba(251, 191, 36, 0.35)',
  error: '#F87171',
  errorBg: 'rgba(220, 38, 38, 0.18)',
  errorBorder: 'rgba(248, 113, 113, 0.35)',
  info: '#38BDF8',
} as const;

export const background = {
  layout: '#F8FAFC',
  section: '#F1F5F9',
  card: '#FFFFFF',
} as const;

export const backgroundDark = {
  layout: '#0B1220',
  section: '#111827',
  card: '#1E293B',
} as const;

export const text = {
  primary: '#0F172A',
  secondary: '#475569',
  placeholder: '#94A3B8',
  disabled: '#CBD5E1',
  inverse: '#FFFFFF',
} as const;

export const textDark = {
  primary: '#F8FAFC',
  secondary: '#94A3B8',
  placeholder: '#64748B',
  disabled: '#475569',
  inverse: '#0F172A',
} as const;

export const border = {
  default: '#E2E8F0',
  hover: '#CBD5E1',
  divider: '#F1F5F9',
} as const;

export const borderDark = {
  default: '#334155',
  hover: '#475569',
  divider: '#1E293B',
} as const;

export const sidebar = {
  background: '#FFFFFF',
  menuHover: '#F8FAFC',
  menuSelected: '#EFF6FF',
  menuSelectedBorder: '#2563EB',
  menuText: '#475569',
  selectedText: '#2563EB',
} as const;

export const sidebarDark = {
  background: '#1E293B',
  menuHover: '#0F172A',
  menuSelected: 'rgba(59, 130, 246, 0.15)',
  menuSelectedBorder: '#3B82F6',
  menuText: '#94A3B8',
  selectedText: '#60A5FA',
} as const;

export const header = {
  background: '#FFFFFF',
  border: '#E2E8F0',
} as const;

export const headerDark = {
  background: '#1E293B',
  border: '#334155',
} as const;

export const table = {
  headerBackground: '#F8FAFC',
  rowHover: '#F8FAFC',
  selectedRow: '#EFF6FF',
  border: '#E2E8F0',
} as const;

export const tableDark = {
  headerBackground: '#111827',
  rowHover: '#0F172A',
  selectedRow: 'rgba(59, 130, 246, 0.15)',
  border: '#334155',
} as const;

export const input = {
  background: '#FFFFFF',
  border: '#CBD5E1',
  placeholder: '#94A3B8',
} as const;

export const inputDark = {
  background: '#1E293B',
  border: '#475569',
  placeholder: '#64748B',
} as const;

export const status = {
  online: '#10B981',
  offline: '#94A3B8',
  draft: '#64748B',
  pending: '#F59E0B',
  completed: '#2563EB',
  cancelled: '#DC2626',
} as const;

export const scanner = {
  idle: '#2563EB',
  checkInSuccess: '#059669',
  alreadyCheckedOut: '#D97706',
  invalidQr: '#DC2626',
  overlay: 'rgba(15, 23, 42, 0.55)',
} as const;

export type ScannerPalette = {
  idle: string;
  checkInSuccess: string;
  alreadyCheckedOut: string;
  invalidQr: string;
  overlay: string;
};

export const qr = {
  foreground: '#000000',
  background: '#FFFFFF',
} as const;

export const chart = {
  blue: '#2563EB',
  green: '#10B981',
  orange: '#F59E0B',
  purple: '#8B5CF6',
  red: '#EF4444',
  teal: '#14B8A6',
} as const;

export const shadow = {
  small: '0 1px 2px rgba(15, 23, 42, 0.05)',
  card: '0 4px 12px rgba(15, 23, 42, 0.06)',
  modal: '0 20px 40px rgba(15, 23, 42, 0.15)',
} as const;

export const shadowDark = {
  small: '0 1px 2px rgba(0, 0, 0, 0.35)',
  card: '0 4px 12px rgba(0, 0, 0, 0.4)',
  modal: '0 20px 40px rgba(0, 0, 0, 0.55)',
} as const;

export const radius = {
  button: 8,
  input: 8,
  select: 8,
  dropdown: 10,
  card: 12,
  modal: 16,
  drawer: 16,
} as const;

export interface Palette {
  brand: typeof brand | typeof brandDark;
  semantic: typeof semantic | typeof semanticDark;
  background: typeof background | typeof backgroundDark;
  text: typeof text | typeof textDark;
  border: typeof border | typeof borderDark;
  sidebar: typeof sidebar | typeof sidebarDark;
  header: typeof header | typeof headerDark;
  table: typeof table | typeof tableDark;
  input: typeof input | typeof inputDark;
  shadow: typeof shadow | typeof shadowDark;
  status: typeof status;
  scanner: ScannerPalette;
  qr: typeof qr;
  chart: typeof chart;
  radius: typeof radius;
}

export const lightPalette: Palette = {
  brand,
  semantic,
  background,
  text,
  border,
  sidebar,
  header,
  table,
  input,
  shadow,
  status,
  scanner,
  qr,
  chart,
  radius,
};

export const darkPalette: Palette = {
  brand: brandDark,
  semantic: semanticDark,
  background: backgroundDark,
  text: textDark,
  border: borderDark,
  sidebar: sidebarDark,
  header: headerDark,
  table: tableDark,
  input: inputDark,
  shadow: shadowDark,
  status,
  scanner: {
    idle: scanner.idle,
    checkInSuccess: scanner.checkInSuccess,
    alreadyCheckedOut: scanner.alreadyCheckedOut,
    invalidQr: scanner.invalidQr,
    overlay: 'rgba(0, 0, 0, 0.65)',
  },
  qr,
  chart,
  radius,
};

export function getPalette(mode: ColorMode): Palette {
  return mode === 'dark' ? darkPalette : lightPalette;
}

function buildAntdTheme(palette: Palette, algorithm: ThemeConfig['algorithm']): ThemeConfig {
  const { brand: b, semantic: s, background: bg, text: tx, border: br, sidebar: sb, header: hd, table: tb, input: inp, shadow: sh } =
    palette;

  return {
    algorithm,
    token: {
      colorPrimary: b.primary,
      colorSuccess: s.success,
      colorWarning: s.warning,
      colorError: s.error,
      colorInfo: s.info,
      colorBgLayout: bg.layout,
      colorBgContainer: bg.card,
      colorBgElevated: bg.card,
      colorBorder: br.default,
      colorBorderSecondary: br.default,
      colorText: tx.primary,
      colorTextSecondary: tx.secondary,
      colorTextPlaceholder: tx.placeholder,
      colorTextDisabled: tx.disabled,
      borderRadius: radius.button,
      boxShadow: sh.small,
      boxShadowSecondary: sh.card,
      boxShadowTertiary: sh.modal,
    },
    components: {
      Layout: {
        headerBg: hd.background,
        siderBg: sb.background,
        bodyBg: bg.layout,
      },
      Menu: {
        itemBg: sb.background,
        itemColor: sb.menuText,
        itemHoverBg: sb.menuHover,
        itemHoverColor: sb.selectedText,
        itemSelectedBg: sb.menuSelected,
        itemSelectedColor: sb.selectedText,
        itemActiveBg: sb.menuSelected,
        darkItemBg: sb.background,
        darkItemColor: sb.menuText,
        darkItemHoverBg: sb.menuHover,
        darkItemSelectedBg: sb.menuSelected,
        darkItemSelectedColor: sb.selectedText,
      },
      Table: {
        headerBg: tb.headerBackground,
        rowHoverBg: tb.rowHover,
        borderColor: tb.border,
      },
      Card: {
        borderRadiusLG: radius.card,
      },
      Modal: {
        borderRadiusLG: radius.modal,
      },
      Drawer: {
        borderRadiusLG: radius.drawer,
      },
      Button: {
        borderRadius: radius.button,
      },
      Input: {
        borderRadius: radius.input,
        colorBorder: inp.border,
        activeBorderColor: b.primary,
        hoverBorderColor: br.hover,
      },
      Select: {
        borderRadius: radius.select,
      },
      Dropdown: {
        borderRadiusLG: radius.dropdown,
      },
    },
  };
}

export function getAntdTheme(mode: ColorMode): ThemeConfig {
  return buildAntdTheme(
    getPalette(mode),
    mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
  );
}

/** @deprecated Prefer getAntdTheme(mode) — kept for gradual migration */
export const antdTheme: ThemeConfig = getAntdTheme('light');
