const webServerAddress = "http://localhost:8080";

// Récupère tous les utilisateurs depuis l'API
async function getUsers() {
  try {
    const res = await fetch(`${webServerAddress}/users`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      const data = await res.json();
      console.log("Utilisateurs récupérés:", data);
      return data;
    } else {
      console.error("Erreur lors de la récupération des utilisateurs");
      return [];
    }
  } catch (err) {
    console.error("Erreur fetch:", err);
    return [];
  }
}

// Met à jour le rôle d'un utilisateur (approve ou reject)
async function updateUserRole(userId, role, action) {
  try {
    console.log("🟢 Envoi approbation :", userId, role, action);
    const res = await fetch(`${webServerAddress}/roles/${userId}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });

    if (res.ok) {
      console.log("Rôle mis à jour, rechargement des utilisateurs...");
      alert("Action réussie !");
      afficherUsers();
    } else {
      const data = await res.json();
      alert("Erreur : " + (data.message || "Échec de l'action"));
    }
  } catch (error) {
    console.error("Erreur updateUserRole:", error);
    alert("Erreur technique. Veuillez réessayer.");
  }
}

// Affiche les utilisateurs dans le tableau
async function afficherUsers() {
  const users = await getUsers();
  const tbody = document.getElementById("users-table");
  tbody.innerHTML = "";

  users.forEach((user) => {
    const role = Array.isArray(user.role) ? user.role.join(", ") : (user.role || "-");
    const roleDemande = Array.isArray(user.role_demande)
      ? (user.role_demande.length > 0 ? user.role_demande.join(", ") : "-")
      : (user.role_demande || "-");

    const firstRequestedRole = roleDemande.split(",")[0].trim();

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="px-6 py-4">${user.id}</td>
      <td class="px-6 py-4">${user.username}</td>
      <td class="px-6 py-4">
        <span class="bg-orange-200 text-orange-800 px-3 py-1 rounded-full text-xs font-semibold">${role}</span>
      </td>
      <td class="px-6 py-4">${roleDemande}</td>
      <td class="px-6 py-4 text-right space-x-2">
        <button class="px-3 py-1 border border-green-500 text-green-500 rounded hover:bg-green-500 hover:text-white"
          onclick="updateUserRole('${user.id}', '${firstRequestedRole}', 'approve')">Accepter</button>
        <button class="px-3 py-1 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white"
          onclick="updateUserRole('${user.id}', '${firstRequestedRole}', 'reject')">Refuser</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// Lancer l'affichage à l'ouverture de la page
window.addEventListener("DOMContentLoaded", afficherUsers);

// page reserve a l'admin
document.addEventListener("DOMContentLoaded", () => {
  const role = getCookie("role");

  // Vérifie si le rôle contient "admin"
  if (!role || !role.toLowerCase().includes("admin")) {
    alert("Accès refusé. Cette page est réservée aux administrateurs.");
    window.location.href = "dashboard.html";
  }
});

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}