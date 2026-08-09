const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

// Inicializa o SDK do Gemini com a chave salva no Render
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Define o modelo atual do Gemini
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: "Você é a AETHER OS, uma inteligência artificial assistente pessoal altamente avançada e futurista. Criador: Daniel Santos. Trate o usuário como 'Senhor' ou 'Operador'. Responda de forma direta, prestativa e técnica."
});

// Rota POST do chat
app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: "Mensagem não enviada." });
        }

        const result = await model.generateContent(message);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });
    } catch (error) {
        console.error("Erro no Gemini:", error);
        res.status(500).json({ error: "Erro interno no servidor da IA." });
    }
});

// Porta do servidor (Render define automaticamente a PORT)
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`AETHER OS online na porta ${PORT}`);
});
    
