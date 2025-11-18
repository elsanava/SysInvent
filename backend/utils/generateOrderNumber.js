const generateOrderNumber = (prefix = 'OC') => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}-${timestamp}-${random}`;
};

const generateInvoiceNumber = () => {
  const timestamp = Date.now();
  return `F-${timestamp}`;
};

module.exports = {
  generateOrderNumber,
  generateInvoiceNumber
};