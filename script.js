// -----------------------------
// UTILIDADES
// -----------------------------
function uid() {
  return Math.random().toString(36).substring(2, 10);
}

// Simulação de busca MUITO MELHORADA
async function smartSearch(query) {
  const keywords = query.toLowerCase().split(" ");

  const items = [
    { title: "Perfume Importado", img:"https://picsum.photos/250?1", link:"#", tags:["perfume","cheiro","importado"] },
    { title: "Fone Bluetooth", img:"https://picsum.photos/250?2", link:"#", tags:["fone","audio","musica"] },
    { title: "Camisa Premium", img:"https://picsum.photos/250?3", link:"#", tags:["camisa","roupa","moda"] },
    { title: "Relógio Digital", img:"https://picsum.photos/250?4", link:"#", tags:["relogio","acessório"] },
    { title: "Air Fryer Smart", img:"https://picsum.photos/250?5", link:"#", tags:["cozinha","airfryer"] },
  ];

  // Rankeamento simples por relevância
  return items
    .map(i => {
      let score = 0;
      keywords.forEach(k => {
        if (i.title.toLowerCase().includes(k)) score += 2;
        if (i.tags.includes(k)) score += 3;
      });
      return { ...i, score };
    })
    .filter(i => i.score > 0)
    .sort((a,b) => b.score - a.score);
}

// -----------------------------
// CRIAR GRUPO E LINKS
// -----------------------------
document.getElementById("btnCreate").onclick = () => {
  const names = document.getElementById("participants").value
    .split("\n")
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const list = document.getElementById("tokenList");
  list.innerHTML = "";

  names.forEach(name => {
    const token = uid();
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${name}</strong>
      <span>${location.href}?u=${token}</span>
    `;
    list.appendChild(li);
  });

  document.getElementById("linksArea").classList.remove("hide");
  document.getElementById("panelList").classList.remove("hide");

  renderPanels(names);
};

// -----------------------------
// PAINÉIS INDIVIDUAIS
// -----------------------------
function renderPanels(names) {
  const container = document.getElementById("peopleList");
  const panels = document.getElementById("peoplePanels");

  container.innerHTML = "";
  panels.innerHTML = "";

  names.forEach(name => {
    const btn = document.createElement("button");
    btn.className = "person-btn";
    btn.textContent = name;

    const panel = document.createElement("div");
    panel.className = "panel";
    panel.innerHTML = `
      <h3>${name}</h3>

      <label>Buscar presente</label>
      <input placeholder="Ex: perfume, fone, camisa">

      <div class="suggest-grid"></div>
    `;

    btn.onclick = () => {
      document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
      panel.classList.add("active");
    };

    // Busca automática
    const input = panel.querySelector("input");
    const grid = panel.querySelector(".suggest-grid");

    input.oninput = async () => {
      const q = input.value.trim();
      grid.innerHTML = "";
      if (q.length < 2) return;

      const results = await smartSearch(q);

      if (results.length === 0) {
        grid.innerHTML = `<p class="small muted">Nenhum item encontrado.</p>`;
        return;
      }

      results.forEach(r => {
        const card = document.createElement("div");
        card.className = "suggest-card";
        card.innerHTML = `
          <img src="${r.img}">
          <div class="title">${r.title}</div>
          <a href="${r.link}" target="_blank">Ver mais</a>
        `;
        grid.appendChild(card);
      });
    };

    container.appendChild(btn);
    panels.appendChild(panel);
  });
}
