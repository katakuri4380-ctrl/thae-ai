const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("."));

const apiKey = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({
  apiKey: apiKey
});

app.get("/api/status", function (req, res) {
  res.json({
    servidor: "online",
    chaveConfigurada: !!apiKey
  });
});

app.post("/api/chat", async function (req, res) {

  try {

    const pergunta = req.body.pergunta;

    if (!pergunta) {
      return res.status(400).json({
        erro: "Digite uma pergunta."
      });
    }

    if (!apiKey) {
      return res.status(500).json({
        erro: "GEMINI_API_KEY não está configurada no Render."
      });
    }

    const resposta = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: pergunta,
      config: {
        systemInstruction:
          "Você é a Thaê, uma assistente educativa brasileira. " +
          "Responda em português de forma simpática, clara e educativa. " +
          "Você pode explicar artesanato, grafismos e culturas indígenas brasileiras. " +
          "Respeite a diversidade dos povos indígenas. " +
          "Não invente informações. Quando não souber algo, diga que não sabe."
      }
    });

    res.json({
      resposta: resposta.text
    });

  } catch (erro) {

    console.error("ERRO NA GEMINI:", erro);

    res.status(500).json({
      erro: erro.message || "Erro ao conversar com a IA."
    });

  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
  console.log("Servidor rodando na porta " + PORT);
});
