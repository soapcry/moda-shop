const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const order = req.body;

    await pool.query(
      `
      INSERT INTO orders
      (
        order_number,
        customer_name,
        phone,
        address,
        total,
        items
      )
      VALUES ($1,$2,$3,$4,$5,$6)
      `,
      [
        order.number,
        order.name,
        order.phone,
        order.address,
        order.total,
        JSON.stringify(order.items),
      ]
    );

    const text = `
🛍 Новый заказ ${order.number}

Сумма: ${order.total} ₽

Имя: ${order.name}
Телефон: ${order.phone}
Адрес: ${order.address}
`;

    await fetch(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: process.env.CHAT_ID,
          text,
        }),
      }
    );

    return res.status(200).json({
      ok: true,
    });
  } catch (e) {
    console.error(e);

    return res.status(500).json({
      ok: false,
      error: e.message,
    });
  }
};
