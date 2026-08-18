document.addEventListener("DOMContentLoaded", function () {

    const aiButton = document.getElementById("aiButton");
    const aiChat = document.getElementById("aiChat");
    const closeAI = document.getElementById("closeAI");
    const aiForm = document.getElementById("aiForm");
    const aiInput = document.getElementById("aiInput");


    // Open chat
    aiButton.addEventListener("click", function () {

        aiChat.classList.add("active");

        aiInput.focus();

    });


    // Close chat ONLY when X is clicked
    closeAI.addEventListener("click", function () {

        aiChat.classList.remove("active");

    });


    // Send message
    aiForm.addEventListener("submit", async function (e) {

        // ⭐ Prevent page reload
        e.preventDefault();

        const message = aiInput.value.trim();

        if (!message) return;


        // Show user message
        const userMessage = document.createElement("div");

        userMessage.className = "user-message";

        userMessage.innerText = message;

        document.getElementById("aiMessages")
            .appendChild(userMessage);


        // Clear input
        aiInput.value = "";


        // IMPORTANT:
        // Do NOT close aiChat here.


        // Call AI backend
        try {

            const response = await fetch("/chat/api", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    message: message
                })

            });


            const data = await response.json();


            // Show AI response
            const aiMessage = document.createElement("div");

            aiMessage.className = "ai-message";

            aiMessage.innerText =
                data.reply || "Sorry, I couldn't generate a response.";

            document.getElementById("aiMessages")
                .appendChild(aiMessage);


        } catch (error) {

            console.error(error);

        }

    });

});