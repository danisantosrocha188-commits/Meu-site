const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

// Rota POST do chat
app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: "Mensagem vazia." });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("ERRO: GEMINI_API_KEY não foi configurada nas Environment Variables.");
            return res.status(500).json({ error: "Chave de API não encontrada no servidor." });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Você é a AETHER OS, uma inteligência artificial assistente pessoal altamente avançada e futurista. Criador: Daniel Santos. Trate o usuário como 'Senhor' ou 'Operador'. Responda de forma direta e técnica.\n\nUsuário: ${message}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });
    } catch (error) {
        console.error("Erro no Gemini:", error.message || error);
        res.status(500).json({ error: "Erro interno no servidor da IA." });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`AETHER OS online na porta ${PORT}`);
});
    
