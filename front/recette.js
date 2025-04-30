const webServerAddress = "http://localhost:8080";

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

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
    toggleLike(id);  // On passe l'ID de la recette en commentaire
  });

  document. getElementById('comment-button').addEventListener('click', () => {
    addComment(id);
  });
});

async function loadRecipe(id) {
  const response = await fetch(`${webServerAddress}/recipes/${id}`);
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
  document.getElementById('recette-title').textContent = recette.nameFR;
  document.querySelector('p.text-lg').textContent = `Recette par ${recette.Author}`;

  // Restrictions
  const restrictions = document.getElementById('restrictions');
  restrictions.innerHTML = '';
  recette.Sans.forEach(restriction => {
    const li = document.createElement('li');
    li.textContent = restriction;
    restrictions.appendChild(li);
  });

  // Ingrédients
  const ingredients = document.getElementById('recette-ingredients');
  ingredients.innerHTML = '';
  recette.ingredientsFR.forEach(ing => {
    const li = document.createElement('li');
    li.textContent = `${ing.quantity} ${ing.name ?? ''}`.trim();
    ingredients.appendChild(li);
  });

  // Étapes
  const steps = document.getElementById('recette-steps');
  steps.innerHTML = '';
  recette.stepsFR.forEach((step, index) => {
    const duration = recette.timers[index] ? ` (${recette.timers[index]} min)` : '';
    const li = document.createElement('li');
    li.textContent = `${step}${duration}`;
    steps.appendChild(li);
  });


  // Mettre à jour le nombre de likes
  const likeCountElement = document.getElementById('like-count');
  likeCountElement.textContent = `${recette.likes} 👍`;  // Récupère et affiche les likes
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
      credentials: 'include', // ← ceci pour les cookies
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ recipe_id: recipeId })
    });

    const result = await response.json();

    if (response.ok) {
      document.getElementById('like-count').textContent = `${result.likes} 👍`;
    } else {
      alert(result.error || "Erreur inconnue");
    }
  } catch (err) {
    console.error("Erreur lors du like :", err);
    alert("Impossible de liker pour l'instant");
  }
}

