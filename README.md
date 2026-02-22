# Future Salary Test

`future-salary-test.pages.dev`에 배포된 정적 웹 프로젝트입니다.

배포 URL: https://future-salary-test.pages.dev

## Live Pages
- 홈(월급 테스트): https://future-salary-test.pages.dev/
- 재테크 테스트: https://future-salary-test.pages.dev/finance-test.html
- 블로그 목록: https://future-salary-test.pages.dev/blog.html

## Project Structure
```text
.
├── index.html            # 메인 테스트
├── finance-test.html     # 재테크 성향 테스트
├── blog.html             # 블로그 목록
├── blog/                 # 블로그 상세 글
├── result/               # 결과 페이지(rich/middle/growth)
├── assets/               # OG 이미지 등 정적 리소스
├── style.css             # 공통 스타일
├── script.js             # 테스트/공통 동작 스크립트
├── sitemap.xml           # 검색엔진 사이트맵
├── robots.txt            # 크롤러 정책
└── _headers              # 배포 헤더 설정
```

## Run Locally
빌드 없이 정적 서버로 바로 실행할 수 있습니다.

```bash
python3 -m http.server 8000
```

접속: `http://localhost:8000/index.html`

## Update Checklist
1. 페이지 추가/삭제 시 `sitemap.xml` 업데이트
2. 공유 메타 변경 시 각 페이지의 `og:*`와 `assets/og-*.svg` 확인
3. 공통 링크 변경 시 `script.js`의 cross-link 로직 함께 점검
4. 배포 전 로컬에서 메뉴/내부 링크/결과 페이지 이동 확인

## Notes
- 루트의 `post-1.html`~`post-5.html`, `column.html`은 레거시 페이지로 호환성 유지를 위해 보관 중입니다.
- IDE 파일(`.idea/`)은 `.gitignore`로 관리됩니다.
