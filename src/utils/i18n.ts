import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 导入翻译文件
import zhCNCommon from '../locales/zh-CN/common.json';
import zhCNProject from '../locales/zh-CN/project.json';
import zhCNCategory from '../locales/zh-CN/category.json';
import zhCNFile from '../locales/zh-CN/file.json';

import enUSCommon from '../locales/en-US/common.json';
import enUSProject from '../locales/en-US/project.json';
import enUSCategory from '../locales/en-US/category.json';
import enUSFile from '../locales/en-US/file.json';

import arSACommon from '../locales/ar-SA/common.json';
import arSAProject from '../locales/ar-SA/project.json';
import arSACategory from '../locales/ar-SA/category.json';
import arSAFile from '../locales/ar-SA/file.json';

// 支持的语言列表
export const SUPPORTED_LANGUAGES = [
  { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' },
  { code: 'ar-SA', name: 'العربية', flag: '🇸🇦' },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];

// RTL 语言列表
export const RTL_LANGUAGES: LanguageCode[] = ['ar-SA'];

// 检查是否为RTL语言
export const isRTL = (language: string): boolean => {
  return RTL_LANGUAGES.includes(language as LanguageCode);
};

// 获取默认语言
export const getDefaultLanguage = (): LanguageCode => {
  const savedLanguage = localStorage.getItem('language') as LanguageCode;
  if (savedLanguage && SUPPORTED_LANGUAGES.some(l => l.code === savedLanguage)) {
    return savedLanguage;
  }
  
  // 基于浏览器语言检测
  const browserLanguage = navigator.language;
  if (browserLanguage.startsWith('zh')) return 'zh-CN';
  if (browserLanguage.startsWith('ar')) return 'ar-SA';
  return 'zh-CN'; // 默认中文
};

// 配置i18n
i18n
  .use(initReactI18next)
  .init({
    resources: {
      'zh-CN': {
        common: zhCNCommon,
        project: zhCNProject,
        category: zhCNCategory,
        file: zhCNFile,
      },
      'en-US': {
        common: enUSCommon,
        project: enUSProject,
        category: enUSCategory,
        file: enUSFile,
      },
      'ar-SA': {
        common: arSACommon,
        project: arSAProject,
        category: arSACategory,
        file: arSAFile,
      },
    },
    lng: getDefaultLanguage(),
    fallbackLng: 'zh-CN',
    debug: import.meta.env.DEV,
    
    // 命名空间配置
    defaultNS: 'common',
    ns: ['common', 'project', 'category', 'file'],
    
    interpolation: {
      escapeValue: false,
    },
    
    // React i18next 配置
    react: {
      bindI18n: 'languageChanged',
      bindI18nStore: '',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i'],
    },
  });

// 切换语言函数
export const changeLanguage = (language: LanguageCode): void => {
  i18n.changeLanguage(language);
  localStorage.setItem('language', language);
  
  // 设置HTML方向和语言属性
  document.documentElement.dir = isRTL(language) ? 'rtl' : 'ltr';
  document.documentElement.lang = language;
};

// 初始化设置HTML属性
const currentLanguage = i18n.language as LanguageCode;
document.documentElement.dir = isRTL(currentLanguage) ? 'rtl' : 'ltr';
document.documentElement.lang = currentLanguage;

export default i18n; 