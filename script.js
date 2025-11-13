const q = id => document.getElementById(id);

let names = [];
let mapping = {};
let wishlists = {};

function addName() {
    const name = q("nameInput").value.trim();
    if (!name) return;

    names.push(name);
    const li = document.createElement("li");
    li.textContent = name;
    q("nameList").appendChild(li);

    q("nameInput").value = "";
}

function startDraw() {
    if (names.length < 2) return alert("Adicione pelo menos 2 pessoas.");

    const shuffled = [...names].sort(() => Math.random() - 0.5);

    mapping = {};
    wishlists = {};

    shuffled.forEach((name, i) => {
        mapping[name] = shuffled[(i + 1) % shuffled.length];
        wishlists[name] = [];
    });

    localStorage.setItem("lastGroup", JSON.stringify({ mapping, names }));

    setupPanels(names, mapping);

    q("setup").classList.add("hide");
    q("panelList").classList.remove("hide");
}

function setupPanels(names, mapping) {
    const container = q("peopleButtons");
    const panels = q("panels");

    container.innerHTML = "";
    panels.innerHTML = "";

    names.forEach(name => {
        const btn = document.createElement("button");
        btn.className = "person-btn";
        btn.textContent = name;
        btn.onclick = () => openPanel(name);
        container.appendChild(btn);

        const panel = document.createElement("div");
        panel.className = "panel";
        panel.id = "panel_" + name;

        panel.innerHTML = `
            <h2>${name}</h2>
            <p>Você tirou: <strong>${mapping[name]}</strong></p>

            <h3>Wishlist</h3>

            <input id="wish_${name}" placeholder="Buscar presentes...">
            <button onclick="searchGifts('${name}')">Buscar</button>

            <div id="wishlist_${name}"></div>
        `;

        panels.appendChild(panel);
    });
}

function openPanel(name) {
    document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
    q("panel_" + name).classList.add("active");
}

async function searchGifts(person) {
    const query = q("wish_" + person).value.trim();
    if (!query) return;

    const results = [
        {
            title: query + " Premium",
            img: "https://images.unsplash.com/photo-1607082349566-187b3f3c4a26",
            link: "https://www.google.com/search?q=" + query
        },
        {
            title: "Melhor " + query,
            img: "https://images.unsplash.com/photo-1519681393784-d120267933ba",
            link: "https://www.google.com/search?q=" + query
        }
    ];

    wishlists[person].push(...results);

    renderWishlist(person);
}

function renderWishlist(person) {
    const div = q("wishlist_" + person);
    div.innerHTML = "";

    wishlists[person].forEach(item => {
        const box = document.createElement("div");
        box.className = "gift-item";

        box.innerHTML = `
            <img src="${item.img}">
            <div>
                <strong>${item.title}</strong><br>
                <a href="${item.link}" target="_blank">Ver</a>
            </div>
        `;

        div.appendChild(box);
    });
}

/* AUTO-LOAD DO GRUPO */
window.onload = () => {
    const saved = JSON.parse(localStorage.getItem("lastGroup") || "{}");
    if (saved.names && saved.mapping) {
        names = saved.names;
        mapping = saved.mapping;
        names.forEach(n => wishlists[n] = []);

        setupPanels(names, mapping);

        q("setup").classList.add("hide");
        q("panelList").classList.remove("hide");
    }
};
