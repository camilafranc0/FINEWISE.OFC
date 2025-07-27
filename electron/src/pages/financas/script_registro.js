// Variáveis globais
let salarioTotal = 0;
let despesasAtuais = [];
let todasDespesas = []; // Armazenará todas as despesas para filtragem

// Elementos da página
const cardsContainer = document.getElementById('cards');
const logoutBtn = document.getElementById('logout-btn');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const btnAtualizar = document.getElementById('btn-atualizar').addEventListener('click', toggleSalaryInput);
const btnSalvar = document.getElementById('btn-salvar').addEventListener('click', updateSalary);

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', async function() {
    // Verificar se o usuário está logado
    const idUsuarioLogado = localStorage.getItem('idUsuarioLogado');
    if (!idUsuarioLogado) {
        alert('Você precisa fazer login primeiro!');
        window.location.href = '../login/index.html';
        return;
    }

    // Configurar evento de logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Configurar modal de cadastro de despesas
    configurarModal();

    try {
        // Carregar dados iniciais
        await carregarDadosIniciais();
        
        // Configurar eventos após carregar os dados
        configurarEventos();
    } catch (error) {
        console.error('Erro ao inicializar:', error);
        alert('Erro ao carregar dados financeiros');
    }
});

// Função para carregar dados iniciais
async function carregarDadosIniciais() {
    const idUsuarioLogado = parseInt(localStorage.getItem('idUsuarioLogado'));
    
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
    const modal = document.getElementById('financeModal');
    const openBtn = document.querySelector('.add-button');
    const closeBtn = document.querySelector('.close');

    openBtn?.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    closeBtn?.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Configurar submit do formulário
    document.getElementById('financeForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        await cadastrarNovaDespesa(this);
    });
}

// Função para cadastrar nova despesa
async function cadastrarNovaDespesa(form) {
    const idUsuarioLogado = parseInt(localStorage.getItem('idUsuarioLogado'));
    
    const despesa = {
        titulo: form.title.value,
        descricao: form.description.value,
        categoria: form.category.value,
        valor: parseFloat(form.value.value),
        id_usuario: idUsuarioLogado
    };

    try {
        await window.api.cadastrarDespesa(despesa);
        form.reset();
        document.getElementById('financeModal').style.display = 'none';
        await carregarDespesas();
        atualizarCalculosFinanceiros();
    } catch (error) {
        console.error('Erro ao cadastrar despesa:', error);
        alert('Erro ao cadastrar despesa: ' + error.message);
    }
}

// Função para carregar despesas (atualizada)
async function carregarDespesas() {
    try {
        const idUsuarioLogado = parseInt(localStorage.getItem('idUsuarioLogado'));
        todasDespesas = await window.api.listarDespesas(idUsuarioLogado);
        despesasAtuais = [...todasDespesas]; // Cópia para filtragem
        
        atualizarListaDespesas();
    } catch (err) {
        console.error('Erro ao carregar despesas:', err);
        throw err;
    }
}

// Nova função para filtrar despesas
function filtrarDespesas(termo) {
    if (!termo || termo.trim() === "") {
        despesasAtuais = [...todasDespesas];
    } else {
        const termoLower = termo.toLowerCase();
        despesasAtuais = todasDespesas.filter(despesa => 
            despesa.titulo.toLowerCase().includes(termoLower) ||
            (despesa.descricao && despesa.descricao.toLowerCase().includes(termoLower)) ||
            despesa.categoria.toLowerCase().includes(termoLower)
        );
    }
    atualizarListaDespesas();
    atualizarCalculosFinanceiros();
}

// Nova função para atualizar a lista de despesas na tela
function atualizarListaDespesas() {
    cardsContainer.innerHTML = "";

    if (despesasAtuais.length === 0) {
        cardsContainer.innerHTML = '<p class="no-results">Nenhuma despesa encontrada</p>';
        return;
    }

    despesasAtuais.forEach(dado => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-content">
                <h3>${dado.titulo}</h3>
                <p>${dado.descricao}</p>
                <small class="card-category">${dado.categoria}</small>
            </div>
            <div class="card-right">
                <p><strong>R$ ${dado.valor.toFixed(2).replace('.', ',')}</strong></p>
                
            </div>
        `;
        cardsContainer.appendChild(card);
    });
}

// Função para atualizar salário
async function updateSalary() {
    try {
        const newSalaryInput = document.getElementById('new-salary');
        const newSalary = parseFloat(newSalaryInput.value);

        // Validação do valor inserido
        if (isNaN(newSalary) || newSalary <= 0) {
            alert('Por favor, insira um valor válido para o salário.');
            return;
        }

        const idUsuarioLogado = parseInt(localStorage.getItem('idUsuarioLogado'));
        
        // Atualizar no banco de dados
        await window.api.atualizarSalario({
            id: idUsuarioLogado,
            novoSalario: newSalary
        });

        // Atualizar variáveis e exibição
        salarioTotal = newSalary;
        atualizarExibicaoSalario();
        atualizarCalculosFinanceiros();
        
        // Resetar o campo de input
        newSalaryInput.value = '';
        document.getElementById('salary-input-container').style.display = 'none';
        
        console.log('Salário atualizado com sucesso para:', newSalary);
    } catch (err) {
        console.error('Erro ao atualizar salário:', err);
        alert('Erro ao atualizar salário: ' + err.message);
    }
}

// Função para atualizar cálculos financeiros
function atualizarCalculosFinanceiros() {
    calcularTotalGastos();
    atualizarSalarioRestante();
}

// Função para calcular total de gastos
function calcularTotalGastos() {
    const total = despesasAtuais.reduce((soma, item) => soma + parseFloat(item.valor), 0);
    const totalFormatado = total.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
    document.getElementById('total-gastos').textContent = totalFormatado;
}

// Função para atualizar salário restante
function atualizarSalarioRestante() {
    const totalGastos = despesasAtuais.reduce((soma, item) => soma + parseFloat(item.valor), 0);
    const restante = salarioTotal - totalGastos;
    document.getElementById('salary-remaining').textContent = `R$ ${restante.toFixed(2).replace('.', ',')}`;
}

// Função para atualizar exibição do salário
function atualizarExibicaoSalario() {
    document.getElementById('salary-amount').textContent = `R$ ${salarioTotal.toFixed(2).replace('.', ',')}`;
}

// Função para logout
function logout() {
    localStorage.removeItem('idUsuarioLogado');
    window.location.href = '../login/index.html';
}

// Função para toggle do input de salário
function toggleSalaryInput() {
    const inputContainer = document.getElementById('salary-input-container');
    inputContainer.style.display = inputContainer.style.display === 'none' ? 'block' : 'none';
}

// Configurar eventos após carregar os dados
function configurarEventos() {
    // Configurar evento de atualização de salário
    const saveSalaryBtn = document.querySelector('.save-salary-button');
    if (saveSalaryBtn) {
        saveSalaryBtn.addEventListener('click', updateSalary);
    }
    
    // Configurar evento de toggle do input de salário
    const incomeButton = document.querySelector('.income-button');
    if (incomeButton) {
        incomeButton.addEventListener('click', toggleSalaryInput);
    }
    
    // Configurar evento de busca
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            filtrarDespesas(searchInput.value);
        });
    }
    
    // Configurar busca ao pressionar Enter
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                filtrarDespesas(searchInput.value);
            }
        });
    }
}