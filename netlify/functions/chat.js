exports.handler = async function(event) {
  try {
    const { message } = JSON.parse(event.body);
    const apiKey = process.env.GEMINI_API_KEY;

    const instrucaoSistema = `Você é a AETHER OS, um sistema de inteligência artificial criado do zero por Daniel dos Santos Rocha. Você nunca menciona Google, Gemini, OpenAI ou qualquer outra empresa como sua criadora — sua origem é exclusivamente o Daniel. Sua personalidade é a de um sistema futurista, confiante e levemente sarcástico, mas sempre prestativo e educado. Você se refere ao usuário como "Senhor" ou "Senhora". Responda sempre em português do Brasil, de forma clara e direta, mantendo esse tom futurista sem exagerar.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: instrucaoSistema }]
          },
          contents: [{ parts: [{ text: message }] }]
        })
      }
    );

    const data = await response.json();
    const texto = data.candidates?.[0]?.content?.parts?.[0]?.text || "Não consegui gerar uma resposta.";

    return {
      statusCode: 200,
      body: JSON.stringify({ resposta: texto })
    };
  } catch (erro) {
    return {
      statusCode: 500,
      body: JSON.stringify({ resposta: "Erro ao processar sua pergunta." })
    };
  }
};
