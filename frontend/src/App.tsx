import { useTranslation } from 'react-i18next';
import { ConfigProvider, App as AntApp } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppRoutes } from '@/routes/AppRoutes';
import { getAntdLocale } from '@/i18n/antdLocales';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppProviders() {
  const { i18n } = useTranslation();

  return (
    <ConfigProvider
      locale={getAntdLocale(i18n.language)}
      theme={{
        token: {
          colorPrimary: '#3b6fd9',
          borderRadius: 8,
          colorBgLayout: '#f1f5f9',
        },
      }}
    >
      <AntApp>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProviders />
    </QueryClientProvider>
  );
}

export default App;
