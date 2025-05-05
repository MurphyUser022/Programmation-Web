const apiURL = 'http://localhost:3000/api/recettes';
const container = document.getElementById('card-container');
const webServerAddress = "http://localhost:8080";

let isEnglish = false;

function loadRecipes() {
  fetch(`${webServerAddress}/recipes`)
    .then(res => res.json())
    .then(recettes => {
      container.innerHTML = '';
      recettes.forEach(recette => {
        const totalTime = recette.timers?.reduce((a, b) => a + b, 0) || 0;
        const recetteLang = isEnglish ? 'en' : 'fr';
        const displayName = isEnglish && recette.traductions ? recette.traductions.name : recette.nameFR;
        const displayIngredients = isEnglish && recette.traductions ? recette.traductions.ingredients.map(i => i.name).join(', ') : recette.ingredientsFR.map(i => i.name).join(', ');
        const displaySteps = isEnglish && recette.traductions ? recette.traductions.steps.join(', ') : recette.stepsFR.join(', ');

        const card = `
          <div class="w-full sm:w-[300px] bg-white rounded-xl shadow-lg overflow-hidden transform transition-all hover:scale-105 hover:shadow-xl hover:bg-gradient-to-r from-green-100 to-green-200 duration-300">
            <div class="relative">
              <img 
                src="${recette.imageURL}" 
                alt="Image de la recette" 
                class="w-full max-w-xl mx-auto rounded-lg shadow-md object-cover h-48" 
                onerror="handleImageError(this)"
              />
              <div class="absolute bottom-2 left-4 text-white text-lg font-bold bg-black bg-opacity-50 px-2 py-1 rounded">${displayName}</div>
            </div>
            <div class="px-4 py-4">
              <h2 class="text-lg font-semibold text-gray-800 mb-2">${displayName}</h2>
              <p class="text-gray-600 text-xs mb-4">Une recette proposée par ${recette.Author}</p>
              <div class="flex items-center space-x-2 text-gray-700 mb-4 text-xs">
                <i class="fas fa-clock text-green-600"></i>
                <span>Temps total : ${totalTime} min</span>
              </div>
              <a href="recette.html?id=${recette.id}&lang=${recetteLang}" class="text-green-600 text-xs font-medium hover:underline mb-3 focus:outline-none">Voir plus</a>
              <div class="flex space-x-3 mt-3">
                <button class="bg-yellow-200 text-gray-700 py-1 px-4 rounded-full hover:bg-yellow-500 text-xs transition" data-id="${recette.id}" onclick="toggleLike(${recette.id})"><i class="fas fa-thumbs-up"></i> Like</button>
                <a href="modifier.html?id=${recette.id}">
                  <button class="bg-blue-200 text-gray-700 py-1 px-4 rounded-full hover:bg-blue-500 text-xs transition"><i class="fas fa-comment"></i> Modifier</button>
                </a>
                <a href="traduction.html?id=${recette.id}">
                  <button class="bg-red-200 text-gray-700 py-1 px-4 rounded-full hover:bg-blue-500 text-xs transition"><i class="fas fa-language"></i> Traduction</button>
                </a>
              </div>
            </div>
          </div>
        `;
        container.insertAdjacentHTML('beforeend', card);
      });
    })
    .catch(err => {
      container.innerHTML = `<div class="text-center text-red-600 mt-10">❌ Une erreur est survenue lors du chargement des recettes.</div>`;
    });
}

function toggleTranslation() {
  isEnglish = !isEnglish;
  updateStaticTexts();
  loadRecipes();
}

function updateStaticTexts() {
  document.getElementById('traduire-btn').textContent = isEnglish ? 'Français' : 'Anglais';
  document.getElementById('gestion-role-link').textContent = isEnglish ? 'Role Management' : 'Gestion des rôles';
  document.getElementById('connection').textContent = isEnglish ? 'Logout' : 'Déconnexion';
  document.querySelector('a[href="dashboard.html"]').textContent = isEnglish ? 'Home' : 'Accueil';
  document.querySelector('h2.text-5xl').innerHTML = isEnglish ? 'Cooking Recipe <span class="text-orange-500">Encyclopedia</span>' : 'Encyclopédie des <span class="text-orange-500">Recettes de cuisine</span>';
  document.querySelector('p.text-gray-600').textContent = isEnglish ? 'Discover healthy and delicious recipes with unique ingredients' : 'Découvrez des recettes saines et délicieuses avec des ingrédients uniques';
  document.querySelector('button.bg-green-600').textContent = isEnglish ? 'Explore Recipes' : 'Explorer les recettes';
}

document.addEventListener('DOMContentLoaded', () => {
  loadRecipes();  
  updateStaticTexts();
  document.getElementById('traduire-btn').addEventListener('click', toggleTranslation);
});

function handleImageError(img) {
  const emojiDiv = document.createElement('div');
  emojiDiv.className = "flex items-center justify-center h-48 text-5xl grayscale opacity-50";
  emojiDiv.textContent = "😩";
  img.style.display = 'none';
  img.parentNode.insertBefore(emojiDiv, img.nextSibling);
}

document.getElementById('request-role-btn').addEventListener('click', async () => {
  const role = document.getElementById('requested-role').value;
  const userId = getCookie('user_id');
  if (!userId) return alert("Vous devez être connecté pour demander un rôle.");
  if (!role || role === "Choisir un rôle") return alert("Veuillez choisir un rôle valide.");
  try {
    const res = await fetch('http://localhost:8080/roles/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
      credentials: 'include'
    });
    const data = await res.json();
    if (res.ok) {
      alert(data.message || "Demande de rôle envoyée avec succès !");
    } else {
      alert(data.error || "Erreur lors de la demande.");
    }
  } catch (error) {
    console.error("Erreur réseau :", error.message || error);
  }
});

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

async function fetchUserRoles() {
  try {
    const response = await fetch("http://localhost:8080/auth/user/roles", { method: "GET", credentials: "include" });
    if (!response.ok) throw new Error("Non autorisé");
    const user = await response.json();
    document.getElementById("roles-list").textContent = Array.isArray(user.roles) ? user.roles.join(", ") : user.roles;
    document.getElementById("pending-roles").textContent = Array.isArray(user.role_demande) ? user.role_demande.join(", ") || "Aucune" : user.role_demande || "Aucune";
  } catch (error) {
    console.error("Erreur récupération rôles :", error);
    document.getElementById("user-roles").innerHTML = "<p class='text-red-600'>Erreur de chargement des rôles.</p>";
  }
}

document.addEventListener("DOMContentLoaded", fetchUserRoles);

function updateRecipeCards(recipes) {
  const cardContainer = document.getElementById('card-container');
  cardContainer.innerHTML = '';
  if (recipes.length === 0) {
    cardContainer.innerHTML = '<p class="text-gray-500">Aucune recette trouvée</p>';
    return;
  }
  recipes.forEach(recipe => {
    const totalTime = recipe.timers?.reduce((a, b) => a + b, 0) || 0;
    const recetteLang = isEnglish ? 'en' : 'fr';
    const displayName = isEnglish && recipe.traductions ? recipe.traductions.name : recipe.nameFR;
    const displayIngredients = isEnglish && recipe.traductions ? recipe.traductions.ingredients.map(i => i.name).join(', ') : recipe.ingredientsFR.map(i => i.name).join(', ');
    const displaySteps = isEnglish && recipe.traductions ? recipe.traductions.steps.join(', ') : recipe.stepsFR.join(', ');

    const card = `
      <div class="w-full sm:w-[300px] bg-white rounded-xl shadow-lg overflow-hidden transform transition-all hover:scale-105 hover:shadow-xl hover:bg-gradient-to-r from-green-100 to-green-200 duration-300">
        <div class="relative">
          <img 
            src="${recipe.imageURL}" 
            alt="Image de la recette" 
            class="w-full max-w-xl mx-auto rounded-lg shadow-md object-cover h-48" 
            onerror="handleImageError(this)"
          />
          <div class="absolute bottom-2 left-4 text-white text-lg font-bold bg-black bg-opacity-50 px-2 py-1 rounded">${displayName}</div>
        </div>
        <div class="px-4 py-4">
          <h2 class="text-lg font-semibold text-gray-800 mb-2">${displayName}</h2>
          <p class="text-gray-600 text-xs mb-4">Une recette proposée par ${recipe.Author}</p>
          <div class="flex items-center space-x-2 text-gray-700 mb-4 text-xs">
            <i class="fas fa-clock text-green-600"></i>
            <span>Temps total : ${totalTime} min</span>
          </div>
          <a href="recette.html?id=${recipe.id}&lang=${recetteLang}" class="text-green-600 text-xs font-medium hover:underline mb-3 focus:outline-none">Voir plus</a>
          <div class="flex space-x-3 mt-3">
            <button class="bg-yellow-200 text-gray-700 py-1 px-4 rounded-full hover:bg-yellow-500 text-xs transition" data-id="${recipe.id}" onclick="toggleLike(${recipe.id})"><i class="fas fa-thumbs-up"></i> Like</button>
            <a href="modifier.html?id=${recipe.id}">
              <button class="bg-blue-200 text-gray-700 py-1 px-4 rounded-full hover:bg-blue-500 text-xs transition"><i class="fas fa-comment"></i> Modifier</button>
            </a>
            <a href="traduction.html?id=${recipe.id}">
              <button class="bg-red-200 text-gray-700 py-1 px-4 rounded-full hover:bg-blue-500 text-xs transition"><i class="fas fa-language"></i> Traduction</button>
            </a>
          </div>
        </div>
      </div>
    `;
    cardContainer.insertAdjacentHTML('beforeend', card);
  });
}

document.getElementById('searchInput').addEventListener('input', function () {
  const mot = this.value.trim();
  if (mot.length < 2) {
    loadAllRecipes();
    return;
  }
  fetch(`${webServerAddress}/recipes/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mot_rechercher: mot })
  })
    .then(response => response.json())
    .then(data => updateRecipeCards(data))
    .catch(error => console.error('Erreur:', error));
});

function loadAllRecipes() {
  fetch(`${webServerAddress}/recipes`)
    .then(response => response.json())
    .then(data => updateRecipeCards(data))
    .catch(error => console.error('Erreur de chargement des recettes:', error));
}
