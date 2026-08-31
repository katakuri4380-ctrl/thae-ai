// ==========================================
// THAÊ — SCRIPT.JS
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

  const entrada = document.getElementById("entrada");
  const mensagens = document.getElementById("messages");

  // ========================================
  // TROCA DE ABAS
  // ========================================

  const botoes = document.querySelectorAll(".tab");
  const paginas = document.querySelectorAll(".page");

  botoes.forEach(function (botao) {

    botao.addEventListener("click", function () {

      const destino = botao.getAttribute("data-page");

      paginas.forEach(function (pagina) {
        pagina.classList.remove("active");
      });

      botoes.forEach(function (b) {
        b.classList.remove("active");
      });

      const paginaEscolhida =
        document.getElementById(destino);

      if (paginaEscolhida) {
        paginaEscolhida.classList.add("active");
        botao.classList.add("active");
      }

    });

  });


  // ========================================
  // ENTER PARA ENVIAR
  // ========================================

  if (entrada) {

    entrada.addEventListener("keydown", function (event) {

      if (event.key === "Enter") {
        event.preventDefault();
        enviarPergunta();
      }

    });

  }


  // ========================================
  // PERGUNTAS RÁPIDAS
  // ========================================

  window.perguntaRapida = function (texto) {

    if (!entrada) return;

    entrada.value = texto;

    enviarPergunta();

  };


  // ========================================
  // ENVIAR PERGUNTA PARA A IA
  // ========================================

  window.enviarPergunta = async function () {

    if (!entrada || !mensagens) {
      return;
    }

    const pergunta = entrada.value.trim();

    if (!pergunta) {
      return;
    }

    // Mostra pergunta do usuário
    adicionarMensagem(pergunta, "user");

    entrada.value = "";
    entrada.disabled = true;

    // Mostra carregando
    const carregando = adicionarMensagem(
      "Thaê está pensando... 🌿",
      "bot"
    );

    try {

      const resposta = await fetch(
        "https://thae-ai.onrender.com/api/chat",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            pergunta: pergunta
          })
        }
      );


      if (!resposta.ok) {
        throw new Error(
          "Erro do servidor: " + resposta.status
        );
      }


      const dados = await resposta.json();

      carregando.remove();


      if (dados.resposta) {

        adicionarMensagem(
          dados.resposta,
          "bot"
        );

      } else if (dados.erro) {

        adicionarMensagem(
          "⚠️ " + dados.erro,
          "bot"
        );

      } else {

        adicionarMensagem(
          "Não recebi uma resposta da IA. 🌿",
          "bot"
        );

      }

    } catch (erro) {

      console.error("Erro na IA:", erro);

      carregando.remove();

      adicionarMensagem(
        "⚠️ Não consegui conectar com a IA agora. Tente novamente.",
        "bot"
      );

    }

    entrada.disabled = false;
    entrada.focus();

  };


  // ========================================
  // ADICIONAR MENSAGEM
  // ========================================

  function adicionarMensagem(texto, tipo) {

    const mensagem = document.createElement("div");

    mensagem.className =
      "message " + tipo;

    const bolha = document.createElement("div");

    bolha.className = "bubble";

    bolha.textContent = texto;

    mensagem.appendChild(bolha);

    mensagens.appendChild(mensagem);

    mensagens.scrollTop =
      mensagens.scrollHeight;

    return mensagem;

  }


  // ========================================
  // LIMPAR CONVERSA
  // ========================================

  window.limparChat = function () {

    mensagens.innerHTML = "";

    adicionarMensagem(
      "Kwei! 👋 Sou a Thaê. Como posso ajudar você?",
      "bot"
    );

  };

});
