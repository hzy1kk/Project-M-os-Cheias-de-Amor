const STORAGE_KEYS = {
    theme: 'maosCheiasDeAmor.tema',
    volunteers: 'maosCheiasDeAmor.voluntarios',
    userEmail: 'maosCheiasDeAmor.emailUsuario',
    donationChecklist: 'maosCheiasDeAmor.checklistDoacoes',
    impactPlan: 'maosCheiasDeAmor.planoImpacto'
};

const VOLUNTEER_GOAL = 80;
const DEFAULT_THEME = 'light';

const elements = {
    body: document.body,
    header: document.querySelector('[data-header]'),
    navToggle: document.querySelector('[data-nav-toggle]'),
    navLinks: document.querySelector('[data-nav-links]'),
    themeToggle: document.getElementById('theme-toggle'),
    themeIcon: document.querySelector('.theme-toggle__icon'),
    volunteerCounter: document.getElementById('volunteer-counter'),
    volunteerProgress: document.getElementById('volunteer-progress'),
    goalLabel: document.getElementById('goal-label'),
    formContainer: document.getElementById('form-container'),
    volunteerForm: document.getElementById('volunteer-form'),
    message: document.getElementById('message'),
    donationChecks: document.querySelectorAll('[data-donation-check]'),
    donationSummary: document.getElementById('donation-summary'),
    backToTop: document.querySelector('[data-back-to-top]'),
    toast: document.getElementById('toast'),
    sections: document.querySelectorAll('.section-observed'),
    navAnchors: document.querySelectorAll('.nav-links a'),
    revealItems: document.querySelectorAll('.reveal'),
    statNumbers: document.querySelectorAll('[data-count]'),
    impactSimulator: document.getElementById('impact-simulator'),
    impactInputs: document.querySelectorAll('[data-impact-input]'),
    impactTotal: document.getElementById('impact-total'),
    simulatorFeedback: document.getElementById('simulator-feedback'),
    saveImpactButton: document.querySelector('[data-save-impact]'),
    clearImpactButton: document.querySelector('[data-clear-impact]'),
    themeMeta: document.querySelector('meta[name="theme-color"]')
};

function readJSON(key, fallback) {
    const rawValue = localStorage.getItem(key);

    if (!rawValue) {
        return fallback;
    }

    try {
        return JSON.parse(rawValue);
    } catch (error) {
        console.warn(`Não foi possível ler ${key} do localStorage.`, error);
        return fallback;
    }
}

function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function migrateLegacyStorage() {
    const legacyVolunteers = readJSON('volunteers', null);
    const currentVolunteers = readJSON(STORAGE_KEYS.volunteers, null);

    if (Array.isArray(legacyVolunteers) && !Array.isArray(currentVolunteers)) {
        setVolunteers(legacyVolunteers.map((volunteer) => ({
            ...volunteer,
            email: normalizeEmail(volunteer.email),
            ajudas: Array.isArray(volunteer.ajudas) ? volunteer.ajudas : []
        })));
    }

    const legacyTheme = localStorage.getItem('tema');

    if (legacyTheme && !localStorage.getItem(STORAGE_KEYS.theme)) {
        localStorage.setItem(STORAGE_KEYS.theme, legacyTheme === 'dark' ? 'dark' : 'light');
    }

    const legacyEmail = localStorage.getItem('userEmail');

    if (legacyEmail && !localStorage.getItem(STORAGE_KEYS.userEmail)) {
        localStorage.setItem(STORAGE_KEYS.userEmail, normalizeEmail(legacyEmail));
    }
}

function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
}

function getVolunteers() {
    return readJSON(STORAGE_KEYS.volunteers, []);
}

function setVolunteers(volunteers) {
    writeJSON(STORAGE_KEYS.volunteers, volunteers);
}

function getVolunteerCount() {
    return getVolunteers().length;
}

function showToast(text) {
    if (!elements.toast) {
        return;
    }

    elements.toast.textContent = text;
    elements.toast.classList.add('is-visible');

    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(() => {
        elements.toast.classList.remove('is-visible');
    }, 3200);
}

function applyTheme(theme) {
    const safeTheme = theme === 'dark' ? 'dark' : DEFAULT_THEME;
    const isDark = safeTheme === 'dark';

    elements.body.classList.toggle('dark', isDark);
    localStorage.setItem(STORAGE_KEYS.theme, safeTheme);

    if (elements.themeToggle) {
        elements.themeToggle.setAttribute('aria-label', isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro');
        elements.themeToggle.setAttribute('title', isDark ? 'Tema escuro ativo' : 'Tema claro ativo');
    }

    if (elements.themeIcon) {
        elements.themeIcon.textContent = isDark ? '🌙' : '☀️';
    }

    if (elements.themeMeta) {
        elements.themeMeta.setAttribute('content', isDark ? '#08111f' : '#0b63ce');
    }
}

function setupTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme) || DEFAULT_THEME;
    applyTheme(savedTheme);

    elements.themeToggle?.addEventListener('click', () => {
        const currentTheme = elements.body.classList.contains('dark') ? 'dark' : 'light';
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);
        showToast(nextTheme === 'dark' ? 'Tema escuro ativado.' : 'Tema claro ativado.');
    });
}

function updateVolunteerPanel() {
    const count = getVolunteerCount();
    const percentage = Math.min(100, Math.round((count / VOLUNTEER_GOAL) * 100));
    const label = count === 1 ? '1 voluntário confirmado' : `${count} voluntários confirmados`;

    if (elements.volunteerCounter) {
        elements.volunteerCounter.textContent = label;
    }

    if (elements.volunteerProgress) {
        elements.volunteerProgress.style.width = `${percentage}%`;
    }

    if (elements.goalLabel) {
        elements.goalLabel.textContent = String(VOLUNTEER_GOAL);
    }
}

function setFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const error = document.querySelector(`[data-error-for="${fieldId}"]`);

    field?.classList.toggle('is-invalid', Boolean(message));

    if (error) {
        error.textContent = message || '';
    }
}

function clearFieldErrors() {
    ['nome', 'idade', 'email', 'turma', 'consentimento'].forEach((fieldId) => setFieldError(fieldId, ''));
}

function validateVolunteerForm(formData) {
    const errors = {};
    const nome = String(formData.get('nome') || '').trim();
    const idade = Number(formData.get('idade'));
    const email = normalizeEmail(formData.get('email'));
    const turma = String(formData.get('turma') || '').trim();
    const consentimento = document.getElementById('consentimento')?.checked;

    if (nome.length < 3) {
        errors.nome = 'Informe pelo menos 3 caracteres.';
    }

    if (!Number.isFinite(idade) || idade < 13 || idade > 99) {
        errors.idade = 'A idade deve estar entre 13 e 99 anos.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = 'Digite um e-mail válido.';
    }

    if (turma.length < 2) {
        errors.turma = 'Informe sua turma ou série.';
    }

    if (!consentimento) {
        errors.consentimento = 'Confirme sua participação para continuar.';
    }

    return errors;
}

function renderAlreadyRegistered(volunteer) {
    if (!elements.formContainer) {
        return;
    }

    const helpList = volunteer.ajudas?.length ? volunteer.ajudas.join(', ') : 'apoio geral na campanha';

    elements.formContainer.innerHTML = `
        <div class="success-message">
            <h3>Olá, ${volunteer.nome}! 💛</h3>
            <p>Você já está inscrito no Projeto Mãos Cheias de Amor.</p>
            <p><strong>Forma de ajuda:</strong> ${helpList}</p>
            <button type="button" class="btn-submit" data-reset-registration>Editar inscrição neste navegador</button>
        </div>
    `;

    elements.formContainer.querySelector('[data-reset-registration]')?.addEventListener('click', () => {
        localStorage.removeItem(STORAGE_KEYS.userEmail);
        window.location.reload();
    });
}

function checkExistingRegistration() {
    const email = normalizeEmail(localStorage.getItem(STORAGE_KEYS.userEmail));

    if (!email) {
        return;
    }

    const registeredVolunteer = getVolunteers().find((volunteer) => volunteer.email === email);

    if (registeredVolunteer) {
        renderAlreadyRegistered(registeredVolunteer);
    }
}

function handleVolunteerSubmit(event) {
    event.preventDefault();
    clearFieldErrors();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const errors = validateVolunteerForm(formData);

    Object.entries(errors).forEach(([fieldId, message]) => setFieldError(fieldId, message));

    if (Object.keys(errors).length > 0) {
        elements.message.innerHTML = '<div class="error">Revise os campos destacados antes de enviar.</div>';
        showToast('Há campos que precisam de atenção.');
        return;
    }

    const volunteers = getVolunteers();
    const email = normalizeEmail(formData.get('email'));

    if (volunteers.some((volunteer) => volunteer.email === email)) {
        setFieldError('email', 'Este e-mail já está cadastrado neste navegador.');
        elements.message.innerHTML = '<div class="error">Este e-mail já está cadastrado!</div>';
        showToast('Inscrição duplicada encontrada.');
        return;
    }

    const newVolunteer = {
        nome: String(formData.get('nome')).trim(),
        idade: Number(formData.get('idade')),
        email,
        turma: String(formData.get('turma')).trim(),
        ajudas: formData.getAll('ajuda'),
        criadoEm: new Date().toISOString()
    };

    volunteers.push(newVolunteer);
    setVolunteers(volunteers);
    localStorage.setItem(STORAGE_KEYS.userEmail, email);

    updateVolunteerPanel();
    elements.message.innerHTML = '<div class="success">Inscrição realizada com sucesso! Obrigado por se juntar a nós 💛</div>';
    showToast('Inscrição confirmada. Obrigado por participar!');
    form.reset();

    window.setTimeout(() => renderAlreadyRegistered(newVolunteer), 900);
}

function setupVolunteerForm() {
    updateVolunteerPanel();
    checkExistingRegistration();
    elements.volunteerForm?.addEventListener('submit', handleVolunteerSubmit);

    elements.volunteerForm?.querySelectorAll('input').forEach((input) => {
        input.addEventListener('input', () => setFieldError(input.id, ''));
    });
}

function getDonationChecklist() {
    return readJSON(STORAGE_KEYS.donationChecklist, []);
}

function setDonationChecklist(items) {
    writeJSON(STORAGE_KEYS.donationChecklist, items);
}

function updateDonationSummary() {
    const selectedItems = Array.from(elements.donationChecks)
        .filter((checkbox) => checkbox.checked)
        .map((checkbox) => checkbox.value);

    setDonationChecklist(selectedItems);

    elements.donationChecks.forEach((checkbox) => {
        checkbox.closest('[data-donation-card]')?.classList.toggle('is-selected', checkbox.checked);
    });

    if (!elements.donationSummary) {
        return;
    }

    elements.donationSummary.textContent = selectedItems.length
        ? selectedItems.join(' • ')
        : 'Nenhum item selecionado ainda.';
}

function setupDonationChecklist() {
    const savedItems = getDonationChecklist();

    elements.donationChecks.forEach((checkbox) => {
        checkbox.checked = savedItems.includes(checkbox.value);
        checkbox.addEventListener('change', () => {
            updateDonationSummary();
            showToast('Checklist de doações atualizada.');
        });
    });

    updateDonationSummary();
}


function getImpactPlan() {
    return readJSON(STORAGE_KEYS.impactPlan, {
        brinquedos: 0,
        roupas: 0,
        livros: 0,
        materiais: 0
    });
}

function setImpactPlan(plan) {
    writeJSON(STORAGE_KEYS.impactPlan, plan);
}

function sanitizeImpactValue(value) {
    const number = Number(value);

    if (!Number.isFinite(number) || number < 0) {
        return 0;
    }

    return Math.min(999, Math.round(number));
}

function collectImpactPlan() {
    return Array.from(elements.impactInputs).reduce((plan, input) => {
        plan[input.dataset.impactInput] = sanitizeImpactValue(input.value);
        return plan;
    }, {});
}

function updateImpactSimulator(shouldPersist = true) {
    const plan = collectImpactPlan();
    const total = Object.values(plan).reduce((sum, value) => sum + value, 0);

    if (elements.impactTotal) {
        elements.impactTotal.textContent = String(total);
    }

    if (elements.simulatorFeedback) {
        if (total === 0) {
            elements.simulatorFeedback.textContent = 'Comece adicionando uma estimativa para visualizar o impacto.';
        } else if (total < 25) {
            elements.simulatorFeedback.textContent = 'Ótimo começo! Convide mais colegas para ampliar essa corrente.';
        } else if (total < 100) {
            elements.simulatorFeedback.textContent = 'Sua turma já tem uma meta forte e muito possível de alcançar.';
        } else {
            elements.simulatorFeedback.textContent = 'Meta inspiradora! Organize caixas por categoria para facilitar a triagem.';
        }
    }

    if (shouldPersist) {
        setImpactPlan(plan);
    }
}

function setupImpactSimulator() {
    if (!elements.impactSimulator) {
        return;
    }

    const savedPlan = getImpactPlan();

    elements.impactInputs.forEach((input) => {
        const key = input.dataset.impactInput;
        input.value = sanitizeImpactValue(savedPlan[key] || 0);
        input.addEventListener('input', () => updateImpactSimulator(true));
    });

    elements.saveImpactButton?.addEventListener('click', () => {
        updateImpactSimulator(true);
        showToast('Simulação de impacto salva.');
    });

    elements.clearImpactButton?.addEventListener('click', () => {
        elements.impactInputs.forEach((input) => {
            input.value = 0;
        });
        updateImpactSimulator(true);
        showToast('Simulação limpa.');
    });

    updateImpactSimulator(false);
}

function closeMobileMenu() {
    elements.navToggle?.classList.remove('is-open');
    elements.navLinks?.classList.remove('is-open');
    elements.navToggle?.setAttribute('aria-expanded', 'false');
    elements.body.classList.remove('nav-open');
}

function toggleMobileMenu() {
    const willOpen = !elements.navLinks?.classList.contains('is-open');

    elements.navToggle?.classList.toggle('is-open', willOpen);
    elements.navLinks?.classList.toggle('is-open', willOpen);
    elements.navToggle?.setAttribute('aria-expanded', String(willOpen));
    elements.body.classList.toggle('nav-open', willOpen);
}

function setupNavigation() {
    elements.navToggle?.addEventListener('click', toggleMobileMenu);

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (event) => {
            const targetId = anchor.getAttribute('href');
            const target = targetId ? document.querySelector(targetId) : null;

            if (!target) {
                return;
            }

            event.preventDefault();
            closeMobileMenu();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeMobileMenu();
        }
    });
}

function updateHeaderState() {
    const scrolled = window.scrollY > 10;
    elements.header?.classList.toggle('is-scrolled', scrolled);
    elements.backToTop?.classList.toggle('is-visible', window.scrollY > 580);
}

function setupScrollControls() {
    updateHeaderState();
    window.addEventListener('scroll', updateHeaderState, { passive: true });

    elements.backToTop?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function setActiveNavLink(sectionId) {
    elements.navAnchors.forEach((anchor) => {
        anchor.classList.toggle('is-active', anchor.getAttribute('href') === `#${sectionId}`);
    });
}

function setupSectionSpy() {
    if (!('IntersectionObserver' in window)) {
        return;
    }

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                setActiveNavLink(entry.target.id);
            }
        });
    }, {
        rootMargin: '-35% 0px -55% 0px',
        threshold: 0.01
    });

    elements.sections.forEach((section) => sectionObserver.observe(section));
}

function animateNumber(element) {
    if (element.dataset.animated === 'true') {
        return;
    }

    element.dataset.animated = 'true';

    const target = Number(element.dataset.count || 0);
    const duration = 1200;
    const startTime = performance.now();

    function tick(now) {
        const progress = Math.min(1, (now - startTime) / duration);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        element.textContent = String(Math.round(target * easedProgress));

        if (progress < 1) {
            requestAnimationFrame(tick);
        }
    }

    requestAnimationFrame(tick);
}

function setupRevealAnimations() {
    if (!('IntersectionObserver' in window)) {
        elements.revealItems.forEach((item) => item.classList.add('active'));
        elements.statNumbers.forEach(animateNumber);
        return;
    }

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.classList.add('active');

            if (entry.target.querySelectorAll) {
                entry.target.querySelectorAll('[data-count]').forEach(animateNumber);
            }

            if (entry.target.matches?.('[data-count]')) {
                animateNumber(entry.target);
            }

            revealObserver.unobserve(entry.target);
        });
    }, {
        threshold: 0.12
    });

    elements.revealItems.forEach((item) => revealObserver.observe(item));
    elements.statNumbers.forEach((number) => revealObserver.observe(number));
}

function setupFaqFeedback() {
    document.querySelectorAll('.faq-item').forEach((item) => {
        item.addEventListener('toggle', () => {
            if (item.open) {
                document.querySelectorAll('.faq-item').forEach((otherItem) => {
                    if (otherItem !== item) {
                        otherItem.open = false;
                    }
                });
            }
        });
    });
}

function setupKeyboardFocus() {
    let usingKeyboard = false;

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Tab') {
            usingKeyboard = true;
            elements.body.classList.add('using-keyboard');
        }
    });

    window.addEventListener('mousedown', () => {
        if (usingKeyboard) {
            usingKeyboard = false;
            elements.body.classList.remove('using-keyboard');
        }
    });
}

function bootstrap() {
    migrateLegacyStorage();
    setupTheme();
    setupNavigation();
    setupScrollControls();
    setupSectionSpy();
    setupRevealAnimations();
    setupDonationChecklist();
    setupImpactSimulator();
    setupVolunteerForm();
    setupFaqFeedback();
    setupKeyboardFocus();
}

bootstrap();
