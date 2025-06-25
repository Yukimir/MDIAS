import { useTranslation } from 'react-i18next';
import { isRTL, type LanguageCode } from '../utils/i18n';

export const useRTL = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language as LanguageCode;
  const isCurrentRTL = isRTL(currentLanguage);

  return {
    isRTL: isCurrentRTL,
    direction: isCurrentRTL ? 'rtl' : 'ltr',
    currentLanguage,
    // 用于条件性样式
    rtlClass: isCurrentRTL ? 'rtl' : 'ltr',
    // 用于图标翻转
    iconTransform: isCurrentRTL ? 'scaleX(-1)' : 'none',
  };
}; 