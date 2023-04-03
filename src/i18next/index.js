
// i18next 라이브러리를 설치한다.
// i18next 라이브러리에서 필요한 모듈을 import 한다.
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 언어 파일을 import 한다.
import translationEN from './locales/en/translation.json';
import translationKO from './locales/ko/translation.json';

// i18next 라이브러리를 초기화한다.
i18n
  .use(initReactI18next) // react-i18next 모듈을 사용한다.
  .init({
    // 언어 파일을 설정한다.
    resources: {
      en: {
        translation: translationEN
      },
      ko: {
        translation: translationKO
      }
    },
    // 기본 언어를 설정한다.
    fallbackLng: 'en',
    // 리액트 컴포넌트에서 사용할 수 있도록 i18n 객체를 전역으로 설정한다.
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;