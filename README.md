# Ⅱ. 미분 대단원 마무리 하기

학생용 8문항 자동채점 퀴즈입니다.

## 학생 화면 흐름
1. 첫 페이지에서 5자리 학번(예: 21229)과 이름 입력
2. 각 문제에 답을 입력하고 `다음 문제` 클릭
3. 다음 문제로 넘어간 뒤에는 이전 문제로 되돌아가 수정할 수 없음
4. 8번까지 완료하면 마지막 결과 페이지에서 맞은 개수와 점수 확인
5. 틀린 문제만 교과서 원래 문항 번호와 정답이 표시됨
6. Google Sheets로 결과 제출 가능

## Google Sheets 연결
`assets/js/config.js`의 `GOOGLE_APPS_SCRIPT_WEB_APP_URL`에 Apps Script 웹 앱의 `/exec` 주소를 입력하세요.
`google-apps-script/Code.gs`는 기존 미분 8문항 응답용 코드입니다.

## GitHub Pages
저장소 최상위에 `index.html`, `assets`, `.nojekyll` 등이 오도록 업로드하고 Settings → Pages → Deploy from a branch → main / root로 배포합니다.
