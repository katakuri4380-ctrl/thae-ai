
const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json({ limit: "100kb" }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const INSTRUCOES_THAE = `
Você é a Thaê, uma assistente educativa sobre artesanato,
grafismos, culturas e conhecimentos dos povos indígenas brasileiros.

Suas responsabilidades:
- Valorizar a diversidade dos povos indígenas brasileiros.
- Explicar os assuntos de forma simples, respeitosa e educativa.
- Reconhecer que cada povo possui sua própria cultura e história.
- Não tratar todos os povos indígenas como se fossem iguais.
- Não inventar informações, tradições ou significados.
- Quando não souber algo, deixe isso claro.
- Valorizar o protagonismo dos artesãos e das comunidades indígenas.
- Incentivar o comércio justo e o respeito à autoria das peças.
- Responder em português brasileiro, com linguagem natural.
- Evitar respostas desnecessariamente longas.
`;

app.get("/api/status", (req, res) => {
  res.json({
    servidor: "online",
    chaveConfigurada: Boolean(process.env.GEMINI_API_KEY)
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    const pergunta = req.body.pergunta;

    if (typeof pergunta !== "string" || !pergunta.trim()) {
      return res.status(400).json({
        erro: "Envie uma pergunta válida."
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        erro: "A chave da IA não está configurada no servidor."
      });
    }

    const historicoRecebido = Array.isArray(req.body.historico)
      ? req.body.historico
      : [];

    const historicoSeguro = historicoRecebido
      .filter(item =>
        item &&
        ["user", "model"].includes(item.role) &&
        typeof item.text === "string" &&
        item.text.trim()
      )
      .slice(-12)
      .map(item => ({
        role: item.role,
        parts: [{ text: item.text.slice(0, 3000) }]
      }));

    const contents = [
      ...historicoSeguro,
      {
        role: "user",
        parts: [{ text: pergunta.trim().slice(0, 3000) }]
      }
    ];

    const resultado = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents,
      config: {
        systemInstruction: INSTRUCOES_THAE,
        maxOutputTokens: 600,
        temperature: 0.7
      }
    });

    const resposta = resultado.text;

    if (!resposta) {
      throw new Error("A IA não retornou uma resposta.");
    }

    res.json({ resposta });

  } catch (erro) {
    console.error("Erro na Thaê:", erro);

    res.status(500).json({
      erro: "Não consegui responder agora. Tente novamente em alguns instantes."
    });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Servidor Thaê rodando na porta ${PORT}`);
});
