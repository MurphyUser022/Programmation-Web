const webServerAddress = "http://localhost:8080";
//alert("Ceci est un test !");

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
  
        const formData = new FormData(loginForm);
        const username = formData.get("username");
        const password = formData.get("password");
  
        try {
          const response = await fetch("http://localhost:8080/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({ username, password }),
            credentials: "include" 
          });
  
          const text = await response.text();
  
          try {
            const result = JSON.parse(text);
  
            if (result.success) {
              alert("Connexion réussie !");
              window.location.href = "dashboard.html";
            } else {
              alert("Erreur : " + (result.message || "Échec de la connexion"));
            }
  
          } catch (err) {
            console.error("Réponse non-JSON :", text);
            alert("Erreur serveur : " + text);
          }
  
        } catch (error) {
          console.error("Erreur de connexion :", error);
          alert("Une erreur s'est produite lors de la connexion.");
        }
      });
    }
  });

  // FORMULAIRE D'INSCRIPTION
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(registerForm);
      const username = formData.get("username");
      const password = formData.get("password");

      console.log("📨 Envoi des données :", { username, password });

      try {
        const response = await fetch("http://localhost:8080/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ username, password }),
        });

        const result = await response.text();
        console.log(" Réponse:", result);

        if (result.includes("successfully")) {
          alert("Inscription réussie !");
          window.location.href = "index.html";
        } else {
          alert("Erreur: " + result);
        }
      } catch (error) {
        console.error("Erreur inscription:", error);
        alert("Une erreur s'est produite lors de l'inscription.");
      }
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

