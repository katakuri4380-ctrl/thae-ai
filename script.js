
document.addEventListener("DOMContentLoaded", function () {

  const entrada = document.getElementById("entrada");
  const mensagens = document.getElementById("messages");

  const botoes = document.querySelectorAll(".tab");
  const paginas = document.querySelectorAll(".page");

  let historico = [];
  let enviando = false;

  // NAVEGAÇÃO ENTRE PÁGINAS

  window.abrirPagina = function (destino) {

    paginas.forEach(function (pagina) {
      pagina.classList.remove("active");
    });

    botoes.forEach(function (botao) {
      botao.classList.remove("active");
    });

    const pagina = document.getElementById(destino);

    if (pagina) {
      pagina.classList.add("active");
    }

    const botaoAtivo = document.querySelector(
      '.tab[data-page="' + destino + '"]'
    );

    if (botaoAtivo) {
      botaoAtivo.classList.add("active");
    }

  };

  botoes.forEach(function (botao) {

    botao.addEventListener("click", function () {

      abrirPagina(botao.dataset.page);

    });

  });

  // PERGUNTAS RÁPIDAS

  window.perguntaRapida = function (texto) {

    abrirPagina("chat");

    entrada.value = texto;

    enviarPergunta();

  };

  // ENVIAR PERGUNTA

  window.enviarPergunta = async function () {

    const pergunta = entrada.value.trim();

    if (!pergunta || enviando) {
      return;
    }

    enviando = true;

    adicionarMensagem(pergunta, "user");

    entrada.value = "";
    entrada.disabled = true;

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

            pergunta: pergunta,

            historico: historico.slice(-12)

          })
        }
      );

      const dados = await resposta.json();

      carregando.remove();

      if (!resposta.ok || !dados.resposta) {

        throw new Error(
          dados.erro || "Não foi possível obter uma resposta."
        );

      }

      adicionarMensagem(dados.resposta, "bot");

      // GUARDAR HISTÓRICO DA CONVERSA

      historico.push(
        {
          role: "user",
          text: pergunta
        },
        {
          role: "model",
          text: dados.resposta
        }
      );

      // Manter somente as 12 mensagens mais recentes.

      historico = historico.slice(-12);

    } catch (erro) {

      console.error("ERRO NA THAÊ:", erro);

      carregando.remove();

      adicionarMensagem(
        "⚠️ " + erro.message,
        "bot"
      );

    } finally {

      enviando = false;
      entrada.disabled = false;
      entrada.focus();

    }

  };

  // CRIAR MENSAGEM

  function adicionarMensagem(texto, tipo) {

    const mensagem = document.createElement("div");

    mensagem.className = "message " + tipo;

    const bolha = document.createElement("div");

    bolha.className = "bubble";

    bolha.textContent = texto;

    mensagem.appendChild(bolha);

    mensagens.appendChild(mensagem);

    mensagens.scrollTop = mensagens.scrollHeight;

    return mensagem;

  }

  // LIMPAR CONVERSA

  window.limparChat = function () {

    if (enviando) {
      return;
    }

    historico = [];

    mensagens.innerHTML = "";

    adicionarMensagem(
      "Kwei! 👋 Sou a Thaê. Como posso ajudar você? 🌿",
      "bot"
    );

  };

  // ENVIAR COM ENTER

  entrada.addEventListener("keydown", function (evento) {

    if (evento.key === "Enter") {

      evento.preventDefault();

      enviarPergunta();

    }

  });

});
