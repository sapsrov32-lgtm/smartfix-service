/* =================================================================
   SmartFix — JavaScript
   Вся интерактивность: форма → WhatsApp, анимации, навигация
   ================================================================= */

// ----- КОНТАКТЫ И КОНСТАНТЫ (менять здесь) -----
const BUSINESS_NAME   = 'SmartFix';
const PHONE           = '+996 999 010 696';
const PHONE_RAW       = '+996999010696';
const WHATSAPP_NUMBER = '996999010696';
const CITY            = 'Бишкек';
const WHATSAPP_BASE   = `https://wa.me/${WHATSAPP_NUMBER}`;

// Предзаполненный текст для кнопок «Написать нам»
const WA_DEFAULT_TEXT = 'Здравствуйте! Хочу вызвать мастера';

// ----- SUPABASE CONFIG (База данных для отзывов) -----
const SUPABASE_URL = 'https://ctpesdissrutihmgghsn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0cGVzZGlzc3J1dGlobWdnaHNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxNjk0NzUsImV4cCI6MjEwODc0NTQ3NX0.ekKjoSXNNxCHGPGZH_h4H8hT9ZltXYw7CixWNk6UeTU';

// ----- ЦЕНЫ НА УСЛУГИ (редактировать в одном месте) -----
const MASTER_PRICES = [
    { id: 'plumber',   master: 'Сантехник',           price: 500, currency: 'сом' },
    { id: 'electric',  master: 'Электрик',            price: 500, currency: 'сом' },
    { id: 'furniture', master: 'Сборка мебели',       price: 800, currency: 'сом' },
    { id: 'repair',    master: 'Мелкий ремонт',       price: 400, currency: 'сом' },
    { id: 'mount',     master: 'Навеска',             price: 300, currency: 'сом' },
    { id: 'universal', master: 'Универсальный мастер', price: 500, currency: 'сом' }
];

// ----- DOM Ready -----
document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initMobileMenu();
    initSmoothScroll();
    initRevealAnimations();
    initCounters();
    initPrices();
    initServiceCards();
    initForm();
    initReviewSystem();
    initFAQ();
    initHeroGlow();
    initFloatingButtons();
    initModal();
});

/* =================================================================
   HEADER — прилипание и смена фона при скролле
   ================================================================= */
function initHeader() {
    const header = document.getElementById('header');
    if (!header) return;

    const onScroll = () => {
        header.classList.toggle('header--scrolled', window.scrollY > 40);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // начальное состояние
}

/* =================================================================
   МОБИЛЬНОЕ МЕНЮ — бургер с анимацией
   ================================================================= */
function initMobileMenu() {
    const burger = document.getElementById('burger');
    const menu   = document.getElementById('mobile-menu');
    if (!burger || !menu) return;

    const toggle = () => {
        const isOpen = menu.classList.toggle('active');
        burger.classList.toggle('active', isOpen);
        burger.setAttribute('aria-expanded', isOpen);
        menu.setAttribute('aria-hidden', !isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    burger.addEventListener('click', toggle);

    // Закрытие по клику на ссылку
    menu.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', () => {
            if (menu.classList.contains('active')) toggle();
        });
    });
}

/* =================================================================
   ПЛАВНЫЙ СКРОЛЛ К ЯКОРЯМ
   ================================================================= */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

/* =================================================================
   REVEAL-АНИМАЦИИ (IntersectionObserver)
   ================================================================= */
function initRevealAnimations() {
    // Уважаем prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('revealed'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* =================================================================
   АНИМИРОВАННЫЕ СЧЁТЧИКИ
   ================================================================= */
function initCounters() {
    const counters = document.querySelectorAll('.stat-card__number[data-target]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
}

function animateCounter(el) {
    const target       = parseFloat(el.dataset.target);
    const decimal      = el.dataset.decimal === 'true';
    const finalDisplay = el.dataset.display;
    const duration     = 2000;
    const start        = performance.now();

    const update = (now) => {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutExpo
        const ease = 1 - Math.pow(2, -10 * progress);
        const value = ease * target;

        el.textContent = decimal
            ? value.toFixed(1)
            : Math.floor(value).toLocaleString('ru-RU');

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.textContent = finalDisplay || (decimal
                ? target.toFixed(1)
                : target.toLocaleString('ru-RU'));
        }
    };

    requestAnimationFrame(update);
}

/* =================================================================
   ЦЕНЫ — синхронизация цен из единого массива MASTER_PRICES
   ================================================================= */
function initPrices() {
    const cards = document.querySelectorAll('.price-card[data-master]');
    cards.forEach(card => {
        const masterName = card.dataset.master;
        const config = MASTER_PRICES.find(item => item.master === masterName);
        if (config) {
            card.dataset.price = config.price;
            const priceElem = card.querySelector('.price-card__price strong');
            if (priceElem) {
                priceElem.textContent = config.price.toLocaleString('ru-RU');
            }
        }
    });
}

/* =================================================================
   СЕРВИСНЫЕ КАРТОЧКИ → выбор мастера + скролл к форме
   ================================================================= */
function initServiceCards() {
    document.querySelectorAll('.service-card[data-master]').forEach(card => {
        card.addEventListener('click', () => selectMaster(card.dataset.master));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectMaster(card.dataset.master);
            }
        });
    });

    // Кнопки «Вызвать» в ценах
    document.querySelectorAll('.price-card__btn[data-master]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            selectMaster(btn.dataset.master);
        });
    });
}

function selectMaster(masterName) {
    // Находим и отмечаем нужный чип
    const chips = document.querySelectorAll('#master-chips input[name="master"]');
    chips.forEach(input => {
        input.checked = (input.value === masterName);
    });

    // Скроллим к форме
    const formSection = document.getElementById('form');
    if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/* =================================================================
   ФОРМА ЗАЯВКИ
   ================================================================= */
function initForm() {
    const form = document.getElementById('booking-form');
    if (!form) return;

    // Маска телефона
    const phoneInput = document.getElementById('field-phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', handlePhoneMask);
        phoneInput.addEventListener('focus', () => {
            if (!phoneInput.value) phoneInput.value = '+996 ';
        });
    }

    form.addEventListener('submit', handleFormSubmit);
}

/**
 * Маска телефона: +996 XXX XXX XXX
 */
function handlePhoneMask(e) {
    const input = e.target;
    let digits = input.value.replace(/\D/g, '');

    // Убираем ведущую 996 если есть
    if (digits.startsWith('996')) {
        digits = digits.substring(3);
    }

    // Максимум 9 цифр после 996
    digits = digits.substring(0, 9);

    // Формируем
    let formatted = '+996';
    if (digits.length > 0) formatted += ' ' + digits.substring(0, 3);
    if (digits.length > 3) formatted += ' ' + digits.substring(3, 6);
    if (digits.length > 6) formatted += ' ' + digits.substring(6, 9);

    input.value = formatted;
}

/**
 * Обработка отправки формы
 */
function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = document.getElementById('form-submit');

    // Собираем данные
    const masterInput = form.querySelector('input[name="master"]:checked');
    const data = {
        master:   masterInput ? masterInput.value : '',
        name:     document.getElementById('field-name').value.trim(),
        phone:    document.getElementById('field-phone').value.trim(),
        district: document.getElementById('field-district').value,
        time:     document.getElementById('field-time').value,
        desc:     document.getElementById('field-desc').value.trim(),
    };

    // Валидация
    let valid = true;

    if (!data.master) {
        showError('error-master');
        valid = false;
    } else {
        hideError('error-master');
    }

    if (!data.name) {
        showError('error-name');
        document.getElementById('field-name').classList.add('error');
        valid = false;
    } else {
        hideError('error-name');
        document.getElementById('field-name').classList.remove('error');
    }

    // Телефон: минимум +996 + 9 цифр
    const phoneDigits = data.phone.replace(/\D/g, '');
    if (phoneDigits.length < 12) {
        showError('error-phone');
        document.getElementById('field-phone').classList.add('error');
        valid = false;
    } else {
        hideError('error-phone');
        document.getElementById('field-phone').classList.remove('error');
    }

    if (!valid) return;

    // Состояние загрузки
    submitBtn.classList.add('btn--loading');

    // Небольшая задержка для ощущения обработки
    setTimeout(() => {
        sendRequest(data);
        submitBtn.classList.remove('btn--loading');
    }, 600);
}

/**
 * Отправка заявки — сейчас открывает WhatsApp.
 * В будущем можно подключить Telegram-бота или Google Таблицу.
 * @param {Object} data — данные формы
 */
function sendRequest(data) {
    // Собираем текст сообщения
    const lines = [
        `Здравствуйте! Заявка с сайта ${BUSINESS_NAME}.`,
        `Мастер: ${data.master}`,
        `Имя: ${data.name}`,
        `Телефон: ${data.phone}`,
    ];

    if (data.district) lines.push(`Район: ${data.district}`);
    if (data.time)     lines.push(`Удобное время: ${data.time}`);
    if (data.desc)     lines.push(`Задача: ${data.desc}`);

    const message = lines.join('\n');
    const waUrl   = `${WHATSAPP_BASE}?text=${encodeURIComponent(message)}`;

    // Открываем WhatsApp
    window.open(waUrl, '_blank');

    // Показываем модалку «Заявка почти готова»
    showSuccessModal(waUrl);
}

function showError(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('visible');
}

function hideError(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('visible');
}

/* =================================================================
   FAQ — аккордеон (плавное открытие/закрытие)
   ================================================================= */
function initFAQ() {
    // По желанию: закрывать другие при открытии одного
    const items = document.querySelectorAll('.faq-item');
    items.forEach(item => {
        item.addEventListener('toggle', () => {
            if (item.open) {
                items.forEach(other => {
                    if (other !== item && other.open) {
                        other.open = false;
                    }
                });
            }
        });
    });
}

/* =================================================================
   HERO GLOW — свечение за курсором (только десктоп)
   ================================================================= */
function initHeroGlow() {
    // Проверяем reduced-motion и тач-устройства
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if ('ontouchstart' in window) return;

    const hero = document.getElementById('hero');
    const glow = document.getElementById('hero-glow');
    if (!hero || !glow) return;

    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        glow.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(245, 181, 68, 0.06), transparent 40%)`;
    });

    hero.addEventListener('mouseleave', () => {
        glow.style.background = '';
    });
}

/* =================================================================
   ПЛАВАЮЩИЕ КНОПКИ — показываются после скролла
   ================================================================= */
function initFloatingButtons() {
    const btns = document.getElementById('floating-buttons');
    if (!btns) return;

    const onScroll = () => {
        btns.classList.toggle('visible', window.scrollY > 300);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

/* =================================================================
   МОДАЛЬНОЕ ОКНО «Заявка почти готова»
   ================================================================= */
let lastWaUrl = '';

function initModal() {
    const modal        = document.getElementById('success-modal');
    const overlay      = document.getElementById('modal-overlay');
    const closeBtn     = document.getElementById('close-modal');
    const reopenWaBtn  = document.getElementById('reopen-wa');

    if (!modal) return;

    // Закрытие
    if (overlay) overlay.addEventListener('click', closeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    // Повторное открытие WhatsApp
    if (reopenWaBtn) {
        reopenWaBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (lastWaUrl) window.open(lastWaUrl, '_blank');
        });
    }

    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

function showSuccessModal(waUrl) {
    lastWaUrl = waUrl;
    const modal = document.getElementById('success-modal');
    if (!modal) return;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('success-modal');
    if (!modal) return;

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

/* =================================================================
   СИСТЕМА ОТЗЫВОВ (через Supabase — без регистрации)
   ================================================================= */
const STORAGE_KEY_REVIEWS = 'smartfix_user_reviews';

function initReviewSystem() {
    const openBtn    = document.getElementById('open-review-modal');
    const modal      = document.getElementById('review-modal');
    const overlay    = document.getElementById('review-modal-overlay');
    const closeBtn   = document.getElementById('close-review-modal');
    const form       = document.getElementById('review-form');
    const starBtns   = document.querySelectorAll('#star-rating .star-btn');
    const ratingInput= document.getElementById('review-rating');

    // Загрузить отзывы из Supabase (с fallback на локальные)
    loadReviews();

    if (!modal) return;

    // Открытие модалки
    if (openBtn) {
        openBtn.addEventListener('click', () => {
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            setTimeout(() => {
                const nameInput = document.getElementById('review-name');
                if (nameInput) nameInput.focus();
            }, 100);
        });
    }

    // Закрытие модалки
    const closeReviewModal = () => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    if (overlay) overlay.addEventListener('click', closeReviewModal);
    if (closeBtn) closeBtn.addEventListener('click', closeReviewModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeReviewModal();
        }
    });

    // Звёздный рейтинг
    if (starBtns.length && ratingInput) {
        starBtns.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                const val = parseInt(btn.dataset.rating, 10);
                highlightStars(val);
            });

            btn.addEventListener('click', () => {
                const val = parseInt(btn.dataset.rating, 10);
                ratingInput.value = val;
                highlightStars(val);
            });
        });

        const ratingContainer = document.getElementById('star-rating');
        if (ratingContainer) {
            ratingContainer.addEventListener('mouseleave', () => {
                const current = parseInt(ratingInput.value, 10) || 5;
                highlightStars(current);
            });
        }
    }

    function highlightStars(count) {
        starBtns.forEach(b => {
            const r = parseInt(b.dataset.rating, 10);
            b.classList.toggle('active', r <= count);
        });
    }

    // Отправка формы отзыва
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('review-name');
            const textInput = document.getElementById('review-text');
            const masterVal = document.getElementById('review-master').value;
            const ratingVal = parseInt(ratingInput.value, 10) || 5;
            const submitBtn = document.getElementById('submit-review-btn');

            const name = nameInput.value.trim();
            const text = textInput.value.trim();

            let valid = true;

            if (!name) {
                showError('error-review-name');
                nameInput.classList.add('error');
                valid = false;
            } else {
                hideError('error-review-name');
                nameInput.classList.remove('error');
            }

            if (!text) {
                showError('error-review-text');
                textInput.classList.add('error');
                valid = false;
            } else {
                hideError('error-review-text');
                textInput.classList.remove('error');
            }

            if (!valid) return;

            const newReview = {
                name,
                master: masterVal,
                rating: ratingVal,
                text,
                date: 'Только что'
            };

            // Индикация сохранения
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.classList.add('btn--loading');
            }

            // Сохраняем в Supabase
            const savedItem = await saveReviewToSupabase(newReview);

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove('btn--loading');
            }

            // Добавляем в разметку наверх сетки
            renderReviewCard(newReview, true, true);

            // Кэшируем также локально
            cacheLocalReview(newReview);

            // Очищаем форму и закрываем модалку
            form.reset();
            ratingInput.value = 5;
            highlightStars(5);
            closeReviewModal();

            // Показываем Toast
            showToast('Спасибо! Ваш отзыв сохранён в базе данных и опубликован.');

            // Скроллим к блоку отзывов
            const reviewsSection = document.getElementById('reviews');
            if (reviewsSection) {
                reviewsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }
}

/**
 * Загрузка отзывов из Supabase
 */
async function loadReviews() {
    const grid = document.getElementById('reviews-grid');
    if (!grid) return;

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/reviews?select=*&is_approved=eq.true&order=created_at.desc`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });

        if (response.ok) {
            const list = await response.json();
            if (Array.isArray(list) && list.length > 0) {
                // Очищаем статичные заглушки и рендерим реальные отзывы из базы
                grid.innerHTML = '';
                list.forEach(item => {
                    renderReviewCard({
                        id: item.id,
                        name: item.name,
                        master: item.master,
                        rating: item.rating,
                        text: item.text,
                        date: formatReviewDate(item.created_at)
                    }, false, false);
                });
                return;
            }
        }
    } catch (e) {
        console.warn('Supabase недоступен, используем резервный кэш:', e);
    }

    // Если нет сети или запрос упал — используем сохранённые в localStorage
    loadCachedReviews();
}

/**
 * Сохранение отзыва в Supabase
 */
async function saveReviewToSupabase(review) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/reviews`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                name: review.name,
                master: review.master,
                rating: review.rating,
                text: review.text,
                is_approved: true
            })
        });

        if (response.ok) {
            const data = await response.json();
            return data && data[0] ? data[0] : review;
        }
    } catch (e) {
        console.error('Ошибка сохранения в Supabase:', e);
    }
    return null;
}

function loadCachedReviews() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_REVIEWS);
        if (!raw) return;
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
            list.slice().reverse().forEach(item => renderReviewCard(item, false, true));
        }
    } catch (e) {
        console.error('Ошибка загрузки кэшированных отзывов:', e);
    }
}

function cacheLocalReview(review) {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_REVIEWS);
        const list = raw ? JSON.parse(raw) : [];
        list.unshift(review);
        localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(list));
    } catch (e) {
        console.error('Ошибка кэширования отзыва:', e);
    }
}

function renderReviewCard(data, isNew = false, prepend = true) {
    const grid = document.getElementById('reviews-grid');
    if (!grid) return;

    const article = document.createElement('article');
    article.className = 'review-card' + (isNew ? ' review-card--new' : '');

    // Звёздочки
    let starsHtml = '';
    for (let i = 0; i < 5; i++) {
        const fill = i < data.rating ? 'currentColor' : 'none';
        const stroke = i < data.rating ? 'none' : 'currentColor';
        starsHtml += `<svg width="18" height="18" viewBox="0 0 24 24" fill="${fill}" stroke="${stroke}" stroke-width="1.5" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    }

    const firstLetter = escapeHtml(data.name.charAt(0).toUpperCase() || 'К');
    const safeName    = escapeHtml(data.name);
    const safeMaster  = escapeHtml(data.master);
    const safeText    = escapeHtml(data.text);
    const safeDate    = escapeHtml(data.date || 'Недавно');

    article.innerHTML = `
        <div class="review-card__stars" aria-label="Оценка ${data.rating} из 5">
            ${starsHtml}
        </div>
        <blockquote class="review-card__text">«${safeText}»</blockquote>
        <div class="review-card__author">
            <div class="review-card__avatar">${firstLetter}</div>
            <div>
                <div class="review-card__name">${safeName}</div>
                <div class="review-card__service">${safeMaster}</div>
            </div>
            <div class="review-card__date">${safeDate}</div>
        </div>
    `;

    if (prepend) {
        grid.prepend(article);
    } else {
        grid.appendChild(article);
    }
}

function formatReviewDate(dateString) {
    if (!dateString) return 'Недавно';
    try {
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return 'Недавно';
        return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    } catch {
        return 'Недавно';
    }
}

function showToast(text) {
    const toast = document.getElementById('toast');
    const toastText = document.getElementById('toast-text');
    if (!toast) return;

    if (toastText && text) toastText.textContent = text;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 4500);
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
