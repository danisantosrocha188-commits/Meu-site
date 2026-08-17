async function enviarMensagem() {
    const input = document.getElementById('userInput');
    const texto = input.value.trim();
    if (!texto) {
        processandoAudio = false;
        return;
    }

    adicionarMensagem('SENHOR', texto);
    input.value = '';

    try {
        // Requisição POST direta aceita pelo Pollinations sem bloquear CORS
        const response = await fetch('https://text.pollinations.ai/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: 'Você é o AETHER OS, um assistente futurista avançado. Responda em português de forma clara e direta.' },
                    { role: 'user', content: texto }
                ],
                model: 'openai'
            })
        });

        if (response.ok) {
            const reply = await response.text();
            if (reply && reply.trim()) {
                adicionarMensagem('AETHER', reply.trim());
                falar(reply.trim());
            } else {
                throw new Error("Resposta vazia");
            }
        } else {
            throw new Error("Erro no servidor");
        }
    } catch (e) {
        adicionarMensagem('AETHER', "Instabilidade temporária na conexão. Tente novamente.");
    } finally {
        processandoAudio = false;
        if (ligacaoContinua && reconhecimento) {
            setTimeout(() => { try { reconhecimento.start(); } catch(e){} }, 1000);
        }
    }
                }
