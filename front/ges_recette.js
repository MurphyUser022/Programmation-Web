const webServerAddress = "http://localhost:8080";

async function fetchRecettes() {
  try {
    const res = await fetch(`${webServerAddress}/recipes`);
    const data = await res.json();
    return data.filter(r => r.statut === 'en_attente');
  } catch (e) {
    console.error("Erreur de chargement :", e);
    return [];
  }
}

async function envoyerAction(id, action) {
  try {
    const res = await fetch(`${webServerAddress}/recipes/${id}/${action}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include"
    });

    const result = await res.json();

    if (res.ok) {
      alert(result.message || "Action réussie");
      chargerTable();
    } else {
      alert(result.error || "Erreur");
    }

  } catch (e) {
    alert("Erreur réseau");
    console.error("Erreur fetch :", e);
  }
}

function chargerTable() {
  fetchRecettes().then(recettes => {
    const tbody = document.getElementById("rec-table");
    tbody.innerHTML = "";

    recettes.forEach(r => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="px-6 py-4">${r.id}</td>
        <td class="px-6 py-4">${r.nameFR}</td>
        <td class="px-6 py-4">${r.Author}</td>
        <td class="px-6 py-4">${r.ingredientsFR.map(i => i.name).join(', ')}</td>
        <td class="px-6 py-4">${r.Sans?.join(', ') || "-"}</td>
        <td class="px-6 py-4 text-right space-x-2">
          <button class="px-3 py-1 border border-green-500 text-green-500 rounded hover:bg-green-500 hover:text-white" onclick="envoyerAction(${r.id}, 'approve')">Valider</button>
          <button class="px-3 py-1 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white" onclick="envoyerAction(${r.id}, 'reject')">Refuser</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const role = getCookie('role');
  if (role !== 'Admin') {
    alert("Accès réservé à l'administrateur");
    window.location.href = "dashboard.html"; 
  }
});

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return match[2];
  return null;
}

window.addEventListener("DOMContentLoaded", chargerTable);