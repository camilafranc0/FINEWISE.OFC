

const registerBtn = document.getElementById("register-btn").addEventListener("click", register);

function register() {
    const email = document.getElementById("email").value.trim();
    const fullName = document.getElementById("full-name").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirm-password").value.trim();

    let isValid = true;

  
    if (!email) {
        document.getElementById("email-error").textContent = "O e-mail é obrigatório!";
        isValid = false;
    } else if (!validateEmail(email)) {
        document.getElementById("email-error").textContent = "E-mail inválido!";
        isValid = false;
    } else {
        document.getElementById("email-error").textContent = "";
    }

    
    if (!fullName) {
        document.getElementById("name-error").textContent = "O nome é obrigatório!";
        isValid = false;
    } else {
        document.getElementById("name-error").textContent = "";
    }

    
    if (!username) {
        document.getElementById("username-error").textContent = "O username é obrigatório!";
        isValid = false;
    } else if (username.length < 3) {
        document.getElementById("username-error").textContent = "O username deve ter pelo menos 3 caracteres!";
        isValid = false;
    } else {
        document.getElementById("username-error").textContent = "";
    }

    
    if (!password) {
        document.getElementById("password-error").textContent = "A senha é obrigatória!";
        isValid = false;
    } else if (password.length < 6) {
        document.getElementById("password-error").textContent = "A senha deve ter pelo menos 6 caracteres!";
        isValid = false;
    } else {
        document.getElementById("password-error").textContent = "";
    }

    
    if (!confirmPassword) {
        document.getElementById("confirm-password-error").textContent = "Confirme sua senha!";
        isValid = false;
    } else if (confirmPassword !== password) {
        document.getElementById("confirm-password-error").textContent = "As senhas não coincidem!";
        isValid = false;
    } else {
        document.getElementById("confirm-password-error").textContent = "";
    }

    if (isValid) {
        const usuario = {
        email,
        nome: fullName,
        username,
        senha: password
    };

    window.api.criarUsuario(usuario)
        .then(res => {
            alert("Conta criada com sucesso!");
            window.location.href = "../login/index.html";
        })
        .catch(err => {
            alert("Erro ao criar conta: " + err);
        });
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    field.type = field.type === "password" ? "text" : "password";
}