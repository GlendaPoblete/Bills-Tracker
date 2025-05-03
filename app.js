"use strict";
// DOM Elements
const billForm = document.getElementById('billForm');
const billList = document.getElementById('billList');
const monthSelect = document.getElementById('monthSelect');
const exportBtn = document.getElementById('exportBtn');
// Get Bills from localStorage
function getBills() {
    return JSON.parse(localStorage.getItem('bills') || '[]');
}
// Save Bills to localStorage
function saveBills(bills) {
    localStorage.setItem('bills', JSON.stringify(bills));
}
// Render Bills in the list
function renderBills(monthFilter) {
    const bills = getBills();
    billList.innerHTML = '';
    const filtered = monthFilter
        ? bills.filter(b => b.dueDate.startsWith(monthFilter))
        : bills;
    filtered.forEach(bill => {
        const row = document.createElement('tr');
        row.innerHTML = `
        <td><input type="checkbox" ${bill.isPaid ? 'checked' : ''} data-id="${bill.id}" /></td>
        <td>${bill.biller}</td>
        <td>₱${bill.amount.toFixed(2)}</td>
        <td>${bill.dueDate}</td>
        <td>
  ${bill.isPaid
            ? '<span class="paid">Paid</span>'
            : '<span class="unpaid">Unpaid</span>'}
</td>

        <td>
          <button data-edit-id="${bill.id}">✏️ Edit</button>
          <button data-delete-id="${bill.id}">❌ Delete</button>
        </td>
      `;
        billList.appendChild(row);
    });
}
//   function renderBills(monthFilter?: string) {
//     const bills = getBills();
//     billList.innerHTML = '';
//     const filtered = monthFilter
//       ? bills.filter(b => b.dueDate.startsWith(monthFilter))
//       : bills;
//     filtered.forEach(bill => {
//       const li = document.createElement('li');
//       li.innerHTML = `
//   <input type="checkbox" ${bill.isPaid ? 'checked' : ''} data-id="${bill.id}" />
//   <strong>${bill.biller}</strong> - ₱${bill.amount.toFixed(2)} - Due: ${bill.dueDate}
//   ${bill.isPaid ? '<span class="paid">✓ Paid</span>' : ''}
//   <button data-edit-id="${bill.id}">✏️</button>
//   <button data-delete-id="${bill.id}">❌</button>
// `;
//       billList.appendChild(li);
//     });
//   }
// Handle form submission to add new bill
billForm.addEventListener('submit', e => {
    e.preventDefault();
    const month = monthSelect.value;
    const biller = document.getElementById('biller').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const dueDate = document.getElementById('dueDate').value;
    if (!month || !biller || isNaN(amount) || !dueDate)
        return;
    const newBill = {
        id: Date.now(),
        biller,
        amount,
        dueDate,
        isPaid: false
    };
    const bills = getBills();
    bills.push(newBill);
    saveBills(bills);
    renderBills(month);
    billForm.reset();
});
// Handle the change of "Paid" status
billList.addEventListener('change', e => {
    const target = e.target;
    if (target.type === 'checkbox') {
        const billId = Number(target.dataset.id);
        const bills = getBills();
        const bill = bills.find(b => b.id === billId);
        if (bill) {
            bill.isPaid = target.checked;
            saveBills(bills);
            renderBills(monthSelect.value);
        }
    }
});
// Bill deletion and editing
billList.addEventListener('click', e => {
    const target = e.target;
    // Delete handler
    if (target.tagName === 'BUTTON' && target.dataset.deleteId) {
        if (confirm("Are you sure you want to delete this bill?")) {
            const id = Number(target.dataset.deleteId);
            let bills = getBills();
            bills = bills.filter(b => b.id !== id);
            saveBills(bills);
            renderBills(monthSelect.value);
        }
    }
    // Edit handler
    if (target.tagName === 'BUTTON' && target.dataset.editId) {
        const id = Number(target.dataset.editId);
        const bills = getBills();
        const bill = bills.find(b => b.id === id);
        if (!bill)
            return;
        const newBiller = prompt("Edit biller name:", bill.biller);
        const newAmount = prompt("Edit amount (₱):", bill.amount.toString());
        const newDueDate = prompt("Edit due date (YYYY-MM-DD):", bill.dueDate);
        if (newBiller && newAmount && !isNaN(parseFloat(newAmount)) && newDueDate) {
            bill.biller = newBiller;
            bill.amount = parseFloat(newAmount);
            bill.dueDate = newDueDate;
            saveBills(bills);
            renderBills(monthSelect.value);
        }
        else {
            alert("Invalid input. Edit cancelled.");
        }
    }
});
// Export JSON of selected month's data
exportBtn.addEventListener('click', () => {
    const month = monthSelect.value;
    if (!month)
        return alert("Please select a month.");
    const all = getBills();
    const filtered = all.filter(b => b.dueDate.startsWith(month));
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bills-${month}.json`;
    a.click();
    URL.revokeObjectURL(url);
});
const exportAllBtn = document.getElementById('exportAllBtn');
// Export JSON of all data
exportAllBtn.addEventListener('click', () => {
    const allBills = getBills();
    if (allBills.length === 0) {
        alert("No bills to export.");
        return;
    }
    const blob = new Blob([JSON.stringify(allBills, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all-bills.json`;
    a.click();
    URL.revokeObjectURL(url);
});
// Populate months dropdown
function populateMonthSelect() {
    const months = [
        '2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06',
        '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12'
    ];
    months.forEach(month => {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = month;
        monthSelect.appendChild(option);
    });
}
// Filter when month changes
monthSelect.addEventListener('change', () => {
    renderBills(monthSelect.value);
});
// Initial setup
populateMonthSelect();
renderBills();
