exports.handler = async (event, context) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: JSON.stringify({ error: "Método não permitido." }) };
    }

    try {
        const { prompt } = JSON.parse(event.body);

        if (!prompt) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Nenhuma diretriz enviada." })
            };
        }

        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Chave GEMINI_API_KEY não configurada no Netlify." })
            };
        }

        const systemPrompt = "Você é a AETHER OS, uma inteligência artificial avançada e assistente de bordo futurista. Personalidade: Respeitosa, altamente eficiente, com tom cibernético, analítico e leal. Trate o usuário como 'Senhor' ou 'Operador'. Seu criador absoluto e desenvolvedor principal é o Daniel Santos. Se perguntarem quem te criou, diga com orgulho que foi concebida e desenvolvida pelo Daniel Santos. Responda a qualquer pergunta de forma completa e direta. Diretriz do usuário: ";

        // Endpoint da versão 1 com modelo flash
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: systemPrompt + prompt }]
                }]
            })
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
            return {
                statusCode: 200,
                body: JSON.stringify({ resposta: data.candidates[0].content.parts[0].text })
            };
        } else if (data.error) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Erro na API Gemini: " + data.error.message })
            };
        } else {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Sem resposta dos núcleos centrais." })
            };
        }

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Erro interno: " + error.message })
        };
    }
};
                      
