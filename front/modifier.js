
const webServerAddress = "http://localhost:8080";
let originalSteps = [];
let originalRestrictions = [];

window.onload = async () => {
  const id = new URLSearchParams(window.location.search).get("id");
  if (!id) return alert("ID de recette manquant.");
  await loadRecipe(id);
};

async function loadRecipe(id) {
  const response = await fetch(`${webServerAddress}/recipes/${id}`);
  const recipe = await response.json();
  document.getElementById("original-title").value = recipe.nameFR || "";
  document.getElementById("image-url-input").value = recipe.imageURL || "";

  // Ingrédients
  const ingredientsContainer = document.getElementById("original-ingredients");
  ingredientsContainer.innerHTML = "";
  recipe.ingredientsFR.forEach(({ quantity, name, type }, i) => {
    const row = document.createElement("div");
    row.className = "flex gap-2";
    row.innerHTML = `
      <input value="${quantity}" placeholder="Quantité" class="flex-1 p-2 border border-gray-300 rounded">
      <input value="${name || ''}" placeholder="Nom" class="flex-1 p-2 border border-gray-300 rounded">
      <input value="${type}" placeholder="Type" class="flex-1 p-2 border border-gray-300 rounded">
      <button type="button" class="px-3 bg-red-500 text-white rounded hover:bg-red-600 transition" onclick="removeItem(${i}, 'ingredient')">Supprimer</button>
    `;
    ingredientsContainer.appendChild(row);
  });

  // Étapes
  const stepsContainer = document.getElementById("steps-section");
  stepsContainer.innerHTML = "";
  originalSteps = recipe.stepsFR;
  recipe.stepsFR.forEach((stepText, i) => {
    const timer = recipe.timers[i] || 0;
    const row = document.createElement("div");
    row.className = "flex gap-2 step-row";
    row.innerHTML = `
      <textarea class="flex-1 p-2 border border-gray-300 rounded">${stepText}</textarea>
      <input type="number" value="${timer}" class="w-32 p-2 border border-gray-300 rounded" placeholder="Temps (min)">
      <button class="px-3 bg-red-500 text-white rounded hover:bg-red-600 transition" onclick="removeItem(${i}, 'step')">Supprimer</button>
    `;
    stepsContainer.appendChild(row);
  });

  // Restrictions
  const restrictionsContainer = document.getElementById("restrictions-section");
  restrictionsContainer.innerHTML = "";
  recipe.Sans.forEach((restriction, i) => {
    const row = document.createElement("div");
    row.className = "flex gap-2";
    row.innerHTML = `
      <input value="${restriction}" placeholder="Restriction" class="flex-1 p-2 border border-gray-300 rounded">
      <button type="button" class="px-3 bg-red-500 text-white rounded hover:bg-red-600 transition" onclick="removeItem(${i}, 'restriction')">Supprimer</button>
    `;
    restrictionsContainer.appendChild(row);
  });
}

function addItem(type) {
if (type === "ingredient") {
const container = document.getElementById("original-ingredients");
const row = document.createElement("div");
row.className = "flex gap-2 items-center";

row.innerHTML = `
  <input placeholder="Quantité" class="flex-1 p-2 border border-gray-300 rounded">
  <input placeholder="Nom" class="flex-1 p-2 border border-gray-300 rounded">
  <input placeholder="Type" class="flex-1 p-2 border border-gray-300 rounded">
  <button type="button" class="px-3 bg-green-600 text-white rounded hover:bg-green-700 transition">Valider</button>
  <button type="button" class="px-3 bg-red-500 text-white rounded hover:bg-red-600 transition" onclick="this.parentElement.remove()">Supprimer</button>
`;

row.querySelector("button").onclick = async () => {
const [quantity, name, typeInput] = row.querySelectorAll("input");
if (quantity.value && name.value && typeInput.value) {
const recipeId = new URLSearchParams(window.location.search).get("id");
await fetch(`${webServerAddress}/addToBothVersions/${recipeId}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    add: {
      type: "ingredient",
      fr: `${quantity.value} de ${name.value}`, // Phrase descriptive
      quantity: quantity.value,
      name: name.value,
      ingredientType: typeInput.value
    }
  })
});
row.querySelector("button").disabled = true;
row.querySelector("button").innerText = "Validé";
row.querySelector("button").classList.add("bg-gray-400");
} else {
alert("Veuillez remplir tous les champs.");
}
};

container.appendChild(row);
}

else if (type === "step") {
const container = document.getElementById("steps-section");
const row = document.createElement("div");
row.className = "flex gap-2 items-center";

row.innerHTML = `
  <textarea placeholder="Étape" class="flex-1 p-2 border border-gray-300 rounded"></textarea>
  <input type="number" value="0" class="w-32 p-2 border border-gray-300 rounded" placeholder="Temps (min)">
  <button type="button" class="px-3 bg-green-600 text-white rounded hover:bg-green-700 transition">Valider</button>
  <button type="button" class="px-3 bg-red-500 text-white rounded hover:bg-red-600 transition" onclick="this.parentElement.remove()">Supprimer</button>
`;

row.querySelector("button").onclick = async () => {
  const text = row.querySelector("textarea").value;
  const timer = row.querySelector("input[type='number']").value;
  if (text.trim()) {
    const recipeId = new URLSearchParams(window.location.search).get("id");
    await fetch(`${webServerAddress}/addToBothVersions/${recipeId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        add: {
          type: "step",
          fr: text,
          timer: parseInt(timer)
        }
      })
    });
    row.querySelector("button").disabled = true;
    row.querySelector("button").innerText = "Validé";
    row.querySelector("button").classList.add("bg-gray-400");
  } else {
    alert("Veuillez remplir le champ de l'étape.");
  }
};

container.appendChild(row);
}

else if (type === "restriction") {
const container = document.getElementById("restrictions-section");
const row = document.createElement("div");
row.className = "flex gap-2 items-center";

row.innerHTML = `
  <input placeholder="Restriction" class="flex-1 p-2 border border-gray-300 rounded">
  <button type="button" class="px-3 bg-green-600 text-white rounded hover:bg-green-700 transition">Valider</button>
  <button type="button" class="px-3 bg-red-500 text-white rounded hover:bg-red-600 transition" onclick="this.parentElement.remove()">Supprimer</button>
`;

row.querySelector("button").onclick = async () => {
  const input = row.querySelector("input").value;
  if (input.trim()) {
    const recipeId = new URLSearchParams(window.location.search).get("id");
    await fetch(`${webServerAddress}/addToBothVersions/${recipeId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        add: {
          type: "restriction",
          fr: input
        }
      })
    });
    row.querySelector("button").disabled = true;
    row.querySelector("button").innerText = "Validé";
    row.querySelector("button").classList.add("bg-gray-400");
    
  } else {
    alert("Veuillez remplir la restriction.");
  }
};

container.appendChild(row);
}
}

async function removeItem(index, type) {
  const recipeId = new URLSearchParams(window.location.search).get("id");

  if (index !== null) {
    const response = await fetch(`${webServerAddress}/testDeleteStepLocal/${recipeId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        remove: {
          type: type,
          index: index
        }
      })
    })
    .then(response => response.json())
    .then(data => {
      console.log("Réponse du serveur :", data);
      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} supprimé(e) avec succès.`);
      
    window.location.reload();
    })
    .catch(error => {
      console.error("Erreur lors de la requête :", error);
      alert('Erreur lors de la suppression.');
    });
  }

  if (index === null) {
    this.closest("div").remove();
  }
}

async function saveRecipeModifications() {
const recipeId = new URLSearchParams(window.location.search).get("id");

const nameFR = document.getElementById("original-title").value.trim();
const imageURL = document.getElementById("image-url-input").value.trim();

// Ingrédients
const ingredients = Array.from(document.querySelectorAll("#original-ingredients > div")).map(row => {
const [quantityInput, nameInput, typeInput] = row.querySelectorAll("input");

const quantity = quantityInput.value.trim();
const name = nameInput.value.trim();
const type = typeInput.value.trim();

if (!quantity || !name || !type) return null;

return {
  quantity,
  name,
  type
};
}).filter(ingredient => ingredient !== null);

// Étapes
const stepRows = Array.from(document.querySelectorAll("#steps-section > .step-row"));
const steps = stepRows.map(row => {
const stepText = row.querySelector("textarea").value.trim();
const timer = parseInt(row.querySelector("input[type='number']").value.trim() || "0");

if (!stepText) return null;

return { stepText, timer };
}).filter(step => step !== null);

// Restrictions
const restrictions = Array.from(document.querySelectorAll("#restrictions-section > div")).map(row => {
const input = row.querySelector("input").value.trim();
if (!input) return null; // Si la restriction est vide, on l'ignore

return input;
}).filter(restriction => restriction !== null); // Filtrer les restrictions vides

const updatePayload = {
nameFR,
imageURL,
ingredientsFR: ingredients,
stepsFR: steps.map(step => step.stepText),
timers: steps.map(step => step.timer),
restrictions: restrictions // Inclure les restrictions collectées
};

// Vérifier si tous les champs nécessaires sont remplis
if (!nameFR || !imageURL || ingredients.length === 0 || steps.length === 0 || restrictions.length === 0) {
return alert("Veuillez remplir tous les champs.");
}

try {
const res = await fetch(`${webServerAddress}/update/${recipeId}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(updatePayload)
});

const result = await res.json();
if (res.ok) {
  alert("Recette mise à jour avec succès.");

  window.location.reload();
 } else {
  alert("Erreur serveur : " + result.error || "Échec de la mise à jour.");
}
} catch (error) {
console.error("Erreur lors de l'enregistrement :", error);
alert("Erreur lors de l'enregistrement.");
}
}



