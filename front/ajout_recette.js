const webServerAddress = "http://localhost:8080";

document.addEventListener('DOMContentLoaded', function() {
  // Ajouter dynamiquement une étape
  document.getElementById("add-step-btn").addEventListener("click", () => {
    const container = document.getElementById("steps-container");

    const block = document.createElement("div");
    block.className = "grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-4 rounded shadow step-block";

    const stepCount = container.querySelectorAll(".step-block").length + 1;

    block.innerHTML = `
      <div>
        <label class="block font-medium mb-1">Étape ${stepCount}</label>
        <textarea class="step-text w-full border rounded px-3 py-2 mb-2" rows="2" placeholder="Description de l'étape"></textarea>
        <input class="step-duration w-full border rounded px-3 py-2" type="number" placeholder="Durée (min)" />
      </div>
    `;

    container.insertBefore(block, document.getElementById("add-step-btn"));
  });

  // Soumettre la recette
  document.getElementById("submit-recipe").addEventListener("click", async (e) => {
    e.preventDefault();

    const nameFR = document.getElementById("recipe-title").value.trim(); // ✅ corrigé ici
    const imageURL = document.getElementById("image-url").value.trim();
    const sansInput = document.getElementById("sans").value;
    const ingredientsInput = document.getElementById("ingredients").value;

    const ingredientsFR = ingredientsInput
      .split("\n")
      .map(ing => ing.trim())
      .filter(Boolean);

    if (!nameFR || ingredientsFR.length === 0 || !imageURL) {
      alert("Veuillez remplir tous les champs requis.");
      return;
    }

    const Sans = sansInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const stepsFR = Array.from(document.querySelectorAll(".step-text"))
      .map(el => el.value.trim())
      .filter(Boolean);

    const timers = Array.from(document.querySelectorAll(".step-duration"))
      .map(el => parseInt(el.value, 10) || 0);

    const payload = {
      nameFR,
      imageURL,
      ingredientsFR,
      stepsFR,
      timers,
      Sans
    };

    try {
      const response = await fetch(`${webServerAddress}/recipes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        alert("✅ Recette ajoutée avec succès !");
        window.location.href = "dashboard.html";
      } else {
        alert("❌ Erreur : " + (result.error || "Ajout impossible"));
      }

    } catch (error) {
      console.error("Erreur réseau :", error);
      alert("❌ Erreur réseau. Veuillez réessayer.");
    }
  });
});

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

document.addEventListener("DOMContentLoaded", () => {
  const roleCookie = getCookie("role");

  if (!roleCookie) {
    alert("Vous devez être connecté pour accéder à cette page.");
    window.location.href = "index.html";
    return;
  }

  const roles = decodeURIComponent(roleCookie).split(",");

  const isAllowed = roles.includes("Admin") || roles.includes("chef");

  if (!isAllowed) {
    alert("Accès refusé. Seuls les admins ou chefs peuvent ajouter une recette.");
    window.location.href = "dashboard.html";
  }
});
