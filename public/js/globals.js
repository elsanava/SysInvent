// ===============================
// VARIABLES GLOBALES
// ===============================
const API_URL = "http://localhost:4000/api";
let token = localStorage.getItem('token') || null;

let currentUser = null;
let products = [];
let inventoryProducts = [];
let customers = [];
let suppliers = [];
let users = [];
let invoices = [];
let purchaseOrders = [];
let salesOrders = [];
let warehouses = [];
let inventoryMovements = [];

function getAuthHeaders() {
  return token ? { "Authorization": "Bearer " + token } : {};
}

// expose to window
window.API_URL = API_URL;
window.token = token;
window.currentUser = currentUser;
window.products = products;
window.inventoryProducts = inventoryProducts;
window.customers = customers;
window.suppliers = suppliers;
window.users = users;
window.warehouses = warehouses;
window.purchaseOrders = purchaseOrders;
window.salesOrders = salesOrders;
window.invoices = invoices;
window.inventoryMovements = inventoryMovements;
window.getAuthHeaders = getAuthHeaders;
