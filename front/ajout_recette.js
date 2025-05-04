const webServerAddress = "http://localhost:8080";

document.addEventListener('DOMContentLoaded', function () {
  const ingredientsContainer = document.getElementById("ingredients-container");
  const addIngredientBtn = document.getElementById("add-ingredient-btn");
  const stepContainer = document.getElementById("steps-container");

  // Ajouter une ligne d'ingrédient
  addIngredientBtn.addEventListener("click", () => {
    const row = document.createElement("div");
    row.className = "flex space-x-2";

    row.innerHTML = `
      <input type="text" placeholder="Quantité" class="ingredient-qty border px-2 py-1 rounded w-1/3">
      <input type="text" placeholder="Nom" class="ingredient-name border px-2 py-1 rounded w-1/3">
      <input type="text" placeholder="Type" class="ingredient-type border px-2 py-1 rounded w-1/3">
    `;

    ingredientsContainer.appendChild(row);
  });

  // Ajouter une étape
  document.getElementById("add-step-btn").addEventListener("click", () => {
    const block = document.createElement("div");
    block.className = "grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-4 rounded shadow step-block";

    const stepCount = stepContainer.querySelectorAll(".step-block").length + 1;

    block.innerHTML = `
      <div>
        <label class="block font-medium mb-1">Étape ${stepCount}</label>
        <textarea class="step-text w-full border rounded px-3 py-2 mb-2" rows="2" placeholder="Description de l'étape"></textarea>
        <input class="step-duration w-full border rounded px-3 py-2" type="number" placeholder="Durée (min)" />
      </div>
    `;

    stepContainer.insertBefore(block, document.getElementById("add-step-btn"));
  });

  // Vérification des rôles à l'accès
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
    return;
  }

  // Soumission du formulaire
  document.getElementById("submit-recipe").addEventListener("click", async (e) => {
    e.preventDefault();

    const nameFR = document.getElementById("recipe-title").value.trim();
    const imageURL = document.getElementById("image-url").value.trim();
    const sansInput = document.getElementById("sans").value;

    // Ingrédients : construire le tableau [{ quantity, name, type }]
    const ingredientRows = document.querySelectorAll("#ingredients-container > div");
    const ingredientsFR = [];

    ingredientRows.forEach(row => {
      const qty = row.querySelector(".ingredient-qty")?.value.trim();
      const name = row.querySelector(".ingredient-name")?.value.trim();
      const type = row.querySelector(".ingredient-type")?.value.trim();

      if (qty && name && type) {
        ingredientsFR.push({ quantity: qty, name, type });
      }
    });

    // Étapes et durées
    const stepsFR = Array.from(document.querySelectorAll(".step-text"))
      .map(el => el.value.trim())
      .filter(Boolean);

    const timers = Array.from(document.querySelectorAll(".step-duration"))
      .map(el => parseInt(el.value, 10) || 0);

    // Restrictions alimentaires
    const Sans = sansInput.split(",").map(x => x.trim()).filter(Boolean);

    if (!nameFR || ingredientsFR.length === 0 || stepsFR.length === 0 || !imageURL) {
      alert("Veuillez remplir tous les champs requis !");
      return;
    }

    const payload = {
      nameFR,
      imageURL,
      ingredientsFR,
      stepsFR,
      timers,
      Sans
    };

    try {
      const res = await fetch(`${webServerAddress}/recipes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (res.ok) {
        alert("Recette ajoutée avec succès !");
        window.location.href = "dashboard.html";
      } else {
        alert("Erreur : " + (result.error || "Ajout impossible"));
      }

    } catch (err) {
      console.error("Erreur réseau :", err);
      alert("Erreur réseau. Veuillez réessayer.");
    }
  });

}); // end DOMContentLoaded

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}
