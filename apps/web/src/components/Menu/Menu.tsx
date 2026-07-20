'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, Flame, Leaf, X } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import styles from './Menu.module.css';

// ── Modifier Types ────────────────────────────────────────────────────────
interface ModifierOption { label: string; price: number; }
interface ModifierGroup  { name: string; type: 'radio' | 'checkbox'; required: boolean; options: ModifierOption[]; }

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: string | number;
  imageUrl: string | null;
  categoryId: string;
  category: { name: string; id: string };
  isSpicy?: boolean;
  isVegetarian?: boolean;
  isFeatured?: boolean;
  modifiers?: ModifierGroup[] | null;
}

interface Category { id: string; name: string; }
interface MenuProps  { searchQuery?: string; }

// ── Helpers ────────────────────────────────────────────────────────────────
function calcTotal(basePrice: number, selections: Record<string, string[]>, groups: ModifierGroup[]): number {
  let extra = 0;
  for (const group of groups) {
    for (const sel of (selections[group.name] ?? [])) {
      const opt = group.options.find(o => o.label === sel);
      if (opt) extra += opt.price;
    }
  }
  return basePrice + extra;
}

export default function Menu({ searchQuery = '' }: MenuProps) {
  const { addToCart } = useCart();
  const [active, setActive] = useState('All');
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);
  // selections: { [groupName]: [selectedLabel, ...] }
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    fetch('/api/menu')
      .then(r => r.json())
      .then(data => {
        setCategories(data.categories);
        setItems(data.menuItems);
        setLoading(false);
      });
  }, []);

  const filtered = items.filter(i => {
    const matchesCategory = active === 'All' || i.category?.name === active;
    const matchesSearch   = i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (i.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // ── Modal Handlers ───────────────────────────────────────────────────────
  const handleOpenModal = (item: MenuItem) => {
    setActiveItem(item);
    setSpecialInstructions('');
    setQty(1);

    // Pre-select first option of every "radio" group
    const initialSelections: Record<string, string[]> = {};
    for (const group of (item.modifiers ?? [])) {
      if (group.type === 'radio' && group.options.length > 0) {
        initialSelections[group.name] = [group.options[0].label];
      } else {
        initialSelections[group.name] = [];
      }
    }
    setSelections(initialSelections);
  };

  const handleSelect = (group: ModifierGroup, label: string) => {
    setSelections(prev => {
      if (group.type === 'radio') {
        return { ...prev, [group.name]: [label] };
      } else {
        const current = prev[group.name] ?? [];
        return {
          ...prev,
          [group.name]: current.includes(label)
            ? current.filter(l => l !== label)
            : [...current, label],
        };
      }
    });
  };

  const handleAddToCart = () => {
    if (!activeItem) return;
    const groups = activeItem.modifiers ?? [];
    const basePrice = Number(activeItem.price);
    const customPrice = calcTotal(basePrice, selections, groups);

    // Build a flat add-ons list for the cart
    const addOns: { name: string; price: number }[] = [];
    for (const group of groups) {
      for (const sel of (selections[group.name] ?? [])) {
        const opt = group.options.find(o => o.label === sel);
        if (opt && opt.price > 0) addOns.push({ name: sel, price: opt.price });
      }
    }

    // Build a readable spice level string (from any radio group containing "spice")
    const spiceGroup = groups.find(g => g.name.toLowerCase().includes('spice'));
    const spiceLevel = spiceGroup ? (selections[spiceGroup.name]?.[0] ?? undefined) : undefined;

    for (let i = 0; i < qty; i++) {
      addToCart(activeItem, { spiceLevel, addOns, specialInstructions, customPrice });
    }
    setActiveItem(null);
  };

  // Prevent background scroll when modal open
  useEffect(() => {
    if (activeItem) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [activeItem]);

  const groups = activeItem?.modifiers ?? [];
  const liveTotal = activeItem
    ? calcTotal(Number(activeItem.price), selections, groups) * qty
    : 0;

  return (
    <section id="menu" className={`section light-section ${styles.menuSection}`}>
      <div className="container">

        {/* Header */}
        <div className={styles.header}>
          <span className="section-eyebrow">Our Menu</span>
          <h2 className="section-title">Choose Your Favourite</h2>
          <div className="gold-line" />
        </div>

        {/* Category Tabs */}
        <div className={styles.tabs} role="tablist">
          <button role="tab" aria-selected={active === 'All'} className={`${styles.tab} ${active === 'All' ? styles.tabActive : ''}`} onClick={() => setActive('All')}>All</button>
          {categories.map(cat => (
            <button key={cat.id} role="tab" aria-selected={active === cat.name}
              className={`${styles.tab} ${active === cat.name ? styles.tabActive : ''}`}
              onClick={() => setActive(cat.name)} id={`menu-tab-${cat.name.toLowerCase()}`}>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9E9E9E' }}>Loading menu...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9E9E9E' }}>No items found in this category.</div>
        ) : (
          <div className={styles.grid}>
            {filtered.map(item => (
              <div key={item.id} className={styles.card}>
                <div className={styles.cardImg}>
                  {item.imageUrl
                    ? <Image src={item.imageUrl} alt={item.name} fill sizes="(max-width: 640px) 50vw, 300px" style={{ objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#BDBDBD' }}>No Image</div>}
                  <div className={styles.cardBadges}>
                    {item.isFeatured   && <span className={styles.badgeFeat}><Star  size={12} style={{ display: 'inline', verticalAlign: 'text-top', marginRight: 2 }} /> Popular</span>}
                    {item.isSpicy      && <span className={styles.badgeSpicy}><Flame size={12} style={{ display: 'inline', verticalAlign: 'text-top', marginRight: 2 }} /> Spicy</span>}
                    {item.isVegetarian && <span className={styles.badgeVeg}><Leaf   size={12} style={{ display: 'inline', verticalAlign: 'text-top', marginRight: 2 }} /> Veg</span>}
                  </div>
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardName}>{item.name}</h3>
                  <p className={styles.cardDesc}>{item.description}</p>
                  <div className={styles.cardFooter}>
                    <span className={styles.cardPrice}>Rs. {Number(item.price).toLocaleString()}</span>
                    <button className={`btn btn-red ${styles.addBtn}`} onClick={() => handleOpenModal(item)} id={`add-to-cart-${item.id}`}>
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Item Customization Modal ── */}
      {activeItem && (
        <div className={styles.modalOverlay} onClick={() => setActiveItem(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setActiveItem(null)}><X size={18} /></button>

            {/* Image */}
            <div className={styles.modalHeader}>
              {activeItem.imageUrl
                ? <Image src={activeItem.imageUrl} alt={activeItem.name} fill style={{ objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>No Image</div>}
            </div>

            <div className={styles.modalBody}>
              <h2 className={styles.modalTitle}>{activeItem.name}</h2>
              <p className={styles.modalDesc}>{activeItem.description}</p>

              {/* Dynamic Modifier Groups */}
              {groups.map(group => (
                <div key={group.name}>
                  <h3 className={styles.sectionTitle}>
                    {group.name}
                    <span>{group.required ? 'Required' : 'Optional'}</span>
                  </h3>
                  <div className={group.type === 'radio' ? styles.radioGroup : styles.checkGroup}>
                    {group.options.map(opt => {
                      const isSelected = (selections[group.name] ?? []).includes(opt.label);
                      return (
                        <label key={opt.label} className={`${styles.optionLabel} ${isSelected ? styles.selected : ''}`}>
                          <div className={styles.optionLeft}>
                            <input
                              type={group.type}
                              name={`group-${group.name}`}
                              checked={isSelected}
                              onChange={() => handleSelect(group, opt.label)}
                              style={{ accentColor: 'var(--color-primary)' }}
                            />
                            {opt.label}
                          </div>
                          {opt.price > 0 && <span className={styles.optionPrice}>+Rs. {opt.price.toLocaleString()}</span>}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Special Instructions — always shown */}
              <h3 className={styles.sectionTitle}>Special Instructions</h3>
              <textarea
                className={styles.instructionInput}
                placeholder="e.g., No onions, extra ketchup..."
                value={specialInstructions}
                onChange={e => setSpecialInstructions(e.target.value)}
              />
            </div>

            {/* Footer */}
            <div className={styles.modalFooter}>
              <div className={styles.qtyControl}>
                <button className={styles.qtyBtn} onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span className={styles.qtyNum}>{qty}</span>
                <button className={styles.qtyBtn} onClick={() => setQty(q => q + 1)}>+</button>
              </div>
              <button className={styles.modalAddBtn} onClick={handleAddToCart}>
                <span>Add to Cart</span>
                <span>Rs. {liveTotal.toLocaleString()}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
