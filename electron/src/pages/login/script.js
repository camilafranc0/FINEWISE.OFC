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

async function login() {
    // Limpar mensagens de erro anteriores
    document.getElementById("email-error").textContent = "";
    document.getElementById("password-error").textContent = "";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const remember = document.getElementById("remember").checked;

    // Validação básica dos campos
    if (!email) {
        document.getElementById("email-error").textContent = "O e-mail é obrigatório!";
        return;
    }

    if (!validateEmail(email)) {
        document.getElementById("email-error").textContent = "E-mail inválido!";
        return;
    }

    if (!password) {
        document.getElementById("password-error").textContent = "A senha é obrigatória!";
        return;
    }

    if (password.length < 6) {
        document.getElementById("password-error").textContent = "A senha deve ter pelo menos 6 caracteres!";
        return;
    }

    try {
        // Mostrar indicador de carregamento (opcional)
        const loginBtn = document.getElementById("login-btn");
        loginBtn.disabled = true;
        loginBtn.textContent = "Autenticando...";

        // Fazer a chamada para a API de login
        const usuario = await window.api.fazerLogin({ email, senha: password });

        if (!usuario) {
            throw new Error("Credenciais inválidas");
        }

        // Armazenar informações do usuário
        localStorage.setItem('idUsuarioLogado', usuario.id_usuario);
        
        if (remember) {
            localStorage.setItem("email", email);
            localStorage.setItem("password", password);
        } else {
            localStorage.removeItem("email");
            localStorage.removeItem("password");
        }

        // Redirecionar para a página principal
        window.location.href = "../financas/registros.html";

    } catch (error) {
        console.error("Erro no login:", error);
        
        // Mostrar mensagem de erro adequada
        if (error.message.includes("Credenciais inválidas")) {
           alert("E-mail ou senha incorretos. Tente novamente.");
            
        } else if (error.message.includes("timeout")) {
            alert("A conexão com o servidor expirou. Verifique sua conexão com a internet e tente novamente.");
        } else {
            alert("Ocorreu um erro ao tentar fazer login. Por favor, tente novamente mais tarde.");
        }
    } finally {
        // Restaurar estado do botão
        const loginBtn = document.getElementById("login-btn");
        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.textContent = "Login";
        }
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}