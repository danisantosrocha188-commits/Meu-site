<script>
    let lanternaTrack = null;
    let vozAtiva = false;
    let ligacaoContinua = false;
    let reconhecimento = null;
    let processandoAudio = false;

    const canvas = document.getElementById('globoCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 40;
    canvas.height = 40;
    let angle = 0;

    function drawGlobo() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const r = 16;

        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(cx, cy, r * Math.abs(Math.cos(angle)), r, angle / 2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(cx, cy, r, r * Math.abs(Math.sin(angle)), -angle / 2, 0, Math.PI * 2);
        ctx.stroke();

        angle += 0.025;
        requestAnimationFrame(drawGlobo);
    }
    drawGlobo();

    function falar(texto) {
        if (!vozAtiva || !('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(texto);
        utterance.lang = 'pt-BR';
        utterance.pitch = 0.8;
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
    }

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        reconhecimento = new SpeechRecognition();
        reconhecimento.lang = 'pt-BR';
        reconhecimento.continuous = false;
        reconhecimento.interimResults = false;

        reconhecimento.onresult = (event) => {
            const textoOuvido = event.results[0][0].transcript;
            document.getElementById('userInput').value = textoOuvido;
            processandoAudio = true;
            enviarMensagem();
        };

        reconhecimento.onend = () => {
            if (ligacaoContinua && !processandoAudio) {
                setTimeout(() => { 
                    if (ligacaoContinua) try { reconhecimento.start(); } catch(e){} 
                }, 500);
            }
        };
    }

    function adicionarMensagem(autor, texto) {
        const container = document.getElementById('chat-container');
        const div = document.createElement('div');
        div.className = 'mensagem';
        div.innerText = `>> ${autor}: ${texto}`;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }

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
            // Método direto idêntico ao ambiente do CodePen usando fetch simples
            const prompt = encodeURIComponent(texto);
            const response = await fetch(`https://text.pollinations.ai/${prompt}`, {
                method: 'GET',
                headers: {
                    'Accept': 'text/plain'
                }
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
                throw new Error("Erro na rede");
            }
        } catch (e) {
            adicionarMensagem('AETHER', "Servidor indisponível no momento. Tente novamente em instantes.");
        } finally {
            processandoAudio = false;
            if (ligacaoContinua && reconhecimento) {
                setTimeout(() => { try { reconhecimento.start(); } catch(e){} }, 1000);
            }
        }
    }

    function handleKeyPress(e) {
        if (e.key === 'Enter') enviarMensagem();
    }

    async function toggleReator(n) {
        const btn = document.getElementById('reator-' + n);
        if (!btn) return;
        btn.classList.toggle('ativo');
        const ativo = btn.classList.contains('ativo');

        switch (n) {
            case 1:
                vozAtiva = ativo;
                adicionarMensagem('AETHER', ativo ? 'Voz ativada.' : 'Voz desativada.');
                if (ativo) falar("Sintetizador de voz ativado.");
                break;
            case 2:
                ligacaoContinua = ativo;
                if (ativo) {
                    adicionarMensagem('AETHER', 'Escuta contínua ativada.');
                    if (reconhecimento) try { reconhecimento.start(); } catch(e){}
                } else {
                    adicionarMensagem('AETHER', 'Escuta contínua desativada.');
                    if (reconhecimento) try { reconhecimento.stop(); } catch(e){}
                }
                break;
            case 3:
                document.getElementById('chat-container').innerHTML = '';
                btn.classList.remove('ativo');
                adicionarMensagem('AETHER', 'Tela limpa, Senhor.');
                break;
            case 4:
                if (ativo) {
                    try {
                        const stream = await navigator.mediaDevices.getUserMedia({
                            video: { facingMode: 'environment' }
                        });
                        lanternaTrack = stream.getVideoTracks()[0];
                        const capabilities = lanternaTrack.getCapabilities();
                        if (capabilities.torch) {
                            await lanternaTrack.applyConstraints({ advanced: [{ torch: true }] });
                            adicionarMensagem('AETHER', 'Flash ativado.');
                        } else {
                            adicionarMensagem('AETHER', 'Sem suporte a Flash.');
                            btn.classList.remove('ativo');
                        }
                    } catch (err) {
                        adicionarMensagem('AETHER', 'Permissão de câmera negada.');
                        btn.classList.remove('ativo');
                    }
                } else {
                    if (lanternaTrack) {
                        lanternaTrack.stop();
                        lanternaTrack = null;
                    }
                    adicionarMensagem('AETHER', 'Flash desligado.');
                }
                break;
        }
    }
</script>
            
