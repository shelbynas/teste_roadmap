// ===================================================
// ARQUIVO: script.js (FINAL - Groq API, Ajustes de Simulado)
// Este código requer um ambiente HTTPS/web para funcionar.
// ===================================================

const API_KEY = "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"; // ⬅️ SUA CHAVE DA GROQ
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const MODEL_NAME = "llama-3.1-8b-instant"; // MODELO CORRETO E ATIVO

let modalState = {}; 

document.getElementById("btnGerar").addEventListener("click", gerarRoadmap);

// --- 1. FUNÇÃO PRINCIPAL: GERAR ROADMAP (SEM MUDANÇAS) ---
async function gerarRoadmap() {
  const tema = document.getElementById("tema").value;
  const nivel = document.getElementById("nivel").value;
  const objetivo = document.getElementById("objetivo").value;
  const roadmapDiv = document.getElementById("roadmap");
  roadmapDiv.innerHTML = "✨ Gerando roadmap...";

  if (!tema) {
      roadmapDiv.innerHTML = "⚠️ Por favor, preencha o campo Tema.";
      return;
  }
  
  try {
    const systemPrompt = `Você é um gerador de roadmaps. Sua única resposta deve ser APENAS JSON válido, sem texto introdutório ou blocos de código markdown. O JSON deve seguir este formato: {"etapas": [{"titulo": "Etapa 1: Nome da etapa", "topicos": [{"tópico": "Nome do tópico", "material": "URL ou null"}], "atividade": "Descrição da atividade prática"}]}.`;
    
    const userPrompt = `Crie um roadmap de estudos para o tema "${tema}" no nível "${nivel}"${objetivo ? ` com objetivo "${objetivo}"` : ""}.`;

    const response = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({ 
          model: MODEL_NAME,
          messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
          ],
          response_format: { type: "json_object" }, 
          temperature: 0.7 
      })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro API: ${response.status} - ${errorData.error.message}`);
    }

    const data = await response.json();
    let texto = data?.choices?.[0]?.message?.content || "";

    let textoLimpo = texto.trim();
    let parsed;
    try {
        parsed = JSON.parse(textoLimpo);
    } catch (e) {
        console.warn("JSON direto falhou. Tentando extração robusta.");
        textoLimpo = textoLimpo.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim();
        const jsonMatch = textoLimpo.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
             console.error("Texto falhou na extração:", texto);
             throw new Error("Não foi possível extrair JSON da resposta.");
        }
        parsed = JSON.parse(jsonMatch[0]);
    }
    
    const etapas = parsed.etapas;
    modalState.etapas = etapas; 
    roadmapDiv.innerHTML = "";

    etapas.forEach(etapa => {
      const blocoDiv = document.createElement("div");
      blocoDiv.className = "bloco";
      blocoDiv.innerText = etapa.titulo;
      blocoDiv.onclick = () => abrirModalMateriais(etapa);
      roadmapDiv.appendChild(blocoDiv);
    });

  } catch (err) {
    console.error("Erro:", err);
    roadmapDiv.innerHTML = `⚠️ Erro ao gerar roadmap. Causa: ${err.message}. (Tente hospedar o projeto!)`;
  }
}

// --- 2. FUNÇÃO: ABRIR MODAL DA ETAPA (SEM MUDANÇAS) ---
function abrirModalMateriais(etapa) {
  modalState.currentEtapa = etapa; 

  document.getElementById("modal").style.display = "block";
  document.getElementById("modal-titulo").innerText = etapa.titulo;

  const conteudo = etapa.topicos.map(t => {
    const topicoEscapado = t.tópico.replace(/'/g,"\\'"); 
    const materialLink = t.material ? t.material : "";

    return `
      <div class="topico-bloco">
        <button class="bloco material-btn" onclick="gerarConteudoMaterial('${topicoEscapado}', '${materialLink}')">${t.tópico}</button>
        <button class="btn-simulado" onclick="gerarSimulado('${topicoEscapado}')">🧠 Gerar Simulado</button>
      </div>
    `;
  }).join("");

  document.getElementById("modal-conteudo").innerHTML = `
    <h3>📌 Atividade prática:</h3>
    <p>${etapa.atividade}</p>
    <h3>📚 Tópicos e Simulado:</h3>
    <div class="topicos-container">${conteudo}</div>
    <div class="modal-actions">
        <button onclick="fecharModal()" class="btn-secondary">❌ Fechar</button>
    </div>
  `;
}

// --- 3. FUNÇÃO: GERAR SIMULADO (AJUSTADA PARA MÚLTIPLAS PERGUNTAS) ---
async function gerarSimulado(topico) {
    const modalConteudo = document.getElementById("modal-conteudo");

    modalConteudo.innerHTML = `<p>Carregando simulado sobre: <strong>${topico}</strong>...</p>`;

    try {
        // MUDANÇA 1: PEDIR UM ARRAY DE 3 PERGUNTAS
        const systemPromptSimulado = `Você é um gerador de questões de múltipla escolha. Sua única resposta deve ser APENAS JSON válido, sem texto introdutório. O JSON deve ser um objeto contendo um array de 3 perguntas. O formato deve ser: {"simulados": [{"pergunta": "...", "alternativas": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."], "resposta_correta": "Letra da alternativa correta (ex: C)"}, {"pergunta": "...", ...}]}.`;
        
        const userPromptSimulado = `Crie 3 questões de múltipla escolha sobre o tópico "${topico}" no nível ${document.getElementById("nivel").value}. Cada questão deve ter 5 alternativas.`;

        const response = await fetch(GROQ_ENDPOINT, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({ 
                model: MODEL_NAME,
                messages: [
                    { role: "system", content: systemPromptSimulado },
                    { role: "user", content: userPromptSimulado }
                ],
                response_format: { type: "json_object" },
                temperature: 0.5 
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Erro API: ${response.status} - ${errorData.error.message}`);
        }

        const data = await response.json();
        let texto = data?.choices?.[0]?.message?.content || "Erro ao gerar simulado.";

        let parsedData;
        try {
            parsedData = JSON.parse(texto.trim());
        } catch (e) {
            let textoLimpo = texto.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim();
            const jsonMatch = textoLimpo.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("Não foi possível extrair JSON do simulado.");
            parsedData = JSON.parse(jsonMatch[0]);
        }
        
        // MUDANÇA 2: ITERAR SOBRE O ARRAY DE SIMULADOS
        const simulados = parsedData.simulados || [parsedData]; 
        
        const simuladosHtml = simulados.map((simulado, index) => {
            const alternativasHtml = simulado.alternativas.map((alt) => {
                const letra = alt.charAt(0);
                return `<li class="alternativa" 
                            data-correta="${letra === simulado.resposta_correta.charAt(0)}">
                            ${alt}
                        </li>`;
            }).join("");

            return `
                <div class="simulado-bloco">
                    <h4>Questão ${index + 1}:</h4>
                    <p><strong>${simulado.pergunta}</strong></p>
                    <ul>${alternativasHtml}</ul>
                    <button class="btnVerResposta" onclick="mostrarResposta(this)">Ver Resposta</button>
                    <p class="feedback" style="font-weight: bold; margin-top: 10px;"></p>
                </div>
                <hr>
            `;
        }).join("");

        modalConteudo.innerHTML = `
            <h3>Simulado: ${topico}</h3>
            <div class="simulado-area">
                ${simuladosHtml}
            </div>
            <div class="modal-actions">
                <button onclick="abrirModalMateriais(modalState.currentEtapa)" class="btn-secondary">⬅ Voltar</button>
            </div>
        `;

    } catch (err) {
        console.error("Erro no Simulado:", err);
        modalConteudo.innerHTML = `
          <p>⚠️ Erro ao gerar simulado. Causa: ${err.message}.</p>
          <div class="modal-actions">
            <button onclick="abrirModalMateriais(modalState.currentEtapa)" class="btn-secondary">⬅ Voltar</button>
          </div>
        `;
    }
}

// --- 4. FUNÇÃO: MOSTRAR RESPOSTA DO SIMULADO (AJUSTADA PARA ESCONDER RESPOSTA) ---
function mostrarResposta(button) {
    // Encontra o simulado-bloco pai do botão que foi clicado
    const simuladoBloco = button.closest('.simulado-bloco');
    if (!simuladoBloco) return;

    const alternativas = simuladoBloco.querySelectorAll('.alternativa');
    const feedback = simuladoBloco.querySelector('.feedback');

    alternativas.forEach(li => {
        if (li.dataset.correta === 'true') {
            li.style.backgroundColor = '#d4edda'; // Cor verde para correta
            li.style.color = '#155724';
        } else {
            // Apenas adiciona a classe .incorreta, que deve ser estilizada no CSS
            li.classList.add('incorreta'); 
        }
        li.style.cursor = 'default';
    });
    
    // Esconde o botão e mostra o feedback
    button.style.display = 'none';
    if (feedback) {
        feedback.innerText = 'A resposta correta está destacada.';
    }
}


// --- 5. FUNÇÃO: GERAR CONTEÚDO MATERIAL (SEM MUDANÇAS) ---
async function gerarConteudoMaterial(topico, material) {
  const modalConteudo = document.getElementById("modal-conteudo");
  modalConteudo.innerHTML = `<p>Carregando conteúdo sobre: <strong>${topico}</strong>...</p>`;

  try {
    const userPromptMaterial = material 
      ? `Explique de forma didática e detalhada o tópico "${topico}" usando o conteúdo do link: ${material}.`
      : `Explique de forma didática e detalhada o tópico "${topico}".`;

    const response = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({ 
          model: MODEL_NAME,
          messages: [
              { role: "user", content: userPromptMaterial }
          ],
          temperature: 0.8
      })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro API: ${response.status} - ${errorData.error.message}`);
    }

    const data = await response.json();
    let texto = data?.choices?.[0]?.message?.content || "Erro ao gerar conteúdo.";

    // Conversão simples de Markdown para HTML
    texto = texto.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
    texto = texto.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');

    modalConteudo.innerHTML = `
      <h3>${topico}</h3>
      <div style="max-height:400px; overflow-y:auto; padding-right:10px;">
        ${texto.split("\n\n").map(p => `<p>${p}</p>`).join("")}
      </div>
      <div class="modal-actions">
        <button onclick="abrirModalMateriais(modalState.currentEtapa)" class="btn-secondary">⬅ Voltar</button>
      </div>
    `;

  } catch (err) {
    console.error("Erro:", err);
    modalConteudo.innerHTML = `
        <p>⚠️ Erro ao gerar conteúdo. Causa: ${err.message}.</p>
        <div class="modal-actions">
            <button onclick="abrirModalMateriais(modalState.currentEtapa)" class="btn-secondary">⬅ Voltar</button>
        </div>
    `;
  }
}

// --- 6. FUNÇÃO: FECHAR MODAL (SEM MUDANÇAS) ---
function fecharModal() {
  document.getElementById("modal").style.display = "none";
}
