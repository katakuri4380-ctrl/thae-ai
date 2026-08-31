const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("."));

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error("ERRO: OPENAI_API_KEY não foi configurada.");
}

const client = new OpenAI({
  apiKey: apiKey
});

app.get("/api/status", (req, res) => {
  res.json({
    servidor: "online",
    chaveConfigurada: !!apiKey
  });
});

app.post("/api/chat", async (req, res) => {

  try {

    const pergunta = req.body.pergunta;

    if (!pergunta) {
      return res.status(400).json({
        erro: "Digite uma pergunta."
      });
    }

    if (!apiKey) {
      return res.status(500).json({
        erro: "A chave da OpenAI não está configurada no Render."
      });
    }

    const resposta = await client.responses.create({

      model: "gpt-5",

      instructions:
        "Você é a Thaê, uma assistente educativa brasileira. " +
        "Responda em português de forma simpática, clara e educativa. " +
        "Você pode explicar artesanato, grafismos e culturas indígenas brasileiras. " +
        "Respeite a diversidade dos povos indígenas e não invente informações. " +
        "Quando não souber algo, diga que não tem certeza.",

      input: pergunta

    });

    console.log("Pergunta recebida:", pergunta);

    res.json({
      resposta: resposta.output_text
    });

  } catch (erro) {

    console.error("ERRO NA OPENAI:", erro);

    res.status(500).json({
      erro: "Erro ao conversar com a inteligência artificial."
    });

  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
