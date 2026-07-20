'use client';
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, UtensilsCrossed, Tag, Flame, Leaf, Star, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

// ── Modifier Types ──────────────────────────────────────────────────────────
interface ModifierOption {
  label: string;
  price: number;
}
interface ModifierGroup {
  name: string;
  type: 'radio' | 'checkbox';
  required: boolean;
  options: ModifierOption[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  _count: { menuItems: number };
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  isVegetarian: boolean;
  isSpicy: boolean;
  modifiers: ModifierGroup[] | null;
  category: { name: string; id: string };
  categoryId: string;
}

const EMPTY_ITEM = {
  name: '', description: '', price: '', imageUrl: '',
  categoryId: '', isSpicy: false, isVegetarian: false, isFeatured: false, isAvailable: true,
};
const EMPTY_CAT = { name: '', description: '', sortOrder: '0' };

export default function AdminMenuPage() {
  const [tab, setTab]               = useState<'items' | 'categories'>('items');
  const [items, setItems]           = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Item modal
  const [itemModal, setItemModal]   = useState(false);
  const [editItem, setEditItem]     = useState<MenuItem | null>(null);
  const [itemForm, setItemForm]     = useState(EMPTY_ITEM);
  const [modifiers, setModifiers]   = useState<ModifierGroup[]>([]);

  // Category modal
  const [catModal, setCatModal]     = useState(false);
  const [editCat, setEditCat]       = useState<Category | null>(null);
  const [catForm, setCatForm]       = useState(EMPTY_CAT);

  const [saving, setSaving]         = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [search, setSearch]         = useState('');

  const load = () => {
    fetch('/api/admin/menu').then(r => r.json()).then(setItems);
    fetch('/api/admin/categories').then(r => r.json()).then(setCategories);
  };
  useEffect(() => { load(); }, []);

  /* ── Item handlers ── */
  function openAddItem() {
    setEditItem(null);
    setItemForm(EMPTY_ITEM);
    setModifiers([]);
    setItemModal(true);
  }
  function openEditItem(item: MenuItem) {
    setEditItem(item);
    setItemForm({
      name: item.name, description: item.description ?? '',
      price: String(item.price), imageUrl: item.imageUrl ?? '',
      categoryId: item.categoryId, isSpicy: item.isSpicy,
      isVegetarian: item.isVegetarian, isFeatured: item.isFeatured,
      isAvailable: item.isAvailable,
    });
    setModifiers(item.modifiers ?? []);
    setItemModal(true);
  }
  async function saveItem() {
    setSaving(true);
    const body = { ...itemForm, price: parseFloat(itemForm.price), modifiers };
    if (editItem) {
      await fetch(`/api/admin/menu/${editItem.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    } else {
      await fetch('/api/admin/menu', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    }
    setSaving(false); setItemModal(false); load();
  }
  async function deleteItem(id: string) {
    if (!confirm('Delete this menu item?')) return;
    await fetch(`/api/admin/menu/${id}`, { method: 'DELETE' }); load();
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) setItemForm(f => ({ ...f, imageUrl: data.url }));
      else alert(data.error || 'Upload failed');
    } catch { alert('Error uploading file'); }
    finally { setUploading(false); }
  }

  /* ── Modifier Group Helpers ── */
  function addModifierGroup() {
    setModifiers(prev => [...prev, { name: 'New Group', type: 'radio', required: false, options: [{ label: 'Option 1', price: 0 }] }]);
  }
  function removeModifierGroup(gi: number) {
    setModifiers(prev => prev.filter((_, i) => i !== gi));
  }
  function updateGroup(gi: number, field: keyof ModifierGroup, value: any) {
    setModifiers(prev => prev.map((g, i) => i === gi ? { ...g, [field]: value } : g));
  }
  function addOption(gi: number) {
    setModifiers(prev => prev.map((g, i) => i === gi ? { ...g, options: [...g.options, { label: '', price: 0 }] } : g));
  }
  function removeOption(gi: number, oi: number) {
    setModifiers(prev => prev.map((g, i) => i === gi ? { ...g, options: g.options.filter((_, j) => j !== oi) } : g));
  }
  function updateOption(gi: number, oi: number, field: keyof ModifierOption, value: string | number) {
    setModifiers(prev => prev.map((g, i) => i === gi
      ? { ...g, options: g.options.map((o, j) => j === oi ? { ...o, [field]: value } : o) }
      : g
    ));
  }

  /* ── Category handlers ── */
  function openAddCat() { setEditCat(null); setCatForm(EMPTY_CAT); setCatModal(true); }
  function openEditCat(c: Category) {
    setEditCat(c);
    setCatForm({ name: c.name, description: c.description ?? '', sortOrder: String(c.sortOrder) });
    setCatModal(true);
  }
  async function saveCat() {
    setSaving(true);
    const body = { ...catForm, sortOrder: parseInt(catForm.sortOrder) };
    if (editCat) {
      await fetch(`/api/admin/categories/${editCat.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    } else {
      await fetch('/api/admin/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    }
    setSaving(false); setCatModal(false); load();
  }
  async function deleteCat(id: string, name: string) {
    if (!confirm(`Delete category "${name}"? This will fail if it has menu items.`)) return;
    await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' }); load();
  }

  const filteredItems = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      {/* Tab Header */}
      <div className="mgmtTabBar">
        <button className={`mgmtTab ${tab === 'items' ? 'mgmtTabActive' : ''}`} onClick={() => setTab('items')}>
          <UtensilsCrossed size={16} /> Menu Items <span className="mgmtTabCount">{items.length}</span>
        </button>
        <button className={`mgmtTab ${tab === 'categories' ? 'mgmtTabActive' : ''}`} onClick={() => setTab('categories')}>
          <Tag size={16} /> Categories <span className="mgmtTabCount">{categories.length}</span>
        </button>
      </div>

      {/* ── MENU ITEMS TAB ── */}
      {tab === 'items' && (
        <div className="tableCard">
          <div className="tableHeader">
            <span className="tableTitle">Menu Items ({filteredItems.length})</span>
            <div style={{ display: 'flex', gap: 12 }}>
              <input className="formInput" style={{ width: 220, marginBottom: 0 }} placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} />
              <button className="btnPrimary" onClick={openAddItem} id="admin-add-menu-item"><Plus size={16} /> Add Item</button>
            </div>
          </div>
          {filteredItems.length === 0 ? (
            <p className="emptyState">No menu items found.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th><th>Category</th><th>Price</th><th>Modifiers</th><th>Flags</th><th>Available</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item.id}>
                    <td><strong>{item.name}</strong><br /><span style={{ fontSize: '0.78rem', color: 'var(--md-sys-color-on-surface-variant)' }}>{item.description?.slice(0, 50)}{(item.description?.length ?? 0) > 50 ? '…' : ''}</span></td>
                    <td>{item.category.name}</td>
                    <td><strong>Rs. {Number(item.price).toLocaleString()}</strong></td>
                    <td>
                      {item.modifiers && item.modifiers.length > 0
                        ? <span className="chip chipFeat">{item.modifiers.length} group{item.modifiers.length > 1 ? 's' : ''}</span>
                        : <span style={{ color: 'var(--md-sys-color-outline-variant)', fontSize: '0.8rem' }}>None</span>
                      }
                    </td>
                    <td>
                      {item.isSpicy      && <span className="chip chipSpicy" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Flame size={12} /> Spicy</span>}
                      {item.isVegetarian && <span className="chip chipVeg"   style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Leaf size={12} /> Veg</span>}
                      {item.isFeatured   && <span className="chip chipFeat"  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Star size={12} /> Featured</span>}
                    </td>
                    <td><span className={`chip ${item.isAvailable ? 'chipVeg' : 'chipNo'}`}>{item.isAvailable ? 'Active' : 'Hidden'}</span></td>
                    <td>
                      <div className="actionBtns">
                        <button className="btnEdit" onClick={() => openEditItem(item)}><Pencil size={14} /> Edit</button>
                        <button className="btnDanger" onClick={() => deleteItem(item.id)}><Trash2 size={14} /> Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── CATEGORIES TAB ── */}
      {tab === 'categories' && (
        <div className="tableCard">
          <div className="tableHeader">
            <span className="tableTitle">Categories ({categories.length})</span>
            <button className="btnPrimary" onClick={openAddCat} id="admin-add-category"><Plus size={16} /> Add Category</button>
          </div>
          {categories.length === 0 ? (
            <p className="emptyState">No categories yet. Add one to start adding menu items.</p>
          ) : (
            <table className="table">
              <thead><tr><th>Name</th><th>Slug</th><th>Description</th><th>Items</th><th>Sort</th><th>Actions</th></tr></thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c.id}>
                    <td><strong>{c.name}</strong></td>
                    <td><code style={{ background: 'var(--md-sys-color-surface-container)', padding: '4px 8px', borderRadius: 'var(--md-shape-sm)', fontSize: '0.8rem' }}>{c.slug}</code></td>
                    <td>{c.description ?? <span style={{ color: 'var(--md-sys-color-outline-variant)' }}>—</span>}</td>
                    <td><span className="chip chipVeg">{c._count.menuItems}</span></td>
                    <td>{c.sortOrder}</td>
                    <td>
                      <div className="actionBtns">
                        <button className="btnEdit" onClick={() => openEditCat(c)}><Pencil size={14} /> Edit</button>
                        <button className="btnDanger" onClick={() => deleteCat(c.id, c.name)}><Trash2 size={14} /> Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── ITEM MODAL ── */}
      {itemModal && (
        <div className="modalOverlay" onClick={() => setItemModal(false)}>
          <div className="modal" style={{ maxWidth: 620, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="modalHead">
              <span className="modalTitle">{editItem ? 'Edit Menu Item' : 'Add Menu Item'}</span>
              <button className="modalClose" onClick={() => setItemModal(false)}><X size={16} /></button>
            </div>
            <div className="modalBody">
              {/* Basic Fields */}
              <div className="formGroup">
                <label className="formLabel">Name *</label>
                <input className="formInput" value={itemForm.name} onChange={e => setItemForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Smash Burger" />
              </div>
              <div className="formGroup">
                <label className="formLabel">Description</label>
                <textarea className="formTextarea" value={itemForm.description} onChange={e => setItemForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description..." />
              </div>
              <div className="formRow">
                <div className="formGroup">
                  <label className="formLabel">Price (Rs.) *</label>
                  <input className="formInput" type="number" value={itemForm.price} onChange={e => setItemForm(f => ({ ...f, price: e.target.value }))} placeholder="750" />
                </div>
                <div className="formGroup">
                  <label className="formLabel">Category *</label>
                  <select className="formSelect" value={itemForm.categoryId} onChange={e => setItemForm(f => ({ ...f, categoryId: e.target.value }))}>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="formGroup">
                <label className="formLabel">Image URL or Upload</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input className="formInput" style={{ flex: 1 }} value={itemForm.imageUrl} onChange={e => setItemForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="/burger.png or https://..." />
                  <label className="btnSecondary" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', margin: 0 }}>
                    {uploading ? 'Uploading...' : 'Upload File'}
                    <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} disabled={uploading} />
                  </label>
                </div>
              </div>
              <div className="formGroup">
                <label className="formLabel">Flags</label>
                <div className="checkboxRow">
                  <label className="checkboxLabel"><input type="checkbox" checked={itemForm.isSpicy} onChange={e => setItemForm(f => ({ ...f, isSpicy: e.target.checked }))} /><Flame size={14} /> Spicy</label>
                  <label className="checkboxLabel"><input type="checkbox" checked={itemForm.isVegetarian} onChange={e => setItemForm(f => ({ ...f, isVegetarian: e.target.checked }))} /><Leaf size={14} /> Vegetarian</label>
                  <label className="checkboxLabel"><input type="checkbox" checked={itemForm.isFeatured} onChange={e => setItemForm(f => ({ ...f, isFeatured: e.target.checked }))} /><Star size={14} /> Featured</label>
                  <label className="checkboxLabel"><input type="checkbox" checked={itemForm.isAvailable} onChange={e => setItemForm(f => ({ ...f, isAvailable: e.target.checked }))} /><CheckCircle2 size={14} /> Available</label>
                </div>
              </div>

              {/* ── MODIFIER BUILDER ── */}
              <div className="formGroup" style={{ borderTop: '1px solid var(--md-sys-color-outline-variant)', paddingTop: 20, marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <label className="formLabel" style={{ margin: 0 }}>
                    Customization Options
                    <span style={{ fontWeight: 400, color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.8rem', marginLeft: 8 }}>
                      (shown to customer on Add to Cart)
                    </span>
                  </label>
                  <button type="button" className="btnSecondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={addModifierGroup}>
                    <Plus size={13} /> Add Group
                  </button>
                </div>

                {modifiers.length === 0 && (
                  <p style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>
                    No customizations. Customer will only see a Special Instructions box.
                  </p>
                )}

                {modifiers.map((group, gi) => (
                  <div key={gi} style={{ border: '1.5px solid var(--md-sys-color-outline-variant)', borderRadius: 12, padding: 16, marginBottom: 12, background: 'var(--md-sys-color-surface-container)' }}>
                    {/* Group header */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
                      <input
                        className="formInput" style={{ flex: 1, marginBottom: 0, fontWeight: 700 }}
                        value={group.name}
                        placeholder="Group name (e.g. Spice Level)"
                        onChange={e => updateGroup(gi, 'name', e.target.value)}
                      />
                      <select
                        className="formSelect" style={{ width: 130, marginBottom: 0 }}
                        value={group.type}
                        onChange={e => updateGroup(gi, 'type', e.target.value as 'radio' | 'checkbox')}
                      >
                        <option value="radio">Pick One</option>
                        <option value="checkbox">Pick Many</option>
                      </select>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', whiteSpace: 'nowrap', cursor: 'pointer', color: 'var(--md-sys-color-on-surface)' }}>
                        <input type="checkbox" checked={group.required} onChange={e => updateGroup(gi, 'required', e.target.checked)} />
                        Required
                      </label>
                      <button type="button" style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#c62828', padding: 4, display: 'flex', alignItems: 'center' }} onClick={() => removeModifierGroup(gi)}>
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Options list */}
                    {group.options.map((opt, oi) => (
                      <div key={oi} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                        <input
                          className="formInput" style={{ flex: 1, marginBottom: 0 }}
                          value={opt.label}
                          placeholder="Option label (e.g. Extra Spicy)"
                          onChange={e => updateOption(gi, oi, 'label', e.target.value)}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--md-sys-color-on-surface-variant)', whiteSpace: 'nowrap' }}>+Rs.</span>
                          <input
                            className="formInput" style={{ width: 80, marginBottom: 0 }}
                            type="number" min="0" value={opt.price}
                            placeholder="0"
                            onChange={e => updateOption(gi, oi, 'price', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <button type="button" style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9e9e9e', padding: 4, display: 'flex', alignItems: 'center' }} onClick={() => removeOption(gi, oi)} disabled={group.options.length <= 1}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}

                    <button type="button" onClick={() => addOption(gi)} style={{ fontSize: '0.8rem', color: 'var(--md-sys-color-primary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: '4px 0', marginTop: 4 }}>
                      <Plus size={13} /> Add Option
                    </button>
                  </div>
                ))}
              </div>

              <div className="modalActions">
                <button className="btnSecondary" onClick={() => setItemModal(false)}>Cancel</button>
                <button className="btnPrimary" onClick={saveItem} disabled={saving || !itemForm.name || !itemForm.price || !itemForm.categoryId}>
                  {saving ? 'Saving...' : editItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CATEGORY MODAL ── */}
      {catModal && (
        <div className="modalOverlay" onClick={() => setCatModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modalHead">
              <span className="modalTitle">{editCat ? 'Edit Category' : 'Add Category'}</span>
              <button className="modalClose" onClick={() => setCatModal(false)}><X size={16} /></button>
            </div>
            <div className="modalBody">
              <div className="formGroup">
                <label className="formLabel">Name *</label>
                <input className="formInput" value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Burgers" />
              </div>
              <div className="formGroup">
                <label className="formLabel">Description</label>
                <input className="formInput" value={catForm.description} onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description" />
              </div>
              <div className="formGroup">
                <label className="formLabel">Sort Order</label>
                <input className="formInput" type="number" value={catForm.sortOrder} onChange={e => setCatForm(f => ({ ...f, sortOrder: e.target.value }))} />
              </div>
              <div className="modalActions">
                <button className="btnSecondary" onClick={() => setCatModal(false)}>Cancel</button>
                <button className="btnPrimary" onClick={saveCat} disabled={saving || !catForm.name}>
                  {saving ? 'Saving...' : editCat ? 'Save Changes' : 'Add Category'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
