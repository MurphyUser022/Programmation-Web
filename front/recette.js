const webServerAddress = "http://localhost:8080";

// Utilitaires
function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

const recetteId = getQueryParam("id");
const isEnglish = getQueryParam("lang") === "en";

// Chargement de la recette
async function loadRecette() {
  const response = await fetch(`${webServerAddress}/recipes`);
  const recettes = await response.json();
  const recette = recettes.find(r => r.id == recetteId);

  if (!recette) {
    document.body.innerHTML = "<p>Recette non trouvée</p>";
    return;
  }

  const name = isEnglish && recette.traductions ? recette.traductions.name : recette.nameFR;
  const ingredients = isEnglish && recette.traductions ? recette.traductions.ingredients : recette.ingredientsFR;
  const steps = isEnglish && recette.traductions ? recette.traductions.steps : recette.stepsFR;
  const restrictions = isEnglish && recette.traductions ? recette.traductions.Without : recette.Sans;

  document.getElementById("recette-img").src = recette.imageURL;
  document.getElementById("recette-title").textContent = name;
  document.querySelector("p.italic").textContent = `Recette par ${recette.Author || 'Inconnu'}`;

  const ingList = document.getElementById("recette-ingredients");
  ingList.innerHTML = '';
  ingredients.forEach(ing => {
    const li = document.createElement("li");
    li.textContent = ing.name || ing;
    ingList.appendChild(li);
  });

  const stepsList = document.getElementById("recette-steps");
  stepsList.innerHTML = '';
  steps.forEach(step => {
    const li = document.createElement("li");
    li.textContent = step;
    stepsList.appendChild(li);
  });

  const restList = document.getElementById("restrictions");
  restList.innerHTML = '';
  restrictions?.forEach(r => {
    const li = document.createElement("li");
    li.textContent = r;
    restList.appendChild(li);
  });
}

async function fetchUsers() {
  try {
    const res = await fetch(`${webServerAddress}/users`, { credentials: 'include' });
    return res.ok ? await res.json() : [];
  } catch (err) {
    console.error("Erreur réseau:", err);
    return [];
  }
}

// Chargement des commentaires
async function loadCommentaires() {
  const container = document.getElementById("commentaires");
  container.innerHTML = "<p class='text-sm text-gray-500'>Chargement des commentaires...</p>";

  try {
    const [resComments, users] = await Promise.all([
      fetch(`${webServerAddress}/comments/${recetteId}`, { credentials: "include" }),
      fetchUsers()
    ]);

    const commentaires = await resComments.json();
    container.innerHTML = '';

    commentaires.forEach(comment => {
      const user = users.find(u => String(u.id) === String(comment.user_id));
      const username = user ? user.username : `Utilisateur ${comment.user_id}`;

      const li = document.createElement("li");
      li.className = "bg-gray-100 p-4 rounded-lg shadow-md mb-4";
      li.innerHTML = `
        <p class="font-medium text-gray-800">${username} :</p>
        <p class="text-gray-700">${comment.message}</p>
        <span class="text-sm text-gray-500">${new Date(comment.timestamp).toLocaleString()}</span>
      `;

      // Ajout de l'image s'il y en a
      if (comment.image) {
        const img = document.createElement("img");
        img.src = `${webServerAddress}/${comment.image}`;
        img.alt = "Image du commentaire";
        img.className = "w-40 mt-2 rounded shadow";
        li.appendChild(img);
      }

      container.appendChild(li);
    });

  } catch (err) {
    console.error("Erreur chargement commentaires", err);
    container.innerHTML = "<p class='text-red-600'>Impossible de charger les commentaires.</p>";
  }
}

// Envoi du commentaire (texte et image)
document.getElementById("comment-button").addEventListener("click", async () => {
  const commentText = document.getElementById("comment-input").value.trim();
  const imageFile = document.getElementById("comment-image").files[0];

  if (!commentText && !imageFile) {
    alert("Veuillez entrer un commentaire ou ajouter une image.");
    return;
  }

  const formData = new FormData();
  formData.append("message", commentText);
  if (imageFile) formData.append("image", imageFile);

  try {
    const res = await fetch(`${webServerAddress}/Addcomments/${recetteId}`, {
      method: "POST",
      credentials: "include",
      body: formData
    });

    const result = await res.json();

    if (res.ok) {
      document.getElementById("comment-input").value = '';
      document.getElementById("comment-image").value = '';
      await loadCommentaires();
    } else {
      alert(result.error || "Erreur lors de l'ajout du commentaire");
    }

  } catch (err) {
    console.error("Erreur réseau :", err);
    alert("Erreur réseau");
  }
});

// Initialisation
document.addEventListener("DOMContentLoaded", async () => {
  await loadRecette();
  await loadCommentaires();

  document.getElementById('like-button').addEventListener('click', () => {
    toggleLike(recetteId);  // Passer l'ID de la recette pour le like
  });
});



async function toggleLike(recipeId) {
  try {
    const response = await fetch(`${webServerAddress}/recipes/${recipeId}/like`, {
      method: 'POST',
      credentials: 'include', 
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ recipe_id: recipeId })
    });

    // Vérification de la réponse brute avant le parse JSON
    const textResponse = await response.text();
    console.log("Réponse brute du serveur:", textResponse);

    if (response.ok) {
      const result = JSON.parse(textResponse); 

      document.getElementById('like-count').textContent = `${result.likes} 👍`;
    } else {
      const errorMessage = JSON.parse(textResponse).error || "Erreur inconnue";
      alert(errorMessage);
    }
  } catch (err) {
    console.error("Erreur lors du like :", err);
    alert("Impossible de liker pour l'instant");
  }
}