// ── fmt / fmtInt / fmtNum defined in ui.js ─────────────────

let itemCounter = 1;
let editingQuotationId = null;

function switchView(view) {
    currentView = view;
    renderApp();
    
    if (view === 'new') {
        setTimeout(() => {
            setupItemListeners();
        }, 100);
    }
}

function setupItemListeners() {
    const itemRows = document.querySelectorAll('.item-row');
    itemRows.forEach(row => {
        const qty = row.querySelector('.item-qty');
        const price = row.querySelector('.item-price');
        const total = row.querySelector('.item-total');
        
        const updateItemTotal = () => {
            const qtyVal = parseFloat(qty.value) || 0;
            const priceVal = parseFloat(price.value) || 0;
            const itemTotal = qtyVal * priceVal;
            total.value = '฿' + fmt(itemTotal);
            updatePreview();
        };
        
        qty.addEventListener('input', updateItemTotal);
        price.addEventListener('input', updateItemTotal);
    });
}

function addItemRow() {
    itemCounter++;
    const itemsList = document.getElementById('itemsList');
    const wrap = document.createElement('div');
    wrap.innerHTML = itemRowMarkup(itemCounter).trim();
    itemsList.appendChild(wrap.firstChild);
    setupItemListeners();
}

function removeItemRow(button) {
    const itemsList = document.getElementById('itemsList');
    const rows = itemsList.querySelectorAll('.item-row');
    
    if (rows.length > 1) {
        button.closest('.item-row').remove();
        updateItemNumbers();
        updatePreview();
    } else {
        alert('⚠️ You must have at least one item!');
    }
}

function updateItemNumbers() {
    const itemRows = document.querySelectorAll('.item-row');
    itemRows.forEach((row, index) => {
        const label = row.querySelector('.item-no');
        if (label) label.textContent = `Item #${index + 1}`;
    });
    itemCounter = itemRows.length;
}

function updatePreview() {
    const itemRows = document.querySelectorAll('.item-row');
    let subtotal = 0;
    
    itemRows.forEach(row => {
        const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        subtotal += qty * price;
    });
    
    const vatChecked = document.getElementById('applyVat')?.checked !== false;
    const tax = vatChecked ? subtotal * 0.07 : 0;
    const total = subtotal + tax;

    document.getElementById('previewSubtotal').textContent = '฿' + fmt(subtotal);
    document.getElementById('previewTax').textContent = '฿' + fmt(tax);
    document.getElementById('previewTotal').textContent = '฿' + fmt(total);
}

function submitQuotation(event) {
    event.preventDefault();
    
    const customerName = document.getElementById('customerName').value;
    const customerEmail = document.getElementById('customerEmail')?.value || '';
    const customerAddress = document.getElementById('customerAddress')?.value || '';
    const taxId = document.getElementById('taxId')?.value || '';
    
    // Get selected document type
    const docType = document.querySelector('input[name="docType"]:checked')?.value || 'bill';
    const notes = document.getElementById('notes')?.value || '';
    
    const items = [];
    const itemRows = document.querySelectorAll('.item-row');
    
    itemRows.forEach(row => {
        const name = row.querySelector('.item-name').value;
        const description = row.querySelector('.item-description')?.value || '';
        const qty = parseFloat(row.querySelector('.item-qty').value);
        const price = parseFloat(row.querySelector('.item-price').value);
        
        if (name && qty && price) {
            items.push({ 
                name, 
                description,  // NEW: Save description
                qty, 
                price 
            });
        }
    });
    
    if (items.length === 0) {
        alert('⚠️ Please add at least one item!');
        return;
    }
    
    const subtotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
    const vatChecked = document.getElementById('applyVat')?.checked !== false;
    const tax = vatChecked ? subtotal * 0.07 : 0;
    const total = subtotal + tax;
    
    if (editingQuotationId) {
        const index = quotations.findIndex(q => q.id === editingQuotationId);
        if (index !== -1) {
            quotations[index] = {
                ...quotations[index],
                customer: customerName,
                taxId: taxId,
                items: items,
                subtotal: subtotal,
                tax: tax,
                total: total
            };
            alert(`✅ Quotation updated successfully!\n\nID: ${editingQuotationId}\nItems: ${items.length}\nTotal: ฿${total}`);
        }
        editingQuotationId = null;
    } else {
        const newQuotation = {
            id: 'QT' + new Date().getTime(),
            date: new Date().toISOString().split('T')[0],
            customer: customerName,
            customerEmail: customerEmail,
            customerAddress: customerAddress,
            taxId: taxId,
            docType: docType,
            items: items,
            subtotal: subtotal,
            tax: tax,
            total: total,
            notes: notes,
            status: 'draft',
            createdBy: sessionStorage.getItem('userEmail')
        };
        
        quotations.unshift(newQuotation);
        alert(`✅ Quotation created successfully!\n\nID: ${newQuotation.id}\nItems: ${items.length}\nTotal: ฿${total}`);
    }
    
    saveToLocalStorage();
    syncToFirebase();
    itemCounter = 1;
    switchView('bills');
}

function editQuotation(id) {
    const q = quotations.find(x => x.id === id);
    if (!q) {
        alert('❌ Quotation not found!');
        return;
    }
    
    editingQuotationId = id;
    currentView = 'new';
    renderApp();
    
    setTimeout(() => {
        document.getElementById('manualCustomerFields')?.classList.remove('hidden');
        document.getElementById('customerName').value = q.customer || '';
        const taxEl = document.getElementById('taxId');
        if (taxEl) taxEl.value = q.taxId || '';

        const itemsList = document.getElementById('itemsList');
        itemsList.innerHTML = '';
        itemCounter = 0;

        q.items.forEach((item, index) => {
            addItemRow();
            const rows = itemsList.querySelectorAll('.item-row');
            const row = rows[index];
            row.querySelector('.item-name').value = item.name;
            if (item.description) row.querySelector('.item-description').value = item.description;
            row.querySelector('.item-qty').value = item.qty;
            row.querySelector('.item-price').value = item.price;
            row.querySelector('.item-total').value = '฿' + fmt(item.qty * item.price);
        });

        setupItemListeners();
        updatePreview();

        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.textContent = 'Update Document';
    }, 100);
}

function deleteQuotation(id) {
    const q = quotations.find(x => x.id === id);
    if (!q) {
        alert('❌ Quotation not found!');
        return;
    }
    
    const confirmDelete = confirm(
        `🗑️ Delete Quotation?\n\n` +
        `ID: ${q.id}\n` +
        `Customer: ${q.customer}\n` +
        `Total: ฿${q.total}\n\n` +
        `This action cannot be undone. Are you sure?`
    );
    
    if (confirmDelete) {
        quotations = quotations.filter(x => x.id !== id);
        saveToLocalStorage();
        syncToFirebase();
        alert('✅ Quotation deleted successfully!');
        renderApp();
    }
}

function viewQuotation(id) {
    const q = quotations.find(x => x.id === id);
    if (!q) { alert('Document not found!'); return; }

    const typeLabel = q.docType === 'tax-invoice' ? 'Tax Invoice' : q.docType === 'invoice' ? 'Invoice' : 'Bill';

    let extraInfo = '';
    if (q.status === 'rejected' && q.rejectionReason) {
        extraInfo = `<div class="alert-err">
            <div style="font-weight:700;margin-bottom:2px;">${L('rejected')}</div>
            <div>${esc(q.rejectionReason)}</div>
            <div style="opacity:.75;margin-top:3px;font-size:var(--t-micro);">by ${esc(q.rejectedBy || 'Technician')} · ${q.rejectedAt ? new Date(q.rejectedAt).toLocaleDateString() : ''}</div>
        </div>`;
    }
    if (q.status === 'approved' && q.approvedBy) {
        extraInfo = `<div class="alert-ok">
            <div style="font-weight:700;">${L('approved')}</div>
            <div style="opacity:.8;font-size:var(--t-micro);">by ${esc(q.approvedBy)} · ${q.approvedAt ? new Date(q.approvedAt).toLocaleDateString() : ''}</div>
        </div>`;
    }

    const itemsHtml = q.items.map(item => `
        <tr>
            <td class="cell-strong">${esc(item.name)}</td>
            <td class="num muted">${item.qty}</td>
            <td class="num muted tnum">฿${fmt(item.price)}</td>
            <td class="num cell-strong tnum">฿${fmt(item.qty * item.price)}</td>
        </tr>`).join('');

    const qrUrl = `${window.location.origin}${window.location.pathname}?doc=${q.id}`;

    const modal = `
    <div id="viewModal" class="scrim" onclick="if(event.target.id==='viewModal')closeViewModal()">
      <div class="sheet">
        <div class="sheet-head">
          <div><div class="k">${typeLabel}</div><div class="h tnum">${esc(q.id)}</div></div>
          <div style="display:flex;align-items:center;gap:8px;">
            ${getStatusPill(q.status)}
            <button class="sheet-x" onclick="closeViewModal()">${icon('x','')}</button>
          </div>
        </div>
        <div class="sheet-body">
          <div style="display:flex;gap:var(--s5);align-items:flex-start;flex-wrap:wrap;">
            <div style="flex:1;min-width:220px;" class="stack">
              <div class="grid-2">
                <div><div class="field-label">${L('customer2')}</div><div class="cell-strong">${esc(q.customer)}</div></div>
                <div><div class="field-label">${L('date')}</div><div>${esc(q.date)}</div></div>
                ${q.taxId ? `<div><div class="field-label">${L('taxId')}</div><div class="muted tnum">${esc(q.taxId)}</div></div>` : ''}
              </div>
              <table class="table" style="margin-top:4px;">
                <thead><tr><th>${L('itemCol')}</th><th class="num">${L('qtyCol')}</th><th class="num">${L('priceCol')}</th><th class="num">${L('amount')}</th></tr></thead>
                <tbody>${itemsHtml}</tbody>
              </table>
              <div style="border-top:1px solid var(--line-2);padding-top:10px;text-align:right;" class="stack">
                <div class="muted" style="font-size:var(--t-meta);">${L('subtotal')}: <span class="tnum">฿${fmt(q.subtotal)}</span></div>
                <div class="muted" style="font-size:var(--t-meta);">${L('tax7')}: <span class="tnum">฿${fmt(q.tax)}</span></div>
                <div style="font-size:var(--t-lede);font-weight:700;color:var(--accent);">${L('total')}: <span class="tnum">฿${fmt(q.total)}</span></div>
              </div>
              ${extraInfo}
            </div>
            <div style="text-align:center;">
              <div id="qrcode" style="background:#fff;padding:8px;border-radius:10px;display:inline-block;border:1px solid var(--line-2);"></div>
              <div class="muted" style="font-size:var(--t-micro);margin-top:5px;">${L('scanToOpen')}</div>
            </div>
          </div>
        </div>
        <div class="sheet-foot">
          <button class="btn btn-primary btn-block" onclick="generatePDF('${q.id}')">${icon('download')}${L('exportPDF')}</button>
          <button class="btn btn-secondary" onclick="closeViewModal()">${L('close')}</button>
        </div>
      </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modal);

    setTimeout(() => {
        const box = document.getElementById('qrcode');
        if (!box) return;
        if (typeof QRCode !== 'undefined') {
            new QRCode(box, { text: qrUrl, width: 104, height: 104, colorDark: '#16233E', colorLight: '#ffffff' });
        } else {
            box.innerHTML = '<div style="font-size:0.7rem;color:#888;padding:8px;">QR N/A</div>';
        }
    }, 50);
}

function closeViewModal() {
    const m = document.getElementById('viewModal');
    if (m) m.remove();
}


function exportGroup(key) {
    const items = quotations.filter(q => {
        return groupBy === 'date' ? q.date === key : q.customer === key;
    });
    
    if (items.length === 0) {
        alert('❌ No quotations found in this group!');
        return;
    }
    
    let csv = 'ID,Date,Customer,Tax ID,Items,Subtotal,Tax,Total,Status\n';
    
    items.forEach(q => {
        const itemsStr = q.items.map(i => `${i.name}(${i.qty}x${i.price})`).join('; ');
        csv += `${q.id},${q.date},${q.customer},${q.taxId},"${itemsStr}",${q.subtotal},${q.tax},${q.total},${q.status}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `group_${key}_export.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    alert('✅ CSV exported successfully!\n\nFile: group_' + key + '_export.csv\nRecords: ' + items.length);
}

// ========== WORKFLOW FUNCTIONS ==========

function submitForApproval(quotationId) {
    if (!confirm('ต้องการส่งใบเสนอราคานี้เพื่อขออนุมัติหรือไม่?')) return;
    
    const quotation = quotations.find(q => q.id === quotationId);
    if (!quotation) {
        alert('ไม่พบใบเสนอราคา');
        return;
    }
    
    quotation.status = 'pending';
    quotation.submittedAt = new Date().toISOString();
    quotation.submittedBy = sessionStorage.getItem('userEmail');
    
    saveToLocalStorage();
    syncToFirebase();
    renderApp();
    
    showNotification('✅ ส่งใบเสนอราคาเรียบร้อยแล้ว รอการอนุมัติ');
}

function approveQuotation(quotationId) {
    if (!confirm('ต้องการอนุมัติใบเสนอราคานี้หรือไม่?')) return;
    
    const quotation = quotations.find(q => q.id === quotationId);
    if (!quotation) {
        alert('ไม่พบใบเสนอราคา');
        return;
    }
    
    quotation.status = 'approved';
    quotation.approvedAt = new Date().toISOString();
    quotation.approvedBy = sessionStorage.getItem('userEmail');
    
    saveToLocalStorage();
    syncToFirebase();
    renderApp();
    
    showNotification('✅ อนุมัติใบเสนอราคาเรียบร้อยแล้ว');
}

function rejectQuotation(quotationId) {
    const reason = prompt('เหตุผลในการไม่อนุมัติ:');
    if (!reason) return;
    
    const quotation = quotations.find(q => q.id === quotationId);
    if (!quotation) {
        alert('ไม่พบใบเสนอราคา');
        return;
    }
    
    quotation.status = 'rejected';
    quotation.rejectedAt = new Date().toISOString();
    quotation.rejectedBy = sessionStorage.getItem('userEmail');
    quotation.rejectionReason = reason;
    
    saveToLocalStorage();
    syncToFirebase();
    renderApp();
    
    showNotification('❌ ไม่อนุมัติใบเสนอราคา: ' + reason);
}

function redoQuotation(quotationId) {
    if (!confirm('Send back to Sales for revision?')) return;
    
    const quotation = quotations.find(q => q.id === quotationId);
    if (!quotation) {
        alert('Quotation not found');
        return;
    }
    
    quotation.status = 'draft';
    quotation.redoAt = new Date().toISOString();
    quotation.redoBy = sessionStorage.getItem('userEmail');
    
    saveToLocalStorage();
    syncToFirebase();
    renderApp();
    
    showNotification('🔄 Document sent back to Sales for revision');
}

function fixAndResubmit(quotationId) {
    if (!confirm('Mark this as fixed and resubmit for approval?')) return;
    
    const quotation = quotations.find(q => q.id === quotationId);
    if (!quotation) {
        alert('Quotation not found');
        return;
    }
    
    // Clear rejection info and set to pending
    quotation.status = 'pending';
    quotation.resubmittedAt = new Date().toISOString();
    quotation.resubmittedBy = sessionStorage.getItem('userEmail');
    // Keep rejection history for reference
    quotation.previousRejection = {
        reason: quotation.rejectionReason,
        rejectedBy: quotation.rejectedBy,
        rejectedAt: quotation.rejectedAt
    };
    
    saveToLocalStorage();
    syncToFirebase();
    renderApp();
    
    showNotification('✅ Document resubmitted for approval!');
}

// Get action buttons based on user role and quotation status


function toggleTaxIdRequired() {
    const type = document.querySelector('input[name="customerType"]:checked')?.value;
    const taxIdInput = document.getElementById('custTaxId');
    const taxIdStar = document.getElementById('taxIdStar');
    if (!taxIdInput) return;
    if (type === 'company') {
        taxIdInput.setAttribute('required', 'required');
        taxIdStar && taxIdStar.classList.remove('hidden');
    } else {
        taxIdInput.removeAttribute('required');
        taxIdStar && taxIdStar.classList.add('hidden');
    }
}

function showAddCustomerModal() {
    if (document.getElementById('customerModal')) return;
    const modal = `
    <div id="customerModal" class="scrim" onclick="if(event.target.id==='customerModal')closeCustomerModal()">
      <div class="sheet" style="max-width:480px;">
        <div class="sheet-head">
          <div class="h">${L('addCustomer')}</div>
          <button class="sheet-x" onclick="closeCustomerModal()">${icon('x','')}</button>
        </div>
        <form onsubmit="saveCustomer(event)" class="sheet-body">
          <div class="field">
            <span class="field-label">${L('customerType')} *</span>
            <div class="doctype" style="grid-template-columns:1fr 1fr;">
              <label><input type="radio" name="customerType" value="individual" checked onchange="toggleTaxIdRequired()"><span class="dt-t">${L('individual')}</span></label>
              <label><input type="radio" name="customerType" value="company" onchange="toggleTaxIdRequired()"><span class="dt-t">${L('company')}</span></label>
            </div>
          </div>
          <div class="field"><span class="field-label">${L('nameStar')} *</span><input id="custName" class="input" required placeholder="${L('nameStar')}"></div>
          <div class="grid-2">
            <div class="field"><span class="field-label">${L('email')}</span><input id="custEmail" type="email" class="input" placeholder="email@example.com"></div>
            <div class="field"><span class="field-label">${L('phone')}</span><input id="custPhone" class="input" placeholder="0X-XXX-XXXX"></div>
          </div>
          <div class="field"><span class="field-label">${L('taxId')} <span id="taxIdStar" class="hidden">*</span></span><input id="custTaxId" class="input" placeholder="0-1234-56789-01-2"></div>
          <div class="field"><span class="field-label">${L('address')}</span><textarea id="custAddress" rows="2" class="textarea" placeholder="Street, City, Postal Code"></textarea></div>
          <div class="sheet-foot" style="padding:0;">
            <button type="submit" class="btn btn-primary btn-block">${L('saveDocument2')}</button>
            <button type="button" class="btn btn-secondary" onclick="closeCustomerModal()">${L('cancel')}</button>
          </div>
        </form>
      </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modal);
}

function closeCustomerModal() {
    const modal = document.getElementById('customerModal');
    if (modal) modal.remove();
    const sel = document.getElementById('customerSelect');
    if (sel && sel.value === '__new__') sel.value = '';
}

function saveCustomer(event) {
    event.preventDefault();
    
    const newCustomer = {
        id: 'CUST' + Date.now(),
        name: document.getElementById('custName').value,
        email: document.getElementById('custEmail').value,
        phone: document.getElementById('custPhone').value,
        address: document.getElementById('custAddress').value,
        taxId: document.getElementById('custTaxId').value,
        type: document.querySelector('input[name="customerType"]:checked').value
    };
    
    customers.push(newCustomer);
    localStorage.setItem('customers', JSON.stringify(customers));
    syncCustomersToFirebase();
    
    closeCustomerModal();
    renderApp();
    
    showNotification('✅ Customer added successfully!');
}

function viewCustomer(id) {
    const customer = customers.find(c => c.id === id);
    if (!customer) return;
    
    alert(`Customer Details:\n\nName: ${customer.name}\nType: ${customer.type}\nEmail: ${customer.email}\nPhone: ${customer.phone}\nAddress: ${customer.address}\nTax ID: ${customer.taxId || 'N/A'}`);
}

function editCustomer(id) {
    alert('Edit customer feature coming soon!');
}

function deleteCustomer(id) {
    if (!confirm('Delete this customer?')) return;
    
    customers = customers.filter(c => c.id !== id);
    localStorage.setItem('customers', JSON.stringify(customers));
    syncCustomersToFirebase();
    renderApp();
    
    showNotification('✅ Customer deleted!');
}

function syncCustomersToFirebase() {
    if (isFirebaseEnabled && database) {
        database.ref('customers').set(customers);
    }
}

function loadCustomersFromStorage() {
    const saved = localStorage.getItem('customers');
    if (saved) {
        customers = JSON.parse(saved);
    }
}

// Load customers on startup
loadCustomersFromStorage();

// Fill customer info when selected from dropdown
function fillCustomerInfo() {
    const select = document.getElementById('customerSelect');
    const customerId = select.value;
    const manualFields = document.getElementById('manualCustomerFields');
    
    if (customerId === '__new__') {
        // Show add customer modal
        showAddCustomerModal();
        select.value = '';
        return;
    }
    
    if (!customerId) {
        // Show manual fields if no customer selected
        manualFields?.classList.remove('hidden');
        document.getElementById('customerName').value = '';
        document.getElementById('customerEmail').value = '';
        document.getElementById('customerAddress').value = '';
        document.getElementById('taxId').value = '';
        return;
    }
    
    // Find customer and fill fields
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
        manualFields?.classList.add('hidden');
        document.getElementById('customerName').value = customer.name;
        document.getElementById('customerEmail').value = customer.email || '';
        document.getElementById('customerAddress').value = customer.address || '';
        document.getElementById('taxId').value = customer.taxId || '';
    }
}

// Fill product info when selected from dropdown
function fillProductInfo(selectElement) {
    const productId = selectElement.value;
    if (!productId) return;
    
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const row = selectElement.closest('.item-row');
    row.querySelector('.item-name').value = product.name;
    row.querySelector('.item-description').value = product.description;
    row.querySelector('.item-price').value = product.price;
    
    updatePreview();
}

// Load products from storage
function loadProductsFromStorage() {
    const saved = localStorage.getItem('products');
    if (saved) {
        products = JSON.parse(saved);
    }
}

loadProductsFromStorage();

// ========== PDF GENERATION ==========


// ========== PRODUCT MANAGEMENT ==========

function showAddProductModal() {
    const modal = `
    <div id="productModal" class="scrim" onclick="if(event.target.id==='productModal')closeProductModal()">
      <div class="sheet" style="max-width:460px;">
        <div class="sheet-head">
          <div class="h">Add Product / Service</div>
          <button class="sheet-x" onclick="closeProductModal()">${icon('x','')}</button>
        </div>
        <form onsubmit="saveProduct(event)" class="sheet-body">
          <div class="field"><span class="field-label">${L('nameStar')} *</span><input type="text" id="prodName" class="input" required placeholder="e.g. Website Development"></div>
          <div class="field"><span class="field-label">${L('descriptionLbl')}</span><textarea id="prodDesc" rows="2" class="textarea" placeholder="Brief description"></textarea></div>
          <div class="grid-2">
            <div class="field"><span class="field-label">${L('unitPrice')} *</span><input type="number" id="prodPrice" class="input" required min="0" step="0.01" placeholder="0.00"></div>
            <div class="field"><span class="field-label">Unit</span><input type="text" id="prodUnit" class="input" placeholder="e.g. hour, project" value="item"></div>
          </div>
          <div class="sheet-foot" style="padding:0;">
            <button type="submit" class="btn btn-primary btn-block">${L('saveDocument2')}</button>
            <button type="button" class="btn btn-secondary" onclick="closeProductModal()">${L('cancel')}</button>
          </div>
        </form>
      </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modal);
}

function closeProductModal() {
    document.getElementById('productModal')?.remove();
}

function saveProduct(event) {
    event.preventDefault();
    
    const newProduct = {
        id: 'PROD' + Date.now(),
        name: document.getElementById('prodName').value,
        description: document.getElementById('prodDesc').value,
        price: parseFloat(document.getElementById('prodPrice').value),
        unit: document.getElementById('prodUnit').value || 'item'
    };
    
    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));
    
    closeProductModal();
    renderApp();
    showNotification('✅ Product added!');
}

function editProduct(id) {
    alert('Edit feature coming soon!');
}

function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;
    
    products = products.filter(p => p.id !== id);
    localStorage.setItem('products', JSON.stringify(products));
    renderApp();
    showNotification('✅ Product deleted!');
}

// Fill product info when selected

// ========== PDF GENERATION ==========

function generatePDF(quotationId) {
    const q = quotations.find(x => x.id === quotationId);
    if (!q) { alert('Quotation not found!'); return; }

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const pw = doc.internal.pageSize.width;
        const ph = doc.internal.pageSize.height;
        const m = 20;

        // --- HEADER BAR ---
        doc.setFillColor(22, 35, 62);
        doc.rect(0, 0, pw, 48, 'F');

        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.setFont(undefined, 'bold');
        doc.text(companyInfo.name, m, 16);

        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(148, 163, 184);
        doc.text(companyInfo.address, m, 23);
        doc.text('Tel: ' + companyInfo.phone + '  |  ' + companyInfo.email, m, 29);
        doc.text('Tax ID: ' + companyInfo.taxId, m, 35);

        const docLabel = getDocTypeLabel(q.docType).toUpperCase();
        doc.setFontSize(22);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(docLabel, pw - m, 20, { align: 'right' });

        const statusColors = { approved: [34, 197, 94], rejected: [239, 68, 68], pending: [234, 179, 8] };
        const sc = statusColors[q.status] || statusColors.pending;
        doc.setFillColor(sc[0], sc[1], sc[2]);
        doc.roundedRect(pw - m - 28, 26, 28, 8, 2, 2, 'F');
        doc.setFontSize(7);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(q.status.toUpperCase(), pw - m - 14, 31.5, { align: 'center' });

        // --- INFO SECTION ---
        const col2 = pw / 2 + 5;

        doc.setFillColor(248, 250, 252);
        doc.roundedRect(m, 54, pw / 2 - m - 5, 30, 2, 2, 'F');
        doc.setFontSize(7);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(100, 116, 139);
        doc.text('INVOICE DETAILS', m + 4, 61);
        doc.setFontSize(9);
        doc.setTextColor(30, 41, 59);
        doc.setFont(undefined, 'normal');
        doc.text('Invoice No:', m + 4, 68);
        doc.setFont(undefined, 'bold');
        doc.text(q.id, m + 30, 68);
        doc.setFont(undefined, 'normal');
        doc.text('Date:', m + 4, 75);
        doc.setFont(undefined, 'bold');
        doc.text(q.date, m + 30, 75);

        doc.setFillColor(248, 250, 252);
        doc.roundedRect(col2, 54, pw - m - col2, 30, 2, 2, 'F');
        doc.setFontSize(7);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(100, 116, 139);
        doc.text('BILL TO', col2 + 4, 61);
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text(q.customer || '', col2 + 4, 68);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(71, 85, 105);
        if (q.taxId) doc.text('Tax ID: ' + q.taxId, col2 + 4, 75);

        // --- ITEMS TABLE ---
        let y = 96;
        doc.setFillColor(22, 35, 62);
        doc.rect(m, y, pw - 2 * m, 9, 'F');
        doc.setFontSize(8);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('DESCRIPTION', m + 4, y + 6);
        doc.text('QTY', pw - m - 60, y + 6, { align: 'center' });
        doc.text('UNIT PRICE', pw - m - 35, y + 6, { align: 'center' });
        doc.text('AMOUNT', pw - m - 8, y + 6, { align: 'right' });

        y += 12;
        q.items.forEach((item, i) => {
            const amt = item.qty * item.price;
            if (i % 2 === 0) {
                doc.setFillColor(248, 250, 252);
                doc.rect(m, y - 5, pw - 2 * m, 9, 'F');
            }
            doc.setFontSize(9);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(30, 41, 59);
            doc.text(item.name, m + 4, y);
            doc.setFont(undefined, 'normal');
            doc.setFontSize(8);
            doc.setTextColor(71, 85, 105);
            doc.text(item.qty.toString(), pw - m - 60, y, { align: 'center' });
            doc.text('THB ' + item.price, pw - m - 35, y, { align: 'center' });
            doc.setFont(undefined, 'bold');
            doc.setTextColor(30, 41, 59);
            doc.text('THB ' + amt, pw - m - 8, y, { align: 'right' });
            y += 10;
        });

        // --- TOTALS ---
        y += 5;
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(m, y, pw - m, y);
        y += 8;

        const tx = pw - m - 55;
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text('Subtotal:', tx, y);
        doc.setTextColor(30, 41, 59);
        doc.text('THB ' + q.subtotal, pw - m - 8, y, { align: 'right' });

        y += 7;
        const taxPct = q.taxRate || 7;
        doc.setTextColor(100, 116, 139);
        doc.text('Tax (' + taxPct + '%):', tx, y);
        doc.setTextColor(30, 41, 59);
        doc.text('THB ' + q.tax, pw - m - 8, y, { align: 'right' });

        y += 4;
        doc.setDrawColor(22, 35, 62);
        doc.setLineWidth(0.5);
        doc.line(tx, y, pw - m, y);

        y += 8;
        doc.setFillColor(22, 35, 62);
        doc.roundedRect(tx - 2, y - 6, pw - m - tx + 2, 11, 2, 2, 'F');
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('TOTAL', tx + 2, y);
        doc.setFontSize(11);
        doc.text('THB ' + q.total, pw - m - 8, y, { align: 'right' });

        // --- FOOTER ---
        doc.setFillColor(248, 250, 252);
        doc.rect(m + 28, ph - 38, pw - 2 * m - 28, 22, 'F');
        doc.setFontSize(7);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text('PAYMENT TERMS', m + 32, ph - 30);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text('Payment due within 30 days of invoice date.  |  Valid for 15 days from issue date.', m + 32, ph - 24);

        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(m, ph - 16, pw - m, ph - 16);
        doc.setFontSize(8);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text('Thank you for your business!', pw / 2, ph - 10, { align: 'center' });

        // --- QR CODE (rendered async, then save PDF) ---
        const qrUrl = `${window.location.origin}${window.location.pathname}?doc=${q.id}`;
        const qrDiv = document.createElement('div');
        qrDiv.style.cssText = 'position:fixed;left:-9999px;top:-9999px;';
        document.body.appendChild(qrDiv);
        new QRCode(qrDiv, { text: qrUrl, width: 100, height: 100, colorDark: '#1e2937', colorLight: '#ffffff' });

        const savePDF = () => {
            try {
                const qrImg = qrDiv.querySelector('img');
                if (qrImg && qrImg.src) {
                    doc.addImage(qrImg.src, 'PNG', m, ph - 52, 22, 22);
                    doc.setFontSize(6);
                    doc.setFont(undefined, 'normal');
                    doc.setTextColor(100, 116, 139);
                    doc.text(L('scanToOpen'), m + 11, ph - 28, { align: 'center' });
                }
            } catch(e) { console.log('QR embed skipped:', e); }
            document.body.removeChild(qrDiv);
            doc.save('Invoice-' + q.id + '.pdf');
            showNotification('PDF downloaded!');
        };

        // Give QRCode.js 300ms to render the img
        setTimeout(savePDF, 300);

    } catch (error) {
        console.error('PDF error:', error);
        alert('Failed to generate PDF: ' + error.message);
    }
}


function getDocTypeLabel(docType) {
    const labels = {
        'bill': 'Bill',
        'invoice': 'Invoice',
        'tax-invoice': 'Tax Invoice'
    };
    return labels[docType] || docType;
}

// Role management functions


function toggleRole() {
    const currentRole = sessionStorage.getItem('userRole') || 'sales';
    const newRole = currentRole === 'sales' ? 'technician' : 'sales';
    sessionStorage.setItem('userRole', newRole);
    renderApp();
    showNotification('Switched to ' + getRoleLabel(newRole));
}

// ══════════════════════════════════════════════════════════════
// PURCHASE ORDER FUNCTIONS
// ══════════════════════════════════════════════════════════════

function generatePOId() {
    const now = new Date();
    const date = now.toISOString().slice(0,10).replace(/-/g,'');
    const existing = purchaseOrders.filter(p => p.id.startsWith('PO' + date));
    const seq = String(existing.length + 1).padStart(3, '0');
    return `PO${date}${seq}`;
}

function savePurchaseOrder() {
    const customer = document.getElementById('poCustomer')?.value?.trim();
    const date = document.getElementById('poDate')?.value;
    const notes = document.getElementById('poNotes')?.value?.trim();
    const editId = document.getElementById('poEditId')?.value;

    if (!customer) { showNotification('Please enter customer name'); return; }
    if (!date) { showNotification('Please select a date'); return; }

    // Collect items
    const rows = document.querySelectorAll('.po-item-row');
    const items = [];
    let valid = true;
    rows.forEach(row => {
        const name = row.querySelector('.po-item-name')?.value?.trim();
        const qty = parseFloat(row.querySelector('.po-item-qty')?.value) || 0;
        const price = parseFloat(row.querySelector('.po-item-price')?.value) || 0;
        if (!name) { valid = false; return; }
        items.push({ name, qty, price });
    });
    if (!valid || items.length === 0) { showNotification('Please fill in all item details'); return; }

    const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
    const tax = subtotal * 0.07;
    const total = subtotal + tax;

    if (editId) {
        // Edit existing
        const idx = purchaseOrders.findIndex(p => p.id === editId);
        if (idx !== -1) {
            purchaseOrders[idx] = { ...purchaseOrders[idx], customer, date, notes, items, subtotal, tax, total };
            showNotification('Purchase Order updated!');
        }
    } else {
        // New PO
        const po = {
            id: generatePOId(),
            date,
            customer,
            notes,
            items,
            subtotal,
            tax,
            total,
            status: 'open',
            createdBy: sessionStorage.getItem('userEmail') || '',
            createdAt: new Date().toISOString(),
            linkedInvoiceId: null
        };
        purchaseOrders.unshift(po);
        showNotification('Purchase Order created!');
    }

    syncPOsToFirebase();
    closePOModal();
    renderApp();
}

function updatePOStatus(id, newStatus) {
    const po = purchaseOrders.find(p => p.id === id);
    if (!po) return;
    po.status = newStatus;
    syncPOsToFirebase();
    renderApp();
    showNotification('Status updated to ' + newStatus);
}

function convertPOToInvoice(id) {
    const po = purchaseOrders.find(p => p.id === id);
    if (!po) return;
    if (!confirm(`Convert PO ${po.id} to Invoice? This will create a new invoice and mark this PO as completed.`)) return;

    // Create invoice from PO
    const now = new Date();
    const date = now.toISOString().slice(0,10).replace(/-/g,'');
    const seq = String(quotations.length + 1).padStart(3, '0');
    const invoiceId = `QT${date}${seq}`;

    const invoice = {
        id: invoiceId,
        date: po.date,
        customer: po.customer,
        taxId: '',
        docType: 'invoice',
        items: po.items,
        subtotal: po.subtotal,
        tax: po.tax,
        total: po.total,
        status: 'draft',
        createdBy: sessionStorage.getItem('userEmail') || '',
        createdAt: now.toISOString(),
        fromPO: po.id
    };

    quotations.unshift(invoice);

    // Mark PO as completed and link invoice
    po.status = 'completed';
    po.linkedInvoiceId = invoiceId;

    syncToFirebase();
    syncPOsToFirebase();
    closePOModal();
    currentView = 'bills';
    renderApp();
    showNotification(`Invoice ${invoiceId} created from PO ${po.id}!`);
}

function deletePO(id) {
    if (!confirm('Delete this Purchase Order?')) return;
    purchaseOrders = purchaseOrders.filter(p => p.id !== id);
    syncPOsToFirebase();
    renderApp();
    showNotification('Purchase Order deleted');
}

function syncPOsToFirebase() {
    if (typeof firebase !== 'undefined' && firebase.database) {
        firebase.database().ref('purchaseOrders').set(purchaseOrders);
    }
}

function poItemRow(item) {
    const it = item || {};
    return `
    <div class="po-item-row" style="display:grid;grid-template-columns:1fr 66px 108px 34px;gap:6px;align-items:center;">
        <input class="po-item-name input" placeholder="Item name" value="${esc(it.name || '')}">
        <input class="po-item-qty input" type="number" min="1" value="${it.qty || 1}" oninput="updatePOTotals()">
        <input class="po-item-price input" type="number" min="0" placeholder="0.00" value="${it.price != null ? it.price : ''}" oninput="updatePOTotals()">
        <button type="button" class="icon-btn" onclick="removePOItem(this)">${icon('trash','')}</button>
    </div>`;
}

function openPOForm(id = null) {
    const po = id ? purchaseOrders.find(p => p.id === id) : null;
    const today = new Date().toISOString().slice(0, 10);
    const itemsHtml = (po ? po.items : [{}]).map(poItemRow).join('');

    const modal = `
    <div id="poModal" class="scrim" onclick="if(event.target.id==='poModal')closePOModal()">
      <div class="sheet">
        <div class="sheet-head">
          <div class="h">${po ? 'Edit Purchase Order' : 'New Purchase Order'}</div>
          <button class="sheet-x" onclick="closePOModal()">${icon('x','')}</button>
        </div>
        <div class="sheet-body">
          <input type="hidden" id="poEditId" value="${po ? esc(po.id) : ''}">
          <div class="grid-2">
            <div class="field"><span class="field-label">${L('customer')} *</span><input id="poCustomer" class="input" value="${po ? esc(po.customer) : ''}" placeholder="Customer name"></div>
            <div class="field"><span class="field-label">${L('date')} *</span><input id="poDate" type="date" class="input" value="${po ? po.date : today}"></div>
          </div>
          <div class="field">
            <div style="display:grid;grid-template-columns:1fr 66px 108px 34px;gap:6px;">
              <span class="field-label">${L('itemsCol')}</span><span class="field-label">${L('qty')}</span><span class="field-label">${L('unitPrice')}</span><span></span>
            </div>
            <div id="poItemList" class="stack" style="gap:6px;">${itemsHtml}</div>
            <button type="button" class="btn btn-secondary btn-block btn-sm" style="border-style:dashed;margin-top:8px;" onclick="addPOItem()">${icon('plus')}${L('addItem')}</button>
          </div>
          <div class="fieldset" style="background:var(--surface-2);text-align:right;gap:4px;">
            <div class="muted" style="font-size:var(--t-meta);">${L('subtotal')}: <span class="tnum">฿<span id="poSubtotal">0.00</span></span></div>
            <div class="muted" style="font-size:var(--t-meta);">${L('tax7')}: <span class="tnum">฿<span id="poTax">0.00</span></span></div>
            <div style="font-weight:700;color:var(--accent);">${L('total')}: <span class="tnum">฿<span id="poTotal">0.00</span></span></div>
          </div>
          <div class="field"><span class="field-label">${L('notes')} (optional)</span><textarea id="poNotes" class="textarea" placeholder="Additional notes…">${po ? esc(po.notes || '') : ''}</textarea></div>
        </div>
        <div class="sheet-foot">
          <button class="btn btn-primary btn-block" onclick="savePurchaseOrder()">${po ? L('saveChanges') : L('createPO')}</button>
          <button class="btn btn-secondary" onclick="closePOModal()">${L('cancel')}</button>
        </div>
      </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modal);
    updatePOTotals();
}

function addPOItem() {
    const list = document.getElementById('poItemList');
    const wrap = document.createElement('div');
    wrap.innerHTML = poItemRow(null).trim();
    list.appendChild(wrap.firstChild);
}

function removePOItem(btn) {
    btn.closest('.po-item-row').remove();
    updatePOTotals();
}

function updatePOTotals() {
    let subtotal = 0;
    document.querySelectorAll('.po-item-row').forEach(row => {
        const qty = parseFloat(row.querySelector('.po-item-qty')?.value) || 0;
        const price = parseFloat(row.querySelector('.po-item-price')?.value) || 0;
        subtotal += qty * price;
    });
    const tax = subtotal * 0.07;
    const total = subtotal + tax;
    const el = (id) => document.getElementById(id);
    if (el('poSubtotal')) el('poSubtotal').textContent = fmt(subtotal);
    if (el('poTax')) el('poTax').textContent = fmt(tax);
    if (el('poTotal')) el('poTotal').textContent = fmt(total);
}

function closePOModal() {
    const m = document.getElementById('poModal');
    if (m) m.remove();
}

// ══════════════════════════════════════════════════════════════
// COST TRACKING + MATERIAL COST PER SUPPLIER
// ══════════════════════════════════════════════════════════════

function openPOCostPanel(poId) {
    const po = purchaseOrders.find(p => p.id === poId);
    if (!po) return;

    const costs = poCosts.filter(c => c.poId === poId);
    const totalCost = costs.reduce((s, c) => s + c.amount, 0);
    const profit = po.total - totalCost;
    const costPill = { labor:'pill-open', transport:'pill-pending', material:'pill-brand', other:'pill-neutral' };

    const costRows = costs.length === 0
        ? `<div class="empty" style="padding:var(--s5);"><span class="muted">${L('noCosts')}</span></div>`
        : costs.map(c => `
            <div class="row" style="padding:9px 0;">
              <span class="pill pill-plain ${costPill[c.type] || 'pill-neutral'}" style="text-transform:capitalize;min-width:66px;justify-content:center;">${c.type}</span>
              <div class="row-main">
                <div class="t" style="font-weight:500;">${esc(c.description)}</div>
                ${c.supplier ? `<div class="s">${L('supplierCol')}: ${esc(c.supplier)}</div>` : ''}
              </div>
              <div class="tnum" style="font-weight:600;">฿${fmt(c.amount)}</div>
              <button class="icon-btn" onclick="deletePOCost('${c.id}','${poId}')">${icon('trash','')}</button>
            </div>`).join('');

    const modal = `
    <div id="poCostModal" class="scrim" onclick="if(event.target.id==='poCostModal')closePOCostModal()">
      <div class="sheet">
        <div class="sheet-head">
          <div><div class="h">${L('costTracking')}</div><div class="sub">${esc(po.id)} · ${esc(po.customer)}</div></div>
          <button class="sheet-x" onclick="closePOCostModal()">${icon('x','')}</button>
        </div>
        <div class="sheet-body">
          <div class="grid-3">
            <div class="stat" style="--stat-accent:var(--accent);padding:12px;text-align:center;">
              <div class="stat-label">${L('poRevenue')}</div><div class="stat-value tnum" style="font-size:var(--t-lede);">฿${fmt(po.total)}</div>
            </div>
            <div class="stat" style="--stat-accent:var(--neg);padding:12px;text-align:center;">
              <div class="stat-label">${L('totalCost')}</div><div class="stat-value tnum" style="font-size:var(--t-lede);">฿${fmt(totalCost)}</div>
            </div>
            <div class="stat" style="--stat-accent:${profit >= 0 ? 'var(--pos)' : 'var(--neg)'};padding:12px;text-align:center;">
              <div class="stat-label">${L('profit')}</div><div class="stat-value tnum" style="font-size:var(--t-lede);color:${profit >= 0 ? 'var(--pos)' : 'var(--neg)'};">฿${fmt(profit)}</div>
            </div>
          </div>

          <div>
            <span class="card-title">${L('costEntries')}</span>
            <div id="costList">${costRows}</div>
          </div>

          <div class="fieldset">
            <h3>${L('addCostTitle')}</h3>
            <div class="grid-2">
              <div class="field"><span class="field-label">${L('typeLbl')}</span>
                <select id="costType" class="select" onchange="toggleSupplierField()">
                  <option value="labor">${L('labor')}</option>
                  <option value="transport">${L('transport')}</option>
                  <option value="material">${L('material')}</option>
                  <option value="other">${L('other')}</option>
                </select>
              </div>
              <div class="field"><span class="field-label">${L('amount')}</span><input id="costAmount" type="number" min="0" class="input" placeholder="0.00"></div>
            </div>
            <div class="field"><span class="field-label">${L('descriptionLbl')}</span><input id="costDesc" class="input" placeholder="e.g. Pipe installation labor"></div>
            <div class="field hidden" id="supplierField"><span class="field-label">${L('supplierLbl')}</span><input id="costSupplier" class="input" placeholder="e.g. Supplier A"></div>
            <button class="btn btn-primary btn-block" onclick="addPOCost('${poId}')">${L('addCost')}</button>
          </div>
        </div>
      </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modal);
}

function toggleSupplierField() {
    const type = document.getElementById('costType')?.value;
    const field = document.getElementById('supplierField');
    if (field) field.classList.toggle('hidden', type !== 'material');
}

function addPOCost(poId) {
    const type    = document.getElementById('costType')?.value;
    const amount  = parseFloat(document.getElementById('costAmount')?.value) || 0;
    const desc    = document.getElementById('costDesc')?.value?.trim();
    const supplier = document.getElementById('costSupplier')?.value?.trim();

    if (!desc) { showNotification('Please enter a description'); return; }
    if (amount <= 0) { showNotification('Please enter a valid amount'); return; }

    const cost = {
        id: 'COST-' + Date.now(),
        poId,
        type,
        description: desc,
        amount,
        supplier: type === 'material' ? supplier : '',
        date: new Date().toISOString().slice(0,10),
        createdBy: sessionStorage.getItem('userEmail') || ''
    };

    poCosts.push(cost);

    // If material type, also save to materialPrices for supplier comparison
    if (type === 'material' && supplier && desc) {
        materialPrices.push({
            id: 'MAT-' + Date.now(),
            materialName: desc,
            supplier,
            pricePerUnit: amount,
            poId,
            date: cost.date
        });
        syncMaterialPricesToFirebase();
    }

    syncCostsToFirebase();
    closePOCostModal();
    openPOCostPanel(poId);
    showNotification('Cost added!');
}

function deletePOCost(costId, poId) {
    if (!confirm('Delete this cost entry?')) return;
    poCosts = poCosts.filter(c => c.id !== costId);
    syncCostsToFirebase();
    closePOCostModal();
    openPOCostPanel(poId);
}

function closePOCostModal() {
    const m = document.getElementById('poCostModal');
    if (m) m.remove();
}

function syncCostsToFirebase() {
    if (typeof firebase !== 'undefined' && firebase.database) {
        firebase.database().ref('poCosts').set(poCosts);
    }
}

function syncMaterialPricesToFirebase() {
    if (typeof firebase !== 'undefined' && firebase.database) {
        firebase.database().ref('materialPrices').set(materialPrices);
    }
}
