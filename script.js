// 부드러운 스크롤
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// 스크롤 애니메이션
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// 애니메이션 대상 요소들
const animateElements = document.querySelectorAll(
    '.stat-card, .about-card, .achievement-card, .effect-card, .timeline-item'
);

animateElements.forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
});

// 숫자 카운트업 애니메이션
function animateNumber(element, target, suffix = '') {
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // easeOutQuart 이징
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + (target - start) * easeProgress);

        element.textContent = current + suffix;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// 통계 숫자 애니메이션
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach(stat => {
                const text = stat.textContent;
                if (text.includes('%')) {
                    animateNumber(stat, parseInt(text), '%');
                } else if (text.includes('+')) {
                    animateNumber(stat, parseInt(text), '+');
                } else {
                    animateNumber(stat, parseInt(text));
                }
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.stats');
if (statsSection) {
    statsObserver.observe(statsSection);
}

// 헤더 스크롤 효과
const header = document.querySelector('.header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    }

    lastScroll = currentScroll;
});

// 페이지 로드 완료 시
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// ==========================================
// 슬라이드쇼 기능
// ==========================================

// 각 슬라이드쇼의 현재 인덱스 저장
const slideshowIndices = {};

// 슬라이드쇼 초기화
function initSlideshows() {
    const slideshows = document.querySelectorAll('.slideshow');
    slideshows.forEach(slideshow => {
        const name = slideshow.dataset.slideshow;
        slideshowIndices[name] = 0;
    });
}

// 슬라이드 변경 함수
function changeSlide(slideshowName, direction) {
    const slideshow = document.querySelector(`[data-slideshow="${slideshowName}"]`);
    if (!slideshow) return;

    const slides = slideshow.querySelectorAll('.slide');
    const dots = slideshow.querySelectorAll('.dot');
    const totalSlides = slides.length;

    // 현재 인덱스 업데이트
    slideshowIndices[slideshowName] += direction;

    // 순환 처리
    if (slideshowIndices[slideshowName] >= totalSlides) {
        slideshowIndices[slideshowName] = 0;
    } else if (slideshowIndices[slideshowName] < 0) {
        slideshowIndices[slideshowName] = totalSlides - 1;
    }

    updateSlideshow(slideshowName, slides, dots);
}

// 특정 슬라이드로 이동
function goToSlide(slideshowName, index) {
    const slideshow = document.querySelector(`[data-slideshow="${slideshowName}"]`);
    if (!slideshow) return;

    const slides = slideshow.querySelectorAll('.slide');
    const dots = slideshow.querySelectorAll('.dot');

    slideshowIndices[slideshowName] = index;
    updateSlideshow(slideshowName, slides, dots);
}

// 슬라이드쇼 UI 업데이트
function updateSlideshow(slideshowName, slides, dots) {
    const currentIndex = slideshowIndices[slideshowName];

    // 모든 슬라이드 비활성화
    slides.forEach((slide, i) => {
        slide.classList.remove('active');
        if (i === currentIndex) {
            slide.classList.add('active');
        }
    });

    // 모든 도트 비활성화
    dots.forEach((dot, i) => {
        dot.classList.remove('active');
        if (i === currentIndex) {
            dot.classList.add('active');
        }
    });
}

// 자동 슬라이드 기능 (선택 사항)
function startAutoSlide(slideshowName, interval = 5000) {
    setInterval(() => {
        changeSlide(slideshowName, 1);
    }, interval);
}

// 터치/스와이프 지원
function initTouchSupport() {
    const slideshows = document.querySelectorAll('.slideshow');

    slideshows.forEach(slideshow => {
        const name = slideshow.dataset.slideshow;
        let touchStartX = 0;
        let touchEndX = 0;

        slideshow.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        slideshow.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe(name, touchStartX, touchEndX);
        }, { passive: true });
    });
}

function handleSwipe(slideshowName, startX, endX) {
    const swipeThreshold = 50;
    const diff = startX - endX;

    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // 왼쪽으로 스와이프 -> 다음 슬라이드
            changeSlide(slideshowName, 1);
        } else {
            // 오른쪽으로 스와이프 -> 이전 슬라이드
            changeSlide(slideshowName, -1);
        }
    }
}

// 키보드 네비게이션 지원
function initKeyboardSupport() {
    document.addEventListener('keydown', (e) => {
        // 현재 뷰포트에 보이는 슬라이드쇼 찾기
        const slideshows = document.querySelectorAll('.slideshow');

        slideshows.forEach(slideshow => {
            const rect = slideshow.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

            if (isVisible) {
                const name = slideshow.dataset.slideshow;
                if (e.key === 'ArrowLeft') {
                    changeSlide(name, -1);
                } else if (e.key === 'ArrowRight') {
                    changeSlide(name, 1);
                }
            }
        });
    });
}

// 슬라이드쇼 초기화 실행
document.addEventListener('DOMContentLoaded', () => {
    initSlideshows();
    initTouchSupport();
    initKeyboardSupport();

    // 자동 슬라이드 활성화 (원하지 않으면 아래 줄들을 주석 처리)
    // startAutoSlide('gstar', 5000);
    // startAutoSlide('ggc', 5000);
    // startAutoSlide('geeks', 5000);
});
