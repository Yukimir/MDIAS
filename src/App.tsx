import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { useTranslation } from 'react-i18next';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import arEG from 'antd/locale/ar_EG';
import { router } from './utils/router';
import { useRTL } from './hooks/useRTL';
import './utils/i18n'; // 确保i18n被初始化

function App() {
  const { i18n } = useTranslation();
  const { isRTL } = useRTL();

  // 获取Ant Design对应的locale
  const getAntdLocale = (lang: string) => {
    switch (lang) {
      case 'zh-CN': return zhCN;
      case 'en-US': return enUS;
      case 'ar-SA': return arEG;
      default: return zhCN;
    }
  };

  const currentLocale = getAntdLocale(i18n.language);

  // 监听语言变化，更新HTML属性
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      document.documentElement.lang = lng;
      document.documentElement.dir = lng === 'ar-SA' ? 'rtl' : 'ltr';
    };

    i18n.on('languageChanged', handleLanguageChange);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  return (
    <ConfigProvider 
      locale={currentLocale}
      direction={isRTL ? 'rtl' : 'ltr'}
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}

export default App;
