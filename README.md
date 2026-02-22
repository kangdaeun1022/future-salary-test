# salary-test

정적 웹 기반의 "미래 월급 테스트" 프로젝트입니다.

- 메인 테스트: AI 얼굴 분류 기반 월급 유형 테스트
- 보조 테스트: 재테크 성향 테스트
- 콘텐츠: 블로그형 칼럼 및 결과 페이지
- 배포 형태: 정적 호스팅(Cloudflare Pages 등)

## 실행 방법 (로컬)
정적 파일 프로젝트라 빌드 없이 바로 미리보기 가능합니다.

```bash
python3 -m http.server 8000
```

브라우저에서 `http://localhost:8000/index.html` 접속.

## 디렉토리 구조

```text
.
├── index.html            # 메인 테스트 페이지
├── finance-test.html     # 재테크 성향 테스트
├── blog.html             # 블로그 목록
├── blog/                 # 블로그 상세 글
├── result/               # 테스트 결과 페이지
├── assets/               # OG 이미지 등 정적 리소스
├── style.css             # 공통 스타일
├── script.js             # 공통 스크립트
├── sitemap.xml           # 사이트맵
├── robots.txt            # 크롤러 정책
└── _headers              # 배포 헤더 설정
```

## 페이지 구성 메모

- 루트의 `post-1.html` ~ `post-5.html`, `column.html`은 기존 콘텐츠 페이지입니다.
- 현재 메인 사용자 동선은 `index.html`, `finance-test.html`, `blog.html`, `blog/*` 기준으로 구성됩니다.
- URL 호환성 때문에 기존 페이지 파일은 유지하는 것을 권장합니다.

## 운영 체크리스트

1. 신규 콘텐츠 추가 시 `sitemap.xml`에 URL 반영
2. 공유 썸네일 변경 시 `assets/og-*.svg`와 각 페이지 메타태그 확인
3. 공통 링크/네비게이션 변경 시 `script.js`의 교차 링크 로직까지 함께 점검
4. 배포 전 로컬 서버에서 메뉴/링크 깨짐 여부 확인

## 정리 원칙

- 정적 URL이 외부에 노출되었을 가능성이 있어 파일 이동/삭제보다 "호환 유지"를 우선합니다.
- IDE 설정 파일은 버전관리에서 제외합니다.
