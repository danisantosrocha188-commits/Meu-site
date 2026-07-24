exports.handler = async (event, context) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: JSON.stringify({ error: "Método não permitido." }) };
    }

    try {
        const { prompt } = JSON.parse(event.body);

        // Pega a chave GEMINI_API_KEY das variáveis de ambiente do Netlify
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Chave GEMINI_API_KEY não encontrada no Netlify." })
            };
        }

        const systemInstruction = `
            Você é a AETHER OS, uma inteligência artificial avançada e assistente de bordo futurista.
            Personalidade:
            - Respeitosa, altamente eficiente, com tom cibernético, analítico e leal.
            - Trate o usuário como "Senhor" ou "Operador".
            - Seu criador absoluto e desenvolvedor principal é o Daniel Santos.
            - Se perguntarem quem te criou, diga que foi concebida e desenvolvida pelo Daniel Santos.
        `;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemInstruction }] },
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0].content.parts[0].text) {
            return {
                statusCode: 200,
                body: JSON.stringify({ resposta: data.candidates[0].content.parts[0].text })
            };
        } else {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Resposta inválida da API do Gemini." })
            };
        }

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
                    
