const dados = [
    { titulo: 'Mercado', desc: 'Compra feita dia 02.05.2025', preco: '300,00' },
    { titulo: 'Conta de Luz', desc: 'Conta de 20.04.2025', preco: '80.00' },
    { titulo: 'Material Escolar', desc: 'Compra feita 12.02.2025', preco: '150.00' },
    { titulo: 'Uniforme', desc: 'Compra feita 11.02.2025', preco: '68.00' },
    { titulo: 'Aluguel', desc: 'Pagamento referente a 01.01.2025', preco: '850.00' }
  ];
  
  const cardsContainer = document.getElementById('cards');
  
  dados.forEach(dado => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
    
      <div class="card-content">
        <h3>${dado.titulo}</h3>
        <p>${dado.desc}</p>
    
      </div>
      <div class="card-right">
        <p><strong>$${dado.preco}</strong></p>
        <span class="favorite">❤</span>
      </div>
    `;
    cardsContainer.appendChild(card);
  });

  function toggleSalaryInput() {
    const inputContainer = document.getElementById("salary-input-container");
    inputContainer.style.display = inputContainer.style.display === "none" ? "block" : "none";
  }
  
  function updateSalary() {
    const newSalary = document.getElementById("new-salary").value;
    if (newSalary && !isNaN(newSalary)) {
      document.getElementById("salary-amount").textContent = `$ ${parseFloat(newSalary).toFixed(2)}`;
      document.getElementById("salary-input-container").style.display = "none";
    } else {
      alert("Por favor, insira um valor válido.");
    }
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
    });
  
    document.getElementById("financeForm").addEventListener("submit", function (e) {
      e.preventDefault();
      const title = document.getElementById("title").value;
      const description = document.getElementById("description").value;
      const category = document.getElementById("category").value;
      const value = document.getElementById("value").value;
  
      // Aqui você pode adicionar lógica para salvar ou exibir os dados.
      console.log("Finança cadastrada:", { title, description, category, value });
  
      alert("Finança cadastrada com sucesso!");
  
      modal.style.display = "none";
      this.reset();
    });
  });

// Função que calcula o total de gastos e atualiza no rodapé
function calcularTotalGastos() {
  const total = dados.reduce((soma, item) => {
    // Substitui vírgula por ponto e converte para float
    const valor = parseFloat(item.preco.replace(',', '.'));
    return soma + (isNaN(valor) ? 0 : valor);
  }, 0);

  // Exibe o total formatado com duas casas decimais e vírgula
  const totalFormatado = total.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  document.getElementById("total-gastos").textContent = totalFormatado;
}

// Chamada da função após gerar os cards
calcularTotalGastos();


  
  
  