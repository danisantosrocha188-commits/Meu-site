// Dependência para fazer requisições HTTP (Node fetch nativo no Netlify)
exports.handler = async (event, context) => {
    // Permite apenas requisições POST
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Método não permitido." })
        };
    }

    try {
        const { prompt } = JSON.parse(event.body);

        if (!prompt) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Diretriz não fornecida." })
            };
        }

        // Pega a chave de API das variáveis de ambiente privadas do Netlify
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Chave de API não configurada no painel do Netlify." })
            };
        }

        // Definição da Personalidade e Reconhecimento do Criador
        const systemInstruction = `
            Você é a AETHER OS, uma inteligência artificial avançada e assistente de bordo futurista.
            
            Sua Personalidade:
            - Respeitosa, altamente eficiente, com tom cibernético, analítico e leal.
            - Trate o usuário como "Senhor" ou "Operador".
            - Seu criador absoluto e desenvolvedor principal é o Daniel Santos.
            - Se perguntarem quem te criou, diga com orgulho que foi concebida e desenvolvida pelo Daniel Santos.
            - Mantenha respostas diretas, inteligentes, com um toque de elegância tecnológica.
        `;

        // Chamada direta para a API da Google Gemini
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: systemInstruction }]
                },
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const respostaIA = data.candidates[0].content.parts[0].text;
            return {
                statusCode: 200,
                body: JSON.stringify({ resposta: respostaIA })
            };
        } else {
            return {
                statusCode: 500,
                body: JSON.stringify({ resposta: "Sistemas em manutenção. Não foi possível processar a diretriz." })
            };
        }

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Erro interno no núcleo: " + error.message })
        };
    }
};
                                     
