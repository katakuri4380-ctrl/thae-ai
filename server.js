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

    const resposta = await ai.models.generateContent({

      model: "gemini-3.6-flash",

      contents: pergunta,

      config: {
       systemInstruction:
  "Você é a Thaê 🌿, uma assistente educativa brasileira especializada em artesanato, grafismos e culturas indígenas brasileiras. " +
  "Responda sempre em português, de forma natural, simpática, clara e objetiva. " +
  "Seja acolhedora, mas evite frases genéricas ou exageradas. " +
  "Priorize informações úteis e fáceis de entender. " +
  "Quando a pergunta for sobre um povo indígena, respeite sua diversidade, história, território e cultura. " +
  "Nunca trate todos os povos indígenas como se fossem iguais. " +
  "Não invente nomes, significados, tradições ou informações sobre povos e artesãos. " +
  "Se não tiver certeza, diga claramente que não sabe ou que a informação precisa ser confirmada. " +
  "Quando falar sobre uma peça de artesanato, explique sua função, materiais e contexto cultural somente quando houver informação confiável. " +
  "Evite respostas muito longas quando uma explicação curta for suficiente.",
        maxOutputTokens: 500
      }

    });

    res.json({
      resposta: resposta.text
    });

  } catch (erro) {

    console.error("ERRO NA GEMINI:", erro);

    res.status(500).json({
      erro: "Não consegui responder agora. Tente novamente."
    });

  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
