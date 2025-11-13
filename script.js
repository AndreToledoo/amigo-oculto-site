const sugestoes = [
    { titulo: "Fone Bluetooth", img: "https://picsum.photos/300?1" },
    { titulo: "Caneca Geek", img: "https://picsum.photos/300?2" },
    { titulo: "Carteira Minimalista", img: "https://picsum.photos/300?3" },
    { titulo: "Perfume Importado", img: "https://picsum.photos/300?4" },
];

const participantes = ["Ana", "Carlos", "João", "Beatriz"];

window.onload = () => {
    renderSugestoes();
    renderParticipantes();
};

function renderSugestoes() {
    const div = document.getElementById("sugestoes");
    div.innerHTML = sugestoes
        .map(item => `
            <div class="card">
                <img src="${item.img}">
                <div class="card-title">${item.titulo}</div>
            </div>
        `).join("");
}

function renderParticipantes() {
    const list = document.getElementById("participantes");
    list.innerHTML = participantes
        .map(p => `<li>${p}</li>`)
        .join("");
}

function sortear() {
    const sorteado = participantes[Math.floor(Math.random() * participantes.length)];
    document.getElementById("resultado-sorteio").textContent =
        `🎉 Seu amigo oculto é: ${sorteado}!`;
}
