const URL = "https://teachablemachine.withgoogle.com/models/OgIgQ0pYA/";

const richMessages = [
    '숨만 쉬어도 돈이 들어오는 관상',
    '걸어 다니는 중소기업',
    '전생에 나라를 구함',
    '조물주 위에 건물주',
    '재벌 3세의 기운이 느껴짐'
];
const middleClassMessages = [
    '어딜 가나 환영받는 인재',
    '워라밸을 즐기는 능력자',
    '부장님 소리 듣는 관상',
    '실속 챙기는 알부자',
    '안정적인 자산가'
];
const poorMessages = [
    '티끌 모아 태산! 성실함이 무기',
    '대기만성형! 늦게 터집니다',
    '돈보다 명예를 좇는 예술가',
    '지금은 힘들어도 끝은 창대하리라',
    '로또 당첨을 노려보세요'
];
let model, maxPredictions;
let webcamStream = null;

// DOM elements - 선언만 전역으로 하고, 할당은 DOMContentLoaded 안에서.
let openFileDialogButton, imageUploadHidden, uploadedImage, checkSalaryButton, loadingMessage,
    resultText, salaryAmountDisplay, shareButton, kakaoShareButton, resetButton;

// --- Confetti Function ---
function triggerConfetti() {
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
    if (uploadedImage) {
        uploadedImage.src = '#';
        uploadedImage.style.opacity = '0';
        setTimeout(() => {
            uploadedImage.style.display = 'none';
        }, 500);
    }
    if (checkSalaryButton) checkSalaryButton.disabled = true;
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

    if (loadingMessage) loadingMessage.style.display = 'flex';
    resetResults();
    if (checkSalaryButton) checkSalaryButton.disabled = true;

    await new Promise(resolve => setTimeout(resolve, 1000));

    const prediction = await model.predict(uploadedImage);
    
    if (loadingMessage) loadingMessage.style.display = 'none';
    if (checkSalaryButton) checkSalaryButton.disabled = false;

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
}

// --- Web Share Button Logic ---
async function handleWebShare() {
    if (navigator.share) {
        try {
            const shareData = {
                title: '미래 월급 테스트 결과',
                text: `${resultText.textContent}${salaryAmountDisplay.textContent} 에서 나도 미래 월급을 확인해보세요!`,
                url: window.location.href
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
        Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title: '미래 월급 관상 테스트',
                description: `AI가 분석한 내 미래 월급은 ${resultText.textContent}${salaryAmountDisplay.textContent} 에서 나도 미래 월급을 확인해보세요!`,
                link: {
                    webUrl: 'https://future-salary-test.pages.dev',
                },
            },
        });
    } else {
        alert('카카오 SDK가 초기화되지 않았습니다.');
        console.error('Kakao SDK not initialized or not available.');
    }
}


// Teachable Machine model init
async function initTeachableMachine() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    
    console.log("Teachable Machine 모델 로드 완료!");
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
                    if (checkSalaryButton) checkSalaryButton.disabled = false;
                    resetResults();
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
    // This should only run on index.html where the functionality is present.
    // So, guard this call.
    if (document.getElementById('home-section')) { // 'home-section' is unique to index.html
        initTeachableMachine();
    }
});