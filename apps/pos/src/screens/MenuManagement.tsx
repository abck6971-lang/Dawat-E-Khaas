import React, { useState } from 'react';
import { usePOSStore } from '../store';
import { Search, ClipboardList, CheckCircle2, XCircle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

const DynamicIcon = ({ name, size = 24 }: { name: string, size?: number }) => {
  const Icon = (LucideIcons as any)[name] || LucideIcons.Utensils;
  return <Icon size={size} />;
};

export default function MenuManagement() {
  const { menuItems, toggleItemAvailability } = usePOSStore();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(menuItems.map(m => m.category)))];

  const filtered = menuItems.filter(item => {
    const matchCat = activeCategory === 'All' || item.category === activeCategory;
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const availableCount = menuItems.filter(m => m.available).length;
  const unavailableCount = menuItems.length - availableCount;

  return (
    <div className="menu-mgmt-page fade-in">
      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <div className="card card-sm" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ color: 'var(--text-dim)' }}><ClipboardList size={32} /></div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{menuItems.length}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Total Items</div>
          </div>
        </div>
        <div className="card card-sm" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ color: 'var(--success)' }}><CheckCircle2 size={32} /></div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--success)' }}>{availableCount}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Available</div>
          </div>
        </div>
        <div className="card card-sm" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ color: 'var(--danger)' }}><XCircle size={32} /></div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--danger)' }}>{unavailableCount}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Out of Stock</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="menu-search-input"
            placeholder="Search items…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 36, width: 260 }}
          />
        </div>
        <div className="category-tabs" style={{ marginBottom: 0, paddingBottom: 0 }}>
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

      {/* Menu Grid */}
      <div className="menu-mgmt-grid">
        {filtered.map(item => (
          <div key={item.id} className="menu-mgmt-card" style={{ opacity: item.available ? 1 : 0.65 }}>
            <div className="menu-mgmt-emoji" style={{ color: 'var(--primary)' }}><DynamicIcon name={item.iconName} size={28} /></div>
            <div className="menu-mgmt-info">
              <div className="menu-mgmt-name">{item.name}</div>
              <div className="menu-mgmt-cat">{item.category}</div>
              <div className="menu-mgmt-price">Rs. {item.price.toLocaleString()}</div>
            </div>
            <div className="menu-mgmt-actions">
              <span style={{ fontSize: 11, color: item.available ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>
                {item.available ? 'Available' : 'Out of Stock'}
              </span>
              <label className="toggle" title={item.available ? 'Mark unavailable' : 'Mark available'}>
                <input
                  type="checkbox"
                  checked={item.available}
                  onChange={() => toggleItemAvailability(item.id)}
                />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
