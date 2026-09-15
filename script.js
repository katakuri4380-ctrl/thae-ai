document.addEventListener("DOMContentLoaded", function () {

  const entrada = document.getElementById("entrada");
  const mensagens = document.getElementById("messages");

  const botoes = document.querySelectorAll(".tab");
  const paginas = document.querySelectorAll(".page");

  // Troca de páginas
  botoes.forEach(function (botao) {

    botao.addEventListener("click", function () {

      const destino = botao.getAttribute("data-page");

      paginas.forEach(function (pagina) {
        pagina.classList.remove("active");
      });

      botoes.forEach(function (b) {
        b.classList.remove("active");
      });

      const pagina = document.getElementById(destino);

      if (pagina) {
        pagina.classList.add("active");
        botao.classList.add("active");
      }

    });

  });

  // Perguntas rápidas
  window.perguntaRapida = function (texto) {

    entrada.value = texto;

    enviarPergunta();

  };

  // Enviar pergunta
  window.enviarPergunta = async function () {

    const pergunta = entrada.value.trim();

    if (!pergunta) {
      return;
    }

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
            pergunta: pergunta
          })
        }
      );

      if (!resposta.ok) {
        throw new Error("Servidor retornou erro.");
      }

      // Remove "Thaê está pensando..."
      carregando.remove();

      // Cria a bolha onde a resposta vai aparecer
      const mensagem = document.createElement("div");
      mensagem.className = "message bot";

      const bolha = document.createElement("div");
      bolha.className = "bubble";

      mensagem.appendChild(bolha);
      mensagens.appendChild(mensagem);

      // Lê a resposta em partes
      const leitor = resposta.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let textoCompleto = "";

      while (true) {

        const { value, done } = await leitor.read();

        if (done) {
          break;
        }

        const parte = decoder.decode(value, {
          stream: true
        });

        textoCompleto += parte;

        bolha.textContent = textoCompleto;

        mensagens.scrollTop = mensagens.scrollHeight;

      }

    } catch (erro) {

      console.error("ERRO:", erro);

      carregando.remove();

      adicionarMensagem(
        "⚠️ Não consegui responder agora. Tente novamente.",
        "bot"
      );

    }

    entrada.disabled = false;
    entrada.focus();

  };

  // Criar mensagem
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

  // Limpar conversa
  window.limparChat = function () {

    mensagens.innerHTML = "";

    adicionarMensagem(
      "Kwei! 👋 Sou a Thaê. Como posso ajudar você?",
      "bot"
    );

  };

});
