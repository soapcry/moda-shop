import { useState, useEffect, useRef } from "react";

const tg = window.Telegram?.WebApp;

// === НАСТРОЙКА УВЕДОМЛЕНИЙ О ЗАКАЗАХ ===
// 1. Создайте бота через @BotFather, получите токен (выглядит как "123456:ABC-DEF...")
// 2. Узнайте chat_id админа: напишите боту /start, затем откройте в браузере
//    https://api.telegram.org/bot<ТОКЕН>/getUpdates и найдите "chat":{"id": ...}
// 3. Вставьте оба значения ниже
const BOT_TOKEN = "8012479392:AAENgPRjcQlHGEJ1SKWlbSLjFoVhA2cPAAU"; // например "123456789:AAExampleTokenHere"
const ADMIN_CHAT_ID = "-5570401001"; // например "987654321"

async function sendOrderToAdmin(order) {
  if (!BOT_TOKEN || !ADMIN_CHAT_ID) {
    console.warn("Бот не настроен: заполните BOT_TOKEN и ADMIN_CHAT_ID");
    return { ok: false, reason: "not_configured" };
  }
  const user = tg?.initDataUnsafe?.user;
  const username = user?.username ? `@${user.username}` : "(без username, id: " + (user?.id || "—") + ")";

  const itemsText = order.items
    .map(i => `• ${i.name} (${i.selectedSize}), ${i.qty} шт. — ${formatPrice(i.price * i.qty)}`)
    .join("\n");

  const text =
    `🛍 Новый заказ ${order.number}\n\n` +
    `От: ${username}\n\n` +
    `Товары:\n${itemsText}\n\n` +
    `Сумма: ${formatPrice(order.total)}\n\n` +
    `Имя: ${order.name}\n` +
    `Телефон: ${order.phone}\n` +
    `Адрес: ${order.address}`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text }),
    });
    const data = await res.json();
    return { ok: data.ok, data };
  } catch (e) {
    return { ok: false, reason: "network_error", error: e };
  }
}

const CATEGORIES = [
  { id: "all", label: "Все", icon: "✦" },
  { id: "new", label: "Новинки", icon: "★" },
  { id: "women", label: "Женское", icon: "◆" },
  { id: "men", label: "Мужское", icon: "◇" },
  { id: "accessories", label: "Аксессуары", icon: "○" },
];

const PRODUCTS = [
  { id: 1, name: "Пальто Minimal", price: 12900, oldPrice: 17500, category: "women", tag: "Хит", colors: ["#1a1a1a", "#8B7355", "#C4C4C4"], sizes: ["XS","S","M","L"], img: "coat", photos: [
    "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80",
    "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80",
  ] },
  { id: 2, name: "Тренч Structured", price: 15400, category: "women", tag: "Новинка", colors: ["#C4A882", "#1a1a1a"], sizes: ["S","M","L","XL"], img: "trench", photos: [
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80",
  ] },
  { id: 3, name: "Куртка Utility", price: 8900, oldPrice: 11200, category: "men", tag: "Sale", colors: ["#3D4A3A", "#1a1a1a", "#6B5B45"], sizes: ["S","M","L","XL","XXL"], img: "jacket", photos: [
    "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80",
    "https://images.unsplash.com/photo-1551489186-cf8726f514f8?w=800&q=80",
  ] },
  { id: 4, name: "Брюки Wide", price: 6400, category: "men", colors: ["#1a1a1a", "#F5F0E8"], sizes: ["XS","S","M","L","XL"], img: "pants", photos: [
    "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80",
    "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80&sat=-50",
  ] },
  { id: 5, name: "Жакет Boxy", price: 9800, category: "women", tag: "Новинка", colors: ["#E8E0D5", "#1a1a1a", "#8B7355"], sizes: ["XS","S","M","L"], img: "blazer", photos: [
    "https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=800&q=80",
    "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800&q=80",
  ] },
  { id: 6, name: "Сумка Minimal Tote", price: 4900, category: "accessories", tag: "Хит", colors: ["#C4A882", "#1a1a1a", "#E8E0D5"], sizes: ["ONE SIZE"], img: "bag", photos: [
    "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&q=80",
    "https://images.unsplash.com/photo-1590739225497-99a8e8a39c7a?w=800&q=80",
  ] },
  { id: 7, name: "Ремень Leather", price: 2900, category: "accessories", colors: ["#1a1a1a", "#8B7355"], sizes: ["S/M","M/L"], img: "belt", photos: [
    "https://images.unsplash.com/photo-1611923134239-b9be5816e23c?w=800&q=80",
    "https://images.unsplash.com/photo-1517257104747-1b3e718c5e6a?w=800&q=80",
  ] },
  { id: 8, name: "Свитер Oversize", price: 5600, oldPrice: 7800, category: "women", tag: "Sale", colors: ["#E8D5C8", "#94978A", "#1a1a1a"], sizes: ["XS","S","M","L"], img: "sweater", photos: [
    "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80",
    "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=800&q=80",
  ] },
  { id: 9, name: "Рубашка Poplin", price: 4200, category: "men", tag: "Новинка", colors: ["#F5F0E8", "#1a1a1a", "#B8C4C0"], sizes: ["S","M","L","XL"], img: "shirt", photos: [
    "https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=800&q=80",
    "https://images.unsplash.com/photo-1564859228273-274232fdb516?w=800&q=80",
  ] },
  { id: 10, name: "Очки Geometric", price: 3800, category: "accessories", colors: ["#1a1a1a", "#C4A882"], sizes: ["ONE SIZE"], img: "glasses", photos: [
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80",
    "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80",
  ] },
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Montserrat:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
  :root {
    --bg: #0D0D0D;
    --bg2: #141414;
    --bg3: #1C1C1C;
    --bg4: #242424;
    --gold: #C4A882;
    --gold-light: #E8D5C0;
    --text: #F0EDE8;
    --text2: #A09A92;
    --text3: #5C5750;
    --border: rgba(196,168,130,0.15);
    --border2: rgba(196,168,130,0.3);
    --red: #C4574A;
    --font-serif: 'Cormorant Garamond', Georgia, serif;
    --font-sans: 'Montserrat', sans-serif;
  }
  body { background: var(--bg); color: var(--text); font-family: var(--font-sans); overflow-x: hidden; }
  
  .app { max-width: 430px; margin: 0 auto; min-height: 100vh; background: var(--bg); position: relative; }
  
  /* STATUS BAR */
  .status-bar { height: 44px; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; position: sticky; top: 0; z-index: 100; background: var(--bg); border-bottom: 1px solid var(--border); }
  .store-name { font-family: var(--font-serif); font-size: 20px; font-weight: 300; letter-spacing: 0.15em; color: var(--text); }
  .store-name span { color: var(--gold); }
  .header-icons { display: flex; gap: 16px; align-items: center; }
  .icon-btn { background: none; border: none; cursor: pointer; color: var(--text2); font-size: 18px; position: relative; padding: 4px; }
  .badge { position: absolute; top: -2px; right: -4px; background: var(--gold); color: #0D0D0D; font-size: 9px; font-weight: 600; font-family: var(--font-sans); width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }

  /* NAV */
  .bottom-nav { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 430px; background: var(--bg2); border-top: 1px solid var(--border); display: flex; z-index: 200; padding-bottom: env(safe-area-inset-bottom); }
  .nav-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 10px 0 8px; cursor: pointer; border: none; background: none; color: var(--text3); font-family: var(--font-sans); font-size: 10px; letter-spacing: 0.05em; text-transform: uppercase; transition: color 0.2s; }
  .nav-item.active { color: var(--gold); }
  .nav-item svg { width: 20px; height: 20px; }

  /* PAGES */
  .page { padding: 0 0 80px; animation: fadeIn 0.25s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  
  /* CATALOG PAGE */
  .hero { padding: 28px 20px 20px; }
  .hero-title { font-family: var(--font-serif); font-size: 38px; font-weight: 300; line-height: 1.1; letter-spacing: 0.02em; color: var(--text); }
  .hero-title em { font-style: italic; color: var(--gold); }
  .hero-sub { font-size: 11px; color: var(--text3); letter-spacing: 0.12em; text-transform: uppercase; margin-top: 6px; }

  .categories { display: flex; gap: 8px; padding: 0 20px 16px; overflow-x: auto; scrollbar-width: none; }
  .categories::-webkit-scrollbar { display: none; }
  .cat-btn { flex-shrink: 0; padding: 7px 16px; border-radius: 2px; border: 1px solid var(--border); background: transparent; color: var(--text2); font-family: var(--font-sans); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
  .cat-btn.active { background: var(--gold); border-color: var(--gold); color: #0D0D0D; font-weight: 500; }

  .products-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--border); margin: 0 0 1px; }
  .product-card { background: var(--bg); cursor: pointer; position: relative; overflow: hidden; transition: background 0.2s; }
  .product-card:active { background: var(--bg3); }
  .product-img { width: 100%; height: 100%; position: relative; }
  .product-tag { position: absolute; top: 10px; left: 10px; font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 8px; font-family: var(--font-sans); font-weight: 500; }
  .tag-hit { background: var(--gold); color: #0D0D0D; }
  .tag-new { background: transparent; border: 1px solid var(--text); color: var(--text); }
  .tag-sale { background: var(--red); color: #fff; }
  .fav-btn { position: absolute; top: 10px; right: 10px; width: 28px; height: 28px; background: rgba(13,13,13,0.7); border: 1px solid var(--border2); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 13px; transition: all 0.2s; }
  .fav-btn.liked { background: rgba(196,87,74,0.2); border-color: var(--red); }
  .product-info { padding: 10px 12px 14px; }
  .product-name { font-family: var(--font-serif); font-size: 15px; font-weight: 400; color: var(--text); line-height: 1.3; margin-bottom: 6px; }
  .product-prices { display: flex; align-items: baseline; gap: 6px; }
  .price { font-size: 14px; font-weight: 500; color: var(--gold); letter-spacing: 0.02em; }
  .price-old { font-size: 11px; color: var(--text3); text-decoration: line-through; }
  .color-dots { display: flex; gap: 4px; margin-top: 6px; }
  .color-dot { width: 8px; height: 8px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.1); }

  /* PRODUCT DETAIL */
  .detail-page { animation: slideUp 0.3s ease; }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .back-btn { display: flex; align-items: center; gap: 8px; padding: 14px 20px 0; background: none; border: none; color: var(--text2); font-family: var(--font-sans); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; }
  .detail-img { width: 100%; height: 100%; position: relative; }
  .detail-body { padding: 20px; }
  .detail-name { font-family: var(--font-serif); font-size: 28px; font-weight: 300; line-height: 1.2; letter-spacing: 0.03em; }
  .detail-prices { display: flex; align-items: baseline; gap: 10px; margin: 10px 0 20px; }
  .detail-price { font-size: 24px; font-weight: 500; color: var(--gold); }
  .detail-price-old { font-size: 16px; color: var(--text3); text-decoration: line-through; }
  .section-label { font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--text3); margin-bottom: 10px; }
  .colors-row { display: flex; gap: 10px; margin-bottom: 20px; }
  .color-swatch { width: 28px; height: 28px; border-radius: 50%; cursor: pointer; transition: all 0.2s; border: 2px solid transparent; }
  .color-swatch.selected { border-color: var(--gold); transform: scale(1.15); }
  .sizes-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
  .size-btn { padding: 8px 16px; border: 1px solid var(--border2); background: transparent; color: var(--text2); font-family: var(--font-sans); font-size: 12px; letter-spacing: 0.1em; cursor: pointer; transition: all 0.2s; }
  .size-btn.selected { border-color: var(--gold); color: var(--gold); background: rgba(196,168,130,0.08); }
  .add-cart-btn { width: 100%; padding: 16px; background: var(--gold); color: #0D0D0D; border: none; font-family: var(--font-sans); font-size: 12px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; }
  .add-cart-btn:active { background: var(--gold-light); transform: scale(0.99); }
  .add-cart-btn.added { background: var(--bg3); color: var(--gold); border: 1px solid var(--gold); }

  /* CART PAGE */
  .cart-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 16px; }
  .cart-empty-icon { font-size: 48px; opacity: 0.3; }
  .cart-empty-text { font-family: var(--font-serif); font-size: 22px; font-weight: 300; color: var(--text3); }
  .cart-empty-sub { font-size: 11px; color: var(--text3); letter-spacing: 0.1em; }
  .cart-item { display: flex; gap: 14px; padding: 16px 20px; border-bottom: 1px solid var(--border); }
  .cart-img { width: 70px; height: 90px; border-radius: 2px; overflow: hidden; flex-shrink: 0; }
  .cart-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .cart-details { flex: 1; }
  .cart-name { font-family: var(--font-serif); font-size: 16px; font-weight: 400; line-height: 1.3; margin-bottom: 4px; }
  .cart-meta { font-size: 11px; color: var(--text3); letter-spacing: 0.05em; margin-bottom: 10px; }
  .cart-row { display: flex; align-items: center; justify-content: space-between; }
  .qty-control { display: flex; align-items: center; gap: 12px; }
  .qty-btn { width: 26px; height: 26px; border: 1px solid var(--border2); background: transparent; color: var(--text); font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
  .qty-btn:active { background: var(--bg3); }
  .qty-num { font-size: 14px; font-weight: 500; min-width: 20px; text-align: center; }
  .remove-btn { background: none; border: none; color: var(--text3); cursor: pointer; font-size: 18px; padding: 4px; }
  .cart-price { font-size: 16px; font-weight: 500; color: var(--gold); }
  .cart-summary { padding: 20px; border-top: 1px solid var(--border2); }
  .summary-row { display: flex; justify-content: space-between; font-size: 13px; color: var(--text2); margin-bottom: 10px; }
  .summary-row.total { font-size: 18px; font-weight: 500; color: var(--text); font-family: var(--font-serif); margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--border); }
  .checkout-btn { width: 100%; padding: 16px; background: var(--gold); color: #0D0D0D; border: none; font-family: var(--font-sans); font-size: 12px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; cursor: pointer; margin-top: 20px; }
  .checkout-btn:active { background: var(--gold-light); }
  .promo-row { display: flex; gap: 10px; margin-bottom: 14px; }
  .promo-input { flex: 1; padding: 10px 14px; background: var(--bg3); border: 1px solid var(--border); color: var(--text); font-family: var(--font-sans); font-size: 12px; letter-spacing: 0.05em; outline: none; }
  .promo-input::placeholder { color: var(--text3); }
  .promo-apply { padding: 10px 16px; background: transparent; border: 1px solid var(--border2); color: var(--text2); font-family: var(--font-sans); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
  .promo-apply:active { background: var(--bg3); }

  /* PROFILE PAGE */
  .profile-header { padding: 28px 20px 20px; display: flex; align-items: center; gap: 16px; }
  .avatar { width: 64px; height: 64px; border-radius: 50%; background: var(--bg3); border: 1px solid var(--border2); display: flex; align-items: center; justify-content: center; font-family: var(--font-serif); font-size: 24px; color: var(--gold); flex-shrink: 0; }
  .profile-name { font-family: var(--font-serif); font-size: 24px; font-weight: 300; color: var(--text); }
  .profile-sub { font-size: 11px; color: var(--text3); letter-spacing: 0.08em; margin-top: 3px; }
  .stats-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1px; background: var(--border); margin: 0 0 20px; }
  .stat-box { background: var(--bg); padding: 16px 12px; text-align: center; }
  .stat-num { font-family: var(--font-serif); font-size: 24px; font-weight: 300; color: var(--gold); }
  .stat-label { font-size: 10px; color: var(--text3); letter-spacing: 0.1em; text-transform: uppercase; margin-top: 4px; }
  .menu-section { padding: 0 20px 8px; }
  .menu-label { font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--text3); padding: 16px 0 8px; }
  .menu-item { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid var(--border); cursor: pointer; }
  .menu-item:last-child { border-bottom: none; }
  .menu-item-left { display: flex; align-items: center; gap: 12px; }
  .menu-icon { width: 32px; height: 32px; background: var(--bg3); border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
  .menu-text { font-size: 14px; color: var(--text); }
  .menu-arrow { color: var(--text3); font-size: 18px; }
  .menu-badge { background: var(--gold); color: #0D0D0D; font-size: 10px; font-weight: 600; font-family: var(--font-sans); padding: 2px 8px; border-radius: 1px; }
  
  .page-title { font-family: var(--font-serif); font-size: 28px; font-weight: 300; padding: 24px 20px 0; letter-spacing: 0.03em; }
  .page-count { font-size: 11px; color: var(--text3); letter-spacing: 0.1em; padding: 4px 20px 16px; }
  
  /* Toast */
  .toast { position: fixed; top: 60px; left: 50%; transform: translateX(-50%) translateY(-20px); background: var(--gold); color: #0D0D0D; font-family: var(--font-sans); font-size: 12px; font-weight: 500; letter-spacing: 0.08em; padding: 10px 20px; z-index: 1000; opacity: 0; transition: all 0.3s; pointer-events: none; border-radius: 2px; white-space: nowrap; }
  .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
  
  /* Search */
  .search-bar { margin: 0 20px 16px; display: flex; align-items: center; gap: 10px; background: var(--bg3); border: 1px solid var(--border); padding: 10px 14px; }
  .search-icon { color: var(--text3); font-size: 16px; }
  .search-input { flex: 1; background: none; border: none; color: var(--text); font-family: var(--font-sans); font-size: 13px; outline: none; }
  .search-input::placeholder { color: var(--text3); }

  /* IMAGE GALLERY */
  .gallery { position: relative; width: 100%; height: 100%; overflow: hidden; }
  .gallery-track { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; -webkit-overflow-scrolling: touch; height: 100%; }
  .gallery-track::-webkit-scrollbar { display: none; }
  .gallery-slide { flex: 0 0 100%; scroll-snap-align: start; height: 100%; }
  .gallery-slide img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .gallery-dots { position: absolute; bottom: 10px; left: 0; right: 0; display: flex; justify-content: center; gap: 6px; z-index: 5; }
  .gallery-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,0.35); transition: all 0.2s; cursor: pointer; }
  .gallery-dot-hit { padding: 8px; margin: -8px; display: flex; align-items: center; justify-content: center; }
  .gallery-dot.active { background: var(--gold); width: 14px; border-radius: 3px; }
  .gallery-arrow { position: absolute; top: 50%; transform: translateY(-50%); width: 28px; height: 28px; border-radius: 50%; background: rgba(13,13,13,0.55); border: 1px solid rgba(255,255,255,0.15); color: var(--text); display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 6; font-size: 14px; opacity: 0; transition: opacity 0.2s, background 0.2s; backdrop-filter: blur(2px); }
  .gallery:hover .gallery-arrow { opacity: 1; }
  .gallery-arrow:hover { background: rgba(13,13,13,0.8); }
  .gallery-arrow.prev { left: 8px; }
  .gallery-arrow.next { right: 8px; }
  .gallery-img-fallback { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--bg3); font-size: 40px; color: var(--text3); }
  @media (hover: none) {
    .gallery-arrow { display: none; }
  }
  .product-img-card { width: 100%; aspect-ratio: 3/4; position: relative; }
  .product-img-card .gallery, .product-img-card .gallery-track, .product-img-card .gallery-slide { height: 100%; }
  .detail-img-card { width: 100%; aspect-ratio: 1/1.1; position: relative; }
  .detail-img-card .gallery, .detail-img-card .gallery-track, .detail-img-card .gallery-slide { height: 100%; }

  /* ORDER FORM */
  .order-form { padding: 0 20px 20px; }
  .form-group { margin-bottom: 16px; }
  .form-label { font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--text3); margin-bottom: 8px; display: block; }
  .form-input { width: 100%; padding: 13px 14px; background: var(--bg3); border: 1px solid var(--border); color: var(--text); font-family: var(--font-sans); font-size: 14px; outline: none; transition: border-color 0.2s; }
  .form-input:focus { border-color: var(--gold); }
  .form-input::placeholder { color: var(--text3); }
  .form-input.error { border-color: var(--red); }
  .form-error { font-size: 11px; color: var(--red); margin-top: 6px; letter-spacing: 0.03em; }
  .form-textarea { resize: none; font-family: var(--font-sans); min-height: 70px; }
  .order-summary-box { background: var(--bg3); border: 1px solid var(--border); padding: 16px; margin-bottom: 20px; }
  .order-summary-item { display: flex; justify-content: space-between; font-size: 12px; color: var(--text2); padding: 6px 0; }
  .order-summary-item.bold { font-weight: 500; color: var(--text); font-size: 14px; padding-top: 10px; margin-top: 6px; border-top: 1px solid var(--border); }
  .submit-spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(13,13,13,0.3); border-top-color: #0D0D0D; border-radius: 50%; animation: spin 0.7s linear infinite; vertical-align: middle; margin-right: 8px; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* CONFIRMATION SCREEN */
  .confirm-page { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 40px 24px; text-align: center; }
  .confirm-icon { width: 72px; height: 72px; border-radius: 50%; border: 1px solid var(--gold); display: flex; align-items: center; justify-content: center; font-size: 32px; color: var(--gold); margin-bottom: 24px; animation: popIn 0.4s ease; }
  @keyframes popIn { from { opacity: 0; transform: scale(0.6); } to { opacity: 1; transform: scale(1); } }
  .confirm-title { font-family: var(--font-serif); font-size: 28px; font-weight: 300; margin-bottom: 8px; }
  .confirm-sub { font-size: 12px; color: var(--text2); letter-spacing: 0.05em; line-height: 1.7; max-width: 280px; margin-bottom: 28px; }
  .confirm-number { font-family: var(--font-serif); font-size: 22px; color: var(--gold); letter-spacing: 0.1em; border: 1px solid var(--border2); padding: 12px 28px; margin-bottom: 32px; }
  .confirm-btn { padding: 14px 32px; background: var(--gold); color: #0D0D0D; border: none; font-family: var(--font-sans); font-size: 11px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; cursor: pointer; }
`;

function formatPrice(p) {
  return p.toLocaleString("ru-RU") + " ₽";
}

function ImageGallery({ photos, alt, className }) {
  const trackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [brokenIndexes, setBrokenIndexes] = useState({});

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const idx = Math.round(track.scrollLeft / track.clientWidth);
    setActiveIndex(idx);
  };

  const goTo = (index) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = (index + photos.length) % photos.length;
    track.scrollTo({ left: clamped * track.clientWidth, behavior: "smooth" });
    setActiveIndex(clamped);
  };

  const handleImgError = (i) => {
    setBrokenIndexes(prev => ({ ...prev, [i]: true }));
  };

  return (
    <div className={className}>
      <div className="gallery">
        <div className="gallery-track" ref={trackRef} onScroll={handleScroll}>
          {photos.map((src, i) => (
            <div className="gallery-slide" key={i}>
              {brokenIndexes[i] ? (
                <div className="gallery-img-fallback">📷</div>
              ) : (
                <img src={src} alt={alt} loading="lazy" onError={() => handleImgError(i)} />
              )}
            </div>
          ))}
        </div>
        {photos.length > 1 && (
          <>
            <button className="gallery-arrow prev" onClick={(e) => { e.stopPropagation(); goTo(activeIndex - 1); }} aria-label="Предыдущее фото">‹</button>
            <button className="gallery-arrow next" onClick={(e) => { e.stopPropagation(); goTo(activeIndex + 1); }} aria-label="Следующее фото">›</button>
            <div className="gallery-dots">
              {photos.map((_, i) => (
                <div key={i} className="gallery-dot-hit" onClick={(e) => { e.stopPropagation(); goTo(i); }}>
                  <div className={`gallery-dot${i === activeIndex ? " active" : ""}`} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CatalogPage({ onProductClick, cart, favorites, toggleFav }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = PRODUCTS.filter(p => {
    const matchCat = activeCategory === "all" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-sub">Коллекция 2026</div>
        <h1 className="hero-title">Мода,<br />созданная для <em>тебя</em></h1>
      </div>
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input className="search-input" placeholder="Поиск по каталогу…" value={search} onChange={e => setSearch(e.target.value)} />
        {search && <span style={{ cursor: "pointer", color: "var(--text3)", fontSize: 16 }} onClick={() => setSearch("")}>✕</span>}
      </div>
      <div className="categories">
        {CATEGORIES.map(c => (
          <button key={c.id} className={`cat-btn${activeCategory === c.id ? " active" : ""}`} onClick={() => setActiveCategory(c.id)}>
            {c.icon} {c.label}
          </button>
        ))}
      </div>
      <div style={{ padding: "0 20px 10px", fontSize: 11, color: "var(--text3)", letterSpacing: "0.08em" }}>
        {filtered.length} {filtered.length === 1 ? "товар" : filtered.length < 5 ? "товара" : "товаров"}
      </div>
      <div className="products-grid">
        {filtered.map(p => (
          <div key={p.id} className="product-card" onClick={() => onProductClick(p)}>
            <div className="product-img-card">
              <ImageGallery photos={p.photos} alt={p.name} className="product-img" />
              {p.tag && <span className={`product-tag tag-${p.tag === "Хит" ? "hit" : p.tag === "Новинка" ? "new" : "sale"}`}>{p.tag}</span>}
              <button className={`fav-btn${favorites.includes(p.id) ? " liked" : ""}`} onClick={e => { e.stopPropagation(); toggleFav(p.id); }}>
                {favorites.includes(p.id) ? "♥" : "♡"}
              </button>
            </div>
            <div className="product-info">
              <div className="product-name">{p.name}</div>
              <div className="product-prices">
                <span className="price">{formatPrice(p.price)}</span>
                {p.oldPrice && <span className="price-old">{formatPrice(p.oldPrice)}</span>}
              </div>
              <div className="color-dots">
                {p.colors.map((c, i) => <div key={i} className="color-dot" style={{ background: c }} />)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductDetail({ product, onBack, onAddToCart, cart }) {
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [added, setAdded] = useState(false);
  const inCart = cart.some(i => i.id === product.id);

  const handleAdd = () => {
    if (!selectedSize) return;
    onAddToCart({ ...product, selectedColor, selectedSize, cartKey: `${product.id}-${selectedColor}-${selectedSize}` });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="detail-page page">
      <button className="back-btn" onClick={onBack}>← Назад</button>
      <div className="detail-img-card">
        <ImageGallery photos={product.photos} alt={product.name} className="detail-img" />
      </div>
      <div className="detail-body">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <h1 className="detail-name">{product.name}</h1>
          {product.tag && (
            <span className={`product-tag tag-${product.tag === "Хит" ? "hit" : product.tag === "Новинка" ? "new" : "sale"}`} style={{ position: "static", marginTop: 4 }}>
              {product.tag}
            </span>
          )}
        </div>
        <div className="detail-prices">
          <span className="detail-price">{formatPrice(product.price)}</span>
          {product.oldPrice && <span className="detail-price-old">{formatPrice(product.oldPrice)}</span>}
        </div>
        <div className="section-label">Цвет</div>
        <div className="colors-row">
          {product.colors.map((c, i) => (
            <div key={i} className={`color-swatch${selectedColor === i ? " selected" : ""}`}
              style={{ background: c, border: c === "#F5F0E8" || c === "#E8E0D5" ? "1px solid rgba(196,168,130,0.4)" : "none" }}
              onClick={() => setSelectedColor(i)} />
          ))}
        </div>
        <div className="section-label">Размер</div>
        <div className="sizes-row">
          {product.sizes.map(s => (
            <button key={s} className={`size-btn${selectedSize === s ? " selected" : ""}`} onClick={() => setSelectedSize(s)}>{s}</button>
          ))}
        </div>
        <button className={`add-cart-btn${added || inCart ? " added" : ""}`} onClick={handleAdd} disabled={!selectedSize}>
          {!selectedSize ? "Выберите размер" : added ? "✓ Добавлено в корзину" : inCart ? "✓ Уже в корзине" : "Добавить в корзину"}
        </button>
        <div style={{ marginTop: 24, padding: "16px 0", borderTop: "1px solid var(--border)" }}>
          <div style={{ fontSize: 11, color: "var(--text3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>О товаре</div>
          <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.7 }}>
            Минималистичный силуэт из премиальных материалов. Идеально для создания лаконичного образа в любой сезон.
          </div>
        </div>
        <div style={{ display: "flex", gap: 20, marginTop: 16, padding: "16px 0", borderTop: "1px solid var(--border)" }}>
          {[["🚚", "Доставка 2–4 дня"], ["↩️", "Возврат 30 дней"], ["✓", "Оригинал гарантирован"]].map(([icon, text]) => (
            <div key={text} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontSize: 10, color: "var(--text3)", letterSpacing: "0.05em", lineHeight: 1.4 }}>{text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CartPage({ cart, updateQty, removeItem, onCheckout }) {
  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState(0);
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = subtotal > 5000 ? 0 : 390;
  const total = subtotal - discount + delivery;

  const applyPromo = () => {
    if (promo.toUpperCase() === "STYLE10") setDiscount(Math.round(subtotal * 0.1));
  };

  if (cart.length === 0) return (
    <div className="page">
      <div className="cart-empty">
        <div className="cart-empty-icon">🛍️</div>
        <div className="cart-empty-text">Корзина пуста</div>
        <div className="cart-empty-sub" style={{ fontSize: 12, color: "var(--text3)", letterSpacing: "0.08em" }}>
          Добавьте товары из каталога
        </div>
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="page-title">Корзина</div>
      <div className="page-count">{cart.length} {cart.length === 1 ? "товар" : cart.length < 5 ? "товара" : "товаров"}</div>
      {cart.map(item => (
        <div key={item.cartKey} className="cart-item">
          <div className="cart-img">
            <img src={item.photos[0]} alt={item.name} loading="lazy" />
          </div>
          <div className="cart-details">
            <div className="cart-name">{item.name}</div>
            <div className="cart-meta">Размер: {item.selectedSize} · {item.colors[item.selectedColor] === "#1a1a1a" ? "Чёрный" : item.colors[item.selectedColor] === "#F5F0E8" || item.colors[item.selectedColor] === "#E8E0D5" ? "Белый" : "Кэмел"}</div>
            <div className="cart-row">
              <div className="qty-control">
                <button className="qty-btn" onClick={() => updateQty(item.cartKey, item.qty - 1)}>−</button>
                <span className="qty-num">{item.qty}</span>
                <button className="qty-btn" onClick={() => updateQty(item.cartKey, item.qty + 1)}>+</button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="cart-price">{formatPrice(item.price * item.qty)}</span>
                <button className="remove-btn" onClick={() => removeItem(item.cartKey)}>✕</button>
              </div>
            </div>
          </div>
        </div>
      ))}
      <div className="cart-summary">
        <div className="promo-row">
          <input className="promo-input" placeholder="Промокод (STYLE10)" value={promo} onChange={e => setPromo(e.target.value.toUpperCase())} />
          <button className="promo-apply" onClick={applyPromo}>Применить</button>
        </div>
        <div className="summary-row"><span>Подытог</span><span>{formatPrice(subtotal)}</span></div>
        {discount > 0 && <div className="summary-row" style={{ color: "var(--red)" }}><span>Скидка</span><span>−{formatPrice(discount)}</span></div>}
        <div className="summary-row"><span>Доставка</span><span>{delivery === 0 ? "Бесплатно" : formatPrice(delivery)}</span></div>
        {delivery === 0 && <div style={{ fontSize: 10, color: "var(--gold)", letterSpacing: "0.08em", marginBottom: 8 }}>✓ Бесплатная доставка от 5 000 ₽</div>}
        <div className="summary-row total"><span>Итого</span><span style={{ color: "var(--gold)" }}>{formatPrice(total)}</span></div>
        <button className="checkout-btn" onClick={() => onCheckout({ subtotal, discount, delivery, total })}>Оформить заказ</button>
      </div>
    </div>
  );
}

function FavoritesPage({ favorites, onProductClick, toggleFav }) {
  const favProducts = PRODUCTS.filter(p => favorites.includes(p.id));
  if (favProducts.length === 0) return (
    <div className="page">
      <div className="cart-empty">
        <div className="cart-empty-icon">♡</div>
        <div className="cart-empty-text">Избранное пусто</div>
        <div className="cart-empty-sub">Сохраняйте понравившиеся товары</div>
      </div>
    </div>
  );
  return (
    <div className="page">
      <div className="page-title">Избранное</div>
      <div className="page-count">{favProducts.length} товара</div>
      <div className="products-grid">
        {favProducts.map(p => (
          <div key={p.id} className="product-card" onClick={() => onProductClick(p)}>
            <div className="product-img-card">
              <ImageGallery photos={p.photos} alt={p.name} className="product-img" />
              <button className="fav-btn liked" onClick={e => { e.stopPropagation(); toggleFav(p.id); }}>♥</button>
            </div>
            <div className="product-info">
              <div className="product-name">{p.name}</div>
              <div className="product-prices">
                <span className="price">{formatPrice(p.price)}</span>
                {p.oldPrice && <span className="price-old">{formatPrice(p.oldPrice)}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfilePage() {
  const user = tg?.initDataUnsafe?.user;
  const name = user ? `${user.first_name} ${user.last_name || ""}`.trim() : "Гость";
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const orders = [
    { id: "#TMA-2461", date: "18 мая 2026", status: "Доставлен", total: 12900 },
    { id: "#TMA-2288", date: "2 апреля 2026", status: "Доставлен", total: 8400 },
  ];

  return (
    <div className="page">
      <div className="profile-header">
        <div className="avatar">{initials || "Г"}</div>
        <div>
          <div className="profile-name">{name}</div>
          <div className="profile-sub">{user?.username ? `@${user.username}` : "Золотой клиент"}</div>
        </div>
      </div>
      <div className="stats-row">
        <div className="stat-box"><div className="stat-num">2</div><div className="stat-label">Заказы</div></div>
        <div className="stat-box"><div className="stat-num">21 300</div><div className="stat-label">₽ потрачено</div></div>
        <div className="stat-box"><div className="stat-num">180</div><div className="stat-label">Баллы</div></div>
      </div>
      <div className="menu-section">
        <div className="menu-label">Мои заказы</div>
        {orders.map(o => (
          <div key={o.id} className="menu-item">
            <div className="menu-item-left">
              <div className="menu-icon">📦</div>
              <div>
                <div className="menu-text">{o.id}</div>
                <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2, letterSpacing: "0.05em" }}>{o.date} · {formatPrice(o.total)}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 10, color: "var(--gold)", letterSpacing: "0.08em" }}>{o.status}</span>
              <span className="menu-arrow">›</span>
            </div>
          </div>
        ))}
        <div className="menu-label">Аккаунт</div>
        {[
          { icon: "📍", text: "Адреса доставки" },
          { icon: "💳", text: "Способы оплаты", badge: "Visa •• 4242" },
          { icon: "🎁", text: "Программа лояльности", badge: "180 баллов" },
          { icon: "🔔", text: "Уведомления" },
          { icon: "⚙️", text: "Настройки" },
        ].map(item => (
          <div key={item.text} className="menu-item">
            <div className="menu-item-left">
              <div className="menu-icon">{item.icon}</div>
              <div className="menu-text">{item.text}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {item.badge && <span className="menu-badge">{item.badge}</span>}
              <span className="menu-arrow">›</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderForm({ cart, totals, onBack, onSubmit }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const user = tg?.initDataUnsafe?.user;
    if (user?.first_name) setName(`${user.first_name} ${user.last_name || ""}`.trim());
  }, []);

  const validate = () => {
    const errs = {};
    if (name.trim().length < 2) errs.name = "Введите имя и фамилию";
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) errs.phone = "Введите корректный номер телефона";
    if (address.trim().length < 5) errs.address = "Введите полный адрес доставки";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      tg?.HapticFeedback?.notificationOccurred?.("error");
      return;
    }
    setSubmitting(true);
    const orderNumber = "#" + Math.floor(100000 + Math.random() * 900000);
    const order = {
      number: orderNumber,
      items: cart,
      total: totals.total,
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      comment: comment.trim(),
    };
    const result = await sendOrderToAdmin(order);
    setSubmitting(false);
    tg?.HapticFeedback?.notificationOccurred?.("success");
    onSubmit(order, result);
  };

  return (
    <div className="page">
      <button className="back-btn" onClick={onBack}>← Назад в корзину</button>
      <div className="page-title" style={{ paddingTop: 12 }}>Оформление</div>
      <div className="page-count">Заполните данные для доставки</div>

      <div className="order-form" style={{ marginTop: 8 }}>
        <div className="order-summary-box">
          <div className="order-summary-item"><span>Товаров</span><span>{cart.reduce((s, i) => s + i.qty, 0)} шт.</span></div>
          <div className="order-summary-item"><span>Доставка</span><span>{totals.delivery === 0 ? "Бесплатно" : formatPrice(totals.delivery)}</span></div>
          {totals.discount > 0 && <div className="order-summary-item" style={{ color: "var(--red)" }}><span>Скидка</span><span>−{formatPrice(totals.discount)}</span></div>}
          <div className="order-summary-item bold"><span>К оплате</span><span style={{ color: "var(--gold)" }}>{formatPrice(totals.total)}</span></div>
        </div>

        <div className="form-group">
          <label className="form-label">Имя и фамилия</label>
          <input className={`form-input${errors.name ? " error" : ""}`} placeholder="Например, Анна Иванова" value={name} onChange={e => setName(e.target.value)} />
          {errors.name && <div className="form-error">{errors.name}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Телефон</label>
          <input className={`form-input${errors.phone ? " error" : ""}`} placeholder="+7 900 000-00-00" value={phone} onChange={e => setPhone(e.target.value)} type="tel" />
          {errors.phone && <div className="form-error">{errors.phone}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Адрес доставки</label>
          <input className={`form-input${errors.address ? " error" : ""}`} placeholder="Город, улица, дом, квартира" value={address} onChange={e => setAddress(e.target.value)} />
          {errors.address && <div className="form-error">{errors.address}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Комментарий к заказу (необязательно)</label>
          <textarea className="form-input form-textarea" placeholder="Например, удобное время доставки" value={comment} onChange={e => setComment(e.target.value)} />
        </div>

        <button className="checkout-btn" onClick={handleSubmit} disabled={submitting}>
          {submitting && <span className="submit-spinner" />}
          {submitting ? "Отправка заказа…" : `Подтвердить заказ · ${formatPrice(totals.total)}`}
        </button>
      </div>
    </div>
  );
}

function OrderConfirmation({ order, onContinue }) {
  return (
    <div className="confirm-page">
      <div className="confirm-icon">✓</div>
      <h1 className="confirm-title">Заказ принят</h1>
      <p className="confirm-sub">
        Спасибо, {order.name.split(" ")[0]}! Мы получили ваш заказ и свяжемся с вами по телефону {order.phone} для подтверждения деталей доставки.
      </p>
      <div className="confirm-number">{order.number}</div>
      <button className="confirm-btn" onClick={onContinue}>Вернуться в каталог</button>
    </div>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState("catalog");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [toast, setToast] = useState({ visible: false, msg: "" });
  const [checkoutTotals, setCheckoutTotals] = useState(null);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
      tg.setHeaderColor("#0D0D0D");
      tg.setBackgroundColor("#0D0D0D");
    }
  }, []);

  const showToast = (msg) => {
    setToast({ visible: true, msg });
    setTimeout(() => setToast({ visible: false, msg }), 2200);
  };

  const addToCart = (item) => {
    setCart(prev => {
      const exists = prev.find(i => i.cartKey === item.cartKey);
      if (exists) return prev.map(i => i.cartKey === item.cartKey ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
    showToast("Добавлено в корзину");
  };

  const updateQty = (cartKey, qty) => {
    if (qty <= 0) setCart(prev => prev.filter(i => i.cartKey !== cartKey));
    else setCart(prev => prev.map(i => i.cartKey === cartKey ? { ...i, qty } : i));
  };

  const removeItem = (cartKey) => setCart(prev => prev.filter(i => i.cartKey !== cartKey));

  const toggleFav = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
    if (!favorites.includes(id)) showToast("Добавлено в избранное");
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const handleProductClick = (p) => { setSelectedProduct(p); };
  const handleBack = () => setSelectedProduct(null);

  const handleCheckout = (totals) => setCheckoutTotals(totals);
  const handleOrderFormBack = () => setCheckoutTotals(null);

  const handleOrderSubmit = (order, result) => {
    setConfirmedOrder(order);
    setCheckoutTotals(null);
    if (!result.ok) showToast("Заказ создан (уведомление боту не отправлено)");
  };

  const handleOrderContinue = () => {
    setCart([]);
    setConfirmedOrder(null);
    setActivePage("catalog");
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className={`toast${toast.visible ? " show" : ""}`}>{toast.msg}</div>
        {confirmedOrder ? (
          <OrderConfirmation order={confirmedOrder} onContinue={handleOrderContinue} />
        ) : checkoutTotals ? (
          <OrderForm cart={cart} totals={checkoutTotals} onBack={handleOrderFormBack} onSubmit={handleOrderSubmit} />
        ) : selectedProduct ? (
          <ProductDetail product={selectedProduct} onBack={handleBack} onAddToCart={addToCart} cart={cart} />
        ) : (
          <>
            <div className="status-bar">
              <span className="store-name">MO<span>D</span>A</span>
              <div className="header-icons">
                <button className="icon-btn" onClick={() => setActivePage("favorites")}>
                  ♡ {favorites.length > 0 && <span className="badge">{favorites.length}</span>}
                </button>
                <button className="icon-btn" onClick={() => setActivePage("cart")}>
                  🛍 {cartCount > 0 && <span className="badge">{cartCount}</span>}
                </button>
              </div>
            </div>

            {activePage === "catalog" && <CatalogPage onProductClick={handleProductClick} cart={cart} favorites={favorites} toggleFav={toggleFav} />}
            {activePage === "favorites" && <FavoritesPage favorites={favorites} onProductClick={handleProductClick} toggleFav={toggleFav} />}
            {activePage === "cart" && <CartPage cart={cart} updateQty={updateQty} removeItem={removeItem} onCheckout={handleCheckout} />}
            {activePage === "profile" && <ProfilePage />}
          </>
        )}

        {!selectedProduct && !checkoutTotals && !confirmedOrder && (
          <nav className="bottom-nav">
            {[
              { id: "catalog", label: "Каталог", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
              { id: "favorites", label: "Избранное", icon: <svg viewBox="0 0 24 24" fill={activePage === "favorites" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>, count: favorites.length },
              { id: "cart", label: "Корзина", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>, count: cartCount },
              { id: "profile", label: "Профиль", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
            ].map(tab => (
              <button key={tab.id} className={`nav-item${activePage === tab.id ? " active" : ""}`} onClick={() => setActivePage(tab.id)}>
                {tab.icon}
                {tab.label}
                {tab.count > 0 && activePage !== tab.id && <span className="badge" style={{ position: "absolute", top: 4, right: "calc(50% - 18px)" }}>{tab.count}</span>}
              </button>
            ))}
          </nav>
        )}
      </div>
    </>
  );
}
