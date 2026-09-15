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

// Status do servidor
app.get("/api/status", (req, res) => {
  res.json({
    servidor: "online",
    chaveConfigurada: !!apiKey
  });
});

// Chat da Thaê
app.post("/api/chat", async (req, res) => {

  try {

    const pergunta = req.body.pergunta?.trim();

    if (!pergunta) {
      return res.status(400).json({
        erro: "Digite uma pergunta."
      });
    }

    if (!apiKey) {
      return res.status(500).json({
        erro: "GEMINI_API_KEY não está configurada."
      });
    }

    // Configura resposta em tempo real
    res.setHeader(
      "Content-Type",
      "text/plain; charset=utf-8"
    );

    res.setHeader(
      "Cache-Control",
      "no-cache"
    );

    res.setHeader(
      "Connection",
      "keep-alive"
    );

    const resposta = await ai.models.generateContentStream({

      model: "gemini-3.6-flash",

      contents: pergunta,

      config: {

        systemInstruction:
          "Você é a Thaê 🌿, uma assistente educativa brasileira especializada em artesanato, grafismos e culturas indígenas brasileiras. " +
          "Responda sempre em português, de forma natural, simpática, clara e objetiva. " +
          "Não use frases genéricas ou exageradas. " +
          "Dê informações úteis e fáceis de entender. " +
          "Respeite a diversidade dos povos indígenas brasileiros. " +
          "Nunca trate todos os povos indígenas como iguais. " +
          "Não invente nomes, significados, tradições ou informações. " +
          "Se não tiver certeza, diga que não sabe ou que a informação precisa ser confirmada. " +
          "Evite respostas desnecessariamente longas.",

        maxOutputTokens: 400
      }

    });

    // Envia cada parte da resposta assim que chegar
    for await (const parte of resposta) {

      if (parte.text) {
        res.write(parte.text);
      }

    }

    res.end();

  } catch (erro) {

    console.error("ERRO NA GEMINI:", erro);

    if (!res.headersSent) {

      res.status(500).json({
        erro: "Não consegui responder agora. Tente novamente."
      });

    } else {

      res.end();

    }

  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    "Servidor rodando na porta " + PORT
  );
});
