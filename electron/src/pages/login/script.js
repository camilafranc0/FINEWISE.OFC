document.addEventListener("DOMContentLoaded", function () {
    const savedEmail = localStorage.getItem("email");
    const savedPassword = localStorage.getItem("password");
    if (savedEmail && savedPassword) {
        document.getElementById("email").value = savedEmail;
        document.getElementById("password").value = savedPassword;
        document.getElementById("remember").checked = true;
    }
});

const loginBtn = document.getElementById("login-btn").addEventListener("click", login);

function login() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const remember = document.getElementById("remember").checked;


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

    if (!password) {
        document.getElementById("password-error").textContent = "A senha é obrigatória!";
        isValid = false;
    } else if (password.length < 6) {
        document.getElementById("password-error").textContent = "A senha deve ter pelo menos 6 caracteres!";
        isValid = false;
    } else {
        document.getElementById("password-error").textContent = "";
    }

   if (isValid) {
    const dados = { email, senha: password };

    window.api.fazerLogin(dados)
    .then(usuario => {
      if (usuario) {
        localStorage.setItem('idUsuarioLogado', usuario.id_usuario);
        // Limpar outros dados se necessário
        localStorage.removeItem('despesasCache');
        
        if (remember) {
          localStorage.setItem("email", email);
          localStorage.setItem("password", password);
        } else {
          localStorage.removeItem("email");
          localStorage.removeItem("password");
        }
        
        window.location.href = "../financas/registros.html";
      }
    });
}

}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}
