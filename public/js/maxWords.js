document.addEventListener("DOMContentLoaded", function () {
    const maxChars = 105;
    const aciklama = document.getElementById('aciklama-text');
    const text = aciklama.innerText;

    if (text.length > maxChars) {
        aciklama.innerText = text.slice(0, maxChars) + '...';
    }
});