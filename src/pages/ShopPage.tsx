// src/pages/ShopPage.tsx

import React, { useState, useEffect } from 'react';
import { useShoppingList } from '../context/ShoppingListContext';
import { usePlan } from '../context/PlanContext';
import type { ShoppingItem, ShoppingCategory } from '../types/shoppingListTypes';
import styles from './ShopPage.module.css';

const ShopPage: React.FC = () => {
  const {
    lists,
    activeList,
    createList,
    deleteList,
    setActiveList,
    addItem,
    updateItem,
    removeItem,
    toggleItemChecked,
    clearCheckedItems,
    generateFromMealPlan,
    getStats,
    getItemsByCategory,
    exportList
  } = useShoppingList();

  const { events } = usePlan();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1,
    unit: 'piece',
    category: 'Other' as ShoppingCategory,
    notes: ''
  });
  const [selectedCategory, setSelectedCategory] = useState<ShoppingCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const stats = getStats();

  const categories: ShoppingCategory[] = [
    'Produce', 'Dairy & Eggs', 'Meat & Seafood', 'Pantry',
    'Frozen', 'Beverages', 'Bakery', 'Snacks', 'Condiments', 'Other'
  ];

  const handleCreateList = () => {
    if (newListName.trim()) {
      createList(newListName.trim());
      setNewListName('');
      setShowCreateModal(false);
    }
  };

  const handleAddItem = () => {
    if (newItem.name.trim()) {
      addItem({
        name: newItem.name.trim(),
        quantity: newItem.quantity,
        unit: newItem.unit,
        category: newItem.category,
        notes: newItem.notes.trim() || undefined,
        isChecked: false
      });
      setNewItem({
        name: '',
        quantity: 1,
        unit: 'piece',
        category: 'Other',
        notes: ''
      });
      setShowAddItemModal(false);
    }
  };

  const handleGenerateFromMealPlan = async () => {
    if (activeList && events.length > 0) {
      await generateFromMealPlan(events, {
        mergeSimilarItems: true,
        includeNotes: true
      });
      setShowGenerateModal(false);
    }
  };

  const handleExport = (format: 'text' | 'json') => {
    const data = exportList(format);
    const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeList?.name || 'shopping-list'}.${format === 'json' ? 'json' : 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredItems = activeList?.items.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }) || [];

  const groupedItems = categories.reduce((acc, category) => {
    const items = filteredItems.filter(item => item.category === category);
    if (items.length > 0) {
      acc[category] = items;
    }
    return acc;
  }, {} as Record<ShoppingCategory, ShoppingItem[]>);

  if (!activeList) {
    return (
      <div className={styles.shopPageContainer}>
        <div className={styles.contentWrapper}>
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>🛒</div>
            <h1>No Shopping List Selected</h1>
            <p>Create a new shopping list or select an existing one to get started.</p>

            <div className={styles.listSelector}>
              <h3>Your Lists</h3>
              {lists.length === 0 ? (
                <p className={styles.noLists}>No shopping lists yet. Create your first one!</p>
              ) : (
                <div className={styles.listGrid}>
                  {lists.map(list => (
                    <div key={list.id} className={styles.listCard}>
                      <h4>{list.name}</h4>
                      <p>{list.items.length} items</p>
                      <button
                        onClick={() => setActiveList(list.id)}
                        className={styles.selectListButton}
                      >
                        Select List
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setShowCreateModal(true)}
                className={styles.createListButton}
              >
                + Create New List
              </button>
            </div>
          </div>
        </div>

        {/* Create List Modal */}
        {showCreateModal && (
          <div className={styles.modalBackdrop} onClick={() => setShowCreateModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h3>Create New Shopping List</h3>
              <input
                type="text"
                placeholder="List name..."
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateList()}
                className={styles.modalInput}
              />
              <div className={styles.modalActions}>
                <button onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button onClick={handleCreateList} className={styles.primaryButton}>
                  Create List
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.shopPageContainer}>
      <div className={styles.contentWrapper}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.pageTitle}>Shopping List</h1>
            <p className={styles.pageSubtitle}>
              {activeList.name} • {stats.totalItems} items • ${stats.estimatedTotal.toFixed(2)} estimated
            </p>
          </div>

          <div className={styles.headerActions}>
            <button
              onClick={() => setShowGenerateModal(true)}
              className={styles.generateButton}
              disabled={events.length === 0}
            >
              📋 Generate from Meal Plan
            </button>
            <button
              onClick={() => setShowAddItemModal(true)}
              className={styles.addItemButton}
            >
              + Add Item
            </button>
            <button
              onClick={() => handleExport('text')}
              className={styles.exportButton}
            >
              📄 Export
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.statsContainer}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.totalItems}</div>
            <div className={styles.statLabel}>Total Items</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.checkedItems}</div>
            <div className={styles.statLabel}>Checked</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.uncheckedItems}</div>
            <div className={styles.statLabel}>Remaining</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>${stats.estimatedTotal.toFixed(2)}</div>
            <div className={styles.statLabel}>Estimated Total</div>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filtersContainer}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.categoryFilter}>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ShoppingCategory | 'All')}
              className={styles.categorySelect}
            >
              <option value="All">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Shopping List */}
        <div className={styles.shoppingListContainer}>
          {Object.keys(groupedItems).length === 0 ? (
            <div className={styles.emptyList}>
              <div className={styles.emptyListIcon}>📝</div>
              <h3>No items found</h3>
              <p>Add some items to your shopping list to get started.</p>
            </div>
          ) : (
            Object.entries(groupedItems).map(([category, items]) => (
              <div key={category} className={styles.categorySection}>
                <h3 className={styles.categoryTitle}>{category}</h3>
                <div className={styles.itemsList}>
                  {items.map(item => (
                    <div key={item.id} className={`${styles.shoppingItem} ${item.isChecked ? styles.checked : ''}`}>
                      <div className={styles.itemContent}>
                        <button
                          onClick={() => toggleItemChecked(item.id)}
                          className={styles.checkbox}
                        >
                          {item.isChecked ? '✓' : ''}
                        </button>
                        <div className={styles.itemDetails}>
                          <span className={styles.itemName}>{item.name}</span>
                          <span className={styles.itemQuantity}>
                            {item.quantity} {item.unit}
                          </span>
                          {item.notes && (
                            <span className={styles.itemNotes}>{item.notes}</span>
                          )}
                        </div>
                        {item.estimatedPrice && (
                          <span className={styles.itemPrice}>
                            ${item.estimatedPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className={styles.removeButton}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Actions */}
        <div className={styles.actionsContainer}>
          <button
            onClick={clearCheckedItems}
            className={styles.clearCheckedButton}
            disabled={stats.checkedItems === 0}
          >
            Clear Checked Items
          </button>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowCreateModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Create New Shopping List</h3>
            <input
              type="text"
              placeholder="List name..."
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateList()}
              className={styles.modalInput}
            />
            <div className={styles.modalActions}>
              <button onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button onClick={handleCreateList} className={styles.primaryButton}>
                Create List
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddItemModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowAddItemModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Add Item to Shopping List</h3>
            <div className={styles.modalForm}>
              <input
                type="text"
                placeholder="Item name..."
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className={styles.modalInput}
              />
              <div className={styles.quantityRow}>
                <input
                  type="number"
                  placeholder="Quantity"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                  className={styles.quantityInput}
                />
                <input
                  type="text"
                  placeholder="Unit (piece, cup, etc.)"
                  value={newItem.unit}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                  className={styles.unitInput}
                />
              </div>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value as ShoppingCategory })}
                className={styles.categorySelect}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Notes (optional)"
                value={newItem.notes}
                onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                className={styles.modalInput}
              />
            </div>
            <div className={styles.modalActions}>
              <button onClick={() => setShowAddItemModal(false)}>Cancel</button>
              <button onClick={handleAddItem} className={styles.primaryButton}>
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {showGenerateModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowGenerateModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Generate from Meal Plan</h3>
            <p>This will add ingredients from your planned meals to your shopping list.</p>
            <div className={styles.mealPlanPreview}>
              <h4>Planned Meals:</h4>
              {events.length === 0 ? (
                <p>No meals planned yet.</p>
              ) : (
                <ul>
                  {events.slice(0, 5).map(event => (
                    <li key={event.id}>{event.title}</li>
                  ))}
                  {events.length > 5 && <li>... and {events.length - 5} more</li>}
                </ul>
              )}
            </div>
            <div className={styles.modalActions}>
              <button onClick={() => setShowGenerateModal(false)}>Cancel</button>
              <button
                onClick={handleGenerateFromMealPlan}
                className={styles.primaryButton}
                disabled={events.length === 0}
              >
                Generate List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;