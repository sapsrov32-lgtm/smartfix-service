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
    const target   = parseFloat(el.dataset.target);
    const decimal  = el.dataset.decimal === 'true';
    const duration = 2000;
    const start    = performance.now();

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
            el.textContent = decimal
                ? target.toFixed(1)
                : target.toLocaleString('ru-RU');
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
