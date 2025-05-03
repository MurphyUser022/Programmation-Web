const webServerAddress = "http://localhost:8080";

let isEnglish = false;  // false pour français, true pour anglais

// Récupérer les paramètres de l'URL à la page de recette
document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search); 
  const id = params.get('id');
  const lang = params.get('lang');  // Vérifie si "lang" est dans l'URL


  isEnglish = lang === 'en';

  if (!id) {
    document.body.innerHTML = "<div class='text-center text-2xl text-gray-500 mt-10'>❌ Recette introuvable</div>";
    return;
  }

  try {
    await loadRecipe(id);
    await loadComments(id);
  } catch (err) {
    console.error(err);
    document.body.innerHTML = "<div class='text-center text-2xl text-gray-500 mt-10'>👻 Oups ! Aucune recette trouvée.</div>";
  }

  document.getElementById('like-button').addEventListener('click', () => {
    toggleLike(id);  // Passer l'ID de la recette pour le like
  });

  document.getElementById('comment-button').addEventListener('click', () => {
    addComment(id);
  });
});

// Charger la recette
async function loadRecipe(id) {
  const response = await fetch(`${webServerAddress}/recipes/${id}/${isEnglish ? 'en' : 'fr'}`);
  if (!response.ok) throw new Error('Recette non trouvée');

  const recette = await response.json();

  // Image
  const img = document.getElementById('recette-img');
  img.src = recette.imageURL;
  img.onerror = () => {
    img.src = 'https://twemoji.maxcdn.com/v/latest/72x72/1f47b.png'; // 👻
    img.alt = "Image non disponible";
  };

  // Titre & Auteur
  const displayName = isEnglish && recette.traductions ? recette.traductions.name : recette.nameFR;
  document.getElementById('recette-title').textContent = displayName;
  document.querySelector('p.text-lg').textContent = `Recette par ${recette.Author}`;

  // Restrictions
  const restrictions = document.getElementById('restrictions');
  restrictions.innerHTML = '';
  const restrictionsList = isEnglish && recette.traductions ? recette.traductions.Without : recette.Sans;
  restrictionsList.forEach(restriction => {
    const li = document.createElement('li');
    li.textContent = restriction;
    restrictions.appendChild(li);
  });

  // Ingrédients
  const ingredients = document.getElementById('recette-ingredients');
  ingredients.innerHTML = '';
  const displayIngredients = isEnglish && recette.traductions ? recette.traductions.ingredients : recette.ingredientsFR;
  displayIngredients.forEach(ing => {
    const li = document.createElement('li');
    li.textContent = `${ing.quantity} ${ing.name ?? ''}`.trim();
    ingredients.appendChild(li);
  });

  // Étapes
  const steps = document.getElementById('recette-steps');
  steps.innerHTML = '';
  const displaySteps = isEnglish && recette.traductions ? recette.traductions.steps : recette.stepsFR;
  displaySteps.forEach((step, index) => {
    const duration = recette.timers[index] ? ` (${recette.timers[index]} min)` : '';
    const li = document.createElement('li');
    li.textContent = `${step}${duration}`;
    steps.appendChild(li);
  });

}



async function loadComments(id) {
  const ul = document.getElementById('commentaires');

  try {
    const response = await fetch(`${webServerAddress}/recipes/${id}/Getcomments`);
    const comments = await response.json();

    ul.innerHTML = '';

    if (!comments.length) {
      ul.innerHTML = `<li class="text-gray-500">👻 Aucun commentaire pour cette recette.</li>`;
      return;
    }

    comments.forEach(c => {
      const li = document.createElement('li');
      li.className = "bg-gray-100 p-4 rounded-lg shadow-md";
      li.innerHTML = `
        <p class="font-medium text-gray-800">${c.user_id} :</p>
        <p class="text-gray-700">${c.message}</p>
        <span class="text-sm text-gray-500">${new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      `;
      ul.appendChild(li);
    });
  } catch {
    ul.innerHTML = `<li class="text-red-500">❌ Impossible de charger les commentaires.</li>`;
  }
}

async function addComment(id) {
  const commentInput = document.getElementById('comment-input');
  const message = commentInput.value.trim();

  if (!message) {
    alert("Écris un commentaire d'abord 😅");
    return;
  }

  const body = new URLSearchParams();
  body.append('message', message);

  try {
    const response = await fetch(`${webServerAddress}/recipes/${id}/Addcomments`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString()
    });

    if (response.ok) {
      commentInput.value = '';
      await loadComments(id);
    } else {
      alert("Erreur lors de l'envoi du commentaire.");
    }
  } catch (err) {
    console.error("Erreur lors de l'envoi du commentaire :", err);
    alert("Une erreur est survenue.");
  }
}

async function toggleLike(recipeId) {
  try {
    const response = await fetch(`${webServerAddress}/recipes/${recipeId}/like`, {
      method: 'POST',
      credentials: 'include', // Pour les cookies
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ recipe_id: recipeId })
    });

    // Vérification de la réponse brute avant le parse JSON
    const textResponse = await response.text();
    console.log("Réponse brute du serveur:", textResponse);

    // Si la réponse est vide ou n'est pas au format JSON, tu peux arrêter ici
    if (response.ok) {
      const result = JSON.parse(textResponse); // Essaye de parser la réponse

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