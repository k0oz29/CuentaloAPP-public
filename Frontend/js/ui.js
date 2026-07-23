/**
 * Manejo de la interfaz de usuario
 */

const UI = {
  elements: {},
  onDeleteProduct: null,
  onUpdateQuantity: null,

  categoryEmojis: {
    'Lácteos': '🥛',
    'Carnes': '🥩',
    'Verduras': '🥬',
    'Frutas': '🍎',
    'Panadería': '🍞',
    'Bebidas': '🥤',
    'Limpieza': '🧼',
    'Otros': '📦'
  },

  /**
   * Inicializa referencias a elementos del DOM
   */
  init() {
    this.elements = {
      productsList: document.getElementById('products-list'),
      searchResults: document.getElementById('search-results'),
      searchInput: document.getElementById('search-input'),
      filterCategory: document.getElementById('filter-category'),
      filterExpiry: document.getElementById('filter-expiry'),
      statTotal: document.getElementById('stat-total'),
      statLow: document.getElementById('stat-low'),
      toast: document.getElementById('toast'),
      toastMessage: document.getElementById('toast-message'),
      fabAdd: document.getElementById('fab-add'),
      scanCta: document.getElementById('scan-cta'),
      modalOverlay: document.getElementById('modal-overlay'),
      modalClose: document.getElementById('modal-close'),
      btnCancel: document.getElementById('btn-cancel'),
      btnScan: document.getElementById('btn-scan'),
      productForm: document.getElementById('product-form'),
      navItems: document.querySelectorAll('.nav-item'),
      screens: {
        home: document.getElementById('home-screen'),
        search: document.getElementById('search-screen')
      },
      inputs: {
        name: document.getElementById('product-name'),
        brand: document.getElementById('product-brand'),
        qty: document.getElementById('product-qty'),
        category: document.getElementById('product-category'),
        expiry: document.getElementById('product-expiry'),
        barcode: document.getElementById('product-barcode')
      }
    };

    this.bindEvents();
  },

  /**
   * Vincula eventos de la interfaz
   */
  bindEvents() {
    this.elements.modalClose.addEventListener('click', () => this.closeModal());
    this.elements.btnCancel.addEventListener('click', () => this.closeModal());

    this.elements.modalOverlay.addEventListener('click', (e) => {
      if (e.target === this.elements.modalOverlay) this.closeModal();
    });

    this.elements.navItems.forEach(item => {
      item.addEventListener('click', () => {
        const screen = item.dataset.screen;
        if (screen) this.showScreen(screen);
      });
    });

    this.elements.searchInput.addEventListener('input', (e) => {
      if (this.onSearch) this.onSearch(e.target.value);
    });

    this.elements.filterCategory.addEventListener('change', () => {
      if (this.onFilterChange) this.onFilterChange();
    });

    this.elements.filterExpiry.addEventListener('change', () => {
      if (this.onFilterChange) this.onFilterChange();
    });
  },

  /**
   * Muestra una pantalla (home o search)
   */
  showScreen(screenName) {
    this.elements.navItems.forEach(item => {
      item.classList.toggle('active', item.dataset.screen === screenName);
    });

    Object.values(this.elements.screens).forEach(screen => {
      screen.classList.remove('active');
    });

    if (this.elements.screens[screenName]) {
      this.elements.screens[screenName].classList.add('active');
    }
  },

  /**
   * Muestra estado de carga
   */
  showLoading() {
    this.elements.productsList.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <p>Cargando productos...</p>
      </div>
    `;
  },

  /**
   * Muestra estado vacío
   */
  showEmptyState() {
    this.elements.productsList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">🧺</div>
        <h3 class="empty-state__title">La despensa está vacía</h3>
        <p>Tocá el botón + para agregar el primer producto.</p>
      </div>
    `;
  },

  /**
   * Muestra un mensaje de error
   */
  showError(message) {
    this.elements.productsList.innerHTML = `
      <div class="error-state">
        <p>⚠️ ${Utils.escapeHtml(message)}</p>
      </div>
    `;
  },

  /**
   * Actualiza los stats
   */
  updateStats(products) {
    const total = products ? products.length : 0;
    const low = products ? products.filter(p => (p.cantidad ?? 0) <= 3).length : 0;

    this.elements.statTotal.textContent = total;
    this.elements.statLow.textContent = low;
  },

  /**
   * Renderiza la lista de productos
   */
  renderProducts(products) {
    if (!products || products.length === 0) {
      this.showEmptyState();
      return;
    }

    this.elements.productsList.innerHTML = products.map(product => this.createProductCard(product)).join('');
    this.bindProductEvents();
  },

  /**
   * Renderiza resultados de búsqueda
   */
  renderSearchResults(products, query) {
    if (!query.trim()) {
      this.elements.searchResults.innerHTML = '';
      return;
    }

    if (!products || products.length === 0) {
      this.elements.searchResults.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">🔍</div>
          <h3 class="empty-state__title">No se encontraron productos</h3>
          <p>Probá con otro nombre.</p>
        </div>
      `;
      return;
    }

    this.elements.searchResults.innerHTML = products.map(product => this.createProductCard(product)).join('');
    this.bindProductEvents();
  },

  /**
   * Crea el HTML de una tarjeta de producto
   */
  createProductCard(product) {
    const quantity = product.cantidad ?? 0;
    const isLow = quantity <= 3;
    const category = product.categoria || 'Otros';
    const imageUrl = product.imagen && product.imagen.includes('openfoodfacts')
      ? product.imagen
      : null;
    const emoji = imageUrl ? null : (this.categoryEmojis[category] || '📦');
    const expiryDate = Utils.formatDate(product.fechaVencimiento);
    const expiryText = expiryDate ? `Vence: ${expiryDate}` : '';

    let meta = category;
    if (expiryText) meta += ` · ${expiryText}`;

    const lowTag = isLow ? '<span class="low-tag">Queda poco</span>' : '';
    const brandText = product.marca ? `<div class="item-brand">${Utils.escapeHtml(product.marca)}</div>` : '';
    const trashIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>`;

    return `
      <article class="item" data-id="${Utils.escapeHtml(product._id || product.id || '')}">
        <button class="trash-btn" aria-label="Eliminar producto">${trashIcon}</button>
        <div class="thumb">
          ${imageUrl ? `<img src="${Utils.escapeHtml(imageUrl)}" alt="${Utils.escapeHtml(product.nombre)}" onerror="this.style.display='none'; this.parentElement.textContent='${emoji}'">` : emoji}
        </div>
        <div class="item-info">
          <div class="item-name">${Utils.escapeHtml(product.nombre)}</div>
          ${brandText}
          <div class="item-meta">${Utils.escapeHtml(meta)}</div>
          ${lowTag}
        </div>
        <div class="stepper">
          <button class="qty-btn qty-btn--minus" aria-label="Restar cantidad">–</button>
          <span class="count">${quantity}</span>
          <button class="qty-btn qty-btn--plus" aria-label="Sumar cantidad">+</button>
        </div>
      </article>
    `;
  },

  /**
   * Vincula eventos de las tarjetas de productos
   */
  bindProductEvents() {
    const items = document.querySelectorAll('.item');

    items.forEach(item => {
      const id = item.dataset.id;
      const qtyElement = item.querySelector('.count');
      const btnMinus = item.querySelector('.qty-btn--minus');
      const btnPlus = item.querySelector('.qty-btn--plus');

      btnMinus.addEventListener('click', () => {
        let qty = parseInt(qtyElement.textContent, 10);
        if (qty > 0) {
          qty--;
          qtyElement.textContent = qty;
          if (this.onUpdateQuantity) this.onUpdateQuantity(id, qty);
        }
      });

      btnPlus.addEventListener('click', () => {
        let qty = parseInt(qtyElement.textContent, 10);
        qty++;
        qtyElement.textContent = qty;
        if (this.onUpdateQuantity) this.onUpdateQuantity(id, qty);
      });

      // Botón eliminar
      const trashBtn = item.querySelector('.trash-btn');
      trashBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('¿Eliminar este producto?')) {
          if (this.onDeleteProduct) this.onDeleteProduct(id);
        }
      });
    });
  },

  /**
   * Abre el modal de agregar producto
   */
  openModal() {
    this.elements.productForm.reset();
    this.elements.inputs.expiry.min = Utils.getTodayDate();
    this.elements.productForm.dataset.image = '';
    this.elements.modalOverlay.classList.add('active');
    this.elements.inputs.name.focus();
  },

  /**
   * Cierra el modal de agregar producto
   */
  closeModal() {
    this.elements.modalOverlay.classList.remove('active');
  },

  /**
   * Obtiene los datos del formulario
   */
  getFormData() {
    return {
      nombre: this.elements.inputs.name.value.trim(),
      marca: this.elements.inputs.brand.value.trim() || null,
      cantidad: parseInt(this.elements.inputs.qty.value, 10),
      categoria: this.elements.inputs.category.value,
      fechaVencimiento: this.elements.inputs.expiry.value || null,
      codigoBarras: this.elements.inputs.barcode.value.trim() || null,
      imagen: this.elements.productForm.dataset.image || 'assets/images/placeholder-producto.svg'
    };
  },

  /**
   * Rellena datos desde el escáner
   */
  fillFromBarcode(barcode) {
    this.elements.inputs.barcode.value = barcode;
  },

  /**
   * Rellena datos desde la búsqueda del backend
   */
  fillProductData(data) {
    if (data.nombre) this.elements.inputs.name.value = data.nombre;
    if (data.marca) this.elements.inputs.brand.value = data.marca;
    if (data.imagen) {
      this.elements.productForm.dataset.image = data.imagen;
    }
  },

  /**
   * Obtiene los valores actuales de los filtros
   */
  getFilters() {
    return {
      category: this.elements.filterCategory.value,
      expiry: this.elements.filterExpiry.value
    };
  },

  /**
   * Resetea los filtros
   */
  resetFilters() {
    this.elements.filterCategory.value = '';
    this.elements.filterExpiry.value = '';
  },

  /**
   * Muestra un toast
   */
  showToast(message, type = 'success') {
    this.elements.toast.textContent = message;
    this.elements.toast.className = `toast ${type}`;

    requestAnimationFrame(() => {
      this.elements.toast.classList.add('show');
    });

    setTimeout(() => {
      this.elements.toast.classList.remove('show');
    }, 3000);
  }
};
