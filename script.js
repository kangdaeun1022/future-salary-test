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
let webcamStream = null; // No longer used, but keeping for now as a placeholder for removed content, will delete in next step

// DOM elements
const openFileDialogButton = document.getElementById('open-file-dialog-button'); // New button
const imageUploadHidden = document.getElementById('image-upload-hidden'); // New hidden input
const uploadedImage = document.getElementById('uploaded-image'); // New image preview
const checkSalaryButton = document.getElementById('check-salary-button');
const loadingMessage = document.getElementById('loading-message');
const resultText = document.getElementById('result-text');
const salaryAmountDisplay = document.getElementById('salary-amount'); // New element
const shareButton = document.getElementById('share-button'); // Web Share button element
const kakaoShareButton = document.getElementById('kakao-share-button'); // Kakao Share button element
const resetButton = document.getElementById('reset-button'); // Reset button element

// Initial mode is implicitly 'upload'
// No currentMode variable or switchMode function needed as only one mode exists.

// Initialize Kakao SDK
// Kakao.init should be called outside of async functions
// It needs to be called after the SDK script is loaded.
if (Kakao && !Kakao.isInitialized()) {
    Kakao.init('783d4abe65a9e7fd57276ee69d32fc04');
    console.log('Kakao SDK initialized:', Kakao.isInitialized());
}


async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    
    console.log("Teachable Machine 모델 로드 완료!");
    // No mode switching needed, directly prepare for upload logic
}

// --- Confetti Function ---
function triggerConfetti() {
    const confettiEmojis = ['💸', '💰']; // Emojis for confetti
    const defaults = {
        spread: 360,
        ticks: 50,
        gravity: 0.5,
        decay: 0.94,
        startVelocity: 30,
        colors: ['#FFD700', '#C0C0C0', '#DAA520', '#FFFFFF'] // Gold, Silver, Goldenrod, White
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

    fire(0.25, {
        spread: 26,
        startVelocity: 55,
    });
    fire(0.2, {
        spread: 60,
    });
    fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8
    });
    fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2
    });
    fire(0.1, {
        spread: 120,
        startVelocity: 45,
    });
}


// --- Reset Function ---
function resetResults() {
    resultText.textContent = '';
    salaryAmountDisplay.textContent = '';
    loadingMessage.style.display = 'none'; // Hide spinner
    shareButton.style.display = 'none';
    kakaoShareButton.style.display = 'none';
    resetButton.style.display = 'none'; // Hide reset button
}

function resetTest() {
    resetResults();
    uploadedImage.src = '#'; // Use new image element
    uploadedImage.style.opacity = '0'; // Start fade out
    setTimeout(() => { // Wait for fade out to complete before hiding
        uploadedImage.style.display = 'none'; 
    }, 500); 
    checkSalaryButton.disabled = true;
    // No mode switching needed
}
resetButton.addEventListener('click', resetTest);


// --- Image Upload Logic ---
imageUploadHidden.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedImage.src = e.target.result;
            uploadedImage.style.display = 'block'; // Use display: block
            setTimeout(() => uploadedImage.style.opacity = '1', 10); // Fade in
            checkSalaryButton.disabled = false; // Enable button after photo
            resetResults(); // Clear previous results and hide share/reset buttons
        };
        reader.readAsDataURL(file);
    } else {
        uploadedImage.src = '#';
        uploadedImage.style.opacity = '0'; // Start fade out
        setTimeout(() => { // Wait for fade out to complete before hiding
            uploadedImage.style.display = 'none'; 
        }, 500);
        checkSalaryButton.disabled = true;
        resetResults();
    }
});

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
checkSalaryButton.addEventListener('click', predict);

async function predict() {
    if (!uploadedImage.src || uploadedImage.style.display === 'none') { // Check display for prediction
        alert("먼저 이미지를 업로드하거나 촬영해주세요!");
        return;
    }

    loadingMessage.style.display = 'flex'; // Show loading message with spinner
    resetResults(); // Clear previous results and hide share/reset buttons (except loading itself)
    checkSalaryButton.disabled = true; // 분석 중에는 버튼 비활성화

    await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기

    // Use uploadedImage directly for prediction
    const prediction = await model.predict(uploadedImage);
    
    loadingMessage.style.display = 'none'; // Hide loading message
    checkSalaryButton.disabled = false; // 버튼 다시 활성화

    let resultMessage = "분석 결과가 명확하지 않습니다. 다른 사진으로 다시 시도해주세요!";
    let salaryAmountNum = 0; // Raw numerical amount
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
            salaryAmountNum = getRandomInt(8_000_000, 30_000_000); // 월 800만 ~ 3,000만
            break;
        case "Class 2":
        case "중산층":
            resultMessage = middleClassMessages[Math.floor(Math.random() * middleClassMessages.length)] + " 예상 월급 ";
            salaryAmountNum = getRandomInt(3_500_000, 6_000_000); // 월 350만 ~ 600만
            break;
        case "Class 3":
        case "거지":
            resultMessage = poorMessages[Math.floor(Math.random() * poorMessages.length)] + " 예상 월급 ";
            salaryAmountNum = getRandomInt(2_200_000, 3_000_000); // 월 220만 ~ 300만
            break;
        default:
            resultMessage = "알 수 없는 결과입니다. 다시 시도해주세요!";
            salaryAmountNum = 0;
    }

    resultText.innerHTML = resultMessage;
    if (salaryAmountNum > 0) {
        salaryAmountDisplay.textContent = formatKoreanWon(salaryAmountNum);
        triggerConfetti(); // Trigger confetti when salary amount is displayed

        // Show share buttons if available
        if (navigator.share) {
            shareButton.style.display = 'block';
        }
        if (Kakao.isInitialized()) {
            kakaoShareButton.style.display = 'block';
        }
        resetButton.style.display = 'block'; // Show reset button after result
    }
}

// --- Web Share Button Logic ---
shareButton.addEventListener('click', async () => {
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
            // User might have cancelled the share, or an error occurred
        }
    } else {
        alert('이 브라우저에서는 공유하기 기능을 지원하지 않습니다.');
        console.log('Web Share API not supported in this browser.');
    }
});

// --- Kakao Share Function ---
function shareKakao() {
    if (Kakao.isInitialized()) {
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
        console.error('Kakao SDK not initialized.');
    }
}
kakaoShareButton.addEventListener('click', shareKakao);

init(); // 페이지 로드 시 모델 초기화

// --- Hamburger Menu Toggle Logic ---
const hamburgerBtn = document.getElementById('hamburger-btn');
const closeMenuBtn = document.getElementById('close-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const menuItems = document.querySelectorAll('#mobile-menu .menu-item');

hamburgerBtn.addEventListener('click', () => {
    mobileMenu.classList.add('open');
});

closeMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
});

menuItems.forEach(item => {
    item.addEventListener('click', () => {
        mobileMenu.classList.remove('open'); // Close menu on item click
    });
});
