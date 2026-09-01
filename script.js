document.addEventListener("DOMContentLoaded", function () {

  const entrada = document.getElementById("entrada");
  const mensagens = document.getElementById("messages");

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

      const pagina = document.getElementById(destino);

      if (pagina) {
        pagina.classList.add("active");
        botao.classList.add("active");
      }

    });

  });


  window.perguntaRapida = function (texto) {

    entrada.value = texto;

    enviarPergunta();

  };


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

      const dados = await resposta.json();

      carregando.remove();

      if (resposta.ok && dados.resposta) {

        adicionarMensagem(
          dados.resposta,
          "bot"
        );

      } else {

        adicionarMensagem(
          "⚠️ " + (
            dados.erro ||
            "Não foi possível obter uma resposta."
          ),
          "bot"
        );

      }

    } catch (erro) {

      console.error(erro);

      carregando.remove();

      adicionarMensagem(
        "⚠️ Não consegui conectar ao servidor.",
        "bot"
      );

    }

    entrada.disabled = false;
    entrada.focus();

  };


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


  window.limparChat = function () {

    mensagens.innerHTML = "";

    adicionarMensagem(
      "Kwei! 👋 Sou a Thaê. Como posso ajudar você?",
      "bot"
    );

  };

});
