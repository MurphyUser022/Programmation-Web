const apiURL = 'http://localhost:3000/api/recettes'; // À adapter si besoin
const container = document.getElementById('card-container');
const webServerAddress = "http://localhost:8080";


// Variable pour garder l'état de la langue (true = traduction anglaise, false = version française)
let isEnglish = false; // Par défaut, c'est le français


function loadRecipes() {
  fetch(`${webServerAddress}/recipes`)
    .then(res => res.json())
    .then(recettes => {
      container.innerHTML = '';  // Effacer les anciennes recettes affichées

      // Ajouter les recettes traduites ou non en fonction de la langue
      recettes
      .filter(recette => recette.statut && recette.statut.trim().toLowerCase() === "validé")
      .forEach(recette => {
        const totalTime = recette.timers?.reduce((a, b) => a + b, 0) || 0;

        // Déterminer l'URL de la recette en fonction de la langue
        const recetteLang = isEnglish ? 'en' : 'fr';

        // Utilisation des traductions si l'anglais est activé
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
              <!-- Lien vers la page de détails de la recette -->
              <a href="recette.html?id=${recette.id}&lang=${recetteLang}" class="text-green-600 text-xs font-medium hover:underline mb-3 focus:outline-none">Voir plus</a>
              <div class="flex space-x-3 mt-3">
                <button class="bg-yellow-200 text-gray-700 py-1 px-4 rounded-full hover:bg-yellow-500 text-xs transition" data-id="${recette.id}" onclick="toggleLike(${recette.id})"><i class="fas fa-thumbs-up"></i> Like</button>
                <a href="#">
                  <button class="bg-blue-200 text-gray-700 py-1 px-4 rounded-full hover:bg-blue-500 text-xs transition"><i class="fas fa-comment"></i> Commenter</button>
                </a>
                <button class="bg-red-200 text-gray-700 py-1 px-4 rounded-full hover:bg-blue-500 text-xs transition" onclick="showTranslation(${recette.id}, ${JSON.stringify(recette.traductions)})"><i class="fas fa-language"></i> Traduction</button>
              </div>
            </div>
          </div>
        `;

        container.insertAdjacentHTML('beforeend', card);
      });
    })
    .catch(err => {
      console.error("Erreur lors de la récupération des recettes :", err);
      container.innerHTML = `
        <div class="text-center text-red-600 mt-10">
          ❌ Une erreur est survenue lors du chargement des recettes.
        </div>
      `;
    });
}

// Fonction pour mettre à jour l'affichage des recettes en fonction de la langue
function toggleTranslation() {
  isEnglish = !isEnglish; 
  loadRecipes();   // Met à jour l'affichage des recettes avec la langue sélectionnée
}

// Fonction d'initialisation pour charger les recettes dès le début (en français par défaut)
document.addEventListener('DOMContentLoaded', () => {
  loadRecipes();  
  document.getElementById('traduire-btn').addEventListener('click', toggleTranslation); // Ajoute l'événement pour le bouton Traduire
});



  function handleImageError(img) {
    // Créer un élément div qui contiendra l'emoji
    const emojiDiv = document.createElement('div');
    // Ajoute les classes CSS pour le style (tailwindcss dans cet exemple)
    emojiDiv.className = "flex items-center justify-center h-48 text-5xl grayscale opacity-50";
    // Choisis l'emoji que tu veux afficher (ici 😩, modifiable à ta guise)
    emojiDiv.textContent = "😩";
    
    // Cache l'image défaillante
    img.style.display = 'none';
    // Insère le div juste après l'image dans le DOM
    img.parentNode.insertBefore(emojiDiv, img.nextSibling);
  }
  
  document.getElementById('request-role-btn').addEventListener('click', async () => {
    const role = document.getElementById('requested-role').value;
    const userId = getCookie('user_id');

    if (!userId) {
      alert("Vous devez être connecté pour demander un rôle.");
      console.log(userId);
      return;
    }

    if (!role || role === "Choisir un rôle") {
      alert("Veuillez choisir un rôle valide.");
      return;
    }

    try {
        const res = await fetch('http://localhost:8080/roles/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role: role
        }),
        credentials: 'include' // 🔥 Sans ça les cookies ne sont jamais envoyés !
       });      
       const data = await res.json();

        if (res.ok) {
          alert(data.message || "Demande de rôle envoyée avec succès !");
        } else {
          alert(data.error || "Erreur lors de la demande.");
        }

    } catch (error) {
      console.error("🔥 Erreur réseau :", error.message || error);
    }
  });

  // Fonction pour lire un cookie
  function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
    return null;
  }