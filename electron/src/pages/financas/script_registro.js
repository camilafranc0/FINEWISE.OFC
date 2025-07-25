const dados = [
  { titulo: "Mercado", desc: "Compra feita dia 02.05.2025", preco: "300,00" },
  { titulo: "Conta de Luz", desc: "Conta de 20.04.2025", preco: "80.00" },
  {
    titulo: "Material Escolar",
    desc: "Compra feita 12.02.2025",
    preco: "150.00",
  },
  { titulo: "Uniforme", desc: "Compra feita 11.02.2025", preco: "68.00" },
  {
    titulo: "Aluguel",
    desc: "Pagamento referente a 01.01.2025",
    preco: "850.00",
  },
];

let salarioTotal = 0;
let despesasAtuais = [];

const cardsContainer = document.getElementById('cards');

function toggleSalaryInput() {
  const inputContainer = document.getElementById("salary-input-container");
  inputContainer.style.display = inputContainer.style.display === "none" ? "block" : "none";
}

function updateSalary() {
  const newSalary = document.getElementById("new-salary").value;
  if (newSalary && !isNaN(newSalary)) {
    salarioTotal = parseFloat(newSalary);
    document.getElementById("salary-input-container").style.display = "none";

    // Atualiza salário no banco de dados
    window.api.atualizarSalario({
      id: 1, // Substitua por id do usuário logado
      novoSalario: salarioTotal
    }).then(() => {
      atualizarSalarioRestante();
    }).catch(err => {
      alert("Erro ao atualizar salário: " + err);
    });

  } else {
    alert("Por favor, insira um valor válido.");
  }
}


function atualizarSalarioRestante() {
  const totalGastos = despesasAtuais.reduce((soma, item) => soma + parseFloat(item.valor), 0);
  const restante = salarioTotal - totalGastos;

  document.getElementById("salary-amount").textContent = `R$ ${restante.toFixed(2).replace('.', ',')}`;
}


async function carregarDespesas() {
  try {
    const despesas = await window.api.listarDespesas(1); // Substituir pelo id do usuário logado
    despesasAtuais = despesas;

    cardsContainer.innerHTML = ''; // Limpa os cards

    despesas.forEach(dado => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-content">
          <h3>${dado.titulo}</h3>
          <p>${dado.descricao}</p>
        </div>
        <div class="card-right">
          <p><strong>R$ ${dado.valor.toFixed(2).replace('.', ',')}</strong></p>
          <span class="favorite">❤</span>
        </div>
      `;
      cardsContainer.appendChild(card);
    });

    calcularTotalGastos(despesas);
    atualizarSalarioRestante();
  } catch (err) {
    alert("Erro ao carregar despesas: " + err);
  }
}

function calcularTotalGastos(lista) {
  const total = lista.reduce((soma, item) => soma + parseFloat(item.valor), 0);
  const totalFormatado = total.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  document.getElementById("total-gastos").textContent = totalFormatado;
}

document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("financeModal");
  const openBtn = document.querySelector(".add-button");
  const closeBtn = document.querySelector(".close");

  openBtn.addEventListener("click", () => {
    modal.style.display = "block";
  });

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }

  window.api.buscarSalario(1).then(salario => {
  salarioTotal = parseFloat(salario) || 0;
  document.getElementById("salary-amount").textContent = `R$ ${salarioTotal.toFixed(2).replace('.', ',')}`;
  atualizarSalarioRestante();
});

  });

  document.getElementById("financeForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const category = document.getElementById("category").value;
    const value = parseFloat(document.getElementById("value").value);

    const despesa = {
      titulo: title,
      descricao: description,
      categoria: category,
      valor: value,
      id_usuario: 1 // Substituir pelo id do usuário logado
    };

    try {
      await window.api.cadastrarDespesa(despesa);
      alert("Despesa cadastrada com sucesso!");
      this.reset();
      modal.style.display = "none";
      carregarDespesas();
    } catch (error) {
      alert("Erro ao cadastrar despesa: " + error);
    }
  });

  carregarDespesas();
});
