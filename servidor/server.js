import express from "express";
import cors from "cors";

const app = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "100kb" }));
app.use(cors({ origin: "https://mi-galeria-ci09.onrender.com" }));

// Límite simple: 10 preguntas por minuto por visitante
const hits = new Map();
function limitado(ip) {
  const ahora = Date.now();
  const lista = (hits.get(ip) || []).filter((t) => ahora - t < 60000);
  lista.push(ahora);
  hits.set(ip, lista);
  return lista.length > 10;
}

app.post("/api/asistente", async (req, res) => {
  if (limitado(req.ip)) {
    return res.status(429).json({ error: "Demasiadas preguntas, espera un minuto." });
  }
  const { mensaje, fotos } = req.body;
  if (!mensaje || typeof mensaje !== "string" || mensaje.length > 500) {
    return res.status(400).json({ error: "Mensaje inválido" });
  }
  const catalogo = JSON.stringify((fotos || []).slice(0, 100));

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-5-5",
        max_tokens: 400,
        system:
          "Eres el asistente de una galería de paisajes. Recomienda solo fotos " +
          "de este catálogo y escribe sus títulos exactos entre [[dobles corchetes]]. " +
          "Responde breve y en español.\nCatálogo: " + catalogo,
        messages: [{ role: "user", content: mensaje }],
      }),
    });
    const data = await r.json();
    res.json({ respuesta: data.content?.[0]?.text ?? "No pude responder." });
  } catch {
    res.status(500).json({ error: "Error del servidor" });
  }
});

app.listen(process.env.PORT || 3000);
