document.addEventListener('DOMContentLoaded', () => {

    const botaoSortear = document.getElementById('sortearBtn');
    const areaNomes = document.getElementById('nomes');
    const divResultado = document.getElementById('resultado');

    botaoSortear.addEventListener('click', () => {
        divResultado.innerHTML = ''; // Limpa resultados anteriores

        const nomes = areaNomes.value
            .split('\n')
            .map(nome => nome.trim())
            .filter(nome => nome.length > 0);

        if (nomes.length < 2) {
            divResultado.innerHTML = '<div class="erro">Por favor, insira pelo menos 2 nomes.</div>';
            return;
        }

        let pares = {};
        let sucesso = false;
        let tentativas = 0;

        while (!sucesso && tentativas < 100) {
            sucesso = true;
            pares = {};
            const recebedores = embaralharArray(nomes.slice());

            for (let i = 0; i < nomes.length; i++) {
                const doador = nomes[i];
                const recebedor = recebedores[i];

                if (doador === recebedor) {
                    sucesso = false;
                    tentativas++;
                    break;
                }
                pares[doador] = recebedor;
            }
        }
        
        if (!sucesso) {
             divResultado.innerHTML = '<div class="erro">Ocorreu um erro ao sortear. Tente novamente.</div>';
             return;
        }

        // --- MUDANÇA PARA ANIMAÇÃO ---
        // Adiciona os resultados com um pequeno atraso (delay) entre eles
        let delay = 0;
        for (const doador in pares) {
            const recebedor = pares[doador];
            const itemResultado = document.createElement('div');
            itemResultado.innerHTML = `<strong>${doador}</strong> ➡️ <strong>${recebedor}</strong>`;
            
            // Define o atraso da animação (definida no CSS)
            itemResultado.style.animationDelay = `${delay}ms`;
            
            divResultado.appendChild(itemResultado);
            delay += 100; // Aumenta o atraso para o próximo item (100ms)
        }
        // --- FIM DA MUDANÇA ---
    });

    /**
     * Função para embaralhar um array (algoritmo de Fisher-Yates)
     */
    function embaralharArray(array) {
        let indiceAtual = array.length, valorTemporario, indiceAleatorio;

        while (0 !== indiceAtual) {
            indiceAleatorio = Math.floor(Math.random() * indiceAtual);
            indiceAtual -= 1;

            valorTemporario = array[indiceAtual];
            array[indiceAtual] = array[indiceAleatorio];
            array[indiceAleatorio] = valorTemporario;
        }
        return array;
    }
});
