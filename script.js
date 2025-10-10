// ===================================================
// JAVASCRIPT INTEGRADO (script.js)
// ===================================================

// ⚠️ ATENÇÃO: CHAVE DA API ATUALIZADA AQUI
const API_KEY ="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"; 
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const MODEL_NAME = "llama-3.1-8b-instant"; 

// --- SISTEMA DE USUÁRIO SIMPLES (LOCALSTORAGE) ---
let currentUser = {
    name: null, // Será o nome de usuário ou 'Convidado'
    trilhas: [], // Array de todas as trilhas (roadmaps) salvas
    currentTrilhaIndex: -1 // Índice da trilha atualmente ativa
};
// Armazena todos os dados de usuários no localStorage
let allUsersData = {}; 

let modalState = {}; 
let patolindoState = {
    questionsLeft: 5,
    history: [],
    lastView: "roadmap-view" 
};

// --- DADOS PRÉ-DEFINIDOS (PARA ECONOMIZAR REQUISIÇÕES) ---
const preDefinedRoadmaps = [
    {
        category: "Programação e Tecnologia",
        courses: [
            {
                tema: "Python para Iniciantes", nivel: "Iniciante", objetivo: "Desenvolvimento de scripts básicos e lógica de programação.",
                etapas: [
                    { titulo: "Etapa 1: Fundamentos e Sintaxe", topicos: [{ tópico: "Variáveis e Tipos de Dados", material: "https://docs.python.org/pt-br/3/tutorial/introduction.html" }, { tópico: "Estruturas de Controle (If/Else)", material: "https://docs.python.org/pt-br/3/tutorial/controlflow.html" }, { tópico: "Laços de Repetição (For/While)", material: "https://docs.python.org/pt-br/3/tutorial/controlflow.html" }, { tópico: "Introdução a Funções", material: "https://docs.python.org/pt-br/3/tutorial/controlflow.html" }], atividade: "Criar uma calculadora simples que utilize If/Else e funções." }
                ]
            },
            {
                tema: "JavaScript Moderno (ES6+)", nivel: "Intermediário", objetivo: "Desenvolvimento Frontend e manipulação de DOM.",
                etapas: [
                    { titulo: "Etapa 1: Variáveis e Scopes", topicos: [{ tópico: "Var, Let e Const", material: "https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide/Grammar_and_types" }, { tópico: "Arrow Functions e Template Literals", material: "https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Functions/Arrow_functions" }, { tópico: "Manipulação de Array (Map, Filter, Reduce)", material: "https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Array" }, { tópico: "Introdução a Promises e Async/Await", material: "https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide/Using_promises" }], atividade: "Criar uma lista de tarefas (To-Do List) que manipule o DOM e use funções de array." }
                ]
            },
            {
                tema: "Java: POO e Backend", nivel: "Avançado", objetivo: "Entender Programação Orientada a Objetos e estruturas de dados básicas.",
                etapas: [
                    { titulo: "Etapa 1: Conceitos de POO", topicos: [{ tópico: "Classes, Objetos e Encapsulamento", material: "https://docs.oracle.com/javase/tutorial/java/concepts/index.html" }, { tópico: "Herança e Polimorfismo", material: "https://docs.oracle.com/javase/tutorial/java/concepts/index.html" }, { tópico: "Tratamento de Exceções", material: "https://docs.oracle.com/javase/tutorial/essential/exceptions/index.html" }, { tópico: "Estruturas de Dados (ArrayList e HashMap)", material: "https://docs.oracle.com/javase/8/docs/api/java/util/ArrayList.html" }], atividade: "Desenvolver um sistema bancário simples com classes Cliente e Conta, aplicando Herança." }
                ]
            },
        ]
    },
    {
        category: "Idiomas e Linguagens",
        courses: [
            {
                tema: "Inglês Básico", nivel: "Iniciante", objetivo: "Conversação simples e compreensão de textos básicos.",
                etapas: [
                    { titulo: "Etapa 1: O Verbo 'To Be'", topicos: [{ tópico: "Afirmativa e Negativa", material: "https://www.youtube.com/watch?v=basico_to_be" }, { tópico: "Interrogativa e Short Answers", material: "https://www.duolingo.com/course/en/pt/learn-english" }, { tópico: "Pronomes Pessoais e Possessivos", material: "https://www.bbc.co.uk/learningenglish/" }, { tópico: "Vocabulário de Saudação e Apresentação", material: "https://www.memrise.com/" }], atividade: "Gravar um áudio se apresentando e falando sobre 3 membros da família em inglês." }
                ]
            },
            {
                tema: "Espanhol Intermediário", nivel: "Intermediário", objetivo: "Dominar pretéritos e conversação em viagens.",
                etapas: [
                    { titulo: "Etapa 1: Pretéritos do Indicativo", topicos: [{ tópico: "Pretérito Perfeito Simples (Pasado Simple)", material: "https://www.rae.es/" }, { tópico: "Pretérito Imperfeito", material: "https://espanhol.com/gramatica/passado-espanhol" }, { tópico: "Verbos Irregulares Comuns", material: "https://conjuga-me.net/espanhol/verbos/irregulares" }, { tópico: "Vocabulário de Viagem e Turismo", material: "https://cervantes.es/" }], atividade: "Escrever um parágrafo contando suas últimas férias usando os pretéritos estudados." }
                ]
            }
        ]
    },
    {
        category: "Matérias Escolares - Ensino Fundamental (Anos Finais)",
        courses: [
            {
                tema: "Matemática (6º Ano)", nivel: "Intermediário", objetivo: "Dominar números inteiros, frações e operações básicas.",
                etapas: [
                    { titulo: "Etapa 1: Números Inteiros e Racionais", topicos: [{ tópico: "Conjunto dos Números Inteiros (Z)", material: "https://www.auladegratis.net/matematica/6-ano/numeros-inteiros.html" }, { tópico: "Soma e Subtração de Frações", material: "https://www.somatematica.com.br/fundamental/6ano/fracoes.php" }, { tópico: "Múltiplos e Divisores (MMC e MDC)", material: "https://www.infoescola.com/matematica/mmc-e-mdc/" }, { tópico: "Expressões Numéricas", material: "https://www.toda_materia.com.br/expressoes-numericas" }], atividade: "Resolver uma lista de 10 problemas que envolvam frações em situações do dia a dia." }
                ]
            },
            {
                tema: "História (9º Ano)", nivel: "Intermediário", objetivo: "Compreender a 1ª República, a Era Vargas e a Guerra Fria.",
                etapas: [
                    { titulo: "Etapa 1: República Oligárquica e Vargas", topicos: [{ tópico: "Primeira República e Coronelismo", material: "https://brasilescola.uol.com.br/historiab/primeira-republica.htm" }, { tópico: "Revolução de 1930 e Era Vargas", material: "https://www.politize.com.br/era-vargas-resumo/" }, { tópico: "A Grande Depressão de 1929 e o Brasil", material: "https://www.sohistoria.com.br/ef2/crise29/" }, { tópico: "O Estado Novo (1937-1945)", material: "https://www.historiadigital.org/estado-novo/" }], atividade: "Criar uma linha do tempo ilustrada da Era Vargas (1930-1945) com os principais eventos." }
                ]
            }
        ]
    },
    {
        category: "Matérias Escolares - Ensino Médio",
        courses: [
            {
                tema: "Português (1º Ano EM)", nivel: "Avançado", objetivo: "Dominar a estrutura frasal, concordância e as primeiras escolas literárias.",
                etapas: [
                    { titulo: "Etapa 1: Sintaxe e Concordância", topicos: [{ tópico: "Estrutura da Oração (Sujeito, Predicado)", material: "https://www.normaculta.com.br/estrutura-da-oracao/" }, { tópico: "Concordância Verbal e Nominal", material: "https://www.portuguesonline.com.br/concordancia-verbal-e-nominal/" }, { tópico: "Introdução à Literatura: Quinhentismo e Barroco", material: "https://www.infoescola.com/literatura/quinhentismo/" }, { tópico: "Análise de Figuras de Linguagem", material: "https://www.todamateria.com.br/figuras-de-linguagem/" }], atividade: "Analisar um trecho de um poema Barroco identificando o sujeito, predicado e as figuras de linguagem." }
                ]
            }
        ]
    }
]; 

// --- MODIFICAÇÃO DE ACESSIBILIDADE: FUNÇÃO AUXILIAR DE FOCO (TalkBack/NVDA) ---
function setFocusToNewView(viewId) {
    const viewElement = viewMap[viewId];
    if (viewElement) {
        // Tenta focar no H2, H1 ou no próprio container
        const focusableElement = viewElement.querySelector('h1, h2, h3') || viewElement;
        
        // Garante que o elemento seja focusable para leitores de tela
        if (!focusableElement.hasAttribute('tabindex')) {
            focusableElement.setAttribute('tabindex', '-1'); 
        }
        focusableElement.focus();
    }
}

// --- FUNÇÕES DE PERSISTÊNCIA ---
function loadAllUsersData() { 
    const data = localStorage.getItem('quackademyAllUsers'); 
    if (data) { 
        allUsersData = JSON.parse(data); 
    } 
} 
function saveAllUsersData() { 
    localStorage.setItem('quackademyAllUsers', JSON.stringify(allUsersData)); 
} 
function loadUserData(username) { 
    loadAllUsersData(); 
    if (!username || username === 'Convidado') { 
        currentUser.name = 'Convidado'; 
        currentUser.trilhas = []; // Convidado não tem trilhas salvas 
        currentUser.currentTrilhaIndex = -1; 
    } else { 
        const userData = allUsersData[username]; 
        if (userData) { 
            currentUser.name = username; 
            currentUser.trilhas = userData.trilhas || []; 
            currentUser.currentTrilhaIndex = userData.currentTrilhaIndex || -1; 
        } else { 
            // Novo usuário 
            currentUser.name = username; 
            currentUser.trilhas = []; 
            currentUser.currentTrilhaIndex = -1; 
            allUsersData[username] = { trilhas: [], currentTrilhaIndex: -1, password: document.getElementById('password').value }; // Salva a senha (simulada) 
        } 
    } 
    document.getElementById("userNameDisplay").innerText = currentUser.name; 
    saveAllUsersData(); 
    updateTrilhasCountDisplay(); 
} 
function saveUserTrilhas() { 
    if (currentUser.name && currentUser.name !== 'Convidado') { 
        allUsersData[currentUser.name] = { ...allUsersData[currentUser.name], trilhas: currentUser.trilhas, currentTrilhaIndex: currentUser.currentTrilhaIndex }; 
        saveAllUsersData(); 
    } 
    updateTrilhasCountDisplay(); 
} 
function updateTrilhasCountDisplay() { 
    const count = currentUser.trilhas ? currentUser.trilhas.length : 0; 
    document.getElementById("btnMinhasTrilhas").innerText = `Minhas Trilhas (${count})`; 
    document.getElementById("btnMinhasTrilhas").disabled = (count === 0 && currentUser.name === 'Convidado');
}

// --- Mapeamento de Elementos ---
const viewMap = {
    "login-screen": document.getElementById("login-screen"),
    "welcome-screen": document.getElementById("welcome-screen"),
    "explanation-screen": document.getElementById("explanation-screen"),
    "main-app": document.getElementById("main-app"),
    "user-trilhas-view": document.getElementById("user-trilhas-view"),
    "predefined-courses-view": document.getElementById("predefined-courses-view"),
    "form-view": document.getElementById("form-view"),
    "roadmap-view": document.getElementById("roadmap-view"),
    "etapa-view": document.getElementById("etapa-view"),
    "material-view": document.getElementById("material-view"),
    "flashcard-view": document.getElementById("flashcard-view"),
    "simulado-etapa-view": document.getElementById("simulado-etapa-view"),
    "chat-view": document.getElementById("chat-view"),
    "chat-button": document.getElementById("chat-button") 
};

// --- FUNÇÕES DE NAVEGAÇÃO E VIEW RENDERING ---

function hideAllViews() {
    // Esconde todas as sub-views do main-app
    Object.keys(viewMap).forEach(key => {
        const element = viewMap[key];
        // Aplica o display: none apenas nas views internas do app (terminadas em -view)
        if (element && element.id && element.id.endsWith('-view')) {
            element.style.display = 'none';
        }
    });
}

function toggleAppDisplay(show) {
    // Essa função gerencia a visibilidade das telas principais (Login, Welcome, Main App)
    viewMap["login-screen"].style.display = 'none';
    viewMap["welcome-screen"].style.display = 'none';
    viewMap["explanation-screen"].style.display = 'none';
    
    if (show) {
        viewMap["main-app"].style.display = 'block';
        viewMap["chat-button"].style.display = 'flex';
    } else {
        viewMap["main-app"].style.display = 'none';
        // O botão do chat só aparece dentro do main-app
        viewMap["chat-button"].style.display = 'none';
    }
}

function showUserTrilhasView() {
    hideAllViews();
    document.getElementById("trilhas-list").innerHTML = '';
    renderTrilhasList(); 
    viewMap["user-trilhas-view"].style.display = 'block';
    // MODIFICAÇÃO A11y: Focar no título da nova view
    setFocusToNewView("user-trilhas-view"); 
}

function showPreDefinedCoursesView() {
    hideAllViews();
    document.getElementById("predefined-courses-list").innerHTML = renderPreDefinedCourses();
    viewMap["predefined-courses-view"].style.display = 'block';
    // MODIFICAÇÃO A11y: Focar no título da nova view
    setFocusToNewView("predefined-courses-view");
}

function showFormView() {
    hideAllViews();
    // Essa view usa flexbox para centralizar o formulário
    viewMap["form-view"].style.display = 'flex';
    // MODIFICAÇÃO A11y: Focar no título da nova view
    setFocusToNewView("form-view");
}

function showRoadmapView() {
    hideAllViews();
    window.scrollTo(0, 0); 
    renderRoadmap(); // Atualiza o conteúdo do roadmap
    viewMap["roadmap-view"].style.display = 'block';
    
    // Ativa o chat se a trilha estiver ativa
    const isTrilhaActive = currentUser.currentTrilhaIndex !== -1;
    document.getElementById("chat-button").style.display = isTrilhaActive ? 'flex' : 'none';
    patolindoState.lastView = "roadmap-view";
    
    // MODIFICAÇÃO A11y: Focar no título da nova view
    setFocusToNewView("roadmap-view"); 
}

function showEtapaView(etapa) {
    hideAllViews();
    window.scrollTo(0, 0);
    renderEtapa(etapa);
    viewMap["etapa-view"].style.display = 'block';
    patolindoState.lastView = "etapa-view";
    
    // MODIFICAÇÃO A11y: Focar no título da nova view
    setFocusToNewView("etapa-view");
}

function showMaterialView(topico, material) {
    hideAllViews();
    window.scrollTo(0, 0);
    renderMaterial(topico, material);
    viewMap["material-view"].style.display = 'block';
    patolindoState.lastView = "material-view";
    
    // MODIFICAÇÃO A11y: Focar no título da nova view
    setFocusToNewView("material-view");
}

function showFlashcardView(topico) {
    hideAllViews();
    window.scrollTo(0, 0);
    renderFlashcard(topico);
    viewMap["flashcard-view"].style.display = 'block';
    patolindoState.lastView = "flashcard-view";
    
    // MODIFICAÇÃO A11y: Focar no título da nova view
    setFocusToNewView("flashcard-view");
}

function showSimuladoEtapaView() {
    hideAllViews();
    window.scrollTo(0, 0);
    // renderSimuladoEtapa já será chamado dentro do generateSimulado() ou startSimulado()
    viewMap["simulado-etapa-view"].style.display = 'block';
    patolindoState.lastView = "simulado-etapa-view";
    
    // MODIFICAÇÃO A11y: Focar no título da nova view
    setFocusToNewView("simulado-etapa-view");
}

function showChatView() {
    hideAllViews();
    window.scrollTo(0, 0);
    document.getElementById("chat-messages").innerHTML = ''; // Limpa mensagens anteriores
    document.getElementById("chat-counter").innerText = `(${patolindoState.questionsLeft} Perguntas)`;
    
    // Adiciona mensagem de boas vindas do Patolindo
    appendMessage("Patolindo: Olá! Sou seu assistente. Estou aqui para tirar dúvidas sobre sua trilha de estudos atual. O que você precisa?", 'bot');

    viewMap["chat-view"].style.display = 'flex';
    
    // MODIFICAÇÃO A11y: Focar no título da nova view
    setFocusToNewView("chat-view");
}

function hideChatView() {
    // Retorna para a última view principal
    viewMap[patolindoState.lastView].style.display = 'block';
}

function toggleChatWindow() {
    const chatContainer = viewMap["chat-view"];
    if (chatContainer.style.display === 'none' || chatContainer.style.display === '') {
        showChatView();
    } else {
        hideChatView();
    }
}

// --- FUNÇÕES DE RENDERIZAÇÃO DE CONTEÚDO ---
function renderRoadmap() {
    const roadmapContainer = document.getElementById("roadmap");
    const trilha = currentUser.trilhas[currentUser.currentTrilhaIndex];
    
    if (!trilha || !trilha.etapas) {
        roadmapContainer.innerHTML = '<p class="placeholder-text">Nenhuma trilha ativa. Por favor, crie uma trilha personalizada.</p>';
        document.getElementById("roadmap-title").innerText = "Sua Trilha de Estudos";
        return;
    }

    document.getElementById("roadmap-title").innerText = `Trilha: ${trilha.tema} (${trilha.nivel})`;
    
    let html = '';
    trilha.etapas.forEach((etapa, index) => {
        html += `<div class="bloco" onclick="showEtapaView(${index})">
                    <span style="font-size: 0.8em; color: #555;">Etapa ${index + 1}</span>
                    <h4>${etapa.titulo}</h4>
                </div>`;
    });
    
    roadmapContainer.innerHTML = html;
}

function renderEtapa(etapaIndex) {
    const trilha = currentUser.trilhas[currentUser.currentTrilhaIndex];
    const etapa = trilha.etapas[etapaIndex];
    
    if (!etapa) return;

    modalState.currentEtapa = etapaIndex; // Salva o índice da etapa atual para navegação
    
    document.getElementById("etapa-titulo").innerText = etapa.titulo;
    
    let html = `
        <p><strong>Descrição:</strong> ${etapa.atividade}</p>
        
        <h3>Tópicos de Estudo</h3>
        <div class="topicos-container">
    `;
    
    etapa.topicos.forEach(topico => {
        html += `
            <div class="topico-bloco">
                <button class="material-btn" onclick="showMaterialView('${topico.tópico}', '${topico.material}')">
                    📚 Material: ${topico.tópico}
                </button>
                <button class="btn-flashcard" onclick="showFlashcardView('${topico.tópico}')">
                    🧠 Flashcards
                </button>
            </div>
        `;
    });
    
    html += `</div>
        <button class="btn-primary btn-simulado-etapa" id="btnStartSimulado">
            ✅ Simulado da Etapa (${etapa.topicos.length * 5} Questões)
        </button>
    `;

    document.getElementById("etapa-conteudo").innerHTML = html;
    
    // Adicionar Listener para o botão Simulado
    document.getElementById("btnStartSimulado").onclick = () => {
         // Prepara para geração (simulada) e navegação
        document.getElementById("simulado-etapa-titulo").innerText = `Simulado: ${etapa.titulo}`;
        document.getElementById("simulado-etapa-conteudo").innerHTML = `<p class="placeholder-text">Gerando <strong>${etapa.topicos.length * 5}</strong> questões exclusivas para esta etapa...</p>`;
        document.getElementById("simulado-etapa-botoes").innerHTML = '';
        showSimuladoEtapaView(); // Navega para a view do simulado com placeholder
        generateSimulado(etapaIndex); // Inicia a geração
    };
}

function renderMaterial(topico, material) {
    document.getElementById("material-titulo").innerText = `Material de Apoio: ${topico}`;
    
    let html = `
        <p>O material gerado pela IA (em uma versão completa) estaria aqui.</p>
        <p>Para esta demonstração, usamos um link direto para um material relevante:</p>
        <a href="${material}" target="_blank" class="btn-primary" style="text-align: center; text-decoration: none;">Acessar Material Externo</a>
        <p style="margin-top: 15px;">Acesse para aprofundar seu conhecimento sobre <strong>${topico}</strong>.</p>
    `;
    
    document.getElementById("material-conteudo").innerHTML = html;

    document.getElementById("btnMaterialVoltar").onclick = () => showEtapaView(modalState.currentEtapa);
}

function renderFlashcard(topico) {
    document.getElementById("flashcard-titulo").innerText = `Flashcards: ${topico}`;
    
    // Simulação de Flashcards
    const flashcards = [
        { front: `Qual a definição de ${topico}?`, back: `Resposta chave de ${topico}.` },
        { front: `Cite um exemplo prático de ${topico}.`, back: `Exemplo prático de ${topico}.` },
        { front: `Por que ${topico} é importante?`, back: `Razão da importância de ${topico}.` }
    ];

    let currentFlashcardIndex = 0;
    const displayArea = document.getElementById("flashcard-display");

    function showCard(index) {
        const card = flashcards[index];
        displayArea.innerHTML = `
            <div class="flashcard" id="current-flashcard" onclick="this.classList.toggle('flipped')">
                <div class="flashcard-inner">
                    <div class="flashcard-face flashcard-front">
                        <p style="font-weight: bold;">Frente (Pergunta)</p>
                        <p>${card.front}</p>
                    </div>
                    <div class="flashcard-face flashcard-back">
                        <p style="font-weight: bold;">Verso (Resposta)</p>
                        <p>${card.back}</p>
                    </div>
                </div>
            </div>
            <div class="flashcard-navigation">
                <button id="btnPrevCard" class="btn-secondary" disabled>Anterior</button>
                <button id="btnNextCard" class="btn-primary">Próximo</button>
            </div>
        `;

        // Adicionar Listeners de navegação
        const btnPrev = document.getElementById("btnPrevCard");
        const btnNext = document.getElementById("btnNextCard");

        btnPrev.disabled = index === 0;
        btnNext.disabled = index === flashcards.length - 1;

        btnPrev.onclick = () => {
            if (currentFlashcardIndex > 0) {
                currentFlashcardIndex--;
                showCard(currentFlashcardIndex);
            }
        };
        btnNext.onclick = () => {
            if (currentFlashcardIndex < flashcards.length - 1) {
                currentFlashcardIndex++;
                showCard(currentFlashcardIndex);
            }
        };
    }

    if (flashcards.length > 0) {
        showCard(currentFlashcardIndex);
    } else {
        displayArea.innerHTML = '<p class="placeholder-text">Não há flashcards disponíveis para este tópico.</p>';
    }

    document.getElementById("btnFlashcardVoltar").onclick = () => showEtapaView(modalState.currentEtapa);
}


function renderPreDefinedCourses() {
    let html = '';
    preDefinedRoadmaps.forEach(cat => {
        html += `<div class="course-category">
                    <h3>${cat.category}</h3>
                    <div class="courses-grid">`;
        
        cat.courses.forEach(course => {
            html += `
                <div class="course-card" onclick="createCourseFromPredefined('${course.tema}', '${course.nivel}', '${course.objetivo}')">
                    <h4>${course.tema}</h4>
                    <p>${course.nivel} - ${course.objetivo}</p>
                </div>
            `;
        });

        html += `</div></div>`;
    });
    return html;
}

function renderTrilhasList() {
    const listContainer = document.getElementById("trilhas-list");
    const trilhas = currentUser.trilhas;

    if (trilhas.length === 0) {
        listContainer.innerHTML = '<p class="placeholder-text">Você ainda não tem trilhas salvas. Crie uma para começar!</p>';
        document.getElementById("btnMinhasTrilhas").innerText = 'Minhas Trilhas (0)';
        return;
    }

    let html = '';
    trilhas.forEach((trilha, index) => {
        const isActive = index === currentUser.currentTrilhaIndex;
        const status = isActive ? 'Ativa' : 'Inativa';
        const statusClass = isActive ? 'btn-success' : 'btn-secondary';

        html += `
            <div class="trilha-card">
                <div class="trilha-info">
                    <h4>${trilha.tema} (${trilha.nivel})</h4>
                    <p>Status: <span style="font-weight: bold; color: ${isActive ? 'var(--color-success)' : '#6c757d'};">${status}</span></p>
                </div>
                <div class="trilha-actions">
                    <button class="${statusClass}" onclick="activateTrilha(${index})" ${isActive ? 'disabled' : ''}>
                        ${isActive ? 'Ativa' : 'Ativar'}
                    </button>
                    <button class="btn-secondary" onclick="deleteTrilha(${index})">Excluir</button>
                    <button class="btn-primary" onclick="showRoadmapFromTrilha(${index})">Ver Roadmap</button>
                </div>
            </div>
        `;
    });

    listContainer.innerHTML = html;
}

// --- FUNÇÕES DE LÓGICA DE NEGÓCIO ---

function activateTrilha(index) {
    if (index >= 0 && index < currentUser.trilhas.length) {
        currentUser.currentTrilhaIndex = index;
        saveUserTrilhas();
        renderTrilhasList(); 
        updateTrilhasCountDisplay();
        showRoadmapView();
    }
}

function deleteTrilha(index) {
    if (confirm(`Tem certeza que deseja excluir a trilha: ${currentUser.trilhas[index].tema}?`)) {
        currentUser.trilhas.splice(index, 1);
        if (currentUser.currentTrilhaIndex === index) {
            currentUser.currentTrilhaIndex = -1; // Desativa se for a trilha atual
        } else if (currentUser.currentTrilhaIndex > index) {
            currentUser.currentTrilhaIndex--; // Ajusta o índice
        }
        saveUserTrilhas();
        renderTrilhasList();
        showUserTrilhasView();
    }
}

function showRoadmapFromTrilha(index) {
    activateTrilha(index); // Ativa e navega
}


function createCourseFromPredefined(tema, nivel, objetivo) {
    document.getElementById("tema").value = tema;
    document.getElementById("nivel").value = nivel;
    document.getElementById("objetivo").value = objetivo;

    // Simula a submissão do formulário para usar a lógica de geração de roadmap
    // Neste caso, a lógica do roadmap será simulada, mas a estrutura será salva
    const course = preDefinedRoadmaps.flatMap(cat => cat.courses).find(c => c.tema === tema);

    if (course) {
        const newTrilha = {
            tema: course.tema,
            nivel: course.nivel,
            objetivo: course.objetivo,
            etapas: course.etapas,
            generatedAt: new Date().toLocaleDateString()
        };
        
        currentUser.trilhas.push(newTrilha);
        currentUser.currentTrilhaIndex = currentUser.trilhas.length - 1;
        saveUserTrilhas();
        
        // Exibe o roadmap
        showRoadmapView();
    }
}

// --- FUNÇÕES DE COMUNICAÇÃO COM A API GROQ (GERAÇÃO SIMULADA) ---

// Função principal para iniciar a geração da trilha (Roadmap)
async function generateRoadmap(tema, nivel, objetivo) {
    // Simulação de resposta da API
    handleRoadmapGenerationResponse({
        tema: tema,
        nivel: nivel,
        objetivo: objetivo,
        etapas: [
            // Resposta de exemplo simulada:
            { titulo: "Introdução à Programação", topicos: [{ tópico: "Variáveis", material: "link" }, { tópico: "Estruturas de Controle", material: "link" }], atividade: "Criar calculadora" }
        ],
        generatedAt: new Date().toLocaleDateString()
    });
}

function handleRoadmapGenerationResponse(trilha) {
    currentUser.trilhas.push(trilha);
    currentUser.currentTrilhaIndex = currentUser.trilhas.length - 1;
    saveUserTrilhas();
    showRoadmapView();
}


// Função para iniciar a geração do Simulado (Simulada)
async function generateSimulado(etapaIndex) {
    // Simulação de resposta da API
    const simuladoData = {
        titulo: `Simulado da Etapa ${etapaIndex + 1}`,
        questoes: [
            { pergunta: "Pergunta 1 do Simulado:", alternativas: ["A", "B", "C", "D"], correta: "A", explicacao: "Explicação 1" },
            { pergunta: "Pergunta 2 do Simulado:", alternativas: ["A", "B", "C", "D"], correta: "B", explicacao: "Explicação 2" },
            { pergunta: "Pergunta 3 do Simulado:", alternativas: ["A", "B", "C", "D"], correta: "C", explicacao: "Explicação 3" }
        ]
    };
    handleSimuladoGenerationResponse(simuladoData);
}

function handleSimuladoGenerationResponse(simuladoData) {
    const simuladoContainer = document.getElementById("simulado-etapa-conteudo");
    const botoesContainer = document.getElementById("simulado-etapa-botoes");
    let userAnswers = {}; // Para armazenar as respostas do usuário

    function renderSimulado() {
        let html = '';
        simuladoData.questoes.forEach((questao, qIndex) => {
            html += `
                <div class="simulado-bloco" data-question-index="${qIndex}">
                    <p><strong>Questão ${qIndex + 1}:</strong> ${questao.pergunta}</p>
                    <ul>
            `;
            questao.alternativas.forEach((alt, aIndex) => {
                const isSelected = userAnswers[qIndex] === alt;
                const selectedClass = isSelected ? 'selected' : '';
                html += `
                    <li class="alternativa ${selectedClass}" 
                        data-alternative="${alt}"
                        onclick="selectAlternative(${qIndex}, '${alt}')">${alt}</li>
                `;
            });
            html += `
                    </ul>
                    <hr>
                </div>
            `;
        });
        simuladoContainer.innerHTML = html;

        botoesContainer.innerHTML = `
            <button class="btn-primary" onclick="submitSimulado()">Finalizar Simulado</button>
        `;
    }

    window.selectAlternative = (qIndex, alt) => {
        userAnswers[qIndex] = alt;
        renderSimulado(); // Renderiza novamente para destacar a seleção
    };

    window.submitSimulado = () => {
        let correctCount = 0;
        let finalHtml = '';
        
        simuladoData.questoes.forEach((questao, qIndex) => {
            const userAnswer = userAnswers[qIndex];
            const isCorrect = userAnswer === questao.correta;

            if (isCorrect) {
                correctCount++;
            }

            finalHtml += `
                <div class="simulado-bloco" data-question-index="${qIndex}">
                    <p><strong>Questão ${qIndex + 1}:</strong> ${questao.pergunta}</p>
                    <ul>
            `;
            questao.alternativas.forEach((alt) => {
                let classResult = '';
                if (alt === questao.correta) {
                    classResult = 'correta-destacada';
                } else if (alt === userAnswer && !isCorrect) {
                    classResult = 'incorreta';
                }
                
                finalHtml += `
                    <li class="alternativa ${classResult}">
                        ${alt} ${alt === questao.correta ? ' (Correta)' : ''}
                    </li>
                `;
            });
            finalHtml += `
                    </ul>
                    <div style="padding: 10px; background-color: #f7f7f7; border-radius: 4px; margin-top: 10px;">
                        <strong>Explicação:</strong> ${questao.explicacao}
                    </div>
                    <hr>
                </div>
            `;
        });

        // Exibe o resultado
        const totalQuestions = simuladoData.questoes.length;
        const score = (correctCount / totalQuestions) * 100;
        
        const resultadoHtml = `<div id="simulado-resultado">
            Resultado Final: ${correctCount}/${totalQuestions} (${score.toFixed(0)}%)
        </div>`;
        
        simuladoContainer.innerHTML = resultadoHtml + finalHtml;
        botoesContainer.innerHTML = `
            <button class="btn-primary" onclick="showEtapaView(modalState.currentEtapa)">Retornar à Etapa</button>
        `;
    };

    renderSimulado();
}


// --- CHATBOT PATOLINDO (GROQ API SIMULADA) ---

// Função principal de comunicação com a Groq
async function getGroqResponse(messages) {
     // Simulação de resposta da API
     const lastUserMessage = messages[messages.length - 1].content.toLowerCase();
     
     let responseText = "Sou o Patolindo, seu assistente de estudos! Para que eu possa te ajudar, por favor, crie e ative uma trilha de estudos. Assim, poderei responder perguntas específicas sobre o seu conteúdo atual.";
     
     if (currentUser.currentTrilhaIndex !== -1) {
         const trilhaAtual = currentUser.trilhas[currentUser.currentTrilhaIndex];
         responseText = `A trilha de estudos ativa é sobre **${trilhaAtual.tema}** no nível **${trilhaAtual.nivel}**. 
         
         Se a sua pergunta for sobre **${lastUserMessage}**, eu diria que a resposta chave é: [A resposta real da Groq sobre o tópico]
         
         Lembre-se: Este é o seu limite de ${patolindoState.questionsLeft} perguntas restantes!`;
     }

     return responseText;
}

// Função de envio de mensagem no chat
async function sendChatMessage() {
    const inputField = document.getElementById("chat-input");
    const sendButton = document.getElementById("chat-send-button");
    const userText = inputField.value.trim();

    if (!userText) return;

    // 1. Exibir mensagem do usuário
    appendMessage(userText, 'user');
    inputField.value = '';

    // 2. Desabilitar interação e verificar limite
    sendButton.disabled = true;
    inputField.disabled = true;

    if (currentUser.currentTrilhaIndex === -1 && currentUser.name !== 'Convidado') {
         appendMessage("Patolindo: Você precisa ter uma trilha de estudos ativa para usar o assistente.", 'bot');
         sendButton.disabled = false;
         inputField.disabled = false;
         return;
    }
    
    if (currentUser.name === 'Convidado' || patolindoState.questionsLeft <= 0) {
         appendMessage("Patolindo: Você atingiu o limite de perguntas do modo Convidado ou da sua cota atual. Por favor, ative uma conta ou entre em contato com o suporte.", 'bot');
         sendButton.disabled = false;
         inputField.disabled = false;
         return;
    }

    // 3. Adicionar ao histórico e chamar API (simulada)
    patolindoState.history.push({ role: "user", content: userText });

    try {
        const answer = await getGroqResponse(patolindoState.history);
        appendMessage(answer, 'bot');
        
        // Diminuir o contador apenas se for uma resposta real (não erro ou aviso)
        if (!answer.includes("Por favor, crie e ative uma trilha")) {
            patolindoState.history.push({ role: "assistant", content: answer });
            patolindoState.questionsLeft--;
        } else {
             patolindoState.history.push({ role: "assistant", content: answer });
        }
        
    } catch (err) {
        console.error("Erro no Patolindo:", err);
        appendMessage("Patolindo: Desculpe, ocorreu um erro de comunicação. Tente novamente.", 'bot');
    } finally {
        sendButton.disabled = false;
        inputField.disabled = false;
        updateSendButtonState();
    }
}

function appendMessage(text, sender) {
    const chatMessages = document.getElementById("chat-messages");
    const messageElement = document.createElement("p");
    
    if (sender === 'user') {
        messageElement.className = 'user-message';
        messageElement.innerHTML = `<span class="user-bubble">${text}</span>`;
    } else {
        messageElement.className = 'bot-message';
        // CORREÇÃO: Garante que o negrito **Markdown** é convertido para <b>HTML</b>
        const htmlText = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, "<br>");
        messageElement.innerHTML = `<span class="bot-bubble">${htmlText}</span>`;
    }
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function updateSendButtonState() {
    const sendButton = document.getElementById("chat-send-button");
    const inputField = document.getElementById("chat-input");
    document.getElementById("chat-counter").innerText = `(${patolindoState.questionsLeft} Perguntas)`;

    if (currentUser.currentTrilhaIndex === -1 || patolindoState.questionsLeft <= 0) {
        sendButton.disabled = true;
        inputField.disabled = true;
        inputField.placeholder = "Limite de perguntas atingido ou trilha não ativa.";
    } else {
        sendButton.disabled = false;
        inputField.disabled = false;
        inputField.placeholder = "Sua pergunta...";
    }
}

// --- INICIALIZAÇÃO E EVENT LISTENERS ---

document.addEventListener('DOMContentLoaded', () => {
    loadUserData(localStorage.getItem('quackademyUser')); // Carrega último usuário ou inicia como Convidado
    
    if (currentUser.name && currentUser.name !== 'Convidado') {
        // Se o login foi persistido, avança para a tela principal
        toggleAppDisplay(true);
        showRoadmapView();
    } else {
        // CORREÇÃO CRÍTICA AQUI:
        // Ocultar todas as telas principais exceto a de Login, que é a primeira.
        // A função toggleAppDisplay(false) estava ocultando a tela de Login, causando a tela branca.
        toggleAppDisplay(false); // Oculta o main-app
        viewMap["login-screen"].style.display = 'flex'; // Exibe SOMENTE a tela de Login
    }

    // Eventos da Tela de Login
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        loadAllUsersData(); // Recarrega todos os usuários
        const storedUser = allUsersData[username];
        const authMessage = document.getElementById('auth-message');

        if (storedUser) {
            // Login (Simulado)
            if (storedUser.password === password) {
                localStorage.setItem('quackademyUser', username);
                loadUserData(username);
                viewMap["login-screen"].style.display = 'none';
                viewMap["welcome-screen"].style.display = 'flex';
            } else {
                authMessage.innerText = "Senha incorreta.";
            }
        } else {
            // Cadastro (Simulado)
            localStorage.setItem('quackademyUser', username);
            loadUserData(username);
            authMessage.innerText = "Usuário cadastrado com sucesso!";
            viewMap["login-screen"].style.display = 'none';
            viewMap["welcome-screen"].style.display = 'flex';
        }
    });

    document.getElementById('btnSkipLogin').addEventListener('click', () => {
        localStorage.removeItem('quackademyUser');
        loadUserData('Convidado');
        viewMap["login-screen"].style.display = 'none';
        viewMap["welcome-screen"].style.display = 'flex';
    });

    // Eventos das Telas de Boas-Vindas
    document.getElementById('btnWelcomeContinue').addEventListener('click', () => {
        viewMap["welcome-screen"].style.display = 'none';
        viewMap["explanation-screen"].style.display = 'flex';
    });
    document.getElementById('btnExplanationContinue').addEventListener('click', () => {
        toggleAppDisplay(true);
        showPreDefinedCoursesView();
    });


    // Eventos do Formulário de Criação de Trilha
    document.getElementById('btnGerar').addEventListener('click', () => {
        const tema = document.getElementById('tema').value;
        const nivel = document.getElementById('nivel').value;
        const objetivo = document.getElementById('objetivo').value;
        
        if (tema) {
            document.getElementById('roadmap').innerHTML = '<p class="placeholder-text">Gerando sua trilha de estudos... Aguarde. (Simulando chamada à Groq)</p>';
            generateRoadmap(tema, nivel, objetivo);
        } else {
            alert('Por favor, defina um Tema.');
        }
    });

    // Eventos do Chatbot
    document.getElementById("chat-send-button").addEventListener('click', sendChatMessage);
    document.getElementById("chat-input").addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });
    document.getElementById("chat-exit-button").addEventListener('click', hideChatView);

    // Listener para o botão flutuante de chat
    viewMap["chat-button"].onclick = toggleChatWindow;

    // Inicializa estado do botão de envio do chat
    updateSendButtonState();
});
