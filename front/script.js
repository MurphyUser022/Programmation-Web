const webServerAddress = "http://localhost:8080";
//alert("Ceci est un test !");

const loginForm = document.getElementById("login-form");
if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const response = await sendLogin(event);
            window.location.href = "dashboard.html";
	});

}


const registerForm = document.getElementById("register-form");
if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        await sendRegister(event);
		window.location.href = "dashboard.html";
    });
}




const commentForm = document.getElementById("post-comment");

if (commentForm) {
    commentForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const comments = await sendComment(event);
        event.target.reset();
        await displayComments(comments);
    });
}


const button = document.getElementById("get-comments");

if (button) {
    button.addEventListener("click", async () => {
        const comments = await getComments();
        await displayComments(comments);
    });
}


async function sendLogin(event) {
    const body = new URLSearchParams(new FormData(event.target));

    try {
        const response = await fetch(`${webServerAddress}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body,
        });

        if (response.ok) {
            const result = await response.json();
            console.log("Login successful:", result);
            return result;
        } else {
            console.error("Login failed:", response.status, response.statusText);
            return { success: false };
        }
    } catch (error) {
        console.error("Error occurred:", error);
        return { success: false };
    }
}





async function sendRegister(event) {
    const body = new URLSearchParams(new FormData(event.target));

    try {
        const response = await fetch(`${webServerAddress}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body,
        });

        const text = await response.text(); 

        if (response.ok) {
            const result = await response.json();
            console.log("register successful:", result);
            return result;
        } else {
            console.error("Register failed:", response.status, response.statusText);
            return { success: false };
        }
    } catch (error) {
        console.error("Error occurred:", error);
        return { success: false };
    }
}



async function sendComment(event) {
    const body = new URLSearchParams(new FormData(event.target));

    try {
        const response = await fetch(`${webServerAddress}/comment`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body,
        });

        if (response.ok) {
            const result = await response.json();
            console.log("Comment submitted:", result);
            return result;
        } else {
            console.error("Comment submission failed:", response.status, response.statusText);
        }
    } catch (error) {
        console.error("Error occurred:", error);
    }
}



async function getComments() {
    try {
        const response = await fetch(`${webServerAddress}/comment`, {
            method: "GET",
        });

        if (response.ok) {
            const result = await response.json();
            console.log("Comments retrieved successfully:", result);
            return result;
        } else {
            console.error("Comments retrieval failed:", response.status, response.statusText);
        }
    } catch (error) {
        console.error("Error occurred:", error);
    }
}


async function displayComments(comments) {
    const commentListContainer = document.getElementById("comment-list");
    commentListContainer.innerHTML = ""; // Efface l'ancienne liste

    const ul = document.createElement("ul");

    comments.forEach(comment => {
        const li = document.createElement("li");
        li.textContent = comment.message;
        ul.appendChild(li);
    });

    commentListContainer.appendChild(ul);
}


//traduction de la recette
  const modal = document.getElementById('modal-traduction');
  const closeModalBtn = document.getElementById('close-modal');
  const form = document.getElementById('form-traduction');
  const recetteIdInput = document.getElementById('recette-id');

  // Charger les recettes dynamiquement
  async function chargerRecettes() {
    const res = await fetch('http://localhost:8080/recipes');
    const recettes = await res.json();
    const container = document.querySelector('.flex.flex-wrap');

    recettes.forEach(recette => {
      const card = document.createElement('div');
      card.className = "w-full sm:w-[300px] bg-white rounded-xl shadow-lg overflow-hidden transform transition-all hover:scale-105 hover:shadow-xl hover:bg-gradient-to-r from-green-100 to-green-200 duration-300";

      card.innerHTML = `
        <div class="relative">
          <img src="${recette.imageURL || 'https://via.placeholder.com/300'}" alt="Image" class="w-full h-48 object-cover">
        </div>
        <div class="px-4 py-4">
          <h2 class="text-lg font-semibold text-gray-800 mb-2">${recette.name}</h2>
          <p class="text-gray-600 text-xs mb-4">${recette.description || 'Recette à découvrir !'}</p>
          <button data-id="${recette.id}" data-name="${recette.name}" class="btn-traduire bg-red-200 text-gray-700 py-1 px-4 rounded-full hover:bg-blue-500 text-xs transition">
            Traduire
          </button>
        </div>
      `;
      container.appendChild(card);
    });

    // Attacher les événements aux boutons "Traduire"
    document.querySelectorAll('.btn-traduire').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.dataset.id;
        const name = btn.dataset.name;

        // Préremplir
        recetteIdInput.value = id;
        document.getElementById('trad-name').value = name;
        document.getElementById('trad-ingredients').value = '';
        document.getElementById('trad-steps').value = '';
        document.getElementById('trad-without').value = '';

        modal.classList.remove('hidden');
      });
    });
  }

  closeModalBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = recetteIdInput.value;
    const name = document.getElementById('trad-name').value;
    const ingredients = document.getElementById('trad-ingredients').value
      .split("\n")
      .map(l => {
        const [quantity, ...rest] = l.trim().split(" ");
        const type = rest.pop();
        const name = rest.join(" ");
        return { quantity, name, type };
      });

    const steps = document.getElementById('trad-steps').value.split("\n").map(s => s.trim());
    const Without = document.getElementById('trad-without').value.split(",").map(w => w.trim());

    const res = await fetch(`http://localhost:8080/recipes/${id}/traduction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, ingredients, steps, Without })
    });

    if (res.ok) {
      alert("✅ Traduction enregistrée !");
      modal.classList.add('hidden');
    } else {
      alert("❌ Erreur lors de l'enregistrement.");
    }
  });

  // Charger les recettes à l'ouverture
  chargerRecettes();