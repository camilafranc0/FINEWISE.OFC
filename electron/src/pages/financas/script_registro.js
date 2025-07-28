// Variáveis globais
let salarioTotal = 0;
let despesasAtuais = [];
let todasDespesas = []; // Armazenará todas as despesas para filtragem
let categoriaAtiva = "Todas"; // Nova variável para controlar o filtro ativo

// Elementos da página
const cardsContainer = document.getElementById("cards");
const logoutBtn = document.getElementById("logout-btn");
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const btnAtualizar = document
  .getElementById("btn-atualizar")
  .addEventListener("click", toggleSalaryInput);
const btnSalvar = document
  .getElementById("btn-salvar")
  .addEventListener("click", updateSalary);

// Inicialização quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", async function () {
  // Verificar se o usuário está logado
  const idUsuarioLogado = localStorage.getItem("idUsuarioLogado");
  if (!idUsuarioLogado) {
    alert("Você precisa fazer login primeiro!");
    window.location.href = "../login/index.html";
    return;
  }

  // Configurar evento de logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  // Configurar modal de cadastro de despesas
  configurarModal();

  try {
    // Carregar dados iniciais
    await carregarDadosIniciais();

    // Configurar eventos após carregar os dados
    configurarEventos();
  } catch (error) {
    console.error("Erro ao inicializar:", error);
    alert("Erro ao carregar dados financeiros");
  }
});

// Função para carregar dados iniciais
async function carregarDadosIniciais() {
  const idUsuarioLogado = parseInt(localStorage.getItem("idUsuarioLogado"));

  // Carregar salário do usuário
  const salario = await window.api.buscarSalario(idUsuarioLogado);
  salarioTotal = parseFloat(salario) || 0;
  atualizarExibicaoSalario();

  // Carregar despesas do usuário
  await carregarDespesas();

  // Atualizar cálculos
  atualizarCalculosFinanceiros();
}

// Função para configurar o modal
function configurarModal() {
  const modal = document.getElementById("financeModal");
  const openBtn = document.querySelector(".add-button");
  const closeBtn = document.querySelector(".close");
  const form = document.getElementById("financeForm");

  function resetarModalParaCadastro() {
    form.reset();
    delete form.dataset.editingId;
    document.getElementById("modal-title").textContent = "Cadastrar Finanças";
    document.getElementById("modal-action-button").textContent = "Salvar";
  }

  function limparEFecharModal() {
    resetarModalParaCadastro();
    modal.style.display = "none";
  }

  openBtn?.addEventListener("click", () => {
    resetarModalParaCadastro();
    modal.style.display = "block";
  });

  closeBtn?.addEventListener("click", limparEFecharModal);

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      limparEFecharModal();
    }
  });

  form?.addEventListener("submit", async function (e) {
    e.preventDefault();
    await cadastrarNovaDespesa(this);
    limparEFecharModal();
  });
}

// Função para cadastrar nova despesa
async function cadastrarNovaDespesa(form) {
  const idUsuarioLogado = parseInt(localStorage.getItem("idUsuarioLogado"));

  const despesa = {
    titulo: form.title.value,
    descricao: form.description.value,
    categoria: form.category.value,
    valor: parseFloat(form.value.value),
    id_usuario: idUsuarioLogado,
  };

  try {
    if (form.dataset.editingId) {
      despesa.id = form.dataset.editingId;
      await window.api.editarDespesa(despesa);
    } else {
      await window.api.cadastrarDespesa(despesa);
    }

    // Fechar o modal primeiro
    document.getElementById("financeModal").style.display = "none";

    // Limpar os campos e resetar o formulário
    form.reset();
    delete form.dataset.editingId;

    // Atualizar a lista e cálculos
    await carregarDespesas();
    atualizarCalculosFinanceiros();
  } catch (error) {
    console.error("Erro ao cadastrar/editar despesa:", error);
    alert("Erro ao cadastrar/editar despesa: " + error.message);
  }
}

// Função para carregar despesas (atualizada)
async function carregarDespesas() {
  try {
    const idUsuarioLogado = parseInt(localStorage.getItem("idUsuarioLogado"));
    todasDespesas = await window.api.listarDespesas(idUsuarioLogado);

    // Aplicar filtro ativo se houver
    if (categoriaAtiva && categoriaAtiva !== "Todas") {
      despesasAtuais = todasDespesas.filter(
        (d) => d.categoria === categoriaAtiva
      );
    } else {
      despesasAtuais = [...todasDespesas];
    }

    atualizarListaDespesas();
  } catch (err) {
    console.error("Erro ao carregar despesas:", err);
    throw err;
  }
}

async function excluirDespesa(id) {
  try {
    const confirmacao = confirm("Tem certeza que deseja excluir esta despesa?");
    if (!confirmacao) return;

    await window.api.excluirDespesa(id);
    await carregarDespesas();
    atualizarCalculosFinanceiros();
  } catch (error) {
    console.error("Erro ao excluir despesa:", error);
    alert("Erro ao excluir despesa");
  }
}

function abrirModalEdicao(despesa) {
  const modal = document.getElementById("financeModal");
  const form = document.getElementById("financeForm");
  
  // Resetar o modal completamente antes de preencher
  form.reset();
  delete form.dataset.editingId;
  
  // Preencher com os dados da despesa
  form.title.value = despesa.titulo || "";
  form.description.value = despesa.descricao || "";
  form.category.value = despesa.categoria || "";
  form.value.value = despesa.valor || "";
  
  // Configurar para modo edição
  document.getElementById("modal-title").textContent = "Editar Despesa";
  document.getElementById("modal-action-button").textContent = "Atualizar";
  form.dataset.editingId = despesa.id;
  
  modal.style.display = "block";
}

// Nova função para filtrar despesas por termo de busca
function filtrarDespesas(termo) {
  if (!termo || termo.trim() === "") {
    // Se não há termo, aplica apenas o filtro de categoria
    if (categoriaAtiva && categoriaAtiva !== "Todas") {
      despesasAtuais = todasDespesas.filter(
        (d) => d.categoria === categoriaAtiva
      );
    } else {
      despesasAtuais = [...todasDespesas];
    }
  } else {
    const termoLower = termo.toLowerCase();
    // Aplica filtro combinado (categoria + busca)
    despesasAtuais = todasDespesas.filter(
      (despesa) =>
        (categoriaAtiva === "Todas" || despesa.categoria === categoriaAtiva) &&
        (despesa.titulo.toLowerCase().includes(termoLower) ||
          (despesa.descricao &&
            despesa.descricao.toLowerCase().includes(termoLower)) ||
          despesa.categoria.toLowerCase().includes(termoLower))
    );
  }
  atualizarListaDespesas();
  atualizarCalculosFinanceiros();
}

// Nova função para filtrar por categoria
async function filtrarPorCategoria(categoria) {
  try {
    const idUsuarioLogado = parseInt(localStorage.getItem("idUsuarioLogado"));
    categoriaAtiva = categoria;

    // Aplicar filtro localmente (mais rápido que chamar o banco novamente)
    if (categoria === "Todas") {
      despesasAtuais = [...todasDespesas];
    } else {
      despesasAtuais = todasDespesas.filter((d) => d.categoria === categoria);
    }

    atualizarListaDespesas();
    atualizarCalculosFinanceiros();
  } catch (error) {
    console.error("Erro ao filtrar por categoria:", error);
    alert("Erro ao filtrar despesas");
  }
}

// Função para limpar todos os filtros
async function limparFiltros() {
  // Remover classe ativa de todos os botões
  document
    .querySelectorAll(".left-buttons button")
    .forEach((btn) => btn.classList.remove("active"));

  // Resetar categoria ativa
  categoriaAtiva = "Todas";

  // Resetar busca
  if (searchInput) searchInput.value = "";

  // Recarregar despesas sem filtros
  await carregarDespesas();
  await atualizarCalculosFinanceiros()
}

// Nova função para atualizar a lista de despesas na tela
function atualizarListaDespesas() {
  cardsContainer.innerHTML = "";

  if (despesasAtuais.length === 0) {
    cardsContainer.innerHTML =
      '<p class="no-results">Nenhuma despesa encontrada</p>';
    return;
  }

  despesasAtuais.forEach((dado) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
            <div class="card-content">
                <h3 >${dado.titulo}</h3>
                <p class="textJS">${dado.descricao}</p>
                <small class="card-category"><span class= "categoriaText">Categoria:</span> ${dado.categoria}</small>
            </div>
            <div class="card-right">
                <p><strong>R$ ${dado.valor
                  .toFixed(2)
                  .replace(".", ",")}</strong></p>
                <div class="card-actions">
                    <button class="edit-btn" data-id="${
                      dado.id
                    }"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" data-id="${
                      dado.id
                    }"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    cardsContainer.appendChild(card);
  });

  // Adicionar event listeners para os novos botões
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.currentTarget.getAttribute("data-id");
      await excluirDespesa(id);
    });
  });

  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.getAttribute("data-id");
      const despesa = despesasAtuais.find((d) => d.id == id);
      abrirModalEdicao(despesa);
    });
  });
}

// Função para atualizar salário
async function updateSalary() {
  try {
    const newSalaryInput = document.getElementById("new-salary");
    const newSalary = parseFloat(newSalaryInput.value);

    // Validação do valor inserido
    if (isNaN(newSalary) || newSalary <= 0) {
      alert("Por favor, insira um valor válido para o salário.");
      return;
    }

    const idUsuarioLogado = parseInt(localStorage.getItem("idUsuarioLogado"));

    // Atualizar no banco de dados
    await window.api.atualizarSalario({
      id: idUsuarioLogado,
      novoSalario: newSalary,
    });

    // Atualizar variáveis e exibição
    salarioTotal = newSalary;
    atualizarExibicaoSalario();
    atualizarCalculosFinanceiros();

    // Resetar o campo de input
    newSalaryInput.value = "";
    document.getElementById("salary-input-container").style.display = "none";

    console.log("Salário atualizado com sucesso para:", newSalary);
  } catch (err) {
    console.error("Erro ao atualizar salário:", err);
    alert("Erro ao atualizar salário: " + err.message);
  }
}

// Função para atualizar cálculos financeiros
function atualizarCalculosFinanceiros() {
  calcularTotalGastos();
  atualizarSalarioRestante();
}

// Função para calcular total de gastos
function calcularTotalGastos() {
  const total = despesasAtuais.reduce(
    (soma, item) => soma + parseFloat(item.valor),
    0
  );
  const totalFormatado = total.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  document.getElementById("total-gastos").textContent = totalFormatado;
}

// Função para atualizar salário restante
function atualizarSalarioRestante() {
  const totalGastos = despesasAtuais.reduce(
    (soma, item) => soma + parseFloat(item.valor),
    0
  );
  const restante = salarioTotal - totalGastos;
  document.getElementById("salary-remaining").textContent = `R$ ${restante
    .toFixed(2)
    .replace(".", ",")}`;
}

// Função para atualizar exibição do salário
function atualizarExibicaoSalario() {
  document.getElementById("salary-amount").textContent = `R$ ${salarioTotal
    .toFixed(2)
    .replace(".", ",")}`;
}

// Função para logout
function logout() {
  localStorage.removeItem("idUsuarioLogado");
  window.location.href = "../login/index.html";
}

// Função para toggle do input de salário
function toggleSalaryInput() {
  const inputContainer = document.getElementById("salary-input-container");
  inputContainer.style.display =
    inputContainer.style.display === "none" ? "block" : "none";
}

// Configurar eventos após carregar os dados
function configurarEventos() {
  // Configurar evento de atualização de salário
  const saveSalaryBtn = document.querySelector(".save-salary-button");
  if (saveSalaryBtn) {
    saveSalaryBtn.addEventListener("click", updateSalary);
  }

  // Configurar evento de toggle do input de salário
  const incomeButton = document.querySelector(".income-button");
  if (incomeButton) {
    incomeButton.addEventListener("click", toggleSalaryInput);
  }

  // Configurar evento de busca
  if (searchButton) {
    searchButton.addEventListener("click", () => {
      filtrarDespesas(searchInput.value);
    });
  }

  // Configurar busca ao pressionar Enter
  if (searchInput) {
    searchInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        filtrarDespesas(searchInput.value);
      }
    });
  }

  // Configurar filtros por categoria
  const botoesCategoria = document.querySelectorAll(
    ".left-buttons button:not(.arrow-button)"
  );
  botoesCategoria.forEach((botao) => {
    botao.addEventListener("click", () => {
      // Remover classe ativa de todos os botões
      botoesCategoria.forEach((btn) => btn.classList.remove("active"));

      // Adicionar classe ativa ao botão clicado
      botao.classList.add("active");

      // Filtrar despesas
      filtrarPorCategoria(botao.textContent.trim());
      
    });
  });

  // Configurar botão limpar filtro
  const limparFiltroBtn = document.querySelector(".arrow-button");
  if (limparFiltroBtn) {
    limparFiltroBtn.addEventListener("click", limparFiltros);
    
  }
}
