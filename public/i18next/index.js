// i18next 모듈을 불러온다.
const i18next = require('i18next');
const translationKO = require("./ko/translation.json");
const translationEN = require("./en/translation.json");

// i18next 초기화
i18next
  // 언어 파일 경로 설정
  .init({
    resources: {
      en: {
        translation: translationEN
      },
      ko: {
        translation: translationKO
      }
    },
    // 사용할 언어
    lng: 'en',
    // 사용할 언어 파일 이름
    ns: ['translation']
  });

module.exports = i18next;