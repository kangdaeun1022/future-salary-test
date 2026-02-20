const URL = "https://teachablemachine.withgoogle.com/models/OgIgQ0pYA/";
const TFJS_CDN = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.3.1/dist/tf.min.js";
const TM_IMAGE_CDN = "https://cdn.jsdelivr.net/npm/@teachablemachine/image@0.8/dist/teachablemachine-image.min.js";
const SITE_URL = "https://future-salary-test.pages.dev";

const SHARE_CONFIGS = {
    rich: {
        title: "미래 월급 테스트 결과: 부자 관상",
        path: "/result/rich.html",
        description: "숨만 쉬어도 돈이 들어오는 관상. 내 결과를 확인해보세요.",
        image: "/assets/og-rich.svg"
    },
    middle: {
        title: "미래 월급 테스트 결과: 안정형 관상",
        path: "/result/middle.html",
        description: "워라밸과 안정성을 갖춘 실속형 관상 결과입니다.",
        image: "/assets/og-middle.svg"
    },
    growth: {
        title: "미래 월급 테스트 결과: 성장형 관상",
        path: "/result/growth.html",
        description: "대기만성형 성장 관상. 앞으로 터질 타입입니다.",
        image: "/assets/og-growth.svg"
    },
    default: {
        title: "AI 미래 월급 테스트",
        path: "/index.html",
        description: "내 관상으로 보는 미래 월급, 지금 바로 확인하세요.",
        image: "/assets/og-default.svg"
    }
};

const richMessages = [
    '숨만 쉬어도 돈이 들어오는 관상',
    '걸어 다니는 중소기업',
    '전생에 나라를 구함',
    '조물주 위에 건물주',
    '재벌 3세의 기운이 느껴짐',
    '통장 잔고가 꾸준히 우상향하는 타입',
    '기회가 돈으로 바뀌는 감각형',
    '돈복과 인복을 같이 타고난 스타일',
    '큰판에서 승부 보는 스케일형',
    '수입 파이프라인이 늘어나는 성장형 부자'
];
const middleClassMessages = [
    '어딜 가나 환영받는 인재',
    '워라밸을 즐기는 능력자',
    '부장님 소리 듣는 관상',
    '실속 챙기는 알부자',
    '안정적인 자산가',
    '꾸준함으로 자산을 만드는 현실형',
    '리스크 관리가 좋은 밸런스형',
    '지출 관리가 뛰어난 생활형 고수',
    '복리의 힘을 믿는 장기전 강자',
    '생활 만족도와 수입을 함께 잡는 타입'
];
const poorMessages = [
    '티끌 모아 태산! 성실함이 무기',
    '대기만성형! 늦게 터집니다',
    '돈보다 명예를 좇는 예술가',
    '지금은 힘들어도 끝은 창대하리라',
    '로또 당첨을 노려보세요',
    '지금은 준비기, 다음 사이클이 중요합니다',
    '작은 습관이 큰 차이를 만드는 성장형',
    '현금흐름 점검만 해도 레벨업 가능',
    '수입 다각화가 필요한 리부트형',
    '지금의 고생이 나중에 자산이 되는 타입'
];
const FINANCE_TEST_RESULTS = {
    high: {
        title: "공격 성장형 재테크 성향",
        description: "수익 기회를 적극적으로 잡는 편입니다. 분산 투자와 손실 한도 규칙을 함께 가져가면 더 강해집니다.",
        tip: "실천 팁: 월 투자 상한선과 손절 기준을 먼저 정하세요."
    },
    balanced: {
        title: "균형 안정형 재테크 성향",
        description: "위험과 안정의 균형 감각이 좋습니다. 장기 복리 전략과 비상자금 관리가 특히 잘 맞습니다.",
        tip: "실천 팁: 자산 비중을 분기마다 한 번 리밸런싱하세요."
    },
    conservative: {
        title: "안전 우선형 재테크 성향",
        description: "리스크를 잘 통제하는 강점이 있습니다. 예적금 중심에서 ETF/적립식으로 천천히 확장하면 좋습니다.",
        tip: "실천 팁: 월 1회 소액 자동투자로 시장 적응부터 시작하세요."
    }
};
let model, maxPredictions;
let modelLoadPromise = null;
const externalScriptPromises = new Map();
let currentShareKey = "default";

// DOM elements - 선언만 전역으로 하고, 할당은 DOMContentLoaded 안에서.
let openFileDialogButton, imageUploadHidden, uploadedImage, checkSalaryButton, loadingMessage,
    resultText, salaryAmountDisplay, shareButton, kakaoShareButton, resetButton;

// --- Confetti Function ---
function triggerConfetti() {
    if (typeof confetti === 'undefined') {
        return;
    }
    const confettiEmojis = ['💸', '💰'];
    const defaults = {
        spread: 360,
        ticks: 50,
        gravity: 0.5,
        decay: 0.94,
        startVelocity: 30,
        colors: ['#FFD700', '#C0C0C0', '#DAA520', '#FFFFFF']
    };

    function fire(particleRatio, opts) {
        confetti(Object.assign({}, defaults, opts, {
            particleCount: Math.floor(200 * particleRatio),
            shapes: ['emoji'],
            shapeOptions: {
                emoji: confettiEmojis
            }
        }));
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
}


// --- Reset Function ---
function resetResults() {
    if (resultText) resultText.textContent = '';
    if (salaryAmountDisplay) salaryAmountDisplay.textContent = '';
    if (loadingMessage) loadingMessage.style.display = 'none';
    if (shareButton) shareButton.style.display = 'none';
    if (kakaoShareButton) kakaoShareButton.style.display = 'none';
    if (resetButton) resetButton.style.display = 'none';
}

function resetTest() {
    resetResults();
    currentShareKey = "default";
    if (uploadedImage) {
        uploadedImage.src = '#';
        uploadedImage.style.opacity = '0';
        setTimeout(() => {
            uploadedImage.style.display = 'none';
        }, 500);
    }
    if (checkSalaryButton) checkSalaryButton.disabled = true;
}

function getShareConfig() {
    return SHARE_CONFIGS[currentShareKey] || SHARE_CONFIGS.default;
}

function buildShareUrl(path) {
    return `${SITE_URL}${path}`;
}

function resolveShareKey(predictedClass) {
    switch (predictedClass) {
        case "Class 1":
        case "부자":
            return "rich";
        case "Class 2":
        case "중산층":
            return "middle";
        case "Class 3":
        case "거지":
            return "growth";
        default:
            return "default";
    }
}

function isHomePath(pathname) {
    return pathname === '/' || pathname.endsWith('/index.html');
}

function injectCrossLinks() {
    const pathname = window.location.pathname;
    const container = document.querySelector('.container');
    if (!container) {
        return;
    }
    if (document.getElementById('auto-cross-links')) {
        return;
    }

    const section = document.createElement('section');
    section.id = 'auto-cross-links';
    section.className = 'info-section';

    if (pathname.includes('/blog/post-')) {
        section.innerHTML = `
            <h2>관련 테스트</h2>
            <p>콘텐츠를 다 읽었다면 아래 테스트도 해보세요.</p>
            <div class="cross-link-grid">
                <a class="card-link" href="../index.html">AI 미래 월급 테스트</a>
                <a class="card-link" href="../finance-test.html">재테크 성향 테스트</a>
            </div>
        `;
    } else if (isHomePath(pathname) || pathname.endsWith('/finance-test.html')) {
        section.innerHTML = `
            <h2>추천 칼럼</h2>
            <p>테스트와 함께 읽으면 더 재밌는 칼럼입니다.</p>
            <div class="cross-link-grid">
                <a class="card-link" href="blog/post-1.html">재물운의 과학 칼럼</a>
                <a class="card-link" href="blog/post-3.html">성공하는 얼굴 특징 칼럼</a>
                <a class="card-link" href="blog/post-6.html">코 관상과 재물운 칼럼</a>
            </div>
        `;
    } else {
        return;
    }

    container.appendChild(section);
}

function handleFinanceTestSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const requiredKeys = ['q1', 'q2', 'q3', 'q4', 'q5'];

    if (!requiredKeys.every((key) => formData.get(key))) {
        alert('모든 문항에 답변해 주세요.');
        return;
    }

    const score = requiredKeys.reduce((sum, key) => sum + Number(formData.get(key)), 0);
    let result = FINANCE_TEST_RESULTS.balanced;
    if (score >= 21) {
        result = FINANCE_TEST_RESULTS.high;
    } else if (score <= 14) {
        result = FINANCE_TEST_RESULTS.conservative;
    }

    const resultBox = document.getElementById('finance-result');
    const resultTitle = document.getElementById('finance-result-title');
    const resultText = document.getElementById('finance-result-text');
    const resultTip = document.getElementById('finance-result-tip');

    if (resultTitle) resultTitle.textContent = result.title;
    if (resultText) resultText.textContent = result.description;
    if (resultTip) resultTip.textContent = result.tip;
    if (resultBox) resultBox.style.display = 'block';
}

function setupFinanceTest() {
    const form = document.getElementById('finance-test-form');
    if (!form) {
        return;
    }
    form.addEventListener('submit', handleFinanceTestSubmit);
}


// --- Utility for Random Numbers ---
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// --- Utility for Korean Won Formatting ---
function formatKoreanWon(amount) {
    const manUnit = 10000;
    if (amount >= manUnit) {
        const millions = Math.floor(amount / manUnit);
        return `월 ${millions.toLocaleString()}만 원`;
    } else {
        return `월 ${amount.toLocaleString()}원`;
    }
}

// --- Prediction Logic ---
async function predict() {
    if (!uploadedImage || !uploadedImage.src || uploadedImage.style.display === 'none') {
        alert("먼저 이미지를 업로드하거나 촬영해주세요!");
        return;
    }

    resetResults();
    if (loadingMessage) loadingMessage.style.display = 'flex';
    if (checkSalaryButton) checkSalaryButton.disabled = true;

    let prediction;
    try {
        await initTeachableMachine();
        await new Promise(resolve => setTimeout(resolve, 600));
        prediction = await model.predict(uploadedImage);
    } catch (error) {
        console.error('Prediction failed:', error);
        alert('AI 모델 로딩 또는 분석에 실패했습니다. 잠시 후 다시 시도해주세요.');
        if (loadingMessage) loadingMessage.style.display = 'none';
        if (checkSalaryButton && uploadedImage && uploadedImage.style.display !== 'none') {
            checkSalaryButton.disabled = false;
        }
        return;
    }

    if (loadingMessage) loadingMessage.style.display = 'none';

    let resultMessage = "분석 결과가 명확하지 않습니다. 다른 사진으로 다시 시도해주세요!";
    let salaryAmountNum = 0;
    let highestProbability = 0;
    let predictedClass = '';

    for (let i = 0; i < maxPredictions; i++) {
        if (prediction[i].probability.toFixed(2) > highestProbability) {
            highestProbability = prediction[i].probability.toFixed(2);
            predictedClass = prediction[i].className;
        }
    }
    
    switch (predictedClass) {
        case "Class 1":
        case "부자":
            resultMessage = richMessages[Math.floor(Math.random() * richMessages.length)] + " 예상 월급 ";
            salaryAmountNum = getRandomInt(8_000_000, 30_000_000);
            break;
        case "Class 2":
        case "중산층":
            resultMessage = middleClassMessages[Math.floor(Math.random() * middleClassMessages.length)] + " 예상 월급 ";
            salaryAmountNum = getRandomInt(3_500_000, 6_000_000);
            break;
        case "Class 3":
        case "거지":
            resultMessage = poorMessages[Math.floor(Math.random() * poorMessages.length)] + " 예상 월급 ";
            salaryAmountNum = getRandomInt(2_200_000, 3_000_000);
            break;
        default:
            resultMessage = "알 수 없는 결과입니다. 다시 시도해주세요!";
            salaryAmountNum = 0;
    }
    currentShareKey = resolveShareKey(predictedClass);

    if (resultText) resultText.innerHTML = resultMessage;
    if (salaryAmountNum > 0) {
        if (salaryAmountDisplay) salaryAmountDisplay.textContent = formatKoreanWon(salaryAmountNum);
        triggerConfetti();

        if (navigator.share && shareButton) {
            shareButton.style.display = 'block';
        }
        if (typeof Kakao !== 'undefined' && Kakao.isInitialized() && kakaoShareButton) {
            kakaoShareButton.style.display = 'block';
        }
        if (resetButton) resetButton.style.display = 'block';
    }

    if (checkSalaryButton && uploadedImage && uploadedImage.style.display !== 'none') {
        checkSalaryButton.disabled = false;
    }
}

// --- Web Share Button Logic ---
async function handleWebShare() {
    if (navigator.share) {
        try {
            const shareConfig = getShareConfig();
            const shareUrl = buildShareUrl(shareConfig.path);
            const shareData = {
                title: shareConfig.title,
                text: `${resultText.textContent}${salaryAmountDisplay.textContent} 에서 나도 미래 월급을 확인해보세요!`,
                url: shareUrl
            };
            await navigator.share(shareData);
            console.log('Web Share successful');
        } catch (error) {
            console.error('Error sharing via Web Share:', error);
        }
    } else {
        alert('이 브라우저에서는 공유하기 기능을 지원하지 않습니다.');
        console.log('Web Share API not supported in this browser.');
    }
}

// --- Kakao Share Function ---
function shareKakao() {
    if (typeof Kakao !== 'undefined' && Kakao.isInitialized()) {
        const shareConfig = getShareConfig();
        const shareUrl = buildShareUrl(shareConfig.path);
        const homeUrl = buildShareUrl("/index.html");
        Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title: shareConfig.title,
                description: `AI가 분석한 내 미래 월급은 ${resultText.textContent}${salaryAmountDisplay.textContent} 에서 나도 미래 월급을 확인해보세요!`,
                imageUrl: `${SITE_URL}${shareConfig.image}`,
                link: {
                    mobileWebUrl: shareUrl,
                    webUrl: shareUrl
                },
            },
            buttons: [
                {
                    title: '결과 확인하기',
                    link: {
                        mobileWebUrl: shareUrl,
                        webUrl: shareUrl
                    }
                },
                {
                    title: '테스트 하러가기',
                    link: {
                        mobileWebUrl: homeUrl,
                        webUrl: homeUrl
                    }
                }
            ]
        });
    } else {
        alert('카카오 SDK가 초기화되지 않았습니다.');
        console.error('Kakao SDK not initialized or not available.');
    }
}


function loadExternalScript(src, globalCheck) {
    if (typeof globalCheck === 'function' && globalCheck()) {
        return Promise.resolve();
    }
    if (externalScriptPromises.has(src)) {
        return externalScriptPromises.get(src);
    }

    const scriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
    });

    externalScriptPromises.set(src, scriptPromise);
    return scriptPromise;
}

// Teachable Machine model init (lazy loaded)
async function initTeachableMachine() {
    if (model) {
        return;
    }
    if (modelLoadPromise) {
        return modelLoadPromise;
    }

    modelLoadPromise = (async () => {
        await loadExternalScript(TFJS_CDN, () => typeof tf !== 'undefined');
        await loadExternalScript(TM_IMAGE_CDN, () => typeof tmImage !== 'undefined');

    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        console.log("Teachable Machine 모델 로드 완료!");
    })().catch((error) => {
        modelLoadPromise = null;
        throw error;
    });

    return modelLoadPromise;
}


// All DOM-related interactions and event listeners should be inside DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // Assign DOM elements inside DOMContentLoaded
    openFileDialogButton = document.getElementById('open-file-dialog-button');
    imageUploadHidden = document.getElementById('image-upload-hidden');
    uploadedImage = document.getElementById('uploaded-image');
    checkSalaryButton = document.getElementById('check-salary-button');
    loadingMessage = document.getElementById('loading-message');
    resultText = document.getElementById('result-text');
    salaryAmountDisplay = document.getElementById('salary-amount');
    shareButton = document.getElementById('share-button');
    kakaoShareButton = document.getElementById('kakao-share-button');
    resetButton = document.getElementById('reset-button');

    // Initialize Kakao SDK (moved here)
    if (typeof Kakao !== 'undefined' && !Kakao.isInitialized()) {
        Kakao.init('783d4abe65a9e7fd57276ee69d32fc04');
        console.log('Kakao SDK initialized:', Kakao.isInitialized());
    }

    // --- Hamburger Menu Toggle Logic ---
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuItems = document.querySelectorAll('#mobile-menu .menu-item');

    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', () => {
            if (mobileMenu) {
                mobileMenu.classList.toggle('open');
            }
        });
    }

    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', () => {
            if (mobileMenu) {
                mobileMenu.classList.remove('open');
            }
        });
    }

    if (menuItems) {
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                if (mobileMenu) {
                    mobileMenu.classList.remove('open');
                }
            });
        });
    }

    // --- Event Listeners for main functionality (index.html specific) ---
    // These elements might not exist on all pages, so robust checks are important.
    if (imageUploadHidden) {
        imageUploadHidden.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    if (uploadedImage) {
                        uploadedImage.src = e.target.result;
                        uploadedImage.style.display = 'block';
                        setTimeout(() => uploadedImage.style.opacity = '1', 10);
                    }
                    if (checkSalaryButton) checkSalaryButton.disabled = true;
                    resetResults();
                    if (loadingMessage) loadingMessage.style.display = 'flex';
                    initTeachableMachine()
                        .then(() => {
                            if (checkSalaryButton && uploadedImage && uploadedImage.style.display !== 'none') {
                                checkSalaryButton.disabled = false;
                            }
                        })
                        .catch((error) => {
                            console.error('Model preload failed:', error);
                            alert('AI 모델 로딩에 실패했습니다. 네트워크 상태를 확인해주세요.');
                        })
                        .finally(() => {
                            if (loadingMessage) loadingMessage.style.display = 'none';
                        });
                };
                reader.readAsDataURL(file);
            } else {
                if (uploadedImage) {
                    uploadedImage.src = '#';
                    uploadedImage.style.opacity = '0';
                    setTimeout(() => {
                        uploadedImage.style.display = 'none';
                    }, 500);
                }
                if (checkSalaryButton) checkSalaryButton.disabled = true;
                resetResults();
            }
        });
    }

    if (checkSalaryButton) {
        checkSalaryButton.addEventListener('click', predict);
    }

    if (shareButton) {
        shareButton.addEventListener('click', handleWebShare);
    }

    if (kakaoShareButton) {
        kakaoShareButton.addEventListener('click', shareKakao);
    }

    if (resetButton) {
        resetButton.addEventListener('click', resetTest);
    }

    // Initialize Teachable Machine model for index.html
    // Model is loaded lazily after image selection or first prediction request.
    if (document.getElementById('home-section')) { // 'home-section' is unique to index.html
        if (checkSalaryButton) checkSalaryButton.disabled = true;
    }

    setupFinanceTest();
    injectCrossLinks();
});
