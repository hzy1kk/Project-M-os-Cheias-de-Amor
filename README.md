# Mãos Cheias de Amor

## 📋 Sobre o Projeto

Site de voluntariado escolar desenvolvido para o Projeto Mãos Cheias de Amor da Escola Paulo de Tarso. O objetivo é arrecadar doações (brinquedos, roupas, livros e dinheiro) para instituições de acolhimento de crianças em situação de vulnerabilidade em São Paulo.

## 🎯 Funcionalidades

- **Formulário de Inscrição**: Cadastro único por e-mail com validação
- **Contador de Voluntários**: Persistência via localStorage
- **Mural Solidário**: suporte a endpoint compartilhado para mensagens públicas, com fallback local quando não configurado
- **Tema Claro/Escuro**: Toggle com preferência salva
- **Design Responsivo**: Compatível com todos os dispositivos
- **Animações Suaves**: Scroll reveal e transições modernas

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: Design moderno com variáveis CSS
- **JavaScript**: Interatividade e localStorage
- **SVG**: Ícones vetoriais inline


## 🌐 Mural compartilhado

O site já vem apontando para `api/wall-messages.php`, que salva as publicações em um arquivo JSON no servidor quando a hospedagem executa PHP. Se você preferir outro backend/serviço, ele precisa aceitar CORS e:

- `GET`: retorna um array de mensagens ou um objeto `{ "messages": [...] }`
- `POST`: recebe `{ "name": "...", "message": "...", "createdAt": "..." }` e retorna a lista atualizada

Para trocar o backend, coloque a nova URL no meta tag do `index.html`:

```html
<meta name="wall-api-endpoint" content="https://seu-endpoint.com/mural">
```

Se a URL estiver vazia ou indisponível, o site mostra um aviso e salva a mensagem apenas no navegador atual. Em hospedagens estáticas que não executam PHP, como GitHub Pages puro, será necessário configurar outro endpoint.

## 📱 Compatibilidade

- ✅ Navegadores modernos (Chrome, Firefox, Safari, Edge)
- ✅ Dispositivos móveis (iOS, Android)
- ✅ Tablets e desktops
- ✅ Fallbacks para navegadores antigos

## 🚀 Como Usar

1. Abra `index.html` em qualquer navegador
2. Navegue pelas seções usando o menu ou scroll
3. Clique em "Quero ser voluntário!" para se inscrever
4. Use o botão ☀️/🌙 para alternar tema

## 📂 Estrutura dos Arquivos

```
/
├── index.html            # Estrutura principal
├── style.css             # Estilos modernos
├── script.js             # Funcionalidades JS
├── assets/
│   └── images/           # Fotos utilizadas no site
│       ├── abrigo-reviver.jpg
│       ├── lalec.jpg
│       ├── casa-pequeno-cidadao.jpg
│       ├── lar-batista.jpg
│       └── lucas.jpg
```

## 🎨 Design System

### Cores
- **Primary**: #4A90E2 (Azul suave)
- **Secondary**: #2C3E50 (Azul escuro)
- **Accent**: #7F8C8D (Cinza médio)
- **Background Light**: #ECF0F1 (Cinza muito claro)
- **Text**: #34495E (Cinza escuro)

### Imagens
- Placeholders temáticos com descrições relacionadas ao voluntariado
- Backgrounds CSS com padrões suaves
- Compatibilidade universal sem dependências externas
- **Accent**: #F59E0B (Âmbar)
- **Background**: #F8FAFC (Cinza claro)

### Tipografia
- **Fonte**: Sistema (-apple-system, BlinkMacSystemFont, Segoe UI, etc.)
- **Peso**: 300-800 para hierarquia
- **Line-height**: 1.7 para legibilidade

### Componentes
- Cards com hover effects
- Botões com gradientes
- Formulários com foco elegante
- Animações cubic-bezier

## 📞 Instituições Beneficiadas

1. **Abrigo Reviver** - Vila Ida, SP | (11) 3021-5171
2. **LALEC** - São Paulo, SP | lalec.com.br
3. **Casa do Pequeno Cidadão** - Vila Leopoldina | (11) 98903-7798
4. **Lar Batista de Crianças** - Várias unidades em SP | larbatista.com.br

## 👨‍💻 Desenvolvedor

**Lucas Lohan Felix Araujo**
- Escola Paulo de Tarso
- Tecnologias: HTML5, CSS3, JavaScript, localStorage
- "Tecnologia para impactar vidas e transformar comunidades."

---

*Desenvolvido com ❤️ para fazer a diferença na comunidade escolar.*