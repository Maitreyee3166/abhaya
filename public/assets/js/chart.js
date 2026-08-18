// Users by Role
new Chart(document.getElementById("usersChart"), {
    type: "doughnut",
    data: {
        labels: [
            "Women Users",
            "Parents/Guardians",
            "Police",
            "Others"
        ],
        datasets: [{
            data: [1452, 512, 210, 284],
            backgroundColor: [
                "#7c4dff",
                "#42a5f5",
                "#2ecc71",
                "#f39c12"
            ],
            borderWidth: 0
        }]
    },
    options: {
        cutout: "70%",
        plugins: {
            legend: {
                position: "right"
            }
        }
    }
});

// Incident Reports
new Chart(document.getElementById("incidentChart"), {
    type: "doughnut",
    data: {
        labels: [
            "Harassment",
            "Stalking",
            "Unsafe Area",
            "Other"
        ],
        datasets: [{
            data: [42, 18, 15, 14],
            backgroundColor: [
                "#ff5252",
                "#f9a825",
                "#42a5f5",
                "#2ecc71"
            ],
            borderWidth: 0
        }]
    },
    options: {
        cutout: "70%",
        plugins: {
            legend: {
                position: "right"
            }
        }
    }
});