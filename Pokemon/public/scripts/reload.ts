document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("reloadBtn");

    if (button) {
        button.addEventListener("click", () => {
            window.location.reload();
        });
    }
});
