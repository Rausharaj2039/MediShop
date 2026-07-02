const { getDb } = require('../config/db');

const mapOrder = (row, items = [], user = null) => {
  if (!row) return null;

  return {
    _id: row.id,
    id: row.id,
    user: user || { _id: row.user_id, id: row.user_id },
    orderItems: items,
    shippingAddress: JSON.parse(row.shipping_address),
    paymentMethod: row.payment_method,
    paymentResult: row.payment_result ? JSON.parse(row.payment_result) : null,
    taxPrice: row.tax_price,
    shippingPrice: row.shipping_price,
    totalPrice: row.total_price,
    isPaid: Boolean(row.is_paid),
    paidAt: row.paid_at,
    isDelivered: Boolean(row.is_delivered),
    deliveredAt: row.delivered_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const getOrderItems = (orderId) => {
  const rows = getDb()
    .prepare('SELECT * FROM order_items WHERE order_id = ?')
    .all(orderId);

  return rows.map((item) => ({
    _id: item.id,
    name: item.name,
    quantity: item.quantity,
    image: item.image,
    price: item.price,
    product: item.product_id,
  }));
};

const Order = {
  find: async () => {
    const rows = getDb()
      .prepare(
        `SELECT o.*, u.name as user_name, u.email as user_email
         FROM orders o
         JOIN users u ON u.id = o.user_id
         ORDER BY o.created_at DESC`
      )
      .all();

    return rows.map((row) =>
      mapOrder(
        row,
        getOrderItems(row.id),
        { _id: row.user_id, id: row.user_id, name: row.user_name, email: row.user_email }
      )
    );
  },

  findById: async (id) => {
    const row = getDb()
      .prepare(
        `SELECT o.*, u.name as user_name, u.email as user_email
         FROM orders o
         JOIN users u ON u.id = o.user_id
         WHERE o.id = ?`
      )
      .get(id);

    if (!row) return null;

    return mapOrder(
      row,
      getOrderItems(row.id),
      { _id: row.user_id, id: row.user_id, name: row.user_name, email: row.user_email }
    );
  },

  markDelivered: async (id) => {
    const existing = await Order.findById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    getDb()
      .prepare(
        `UPDATE orders
         SET is_delivered = 1, delivered_at = ?, updated_at = ?
         WHERE id = ?`
      )
      .run(now, now, id);

    return Order.findById(id);
  },
};

module.exports = Order;
