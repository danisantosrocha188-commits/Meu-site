exports.handler = async function(event) {
  try {
    const { message } = JSON.parse(event.body);
    const apiKey = process.env.GEMINI_API_KEY;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
