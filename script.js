document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Ambient Background Particles ---
    const bgCanvas = document.getElementById('ambient-canvas');
    const bgCtx = bgCanvas.getContext('2d');

    function resizeBgCanvas() {
        bgCanvas.width = window.innerWidth;
        bgCanvas.height = window.innerHeight;
    }
    resizeBgCanvas();
    window.addEventListener('resize', resizeBgCanvas);

    const particles = Array.from({ length: 30 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.3 - 0.1
    }));

    function renderAmbient() {
        bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
        
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.y < 0) p.y = bgCanvas.height;
            if (p.x < 0) p.x = bgCanvas.width;
            if (p.x > bgCanvas.width) p.x = 0;

            bgCtx.beginPath();
            bgCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            bgCtx.fillStyle = `rgba(243, 229, 171, ${p.alpha})`;
            bgCtx.shadowBlur = 4;
            bgCtx.shadowColor = '#d4af37';
            bgCtx.fill();
        });

        requestAnimationFrame(renderAmbient);
    }
    renderAmbient();

    // --- 2. Rain Animation for Book 1 ---
    const rainCanvas = document.getElementById('rain-canvas');
    const rainCtx = rainCanvas.getContext('2d');

    function resizeRainCanvas() {
        rainCanvas.width = window.innerWidth;
        rainCanvas.height = window.innerHeight;
    }
    resizeRainCanvas();
    window.addEventListener('resize', resizeRainCanvas);

    const raindrops = Array.from({ length: 60 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        length: Math.random() * 20 + 10,
        speed: Math.random() * 4 + 3,
        opacity: Math.random() * 0.4 + 0.1
    }));

    function renderRain() {
        rainCtx.clearRect(0, 0, rainCanvas.width, rainCanvas.height);
        
        raindrops.forEach(drop => {
            drop.y += drop.speed;
            if (drop.y > rainCanvas.height) {
                drop.y = -20;
                drop.x = Math.random() * window.innerWidth;
            }

            rainCtx.beginPath();
            rainCtx.moveTo(drop.x, drop.y);
            rainCtx.lineTo(drop.x - 1, drop.y + drop.length);
            rainCtx.strokeStyle = `rgba(174, 219, 245, ${drop.opacity})`;
            rainCtx.lineWidth = 1.2;
            rainCtx.stroke();
        });

        requestAnimationFrame(renderRain);
    }
    renderRain();

    // --- 3. High 60 FPS Flower Animation ---
    const flowerCanvas = document.getElementById('flower-canvas');
    const ctx = flowerCanvas.getContext('2d');
    const bloomSlider = document.getElementById('bloom-slider');
    const flowerStatus = document.getElementById('flower-status');
    const btnToggle = document.getElementById('btn-toggle');
    const btnText = document.getElementById('btn-text');
    const flowerGlow = document.getElementById('flower-glow');
    const touchHint = document.getElementById('touch-hint');
    const flowerContainer = document.getElementById('flower-container');

    let currentProgress = 0;
    let targetProgress = 0;
    const petalCount = 8;
    const centerX = flowerCanvas.width / 2;
    const centerY = flowerCanvas.height / 2 + 10;

    function drawFlower(progress) {
        ctx.clearRect(0, 0, flowerCanvas.width, flowerCanvas.height);

        ctx.beginPath();
        ctx.moveTo(centerX, centerY + 20);
        ctx.quadraticCurveTo(centerX - 10, centerY + 80, centerX, centerY + 120);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#4a5d3f';
        ctx.stroke();

        const leafProgress = Math.min(progress * 1.2, 1);
        if (leafProgress > 0.1) {
            ctx.save();
            ctx.fillStyle = '#3a4d30';
            ctx.beginPath();
            ctx.moveTo(centerX - 5, centerY + 70);
            ctx.quadraticCurveTo(centerX - 35 * leafProgress, centerY + 50, centerX - 15 * leafProgress, centerY + 85);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(centerX + 3, centerY + 80);
            ctx.quadraticCurveTo(centerX + 35 * leafProgress, centerY + 60, centerX + 15 * leafProgress, centerY + 95);
            ctx.fill();
            ctx.restore();
        }

        for (let i = 0; i < petalCount; i++) {
            const angle = (i * 2 * Math.PI) / petalCount;
            drawPetal(angle, progress, 55, 24, '#b8860b', '#d4af37', 0.85);
        }

        for (let i = 0; i < petalCount; i++) {
            const angle = (i * 2 * Math.PI) / petalCount + Math.PI / petalCount;
            drawPetal(angle, progress, 45, 18, '#d4af37', '#f3e5ab', 1.0);
        }

        ctx.save();
        ctx.beginPath();
        const centerRadius = 8 + progress * 6;
        ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
        
        const centerGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, centerRadius);
        centerGrad.addColorStop(0, '#fff5cc');
        centerGrad.addColorStop(0.7, '#d4af37');
        centerGrad.addColorStop(1, '#8b6508');
        
        ctx.fillStyle = centerGrad;
        ctx.shadowBlur = 10 * progress;
        ctx.shadowColor = '#f3e5ab';
        ctx.fill();
        ctx.restore();

        flowerGlow.style.opacity = progress * 0.8;
        if (progress > 0.8) {
            flowerStatus.textContent = "الزهرة في أوج تفتحها ✨";
            btnText.textContent = "إذبال الزهرة";
        } else if (progress < 0.2) {
            flowerStatus.textContent = "الزهرة في حالة ذبول 🌿";
            btnText.textContent = "إزهار الزهرة";
        } else {
            flowerStatus.textContent = "الزهرة تتفتح... 🌸";
        }
    }

    function drawPetal(angle, progress, maxLength, maxWidth, colorStart, colorEnd, alphaMultiplier) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);

        const currentLength = 12 + progress * (maxLength - 12);
        const currentWidth = 6 + progress * (maxWidth - 6);
        const curl = (1 - progress) * 15;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-currentWidth, -currentLength * 0.4, -currentWidth + curl, -currentLength, 0, -currentLength);
        ctx.bezierCurveTo(currentWidth - curl, -currentLength, currentWidth, -currentLength * 0.4, 0, 0);

        const grad = ctx.createLinearGradient(0, 0, 0, -currentLength);
        grad.addColorStop(0, colorStart);
        grad.addColorStop(0.6, colorEnd);
        grad.addColorStop(1, '#ffffff');

        ctx.fillStyle = grad;
        ctx.globalAlpha = (0.3 + progress * 0.7) * alphaMultiplier;
        ctx.shadowBlur = progress * 8;
        ctx.shadowColor = 'rgba(212, 175, 55, 0.4)';
        ctx.fill();
        ctx.restore();
    }

    function animate() {
        const diff = targetProgress - currentProgress;
        if (Math.abs(diff) > 0.001) {
            currentProgress += diff * 0.08;
            bloomSlider.value = currentProgress;
            drawFlower(currentProgress);
        }
        requestAnimationFrame(animate);
    }
    animate();

    bloomSlider.addEventListener('input', (e) => {
        targetProgress = parseFloat(e.target.value);
        touchHint.style.opacity = '0';
    });

    const toggleFlowerState = () => {
        targetProgress = targetProgress > 0.5 ? 0 : 1;
        touchHint.style.opacity = '0';
        triggerHaptic();
    };

    btnToggle.addEventListener('click', toggleFlowerState);
    flowerContainer.addEventListener('click', toggleFlowerState);

    function triggerHaptic() {
        if (navigator.vibrate) {
            navigator.vibrate(25);
        }
    }

    // --- 4. Mobile Book Carousel & Correct RTL Drag (محسوس بالاتجاه العربي الصحيح) ---
    const track = document.getElementById('carousel-track');
    const cards = Array.from(track.querySelectorAll('.book-card'));
    const dotsContainer = document.getElementById('carousel-dots');
    
    let currentIndex = 0;
    let startX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let isDragging = false;
    let hasMoved = false;

    cards.forEach((_, idx) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (idx === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(idx));
        dotsContainer.appendChild(dot);
    });

    const dots = Array.from(dotsContainer.querySelectorAll('.dot'));

    function updateCarousel() {
        const cardWidth = 160 + 16;
        const containerWidth = track.parentElement.offsetWidth;
        const centerOffset = (containerWidth - 160) / 2;
        
        // اتجاه موجب في RTL لجعل التصفح يبدأ من اليمين ويسحب لليسار بشكل طبيعي
        currentTranslate = currentIndex * cardWidth - centerOffset;
        prevTranslate = currentTranslate;
        
        track.style.transform = `translateX(${currentTranslate}px)`;

        cards.forEach((card, idx) => {
            card.classList.toggle('active', idx === currentIndex);
        });

        dots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === currentIndex);
        });
    }

    function goToSlide(index) {
        currentIndex = Math.max(0, Math.min(index, cards.length - 1));
        updateCarousel();
    }

    const container = document.getElementById('carousel-container');

    container.addEventListener('touchstart', (e) => {
        isDragging = true;
        hasMoved = false;
        startX = e.touches[0].clientX;
        track.style.transition = 'none';
    }, {passive: true});

    container.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const currentPosition = e.touches[0].clientX;
        const diff = currentPosition - startX;
        if (Math.abs(diff) > 5) hasMoved = true;
        // تعديل اتجاه السحب ليتوافق مع اللغة العربية RTL
        track.style.transform = `translateX(${prevTranslate - diff}px)`;
    }, {passive: true});

    container.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        track.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
        
        const movedBy = currentTranslate - prevTranslate;
        if (movedBy > 40 && currentIndex < cards.length - 1) {
            currentIndex += 1;
        } else if (movedBy < -40 && currentIndex > 0) {
            currentIndex -= 1;
        }
        updateCarousel();
    });

    // Mouse support
    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        hasMoved = false;
        startX = e.clientX;
        track.style.transition = 'none';
    });

    container.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const currentPosition = e.clientX;
        const diff = currentPosition - startX;
        if (Math.abs(diff) > 5) hasMoved = true;
        track.style.transform = `translateX(${prevTranslate - diff}px)`;
    });

    container.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        track.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
        
        const movedBy = currentTranslate - prevTranslate;
        if (movedBy > 40 && currentIndex < cards.length - 1) {
            currentIndex += 1;
        } else if (movedBy < -40 && currentIndex > 0) {
            currentIndex -= 1;
        }
        updateCarousel();
    });

    container.addEventListener('mouseleave', () => {
        if (isDragging) {
            isDragging = false;
            track.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
            updateCarousel();
        }
    });

    updateCarousel();
    window.addEventListener('resize', updateCarousel);

    // --- 5. Book Pages & Auto Music Player ---
    const bookPages = {
        1: { page: document.getElementById('book-page-1'), audio: document.getElementById('bg-audio-1') },
        2: { page: document.getElementById('book-page-2'), audio: document.getElementById('bg-audio-2') },
        3: { page: document.getElementById('book-page-3'), audio: document.getElementById('bg-audio-3') },
        4: { page: document.getElementById('book-page-4'), audio: document.getElementById('bg-audio-4') },
        5: { page: document.getElementById('book-page-5'), audio: document.getElementById('bg-audio-5') }
    };

    cards.forEach((card, idx) => {
        card.addEventListener('click', (e) => {
            if (hasMoved) return;
            const bookId = card.getAttribute('data-book');
            const target = bookPages[bookId];

            if (target && target.page) {
                target.page.classList.add('active');
                triggerHaptic();
                if (target.audio) {
                    target.audio.play().catch(err => console.log("Audio autoplay prevented:", err));
                }
            }
        });
    });

    for (let id in bookPages) {
        const closeBtn = document.querySelector(`[data-close-book="${id}"]`);
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                const target = bookPages[id];
                if (target && target.page) {
                    target.page.classList.remove('active');
                    if (target.audio && !target.audio.paused) {
                        target.audio.pause();
                        target.audio.currentTime = 0;
                    }
                }
            });
        }
    }
});
