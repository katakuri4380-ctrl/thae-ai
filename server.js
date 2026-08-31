const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("."));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/api/chat", async (req, res) => {
  try {
    const pergunta = req.body.pergunta;

    if (!pergunta) {
      return res.status(400).json({
        erro: "Digite uma pergunta."
      });
    }

    const resposta = await client.responses.create({
      model: "gpt-5.6-luna",
      instructions:
        "Você é a Thaê, uma assistente educativa brasileira. " +
        "Converse de forma simpática e clara sobre artesanato, grafismos " +
        "e culturas indígenas brasileiras. Respeite a diversidade dos povos " +
        "indígenas e não invente informações.",
      input: pergunta
    });

    res.json({
      resposta: resposta.output_text
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({
      erro: "Não foi possível responder agora."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
