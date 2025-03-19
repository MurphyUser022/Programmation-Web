// Description: This file contains the JavaScript code for the front-end of the application.

const webServerAddress = "http://localhost:8080";

const form = document.getElementById("post-comment");
// Trigger the getComments function when the form is submitted
form.addEventListener("submit", async (event) => {
	// Prevent the default form submission (page reload)
	event.preventDefault();
	const comments = await sendComment(event);
	event.target.reset();
	await displayComments(comments);
});

const button = document.getElementById("get-comments");
// Trigger the getComments function when the button is clicked
button.addEventListener("click", async () => {
	const comments = await getComments();
	await displayComments(comments);
});

/**
 * This function sends a POST request to the server with the form data to add a new comment.
 * @param {SubmitEvent} event The event that triggered the function
 * @returns {Object} The result of the form submission
 */
async function sendComment(event) {
	const body = new URLSearchParams(new FormData(event.target));

	try {
		// Send a POST request to the server with the form data
		const response = await fetch(`${webServerAddress}/comment`, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			// Serialize the form data to URL-encoded format
			body,
		});

		if (response.ok) {
			// If the request was successful, log the result
			const result = await response.json();
			console.log("Form submitted successfully:", result);
			return result;
		} else {
			console.error(
				"Form submission failed:",
				response.status,
				response.statusText
			);
		}
	} catch (error) {
		console.error("Error occurred:", error);
	}
}

/**
 * This function sends a GET request to the server to retrieve all comments.
 */
async function getComments() {
	try {
		// Send a GET request to the server to retrieve all comments
		const response = await fetch(`${webServerAddress}/comment`, {
			method: "GET",
		});

		if (response.ok) {
			const result = await response.json();
			console.log("Comments retrieved successfully:", result);
			return result;
		} else {
			console.error(
				"Comments retrieval failed:",
				response.status,
				response.statusText
			);
		}
	} catch (error) {
		console.error("Error occurred:", error);
	}
}

/**
 * This function takes the list of comments and displays them in the HTML list inside the div with id="comment-list".
 * @param {Array} comments List of comments to display
 */
async function displayComments(comments) {

    const commentListContainer = document.getElementById("comment-list");

  
    const ul = document.createElement("ul");
	const li = document.createElement("li");
        
	li.innerHTML="";
    comments.forEach(comment => {
        
        li.innerHTML = comment.message;
        
		
	});
	ul.appendChild(li);
	commentListContainer.appendChild(ul);
	// Hints:
	// 1. Create a new unordered list element (ul)
	// 2. Loop through each comment in the list
	// 3. Create a new list item element (li) for each comment
	// 4. Set the innerHTML of the list item to the comment text
	// 5. Append the list item to the unordered list
	// 6. Append the unordered list to the div with id="comment-list"

	// What functions do you need to use here?
	// - document.createElement
	// - document.getElementById
	// - element.appendChild
	// - element.innerHTML
}





form = document.getElementById("signup-form");
// Trigger the getComments function when the form is submitted
form.addEventListener("submit", async (event) => {
    event.preventDefault(); // Empêche le formulaire de soumettre de manière classique

    // Récupération des données du formulaire
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const password = document.getElementById('password').value;
    const job = document.getElementById('state').value;

    // Données à envoyer au serveur
    const formData = {
        first_name: firstName,
        last_name: lastName,
        password: password,
        job: job
    };

    try {
        // Envoi des données au serveur via POST
        const response = await fetch(`${webServerAddress}/save`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Form submitted successfully:', result);
        } else {
            console.error('Form submission failed:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Error occurred:', error);
    }
});





fetch('TpController.php')
.then(response => response.json())
.then(data => {
	document.getElementById('nomUser').textContent = data.NameUser; // Affichage de la variable
})
.catch(error => {
	console.error('Erreur:', error);
});