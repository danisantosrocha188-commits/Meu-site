const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: "Mensagem vazia." });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "Sem chave API configurada." });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        // Usando o modelo mais atual
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `Você é o AETHER OS, uma IA avançada e futurista. Criador: Daniel Santos. Trate o usuário como 'Senhor' ou 'Operador'.\n\nUsuário: ${message}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });
    } catch (error) {
        console.error("Erro detalhado no servidor:", error);
        res.status(500).json({ error: "Erro interno no Gemini." });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`AETHER OS rodando na porta ${PORT}`);
});
                
