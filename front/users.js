const webServerAddress = "http://localhost:8080";

// Récupère tous les utilisateurs depuis l'API
async function getUsers() {
  try {
    const res = await fetch(`${webServerAddress}/users`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      return await res.json();
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
    const res = await fetch(`${webServerAddress}/roles/${userId}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });

    if (res.ok) {
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
          onclick="updateUserRole('${user.id}', '${roleDemande}', 'approve')">Accepter</button>
        <button class="px-3 py-1 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white"
          onclick="updateUserRole('${user.id}', '${roleDemande}', 'reject')">Refuser</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}


// Lancer l'affichage à l'ouverture de la page
window.addEventListener("DOMContentLoaded", afficherUsers);