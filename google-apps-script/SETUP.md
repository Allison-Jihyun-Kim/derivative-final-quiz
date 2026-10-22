# Google Sheets 연결
1. 새 Google 스프레드시트를 만듭니다.
2. 확장 프로그램 → Apps Script를 엽니다.
3. 기본 Code.gs 내용을 지우고 이 폴더의 Code.gs 전체를 붙여넣고 저장합니다.
4. 배포 → 새 배포 → 유형: 웹 앱.
5. 실행 사용자: 나 / 액세스 권한: 모든 사용자로 배포합니다.
6. 발급된 `/exec`로 끝나는 웹 앱 URL을 복사합니다.
7. `assets/js/config.js`의 `PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE`를 그 URL로 바꿉니다.
8. GitHub에 수정된 config.js를 업로드/커밋합니다.
