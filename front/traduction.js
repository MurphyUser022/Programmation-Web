const webServerAddress = "http://localhost:8080";

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  const roleCookie = getCookie("role");
  if (!roleCookie) {
    alert("Vous devez être connecté pour accéder à cette page.");
    window.location.href = "index.html";
    return;
  }

  const roles = decodeURIComponent(roleCookie).split(",");
  const isAllowed = roles.includes("Admin") || roles.includes("Traducteur");
  if (!isAllowed) {
    alert("Accès refusé. Seuls les admin ou Traducteur peuvent modifier les recettes.");
    window.location.href = "dashboard.html";
    return;
  }

  if (!id) {
    document.body.innerHTML = "<div class='text-center text-2xl text-gray-500 mt-10'>❌ Recette introuvable</div>";
    return;
  }

  try {
    await loadRecipe(id);
  } catch (err) {
    console.error(err);
    document.body.innerHTML = "<div class='text-center text-2xl text-gray-500 mt-10'>👻 Oups ! Aucune recette trouvée.</div>";
  }

  document.getElementById("save-button").addEventListener("click", saveTranslation);
});

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

async function loadRecipe(id) {
  const response = await fetch(`${webServerAddress}/recipes/${id}`, {
    method: 'GET',
    credentials: 'include'
  });
  if (!response.ok) throw new Error("Erreur lors du chargement de la recette");

  const recette = await response.json();

  const img = document.getElementById("recipe-image");
  if (img) {
    img.src = recette.imageURL || '';
    img.onerror = () => {
      img.src = 'https://twemoji.maxcdn.com/v/latest/72x72/1f47b.png';
      img.alt = "Image non disponible";
    };
  }

  document.getElementById("recipe-title").textContent = "Modifier & Traduire la Recette";
  document.getElementById("original-title").value = recette.nameFR ?? "";
  document.getElementById("translated-title").value = recette.traductions?.name ?? "Non disponible";

  const containerFr = document.getElementById("original-ingredients");
  const containerEn = document.getElementById("translated-ingredients");
  containerFr.innerHTML = "";
  containerEn.innerHTML = "";

  (recette.ingredientsFR || []).forEach((ing, i) => {
    containerFr.appendChild(createIngredientRow(ing.quantity, ing.name, ing.type, true));
    const transIng = recette.traductions?.ingredients?.[i] ?? {};
    containerEn.appendChild(createIngredientRow(transIng.quantity, transIng.name, transIng.type, false));
  });

  const stepsContainer = document.getElementById("steps-section");
  stepsContainer.innerHTML = "";

  const frSteps = recette.stepsFR || [];
  const enSteps = recette.traductions?.steps || [];
  const timers = recette.timers || [];

  for (let i = 0; i < Math.max(frSteps.length, enSteps.length); i++) {
    const block = document.createElement("div");
    block.className = "grid grid-cols-1 md:grid-cols-2 gap-6";

    const en = createStepBlock(enSteps[i] ?? "", timers[i] ?? 0, "en");
    const fr = createStepBlock(frSteps[i] ?? "Étape non disponible", timers[i] ?? 0, "fr");

    block.appendChild(en);
    block.appendChild(fr);
    stepsContainer.appendChild(block);
  }

  // Affichage des restrictions
  const withoutFr = document.getElementById("without-fr");
  const withoutEn = document.getElementById("without-en");
  withoutFr.innerHTML = "";
  withoutEn.innerHTML = "";

  (recette.Sans || []).forEach(r => {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "w-full border rounded px-3 py-2";
    input.value = r;
    input.readOnly = true;
    withoutFr.appendChild(input);
  });

  (recette.traductions?.Without || []).forEach(r => {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "w-full border rounded px-3 py-2 mt-2";
    input.value = r;
    withoutEn.appendChild(input);
  });


}

function createIngredientRow(quantity = "", name = "", type = "", readOnly = false) {
  const row = document.createElement("div");
  row.className = "grid grid-cols-3 gap-2";

  row.innerHTML = `
    <input type="text" class="border rounded px-2 py-1" placeholder="Quantité" value="${quantity || ''}" ${readOnly ? "readonly" : ""} />
    <input type="text" class="border rounded px-2 py-1" placeholder="Nom" value="${name || ''}" ${readOnly ? "readonly" : ""} />
    <input type="text" class="border rounded px-2 py-1" placeholder="Type" value="${type || ''}" ${readOnly ? "readonly" : ""} />
  `;
  return row;
}

function createStepBlock(text = "", duration = "", lang = "en") {
  const block = document.createElement("div");
  block.className = "bg-white p-4 rounded shadow space-y-2 mb-4";

  const isFr = lang === "fr";

  block.innerHTML = `
    <textarea class="w-full border rounded px-3 py-2 mb-2" rows="2" data-lang="${lang}" ${isFr ? "readonly" : ""}>${text || ""}</textarea>
    <input type="number" class="w-full border rounded px-3 py-2" placeholder="Durée (min)" value="${duration}" ${isFr ? "readonly" : ""} />
  `;
  return block;
}


async function saveTranslation() {
  const title = document.getElementById("translated-title").value.trim();
  const ingredientInputs = document.querySelectorAll("#translated-ingredients input");
  const stepTextareas = document.querySelectorAll("#steps-section textarea[data-lang='en']");
  const withoutEnInputs = document.querySelectorAll("#without-en input:not(button)");

  let isValid = true;

  if (!title) {
    document.getElementById("translated-title").classList.add("border-red-500");
    isValid = false;
  } else {
    document.getElementById("translated-title").classList.remove("border-red-500");
  }

  const translatedIngredients = [];
  for (let i = 0; i < ingredientInputs.length; i += 3) {
    const quantity = ingredientInputs[i]?.value.trim();
    const name = ingredientInputs[i + 1]?.value.trim();
    const type = ingredientInputs[i + 2]?.value.trim();

    if (!quantity || !name || !type) {
      [ingredientInputs[i], ingredientInputs[i + 1], ingredientInputs[i + 2]].forEach(input => {
        if (!input.value.trim()) input.classList.add("border-red-500");
        else input.classList.remove("border-red-500");
      });
      isValid = false;
    } else {
      translatedIngredients.push({ quantity, name, type });
    }
  }

  const translatedSteps = [];
  stepTextareas.forEach(textarea => {
    const val = textarea.value.trim();
    if (!val) {
      textarea.classList.add("border-red-500");
      isValid = false;
    } else {
      textarea.classList.remove("border-red-500");
      translatedSteps.push(val);
    }
  });

  const translatedWithout = [];
  withoutEnInputs.forEach(input => {
    const val = input.value.trim();
    if (!val) {
      input.classList.add("border-red-500");
      isValid = false;
    } else {
      input.classList.remove("border-red-500");
      translatedWithout.push(val);
    }
  });

  if (!isValid) {
    alert("Tous les champs doivent être remplis.");
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  const data = {
    name: title,
    ingredients: translatedIngredients,
    steps: translatedSteps,
    Without: translatedWithout
  };

  try {
    const response = await fetch(`${webServerAddress}/recipes/${id}/traduction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (response.ok) {
      alert("Traduction sauvegardée");
    } else {
      alert(result.error || "Erreur lors de la sauvegarde");
    }
  } catch (error) {
    console.error("Erreur réseau", error);
    alert("Erreur lors de la sauvegarde");
  }
}
