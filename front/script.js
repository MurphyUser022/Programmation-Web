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

// Demande de rôle
if (document.getElementById("request-role-btn")) {
    document.getElementById("request-role-btn").addEventListener("click", async () => {
      const role = document.getElementById("requested-role").value;
  
      const res = await fetch(`${webServerAddress}/roles/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
  
      if (res.ok) {
        alert("✅ Demande envoyée !");
      } else {
        const error = await res.json();
        alert("❌ Erreur : " + (error.message || "Impossible d'envoyer la demande"));
      }
    });
  }
  
    
    // Admin : approuver ou assigner un rôle
    async function updateUserRole(userId, role, action) {
    const endpoint = `${webServerAddress}/roles/${userId}/${action}`;
    const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role })
    });
    
    if (res.ok) {
    alert("✅ Rôle mis à jour avec succès !");
    location.reload();
    } else {
    alert("❌ Erreur lors de la mise à jour du rôle.");
    }
    }
    
    // Contrôle d'accès selon le rôle requis
    async function checkUserRole(requiredRole) {
    try {
    const res = await fetch(`${webServerAddress}/auth/check-role`, {
    method: "GET",
    credentials: "include",
    });
    
    if (!res.ok) {
      alert("Non autorisé");
      window.location.href = "index.html";
      return;
    }
    
    const data = await res.json();
    if (!data.roles.includes(requiredRole)) {
      alert("Accès refusé pour le rôle requis");
      window.location.href = "index.html";
    }
    
    } catch (error) {
    console.error("Erreur de vérification du rôle :", error);
    window.location.href = "index.html";
    }
    }
    
    
    async function getUsers() {
        try {
          const res = await fetch(`${webServerAddress}/users`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
      
          if (res.ok) {
            return await res.json();
          } else {
            console.error("Échec de récupération des utilisateurs");
            return [];
          }
        } catch (err) {
          console.error("Erreur lors du chargement des utilisateurs :", err);
          return [];
        }
      }
      
      async function afficherUsers() {
        const users = await getUsers();
        const tbody = document.getElementById("users-table");
        tbody.innerHTML = "";
      
        users.forEach((user) => {
          const tr = document.createElement("tr");
      
          tr.innerHTML = `
            <td class="border px-4 py-2">${user.username || "N/A"}</td>
            <td class="border px-4 py-2">${user.email || user.username || "N/A"}</td>
            <td class="border px-4 py-2">${(user.roles || []).join(", ")}</td>
            <td class="border px-4 py-2">
              <button class="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
                onclick="updateUserRole(${user.id}, 'traducteur', 'approve')">Approuver</button>
            </td>
          `;
      
          tbody.appendChild(tr);
        });
      }
      
      // Appel automatique à l'ouverture de la page
      if (document.getElementById("users-table")) {
        afficherUsers();
      }