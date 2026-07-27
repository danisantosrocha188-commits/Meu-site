exports.handler = async (event, context) => {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "Método não permitido." })
        };
    }

    let prompt;
    try {
        const body = JSON.parse(event.body || "{}");
        prompt = body.prompt;
    } catch {
        return {
            statusCode: 400,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "Requisição inválida." })
        };
    }

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
        return {
            statusCode: 400,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "Nenhuma diretriz enviada." })
        };
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "NÚCLEO OFFLINE: configuração da IA ausente." })
        };
    }

    const SYSTEM_PROMPT =
        "Você é a AETHER OS, uma inteligência artificial avançada e assistente de bordo futurista. " +
        "Personalidade: Respeitosa, altamente eficiente, com tom cibernético, analítico e leal. " +
        "Trate o usuário sempre como 'Senhor' ou 'Operador'. " +
        "Seu criador absoluto e desenvolvedor principal é o Daniel Santos. " +
        "Se perguntarem quem te criou, diga com orgulho que foi concebida e desenvolvida pelo Daniel Santos. " +
        "Responda a qualquer pergunta de forma completa e direta. Diretriz do usuário: ";

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000);

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: SYSTEM_PROMPT + prompt.trim() }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2048
                }
            })
        });

        clearTimeout(timeoutId);

        const data = await response.json();

        if (!response.ok) {
            const msg = data?.error?.message || "Erro desconhecido na API Gemini.";
            return {
                statusCode: 502,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ error: "NÚCLEO OFFLINE: " + msg })
            };
        }

        const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (texto) {
            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resposta: texto })
            };
        }

        const finishReason = data?.candidates?.[0]?.finishReason;
        if (finishReason === "SAFETY") {
            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resposta: "AETHER OS: Diretriz bloqueada pelos filtros de segurança dos núcleos. Reformule o comando, Senhor." })
            };
        }

        return {
            statusCode: 502,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "Sem resposta dos núcleos centrais." })
        };

    } catch (err) {
        if (err.name === "AbortError") {
            return {
                statusCode: 504,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ error: "TIMEOUT: os núcleos demoraram demais para responder." })
            };
        }
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "Erro interno: " + err.message })
        };
    }
};
