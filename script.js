let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let budget = parseFloat(localStorage.getItem("budget")) || 0;

document.getElementById("reset-budget-btn").addEventListener("click", function () {
  budget = 0;
  expenses = [];

  localStorage.setItem("budget", budget);
  localStorage.setItem("expenses", JSON.stringify(expenses));

  document.getElementById("budget-display").textContent = budget.toFixed(2);
  document.getElementById("remaining-budget").textContent = budget.toFixed(2);
  document.getElementById("budget-info").classList.add("d-none");
  updateExpenseTable();
  updateExpenseChart();

  alert("Budget and expenses have been reset.");
});

window.onload = () => {
  const loggedInUser = sessionStorage.getItem("loggedInUser");
  if (!loggedInUser) {
    window.location.href = "index.html";
  } else {
    document.getElementById("userName").textContent = `Welcome, ${loggedInUser}`;
    const userData = JSON.parse(localStorage.getItem(loggedInUser)) || { expenses: [], budget: 0 };
    expenses = userData.expenses;
    budget = userData.budget;
    if (budget > 0) {
      document.getElementById("budget-display").textContent = budget.toFixed(2);
      updateRemainingBudget();
      document.getElementById("budget-info").classList.remove("d-none");
    }
    updateExpenseTable();
    updateExpenseChart();
  }
};

document.getElementById("budget-form").addEventListener("submit", (e) => {
  e.preventDefault();
  budget = parseFloat(document.getElementById("budget-amount").value);

  const loggedInUser = sessionStorage.getItem("loggedInUser");
  if (loggedInUser) {
    const userData = JSON.parse(localStorage.getItem(loggedInUser)) || { expenses: [], budget: 0 };
    userData.budget = budget;
    localStorage.setItem(loggedInUser, JSON.stringify(userData));
  }

  document.getElementById("budget-display").textContent = budget.toFixed(2);
  updateRemainingBudget();
  document.getElementById("budget-info").classList.remove("d-none");
  document.getElementById("budget-form").reset();
});

document.getElementById("expense-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const amount = parseFloat(document.getElementById("expense-amount").value);
  const category = document.getElementById("expense-category").value;
  const date = new Date().toLocaleDateString();
  const expense = { amount, category, date };

  expenses.push(expense);

  const loggedInUser = sessionStorage.getItem("loggedInUser");
  if (loggedInUser) {
    const userData = JSON.parse(localStorage.getItem(loggedInUser)) || { expenses: [], budget: 0 };
    userData.expenses = expenses;
    localStorage.setItem(loggedInUser, JSON.stringify(userData));
  }

  updateExpenseTable();
  updateExpenseChart();
  updateRemainingBudget();
  document.getElementById("expense-form").reset();
});

function updateExpenseTable() {
  const tableBody = document.getElementById("expense-table");
  tableBody.innerHTML = "";
  expenses.forEach((expense,index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>₹${expense.amount.toFixed(2)}</td>
      <td>${expense.category}</td>
      <td>${expense.date}</td>
      <td>
        <button class="btn btn-danger btn-sm delete-expense-btn" data-index="${index}">
          <i class="bi bi-trash"></i> Delete
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });
  document.querySelectorAll(".delete-expense-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const index = this.getAttribute("data-index");
      deleteExpense(index);
    });
  });
}

function deleteExpense(index) {
  expenses.splice(index, 1);

  localStorage.setItem("expenses", JSON.stringify(expenses));

  updateExpenseTable();
  updateExpenseChart();
  updateRemainingBudget();
}

function updateRemainingBudget() {
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remaining = budget - totalExpenses;
  document.getElementById("remaining-budget").textContent = remaining.toFixed(2);
}

const ctx = document.getElementById("expense-chart").getContext("2d");
let expenseChart = new Chart(ctx, {
  type: "pie",
  data: {
    labels: [],
    datasets: [{
      label: "Expenses by Category",
      data: [],
      backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
    }],
  },
});

function updateExpenseChart() {
  const categories = {};
  expenses.forEach((expense) => {
    categories[expense.category] = (categories[expense.category] || 0) + expense.amount;
  });
  expenseChart.data.labels = Object.keys(categories);
  expenseChart.data.datasets[0].data = Object.values(categories);
  expenseChart.update();
}

document.getElementById('calculate-btn').addEventListener('click', function() {
  const income = Number(document.getElementById('income-input').value);
  let tax = 0;

  if (income <= 300000) {
      tax = 0;
  } else if (income <= 4500000) {
      tax = income * 0.05;
  } else if (income <= 900000) {
      tax = income * 0.1;
  } else if (income <= 1200000) {
      tax = income * 0.15;
  } else if (income <= 1500000) {
      tax = income * 0.2;
  } else if (income > 1500000) {
      tax = income * 0.3;
  } 

  document.getElementById('tax-output').textContent = `You need to pay: ₹${tax.toFixed(2)} in taxes.`;

  const payNowBtn = document.getElementById('pay-now-btn') || document.createElement('button');
  payNowBtn.textContent = 'Pay Now';
  payNowBtn.id = 'pay-now-btn';
  document.getElementById('pay-now-container').appendChild(payNowBtn);

  payNowBtn.addEventListener('click', function() {
      const upiID = "ramoliyayug@fam";
      const amount = tax.toFixed(2);
      const name = "Name";
      const note = "Tax Payment";

      const upiString = `upi://pay?pa=${upiID}&pn=${name}&am=${amount}&cu=INR&tn=${note}`;
      const existingQRCode = document.getElementById('qrcode');
      if (existingQRCode) {
          existingQRCode.remove();
      }

      const qrcodeDiv = document.createElement('div');
      qrcodeDiv.id = 'qrcode';
      document.getElementById('qrcode-container').appendChild(qrcodeDiv);

      new QRCode(document.getElementById("qrcode"), { text: upiString, width: 128, height: 128});
  });
});
document.getElementById("logout-btn").addEventListener("click", () => {
  sessionStorage.clear();
  window.location.href = "index.html";
});
