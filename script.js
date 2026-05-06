// Função para aplicar tema
function applyTheme(theme) {
    const toggleBtn = document.getElementById('theme-toggle');
    if (theme === 'dark') {
        document.body.classList.add('dark');
        toggleBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
    } else {
        document.body.classList.remove('dark');
        toggleBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/>
                <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" stroke-width="2"/>
            </svg>
        `;
    }
}

// Carregar tema do localStorage (Funcionalidade 3 — Preferência de tema claro/escuro)
const savedTheme = localStorage.getItem('tema') || 'light';
applyTheme(savedTheme);

// Toggle tema
document.getElementById('theme-toggle').addEventListener('click', () => {
    const currentTheme = document.body.classList.contains('dark') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('tema', newTheme); // Salvar no localStorage
    applyTheme(newTheme);
});

// Carregar contador de voluntários (Funcionalidade 2 — Contador de voluntários inscritos)
let volunteerCount = parseInt(localStorage.getItem('volunteerCount')) || 0;
document.getElementById('volunteer-counter').textContent = `${volunteerCount} voluntários já confirmados!`;

// Carregar voluntários do localStorage (Funcionalidade 1 — Inscrição única por e-mail)
let volunteers = JSON.parse(localStorage.getItem('volunteers')) || [];

// Verificar se usuário já está inscrito
const userEmail = localStorage.getItem('userEmail');
if (userEmail) {
    const volunteer = volunteers.find(v => v.email === userEmail);
    if (volunteer) {
        document.getElementById('form-container').innerHTML = `
            <div class="message success">
                Olá, ${volunteer.nome}! Você já está inscrito 💛 Obrigado por fazer parte do Projeto Mãos Cheias de Amor!
            </div>
        `;
    }
}

// Formulário
document.getElementById('volunteer-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const nome = document.getElementById('nome').value;
    const idade = document.getElementById('idade').value;
    const email = document.getElementById('email').value;
    const turma = document.getElementById('turma').value;
    const ajudas = Array.from(document.querySelectorAll('input[name="ajuda"]:checked')).map(cb => cb.value);

    // Verificar se e-mail já cadastrado (Funcionalidade 1)
    if (volunteers.some(v => v.email === email)) {
        document.getElementById('message').innerHTML = '<div class="error">Este e-mail já está cadastrado!</div>';
        return;
    }

    // Salvar voluntário (Funcionalidade 1)
    const newVolunteer = { nome, idade, email, turma, ajudas };
    volunteers.push(newVolunteer);
    localStorage.setItem('volunteers', JSON.stringify(volunteers));
    localStorage.setItem('userEmail', email); // Para verificar inscrição única

    // Incrementar contador (Funcionalidade 2)
    volunteerCount++;
    localStorage.setItem('volunteerCount', volunteerCount);
    document.getElementById('volunteer-counter').textContent = `${volunteerCount} voluntários já confirmados!`;

    // Mensagem de sucesso
    document.getElementById('message').innerHTML = '<div class="success">Inscrição realizada com sucesso! Obrigado por se juntar a nós 💛</div>';
    this.reset();
});

// Smooth scroll para âncoras
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Scroll reveal com IntersectionObserver
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.1 });

reveals.forEach(reveal => observer.observe(reveal));