const STORAGE_KEYS = {
    volunteers: "mca_volunteers",
    theme: "mca_theme",
    lastEmail: "mca_last_email",
    wallMessages: "mca_wall_messages"
};

const defaultState = {
    volunteers: [],
    theme: "light",
    lastEmail: "",
    wallMessages: [
        {
            name: "Equipe MÃ£os Cheias",
            message: "Toda doaÃ§Ã£o organizada carrega respeito, cuidado e futuro.",
            createdAt: "2026-01-01T12:00:00.000Z"
        },
        {
            name: "Escola Paulo de Tarso",
            message: "Quando a comunidade se une, a solidariedade deixa de ser ideia e vira aÃ§Ã£o.",
            createdAt: "2026-01-01T12:01:00.000Z"
        }
    ]
};

const state = {
    volunteers: readJson(STORAGE_KEYS.volunteers, defaultState.volunteers),
    theme: localStorage.getItem(STORAGE_KEYS.theme) || defaultState.theme,
    lastEmail: localStorage.getItem(STORAGE_KEYS.lastEmail) || defaultState.lastEmail,
    wallMessages: readJson(STORAGE_KEYS.wallMessages, defaultState.wallMessages)
};

const campaignGoals = {
    volunteers: 40,
    donations: 120,
    eventDate: new Date("2026-06-20T08:00:00-03:00")
};

const elements = {
    body: document.body,
    menuToggle: document.getElementById("menu-toggle"),
    siteMenu: document.getElementById("site-menu"),
    themeToggle: document.getElementById("theme-toggle"),
    themeIcon: document.querySelector(".theme-toggle-icon"),
    themeText: document.querySelector(".theme-toggle-text"),
    volunteerCounter: document.getElementById("volunteer-counter"),
    dashboardTotal: document.getElementById("dashboard-total"),
    dashboardItems: document.getElementById("dashboard-items"),
    goalVolunteersCurrent: document.getElementById("goal-volunteers-current"),
    goalItemsCurrent: document.getElementById("goal-items-current"),
    goalScore: document.getElementById("goal-score"),
    goalVolunteersBar: document.getElementById("goal-volunteers-bar"),
    goalItemsBar: document.getElementById("goal-items-bar"),
    goalScoreBar: document.getElementById("goal-score-bar"),
    countdownDays: document.getElementById("countdown-days"),
    countdownCaption: document.getElementById("countdown-caption"),
    simToys: document.getElementById("sim-toys"),
    simClothes: document.getElementById("sim-clothes"),
    simBooks: document.getElementById("sim-books"),
    simToysValue: document.getElementById("sim-toys-value"),
    simClothesValue: document.getElementById("sim-clothes-value"),
    simBooksValue: document.getElementById("sim-books-value"),
    simKits: document.getElementById("sim-kits"),
    simDescription: document.getElementById("sim-description"),
    wallForm: document.getElementById("wall-form"),
    wallName: document.getElementById("wall-name"),
    wallMessage: document.getElementById("wall-message"),
    messageWall: document.getElementById("message-wall"),
    clearData: document.getElementById("clear-data"),
    volunteerForm: document.getElementById("volunteer-form"),
    formStatus: document.getElementById("form-status"),
    reveals: document.querySelectorAll(".reveal")
};

function readJson(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) {
            return fallback;
        }
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : fallback;
    } catch (error) {
        return fallback;
    }
}

function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
}

function pluralize(value, singular, plural) {
    return value === 1 ? singular : plural;
}

function applyTheme(theme) {
    const isDark = theme === "dark";
    elements.body.classList.toggle("dark", isDark);
    localStorage.setItem(STORAGE_KEYS.theme, theme);

    if (elements.themeIcon) {
        elements.themeIcon.textContent = isDark ? "☾" : "☀";
    }

    if (elements.themeText) {
        elements.themeText.textContent = isDark ? "Escuro" : "Claro";
    }
}

function toggleTheme() {
    state.theme = elements.body.classList.contains("dark") ? "light" : "dark";
    applyTheme(state.theme);
}

function toggleMenu() {
    const willOpen = !elements.body.classList.contains("menu-open");
    elements.body.classList.toggle("menu-open", willOpen);
    elements.menuToggle.setAttribute("aria-expanded", String(willOpen));
    elements.menuToggle.setAttribute("aria-label", willOpen ? "Fechar menu" : "Abrir menu");
}

function closeMenu() {
    elements.body.classList.remove("menu-open");
    elements.menuToggle.setAttribute("aria-expanded", "false");
    elements.menuToggle.setAttribute("aria-label", "Abrir menu");
}

function countPromisedItems() {
    return state.volunteers.reduce((total, volunteer) => {
        return total + (volunteer.donationType ? 1 : 0);
    }, 0);
}

function clampPercent(value, max) {
    return Math.max(0, Math.min(100, Math.round((value / max) * 100)));
}

function updateCounters() {
    const total = state.volunteers.length;
    const items = countPromisedItems();
    const volunteerPercent = clampPercent(total, campaignGoals.volunteers);
    const itemPercent = clampPercent(items, campaignGoals.donations);
    const score = Math.round((volunteerPercent + itemPercent) / 2);

    if (elements.volunteerCounter) {
        elements.volunteerCounter.textContent = String(total);
    }

    if (elements.dashboardTotal) {
        elements.dashboardTotal.textContent = String(total);
    }

    if (elements.dashboardItems) {
        elements.dashboardItems.textContent = String(items);
    }

    if (elements.goalVolunteersCurrent) {
        elements.goalVolunteersCurrent.textContent = String(total);
    }

    if (elements.goalItemsCurrent) {
        elements.goalItemsCurrent.textContent = String(items);
    }

    if (elements.goalScore) {
        elements.goalScore.textContent = `${score}%`;
    }

    if (elements.goalVolunteersBar) {
        elements.goalVolunteersBar.style.width = `${volunteerPercent}%`;
    }

    if (elements.goalItemsBar) {
        elements.goalItemsBar.style.width = `${itemPercent}%`;
    }

    if (elements.goalScoreBar) {
        elements.goalScoreBar.style.width = `${score}%`;
    }
}

function updateCountdown() {
    if (!elements.countdownDays || !elements.countdownCaption) {
        return;
    }

    const now = new Date();
    const diff = campaignGoals.eventDate.getTime() - now.getTime();

    if (diff <= 0) {
        elements.countdownDays.textContent = "0";
        elements.countdownCaption.textContent = "a campanha jÃ¡ comeÃ§ou";
        return;
    }

    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    elements.countdownDays.textContent = String(days);
    elements.countdownCaption.textContent = days === 1 ? "dia para a aÃ§Ã£o" : "dias para a aÃ§Ã£o";
}

function showStatus(message, type) {
    if (!elements.formStatus) {
        return;
    }

    elements.formStatus.hidden = false;
    elements.formStatus.textContent = message;
    elements.formStatus.className = `form-status ${type}`;
}

function hideStatus() {
    if (!elements.formStatus) {
        return;
    }

    elements.formStatus.hidden = true;
    elements.formStatus.textContent = "";
    elements.formStatus.className = "form-status";
}

function getCheckedTasks(form) {
    return Array.from(form.querySelectorAll('input[name="tasks"]:checked')).map((input) => input.value);
}

function buildVolunteerFromForm(form) {
    const formData = new FormData(form);
    const tasks = getCheckedTasks(form);

    return {
        id: window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : String(Date.now()),
        name: String(formData.get("name") || "").trim(),
        age: Number(formData.get("age")),
        classroom: String(formData.get("classroom") || "").trim(),
        email: normalizeEmail(formData.get("email")),
        donationType: String(formData.get("donationType") || "").trim(),
        tasks,
        message: String(formData.get("message") || "").trim(),
        createdAt: new Date().toISOString()
    };
}

function validateVolunteer(volunteer) {
    if (!volunteer.name || volunteer.name.length < 3) {
        return "Informe seu nome completo.";
    }

    if (!volunteer.age || volunteer.age < 12) {
        return "Informe uma idade válida. Voluntários menores devem participar com orientação da escola.";
    }

    if (!volunteer.classroom) {
        return "Informe sua turma.";
    }

    if (!volunteer.email || !volunteer.email.includes("@")) {
        return "Informe um e-mail válido.";
    }

    if (!volunteer.donationType) {
        return "Escolha o tipo de doação que pretende trazer.";
    }

    if (!volunteer.tasks.length) {
        return "Selecione pelo menos uma forma de ajudar na prática.";
    }

    return "";
}

function hasVolunteer(email) {
    return state.volunteers.some((volunteer) => volunteer.email === email);
}

function saveVolunteer(volunteer) {
    state.volunteers.push(volunteer);
    state.lastEmail = volunteer.email;
    writeJson(STORAGE_KEYS.volunteers, state.volunteers);
    localStorage.setItem(STORAGE_KEYS.lastEmail, state.lastEmail);
    updateCounters();
}

function handleVolunteerSubmit(event) {
    event.preventDefault();
    hideStatus();

    const volunteer = buildVolunteerFromForm(elements.volunteerForm);
    const error = validateVolunteer(volunteer);

    if (error) {
        showStatus(error, "error");
        return;
    }

    if (hasVolunteer(volunteer.email)) {
        showStatus("Este e-mail já está inscrito. Obrigado por fazer parte do Mãos Cheias de Amor!", "success");
        return;
    }

    saveVolunteer(volunteer);

    const taskLabel = pluralize(volunteer.tasks.length, "atividade", "atividades");
    showStatus(`Inscrição confirmada, ${volunteer.name}! Você escolheu ${volunteer.tasks.length} ${taskLabel} e prometeu contribuir com ${volunteer.donationType}.`, "success");
    elements.volunteerForm.reset();
}

function prefillReturningVolunteer() {
    if (!state.lastEmail || !elements.volunteerForm) {
        return;
    }

    const volunteer = state.volunteers.find((item) => item.email === state.lastEmail);

    if (!volunteer) {
        return;
    }

    showStatus(`Olá, ${volunteer.name}! Sua inscrição já está salva neste navegador.`, "success");
}

function clearSavedData() {
    const confirmed = window.confirm("Deseja apagar as inscrições salvas neste navegador?");

    if (!confirmed) {
        return;
    }

    state.volunteers = [];
    state.lastEmail = "";
    localStorage.removeItem(STORAGE_KEYS.volunteers);
    localStorage.removeItem(STORAGE_KEYS.lastEmail);
    updateCounters();
    hideStatus();
}

function updateSimulator() {
    if (!elements.simToys || !elements.simClothes || !elements.simBooks) {
        return;
    }

    const toys = Number(elements.simToys.value);
    const clothes = Number(elements.simClothes.value);
    const books = Number(elements.simBooks.value);
    const kits = Math.min(Math.floor(toys / 1), Math.floor(clothes / 2), Math.floor(books / 1));
    const totalItems = toys + clothes + books;

    elements.simToysValue.textContent = String(toys);
    elements.simClothesValue.textContent = String(clothes);
    elements.simBooksValue.textContent = String(books);
    elements.simKits.textContent = `${kits} ${pluralize(kits, "kit", "kits")}`;

    if (kits === 0) {
        elements.simDescription.textContent = "Adicione pelo menos brinquedo, roupa e livro para formar um kit completo.";
        return;
    }

    elements.simDescription.textContent = `${totalItems} itens podem formar ${kits} ${pluralize(kits, "kit", "kits")} com brinquedo, roupas e livro para encaminhar aos lares.`;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function renderWallMessages() {
    if (!elements.messageWall) {
        return;
    }

    const messages = state.wallMessages.slice(-5).reverse();

    if (!messages.length) {
        elements.messageWall.innerHTML = '<div class="empty-wall">Ainda não há mensagens. Seja a primeira pessoa a inspirar a campanha.</div>';
        return;
    }

    elements.messageWall.innerHTML = messages.map((item) => {
        return `
            <article class="wall-message-card">
                <strong>${escapeHtml(item.name)}</strong>
                <p>${escapeHtml(item.message)}</p>
            </article>
        `;
    }).join("");
}

function handleWallSubmit(event) {
    event.preventDefault();

    const name = elements.wallName.value.trim();
    const message = elements.wallMessage.value.trim();

    if (!name || !message) {
        return;
    }

    state.wallMessages.push({
        name,
        message,
        createdAt: new Date().toISOString()
    });

    state.wallMessages = state.wallMessages.slice(-12);
    writeJson(STORAGE_KEYS.wallMessages, state.wallMessages);
    elements.wallForm.reset();
    renderWallMessages();
}

function setupRevealAnimations() {
    if (!("IntersectionObserver" in window)) {
        elements.reveals.forEach((element) => element.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
    });

    elements.reveals.forEach((element, index) => {
        element.style.transitionDelay = `${Math.min(index * 35, 260)}ms`;
        observer.observe(element);
    });
}

function setupNavigation() {
    if (elements.menuToggle) {
        elements.menuToggle.addEventListener("click", toggleMenu);
    }

    if (elements.siteMenu) {
        elements.siteMenu.addEventListener("click", (event) => {
            const link = event.target.closest("a");

            if (link) {
                closeMenu();
            }
        });
    }

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && elements.body.classList.contains("menu-open")) {
            closeMenu();
        }
    });
}

function setupForm() {
    if (elements.volunteerForm) {
        elements.volunteerForm.addEventListener("submit", handleVolunteerSubmit);
        prefillReturningVolunteer();
    }

    if (elements.clearData) {
        elements.clearData.addEventListener("click", clearSavedData);
    }
}

function setupSimulator() {
    const controls = [elements.simToys, elements.simClothes, elements.simBooks].filter(Boolean);

    controls.forEach((control) => {
        control.addEventListener("input", updateSimulator);
    });

    updateSimulator();
}

function setupWall() {
    if (elements.wallForm) {
        elements.wallForm.addEventListener("submit", handleWallSubmit);
    }

    renderWallMessages();
}

function setupTheme() {
    applyTheme(state.theme);

    if (elements.themeToggle) {
        elements.themeToggle.addEventListener("click", toggleTheme);
    }
}

function setupHeaderShadow() {
    const header = document.querySelector(".site-header");

    if (!header) {
        return;
    }

    const update = () => {
        header.classList.toggle("is-scrolled", window.scrollY > 8);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
}

function init() {
    setupTheme();
    setupNavigation();
    setupForm();
    setupSimulator();
    setupWall();
    setupRevealAnimations();
    setupHeaderShadow();
    updateCountdown();
    updateCounters();
}

init();
