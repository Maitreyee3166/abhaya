
setTimeout(() => {
    const success = document.getElementById("successAlert");
    const error = document.getElementById("errorAlert");

    if (success) {
        success.style.opacity = "0";
        success.style.transform = "translateX(100%)";

        setTimeout(() => success.remove(), 400);
    }

    if (error) {
        error.style.opacity = "0";
        error.style.transform = "translateX(100%)";

        setTimeout(() => error.remove(), 400);
    }
}, 4000);
