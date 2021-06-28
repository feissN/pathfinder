// Important! 
// Open/Whitelist chanels in preload.js

document.getElementById("close").addEventListener("click", e => {
    window.api.send("close");
});

document.getElementById("minimize").addEventListener("click", e => {
    window.api.send("minimize");
});