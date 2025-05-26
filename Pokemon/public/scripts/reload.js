document.addEventListener("DOMContentLoaded", function () {
    var button = document.getElementById("reloadBtn");
    if (button) {
        button.addEventListener("click", function () {
            window.location.reload();
        });
    }
});
