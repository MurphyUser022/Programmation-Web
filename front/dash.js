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
  
  document.addEventListener("DOMContentLoaded", () => {
    const requestBtn = document.getElementById("request-role-btn");
    const roleSelect = document.getElementById("requested-role");
  
    if (requestBtn && roleSelect) {
      requestBtn.addEventListener("click", async () => {
        const selectedRole = roleSelect.value;
  
        if (!selectedRole) {
          alert("Veuillez choisir un rôle.");
          return;
        }
  
        try {
          const response = await fetch("http://localhost:8080/roles/request", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include", // 🔥 pour envoyer les cookies
            body: JSON.stringify({ role: selectedRole })
          });
  
          const result = await response.json();
  
          if (response.ok) {
            alert("✅ Demande envoyée avec succès !");
          } else {
            alert("❌ Erreur : " + (result.error || "Échec de la demande"));
          }
        } catch (error) {
          console.error("Erreur technique :", error);
          alert("Erreur technique. Voir console.");
        }
      });
    } else {
      console.warn("🔍 Élément(s) introuvable(s) : Bouton ou Select non chargé");
    }
  });
  