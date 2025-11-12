function updateProductStock(productId, quantityChange, movementType, reason, notes = '') {
        const productIndex = inventoryProducts.findIndex(p => p.id === productId);
        
        if (productIndex === -1) {
            console.error(`Producto con ID ${productId} no encontrado`);
            return false;
        }
        
        const product = inventoryProducts[productIndex];
        const oldStock = product.stock;
        
        // Actualizar stock del producto
        if (movementType === 'entry') {
            product.stock += quantityChange;
        } else if (movementType === 'exit') {
            // Validar que haya suficiente stock
            if (product.stock < quantityChange) {
                console.error(`Stock insuficiente para el producto: ${product.name}`);
                return false;
            }
            product.stock -= quantityChange;
        }
        
        // Registrar movimiento de inventario
        const newMovement = {
            id: inventoryMovements.length > 0 ? Math.max(...inventoryMovements.map(m => m.id)) + 1 : 1,
            productId,
            type: movementType,
            quantity: quantityChange,
            date: new Date().toISOString().split('T')[0],
            reason,
            notes,
            user: currentUser.name,
            oldStock,
            newStock: product.stock
        };
        
        inventoryMovements.push(newMovement);
        
        // Actualizar estado del producto basado en el nuevo stock
        updateProductStatus(product);
        
        // Guardar cambios
        localStorage.setItem('inventoryProducts', JSON.stringify(inventoryProducts));
        localStorage.setItem('inventoryMovements', JSON.stringify(inventoryMovements));
        
        console.log(`Stock actualizado: ${product.name} - ${oldStock} → ${product.stock}`);
        return true;
    }