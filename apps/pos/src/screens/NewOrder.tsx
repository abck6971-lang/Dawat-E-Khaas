import React, { useState, useMemo } from 'react';
import { usePOSStore, type POSOrder, type MenuItem } from '../store';
import { Search, ShoppingCart, Trash2, Plus, Minus, CheckCircle2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const ORDER_TYPES = [
  { id: 'DINE_IN', label: 'Dine In' },
  { id: 'PICKUP', label: 'Takeaway' },
  { id: 'DELIVERY', label: 'Delivery' },
] as const;

const DynamicIcon = ({ name, size = 24 }: { name: string, size?: number }) => {
  const Icon = (LucideIcons as any)[name] || LucideIcons.Utensils;
  return <Icon size={size} />;
};

interface CartItem extends MenuItem {
  quantity: number;
}

export default function NewOrder() {
  const { menuItems, addOrder, settings } = usePOSStore();
  const navigate = useNavigate();
  const location = useLocation();
  const initialType = (location.state as any)?.orderType ?? 'DINE_IN';

  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [orderType, setOrderType] = useState<'DINE_IN' | 'PICKUP' | 'DELIVERY'>(initialType === 'WALK_IN' ? 'PICKUP' : initialType);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = useMemo(() => {
    const cats = new Set(menuItems.map(m => m.category));
    return ['All', ...Array.from(cats)];
  }, [menuItems]);

  const filteredMenu = useMemo(() => {
    return menuItems.filter(item => {
      const matchCat = activeCategory === 'All' || item.category === activeCategory;
      const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [menuItems, activeCategory, search]);

  const addToCart = (item: MenuItem) => {
    if (!item.available) return;
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const changeQty = (id: string, delta: number) => {
    setCart(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, quantity: c.quantity + delta } : c);
      return updated.filter(c => c.quantity > 0);
    });
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(c => c.id !== id));
  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const tax = Math.round(subtotal * settings.taxPercent / 100);
  const total = subtotal + tax;
  const itemCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  const placeOrder = () => {
    if (cart.length === 0) return;

    const newOrder: POSOrder = {
      id: `pos-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      customerName: customerName.trim() || '',
      customerPhone: customerPhone.trim(),
      tableNumber: tableNumber.trim(),
      totalAmount: total,
      status: 'PENDING',
      type: orderType,
      items: cart.map(c => ({ menuItemId: c.id, name: c.name, price: c.price, quantity: c.quantity })),
      isSynced: false,
      createdAt: new Date().toISOString(),
      source: 'WALK_IN',
    };

    // Save locally via IPC (Electron)
    if ((window as any).ipcRenderer) {
      (window as any).ipcRenderer.invoke('save-local-order', newOrder);
    }

    addOrder(newOrder);
    clearCart();
    setCustomerName('');
    setCustomerPhone('');
    setTableNumber('');

    navigate('/orders');
  };

  return (
    <div className="new-order-layout fade-in">
      {/* ========== LEFT: MENU ========== */}
      <div className="menu-panel">
        <div className="menu-panel-header">
          <h2>Select Items</h2>
          <div className="category-tabs">
            {categories.map(cat => (
              <button
                key={cat}
                className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="menu-search">
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="menu-search-input"
              placeholder="Search menu items…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 36 }}
            />
          </div>
        </div>

        <div className="menu-items-grid">
          {filteredMenu.map(item => (
            <div
              key={item.id}
              className={`menu-item-card ${!item.available ? 'unavailable' : ''}`}
              onClick={() => addToCart(item)}
            >
              <div className="menu-item-emoji" style={{ color: 'var(--primary)' }}><DynamicIcon name={item.iconName} size={28} /></div>
              <div className="menu-item-name">{item.name}</div>
              <div className="menu-item-cat">{item.category}</div>
              <div className="menu-item-price">Rs. {item.price.toLocaleString()}</div>
              {!item.available && (
                <div style={{ fontSize: 11, color: 'var(--danger)', fontWeight: 700 }}>Out of Stock</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ========== RIGHT: CART ========== */}
      <div className="cart-panel">
        <div className="cart-panel-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>
              <ShoppingCart size={18} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
              Current Order {itemCount > 0 && <span style={{ background: 'var(--primary)', color: 'white', borderRadius: 20, padding: '2px 8px', fontSize: 13, marginLeft: 4 }}>{itemCount}</span>}
            </h2>
            {cart.length > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={clearCart} style={{ color: 'var(--danger)' }}>
                <Trash2 size={14} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Order Type */}
        <div className="cart-order-type">
          {ORDER_TYPES.map(t => (
            <button
              key={t.id}
              className={`order-type-btn ${orderType === t.id ? 'active' : ''}`}
              onClick={() => setOrderType(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Customer Info */}
        <div className="cart-customer-form">
          <div className="form-group">
            <label className="form-label">Customer Name</label>
            <input
              className="form-input"
              placeholder="Optional"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              className="form-input"
              placeholder="Optional"
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)}
            />
          </div>
          {orderType === 'DINE_IN' && (
            <div className="form-group">
              <label className="form-label">Table Number</label>
              <input
                className="form-input"
                placeholder="e.g. T-04"
                value={tableNumber}
                onChange={e => setTableNumber(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="cart-items-list">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon"><ShoppingCart size={36} opacity={0.5} /></div>
              <p>Tap items from the menu to add them here</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, flexShrink: 0, background: 'var(--surface-3)', borderRadius: 8, color: 'var(--primary)' }}>
                  <DynamicIcon name={item.iconName} size={18} />
                </div>
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">Rs. {item.price.toLocaleString()} each</div>
                </div>
                <div className="cart-qty-controls">
                  <button className="qty-btn" onClick={() => changeQty(item.id, -1)}><Minus size={12} /></button>
                  <span className="qty-value">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => changeQty(item.id, 1)}><Plus size={12} /></button>
                </div>
                <div className="cart-item-subtotal">Rs. {(item.price * item.quantity).toLocaleString()}</div>
              </div>
            ))
          )}
        </div>

        {/* Cart Footer */}
        <div className="cart-footer">
          <div className="cart-summary">
            <div className="cart-summary-row">
              <span>Subtotal</span><span>Rs. {subtotal.toLocaleString()}</span>
            </div>
            {settings.taxPercent > 0 && (
              <div className="cart-summary-row">
                <span>Tax ({settings.taxPercent}%)</span><span>Rs. {tax.toLocaleString()}</span>
              </div>
            )}
            <div className="cart-summary-row total">
              <span>Total</span><span>Rs. {total.toLocaleString()}</span>
            </div>
          </div>
          <button
            className="btn btn-primary btn-lg"
            onClick={placeOrder}
            disabled={cart.length === 0}
          >
            <CheckCircle2 size={18} /> Place Order · Rs. {total.toLocaleString()}
          </button>
        </div>
      </div>
    </div>
  );
}
