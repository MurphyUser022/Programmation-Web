const apiURL = 'http://localhost:3000/api/recettes'; // À adapter si besoin
const container = document.getElementById('card-container');
const webServerAddress = "http://localhost:8080";
//alert("Ceci est un test !");


fetch(`${webServerAddress}/recipes`)
  .then(res => res.json())
  .then(recettes => {
    if (!recettes || recettes.length === 0) {
      container.innerHTML = `
        <div class="text-center text-gray-500 text-sm mt-10">
          <div class="text-4xl">👻</div>
          <p class="mt-2">Pas de recette disponible pour le moment...</p>
        </div>
      `;
      return;
    }

    recettes.forEach(recette => {
      const totalTime = recette.timers?.reduce((a, b) => a + b, 0) || 0;
      const recetteURL = `/recettes/${recette.id}`;

      const card = `
        <div class="w-full sm:w-[300px] bg-white rounded-xl shadow-lg overflow-hidden transform transition-all hover:scale-105 hover:shadow-xl hover:bg-gradient-to-r from-green-100 to-green-200 duration-300">
          <div class="relative">
                <img 
                src="${recette.imageURL}" 
                alt="Image de la recette" 
                class="w-full max-w-xl mx-auto rounded-lg shadow-md object-cover h-48" 
                onerror="handleImageError(this)"
                />

           <div class="absolute bottom-2 left-4 text-white text-lg font-bold bg-black bg-opacity-50 px-2 py-1 rounded">${recette.nameFR}</div>
          </div>
          <div class="px-4 py-4">
            <h2 class="text-lg font-semibold text-gray-800 mb-2">${recette.nameFR}</h2>
            <p class="text-gray-600 text-xs mb-4">Une recette proposée par ${recette.Author}</p>
            <div class="flex items-center space-x-2 text-gray-700 mb-4 text-xs">
              <i class="fas fa-clock text-green-600"></i>
              <span>Temps total : ${totalTime} min</span>
            </div>
            <a href="recette.html?id=${recette.id}" class="text-green-600 text-xs font-medium hover:underline mb-3 focus:outline-none">Voir plus</a>
            <div class="flex space-x-3 mt-3">
              <button class="bg-yellow-200 text-gray-700 py-1 px-4 rounded-full hover:bg-yellow-500 text-xs transition"><i class="fas fa-thumbs-up"></i> Like</button>
              <a href="${recetteURL}">
                <button class="bg-blue-200 text-gray-700 py-1 px-4 rounded-full hover:bg-blue-500 text-xs transition"><i class="fas fa-comment"></i> Commenter</button>
              </a>
              <a href="${recetteURL}?lang=en">
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
    console.error("Erreur lors de la récupération des recettes :", err);
    container.innerHTML = `
      <div class="text-center text-red-600 mt-10">
        ❌ Une erreur est survenue lors du chargement des recettes.
      </div>
    `;
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

  async function fetchUserRoles() {
    try {
      const response = await fetch("http://localhost:8080/auth/user/roles", {
        method: "GET",
        credentials: "include"
      });
  
      if (!response.ok) {
        throw new Error("Non autorisé");
      }
  
      const user = await response.json();
      document.getElementById("roles-list").textContent = Array.isArray(user.roles)
        ? user.roles.join(", ")
        : user.roles;
  
      document.getElementById("pending-roles").textContent = Array.isArray(user.role_demande)
        ? user.role_demande.join(", ") || "Aucune"
        : user.role_demande || "Aucune";
    } catch (error) {
      console.error("Erreur récupération rôles :", error);
      document.getElementById("user-roles").innerHTML =
        "<p class='text-red-600'>Erreur de chargement des rôles.</p>";
    }
  }
  
  // Appel auto au chargement de la page
  document.addEventListener("DOMContentLoaded", fetchUserRoles);
  