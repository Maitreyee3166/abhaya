
const socket = io();

const bell = document.getElementById("bell");
const count = document.getElementById("count");
const notificationBox = document.getElementById("notificationBox");
let isOpen = false;

socket.on("sosSent", (sos) => {

    // console.log("it is working");
    

    // Increase notification count
    count.textContent = Number(count.textContent) + 1;

    // Store the notification
    notificationBox.innerHTML += `
        <div class="alert alert-success">
            <strong>SOS Alert</strong><br>
            ${sos.user} has sent an SOS alert.
        </div>`;
});

// Show notifications when the bell is clicked
bell.addEventListener("click", () => {

    if (notificationBox.style.display === "none") {
        notificationBox.style.display = "block";
        count.textContent = 0;
    } else {
        notificationBox.style.display = "none";
    }

});
