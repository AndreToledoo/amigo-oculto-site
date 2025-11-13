// Aguarda o documento HTML ser totalmente carregado
document.addEventListener('DOMContentLoaded', () => {

    // Pega os elementos da página
    const botaoSortear = document.getElementById('sortearBtn');
    const areaNomes = document.getElementById('nomes');
    const divResultado = document.getElementById('resultado');

    // Adiciona um "ouvinte" de clique no botão
    botaoSortear.addEventListener('click', () => {
        // Limpa resultados anteriores
        divResultado.innerHTML = '';

        // Pega os nomes, transforma em array e limpa (remove espaços e linhas vazias)
        const nomes = areaNomes.value
            .split('\n')
            .map(nome => nome.trim()) // Remove espaços em branco antes e depois
            .filter(nome => nome.length > 0); // Remove linhas vazias

        // Validação: precisa de pelo menos 2 pessoas
        if (nomes.length < 2) {
            divResultado.innerHTML = '<div class="erro">Por favor, insira pelo menos 2 nomes.</div>';
            return;
        }

        // Embaralha os nomes
        const nomesEmbaralhados = embaralharArray(nomes.slice()); // .slice() cria uma cópia

        // Cria os pares
        let sucesso = false;
        let tentativas = 0;
        let pares = {};

        // Tenta criar pares válidos (evitando que alguém tire a si mesmo)
        // Esta é uma lógica simples, pode falhar em casos raros com poucos nomes.
        // Para garantir 100%, um algoritmo mais complexo (como o de 'derangements') seria necessário.
        // Mas para um script simples, tentamos embaralhar até dar certo.

        while (!sucesso && tentativas < 100) {
            sucesso = true; // Assume que vai dar certo
            pares = {};
            const recebedores = embaralharArray(nomes.slice()); // Embaralha a lista de quem recebe

            for (let i = 0; i < nomes.length; i++) {
                const doador = nomes[i];
                const recebedor = recebedores[i];

                // Se o doador tirar ele mesmo, falha e tenta de novo
                if (doador === recebedor) {
                    sucesso = false;
                    tentativas++;
                    break; // Sai deste 'for' e tenta o 'while' de novo
                }
                pares[doador] = recebedor;
            }
        }
        
        // Se após 100 tentativas não conseguir (muito raro), exibe erro.
        if (!sucesso) {
             divResultado.innerHTML = '<div class="erro">Ocorreu um erro ao sortear. Tente novamente.</div>';
             return;
        }

        // Exibe os resultados na tela
        for (const doador in pares) {
            const recebedor = pares[doador];
            const itemResultado = document.createElement('div');
            itemResultado.innerHTML = `<strong>${doador}</strong> ➡️ <strong>${recebedor}</strong>`;
            divResultado.appendChild(itemResultado);
        }
    });

    /**
     * Função para embaralhar um array (algoritmo de Fisher-Yates)
     * @param {Array} array O array a ser embaralhado
     * @returns {Array} O array embaralhado
     */
    function embaralharArray(array) {
        let indiceAtual = array.length, valorTemporario, indiceAleatorio;

        // Enquanto ainda houver elementos para embaralhar
        while (0 !== indiceAtual) {
            // Pega um elemento restante
            indiceAleatorio = Math.floor(Math.random() * indiceAtual);
            indiceAtual -= 1;

            // E troca com o elemento atual
            valorTemporario = array[indiceAtual];
            array[indiceAtual] = array[indiceAleatorio];
            array[indiceAleatorio] = valorTemporario;
        }
        return array;
    }

});
