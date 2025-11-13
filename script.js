// ------------------------------
// DADOS FIXOS DO SITE
// ------------------------------

const sugestoes = [
    { nome: "Relógio Minimalista", img: "https://i.imgur.com/7yUVEeC.png" },
    { nome: "Kit de Perfume", img: "https://i.imgur.com/HG2ek8E.png" },
    { nome: "Fone Bluetooth", img: "https://i.imgur.com/JrT8PqB.png" },
    { nome: "Carteira Masculina", img: "https://i.imgur.com/gzdZ4n2.png" },
    { nome: "Kit Barbeiro", img: "https://i.imgur.com/tvUL6Gu.png" }
];

const pessoas = [
    "André",
    "João",
    "Pedro",
    "Lucas",
    "Maria",
];

// ------------------------------
// RENDERIZA SUGESTÕES
// ------------------------------

const sugestoesDiv = document.getElementById("sugestoes");

function renderSugestoes(lista) {
    sugestoesDiv.innerHTML = "";
    lista.forEach(item => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <img src="${item.img}">
            <p>${item.nome}</p>
            <button onclick="addWishlist('${item.nome}', '${item.img}')">Adicionar</button>
        `;
        sugestoesDiv.appendChild(card);
    });
}

renderSugestoes(sugestoes);

// ------------------------------
// BUSCA
// ------------------------------

document.getElementById("search").addEventListener("input", (e) => {
    const valor = e.target.value.toLowerCase();
    const filtrados = sugestoes.filter(s => s.nome.toLowerCase().includes(valor));
    renderSugestoes(filtrados);
});

// ------------------------------
// WISHLIST
// ------------------------------

let wishlist = [];

const wishlistDiv = document.getElementById("wishlist");

function addWishlist(nome, img) {
    wishlist.push({ nome, img });
    renderWishlist();
}

function renderWishlist() {
    wishlistDiv.innerHTML = "";
    wishlist.forEach(item => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <img src="${item.img}">
            <p>${item.nome}</p>
        `;
        wishlistDiv.appendChild(card);
    });
}

// ------------------------------
// PESSOAS
// ------------------------------

const pessoasDiv = document.getElementById("pessoas");

pessoas.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<p>${p}</p>`;
    pessoasDiv.appendChild(card);
});

// ------------------------------
// ROLETA DE SORTEIO
// ------------------------------

document.getElementById("btn-sortear").onclick = () => {
    const escolhido = pessoas[Math.floor(Math.random() * pessoas.length)];
    document.getElementById("resultado-sorteio").innerText =
        "Seu amigo oculto é: " + escolhido + " 🎉";
};
