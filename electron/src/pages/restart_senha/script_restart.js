document.getElementById("forgotPasswordForm").addEventListener("submit", function(event) {
    event.preventDefault(); 

    let email = document.getElementById("email").value;

    if (email) {
        alert("Um link de redefinição de senha foi enviado para " + email);
        window.location.href = "../login/index.html"; 
    } else {
        alert("Por favor, insira um email válido.");
    }
});