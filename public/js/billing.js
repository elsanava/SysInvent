function generateInvoiceFromPurchaseOrder(purchaseOrder) {
    const supplier = suppliers.find(s => s.id === purchaseOrder.supplierId);
    if (!supplier) return null;
    
    // Crear factura a partir de la orden de compra
    const newInvoice = {
        id: invoices.length > 0 ? Math.max(...invoices.map(i => i.id)) + 1 : 1,
        clientId: null, // Las órdenes de compra no tienen cliente
        supplierId: purchaseOrder.supplierId,
        orderId: purchaseOrder.id,
        orderType: 'purchase',
        date: new Date().toISOString().split('T')[0],
        items: [...purchaseOrder.items],
        subtotal: purchaseOrder.subtotal,
        tax: purchaseOrder.tax,
        total: purchaseOrder.total,
        status: purchaseOrder.status,
        notes: `Factura generada automáticamente desde orden de compra #${purchaseOrder.id}`
    };
    
    invoices.push(newInvoice);
    localStorage.setItem('invoices', JSON.stringify(invoices));
    
    return newInvoice;
}

function generateInvoiceFromSalesOrder(salesOrder) {
    const customer = customers.find(c => c.id === salesOrder.clientId);
    if (!customer) return null;
    
    // Crear factura a partir de la orden de venta
    const newInvoice = {
        id: invoices.length > 0 ? Math.max(...invoices.map(i => i.id)) + 1 : 1,
        clientId: salesOrder.clientId,
        supplierId: null, // Las órdenes de venta no tienen proveedor
        orderId: salesOrder.id,
        orderType: 'sales',
        date: new Date().toISOString().split('T')[0],
        items: [...salesOrder.items],
        subtotal: salesOrder.subtotal,
        tax: salesOrder.tax,
        total: salesOrder.total,
        status: salesOrder.status,
        notes: `Factura generada automáticamente desde orden de venta #${salesOrder.id}`
    };
    
    invoices.push(newInvoice);
    localStorage.setItem('invoices', JSON.stringify(invoices));
    
    return newInvoice;
}

function printSection(tableId, title) {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    // Crear contenido para imprimir
    let printContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="text-align: center; color: #3498db;">SysInvent</h2>
            <h3 style="text-align: center;">${title}</h3>
            <hr>
    `;
    
    // Agregar la tabla
    printContent += table.outerHTML;
    
    // Cerrar el div
    printContent += `
            <div style="margin-top: 30px; text-align: right; font-size: 12px;">
                <p>Generado el: ${new Date().toLocaleDateString()}</p>
            </div>
        </div>
    `;
    
    // Abrir ventana de impresión
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>${title} - SysInvent</title>
                <style>
                    @media print {
                        body { margin: 0; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { padding: 8px; border: 1px solid #ddd; }
                        th { background-color: #f8f9fa; }
                    }
                </style>
            </head>
            <body>${printContent}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}