const webServerAddress = "http://localhost:8080";

let isEnglish = false;

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search); 
  const id = params.get('id');
  const lang = params.get('lang');

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
    toggleLike(id);
  });

  document.getElementById('comment-button').addEventListener('click', () => {
    addComment(id);
  });
});

async function loadRecipe(id) {
  const response = await fetch(`${webServerAddress}/recipes/${id}/${isEnglish ? 'en' : 'fr'}`);
  if (!response.ok) throw new Error('Recette non trouvée');

  const recette = await response.json();

  document.getElementById('recette-img').src = recette.imageURL;
  document.getElementById('recette-title').textContent = isEnglish && recette.traductions ? recette.traductions.name : recette.nameFR;
  document.querySelector('p.text-lg').textContent = `Recette par ${recette.Author}`;

  const restrictionsList = isEnglish && recette.traductions ? recette.traductions.Without : recette.Sans;
  const restrictions = document.getElementById('restrictions');
  restrictions.innerHTML = '';
  restrictionsList.forEach(r => {
    const li = document.createElement('li');
    li.textContent = r;
    restrictions.appendChild(li);
  });

  const ingredients = document.getElementById('recette-ingredients');
  ingredients.innerHTML = '';
  const ingList = isEnglish && recette.traductions ? recette.traductions.ingredients : recette.ingredientsFR;
  ingList.forEach(i => {
    const li = document.createElement('li');
    li.textContent = `${i.quantity} ${i.name ?? ''}`;
    ingredients.appendChild(li);
  });

  const steps = document.getElementById('recette-steps');
  steps.innerHTML = '';
  const stepList = isEnglish && recette.traductions ? recette.traductions.steps : recette.stepsFR;
  stepList.forEach((s, i) => {
    const li = document.createElement('li');
    li.textContent = `${s}${recette.timers[i] ? ` (${recette.timers[i]} min)` : ''}`;
    steps.appendChild(li);
  });
}

async function loadComments(recipeId) {
  const ul = document.getElementById('commentaires');
  try {
    const response = await fetch(`${webServerAddress}/recipes/${recipeId}/Getcomments`);
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
        <p class="font-medium text-gray-800">${c.username ?? 'Utilisateur'} :</p>
        <p class="text-gray-700">${c.message}</p>
        <span class="text-sm text-gray-500">${new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      `;
      ul.appendChild(li);
    });
  } catch {
    ul.innerHTML = `<li class="text-red-500">Erreur de chargement des commentaires.</li>`;
  }
}

async function addComment(id) {
  const message = document.getElementById('comment-input').value.trim();
  if (!message) return alert("Veuillez écrire un commentaire.");

  const res = await fetch(`${webServerAddress}/recipes/${id}/Addcomments`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ message })
  });

  if (res.ok) {
    document.getElementById('comment-input').value = '';
    await loadComments(id);
  } else {
    alert("Erreur lors de l'envoi du commentaire.");
  }
}
