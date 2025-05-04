const webServerAddress = "http://localhost:8080";

// 🔁 Fonction pour récupérer les utilisateurs depuis le backend
async function getUsers() {
  try {
    const res = await fetch(`${webServerAddress}/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include" // 🔐 Nécessaire pour envoyer les cookies
    });

    if (!res.ok) {
      console.error("Erreur serveur :", res.status);
      return [];
    }

    const data = await res.json();
    console.log("Utilisateurs récupérés :", data);
    return data;

  } catch (error) {
    console.error("Erreur fetch:", error);
    return [];
  }
}


async function afficherUsers() {
  const users = await getUsers();
  const tbody = document.getElementById("users-table");

  if (!tbody) {
    console.error("Élément #users-table introuvable dans le DOM");
    return;
  }

  tbody.innerHTML = ""; // Nettoyer avant réaffichage

  users.forEach((user, index) => {
    const tr = document.createElement("tr");

    const roles = Array.isArray(user.role) ? user.role.join(", ") : user.role;
    const demandes = Array.isArray(user.role_demande)
      ? (user.role_demande.length ? user.role_demande.join(", ") : "-")
      : (user.role_demande || "-");

    tr.innerHTML = `
      <td class="px-4 py-2 font-semibold">${index + 1}</td>
      <td class="px-4 py-2">${user.username}</td>
      <td class="px-4 py-2 text-sm text-gray-700">${roles}</td>
      <td class="px-4 py-2 text-sm text-gray-500">${demandes}</td>
      <td class="px-4 py-2 text-right">
        ${
          demandes !== "-" ? `
          <button onclick="updateUserRole('${user.id}', '${demandes}', 'approve')" class="text-green-600 hover:underline mr-2">Valider</button>
          <button onclick="updateUserRole('${user.id}', '${demandes}', 'reject')" class="text-red-600 hover:underline">Refuser</button>
          ` : `<span class="text-gray-400 italic">Aucune demande</span>`
        }
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// 🔁 Appelé au chargement
window.addEventListener("DOMContentLoaded", afficherUsers);

// 🔁 Fonction pour valider ou refuser un rôle
async function updateUserRole(userId, role, action) {
  try {
    const res = await fetch(`${webServerAddress}/roles/${userId}/${action}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ role })
    });

    const data = await res.json();

    if (res.ok) {
      alert(data.message || "Action réussie !");
      afficherUsers(); // Recharger la table
    } else {
      alert("Erreur : " + (data.error || "Impossible de traiter l'action."));
    }
  } catch (error) {
    console.error("Erreur réseau :", error);
    alert("Erreur réseau. Veuillez réessayer.");
  }
}

// Lancer l'affichage à l'ouverture de la page
window.addEventListener("DOMContentLoaded", afficherUsers);

// Fonction pour récupérer un cookie spécifique
document.addEventListener('DOMContentLoaded', () => {
  const role = getCookie('role');
  if (role !== 'Admin') {
    alert("Accès réservé à l'administrateur");
    window.location.href = "dashboard.html"; // ou login.html si non connecté
  }
});

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return match[2];
  return null;
}