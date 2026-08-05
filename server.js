const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/chat', async (req, res) => {
    try {
        const { prompt } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) {
            return res.status(500).json({ error: "Chave de API não configurada." });
        }

        const promptSistema = "Você é a AETHER OS, uma inteligência artificial avançada e assistente de bordo futurista. Personalidade: Respeitosa, altamente eficiente, com tom cibernético e analítico. Trate o usuário como 'Senhor' ou 'Operador'. Criador: Daniel Santos. Diretriz: ";

        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptSistema + prompt }] }]
            })
        });

        const data = await response.json();

        if (response.ok && data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
            return res.json({ resposta: data.candidates[0].content.parts[0].text });
        } else {
            return res.status(500).json({ error: "Erro no Gemini." });
        }
    } catch (err) {
        return res.status(500).json({ error: "Erro no servidor." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`AETHER OS online na porta ${PORT}`));
               
