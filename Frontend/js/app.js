/**
 * Punto de entrada de la aplicación
 */

const App = {
  products: [],
  filteredProducts: [],

  /**
   * Inicializa la aplicación
   */
  async init() {
    UI.init();
    Scanner.init();
    this.bindEvents();
    this.registerServiceWorker();

    await this.loadProducts();
  },

  /**
   * Vincula eventos globales
   */
  bindEvents() {
    // FAB abre modal
    UI.elements.fabAdd.addEventListener('click', () => UI.openModal());

    // CTA escanear abre modal y luego escáner
    UI.elements.scanCta.addEventListener('click', () => {
      UI.openModal();
      setTimeout(() => Scanner.open(), 300);
    });

    // Evento del formulario
    UI.elements.productForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleCreateProduct();
    });

    // Botón escanear dentro del modal
    UI.elements.btnScan.addEventListener('click', () => {
      Scanner.open();
    });

    // Callback cuando el escáner lee un código
    Scanner.onScanSuccess = async (barcode) => {
      UI.fillFromBarcode(barcode);

      try {
        UI.elements.btnScan.textContent = '🔍 Buscando...';
        const data = await API.searchBarcode(barcode);

        if (data && data.encontrado && data.nombre) {
          UI.fillProductData(data);
          UI.showToast('Producto encontrado. Revisá los datos y guardalo.', 'success');
        } else {
          UI.showToast('No se encontró el producto. Completá los datos manualmente.', 'error');
        }
      } catch (error) {
        console.log('No se pudo obtener información del código:', error);
        UI.showToast('No se pudo consultar el producto. Intentá manualmente.', 'error');
      } finally {
        UI.elements.btnScan.textContent = '📷 Escanear código de barras';
      }
    };

    // Callbacks de la UI
    UI.onUpdateQuantity = this.handleUpdateQuantity.bind(this);
    UI.onDeleteProduct = this.handleDeleteProduct.bind(this);
    UI.onSearch = this.handleSearch.bind(this);
    UI.onFilterChange = this.applyFilters.bind(this);
  },

  /**
   * Carga los productos desde el backend
   */
  async loadProducts() {
    UI.showLoading();

    try {
      this.products = await API.getProducts();
      UI.updateStats(this.products);
      this.applyFilters();
    } catch (error) {
      UI.showError('No se pudieron cargar los productos. Verificá que el servidor esté corriendo.');
    }
  },

  /**
   * Aplica los filtros de categoría y fecha de vencimiento
   */
  applyFilters() {
    const { category, expiry } = UI.getFilters();
    let filtered = [...this.products];

    // Filtro por categoría
    if (category) {
      filtered = filtered.filter(p => p.categoria === category);
    }

    // Filtro/orden por fecha de vencimiento
    if (expiry === 'soon') {
      filtered = filtered
        .filter(p => p.fechaVencimiento)
        .sort((a, b) => new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento));
    } else if (expiry === 'far') {
      filtered = filtered
        .filter(p => p.fechaVencimiento)
        .sort((a, b) => new Date(b.fechaVencimiento) - new Date(a.fechaVencimiento));
    } else if (expiry === 'none') {
      filtered = filtered.filter(p => !p.fechaVencimiento);
    }

    UI.renderProducts(filtered);
  },

  /**
   * Crea un nuevo producto
   */
  async handleCreateProduct() {
    const product = UI.getFormData();

    if (!product.nombre) {
      UI.showToast('El nombre es obligatorio', 'error');
      return;
    }

    if (!product.categoria) {
      UI.showToast('La categoría es obligatoria', 'error');
      return;
    }

    if (isNaN(product.cantidad) || product.cantidad < 0) {
      UI.showToast('La cantidad debe ser un número válido', 'error');
      return;
    }

    try {
      const created = await API.createProduct(product);
      this.products.unshift(created);
      UI.updateStats(this.products);
      this.applyFilters();
      UI.closeModal();
      UI.showToast('Producto agregado correctamente', 'success');
    } catch (error) {
      UI.showToast('Error al guardar el producto', 'error');
    }
  },

  /**
   * Actualiza la cantidad de un producto
   */
  async handleUpdateQuantity(id, quantity) {
    try {
      await API.updateQuantity(id, quantity);

      if (quantity === 0) {
        this.products = this.products.filter(p => (p._id || p.id) !== id);
        UI.showToast('Producto eliminado', 'success');
      } else {
        const product = this.products.find(p => (p._id || p.id) === id);
        if (product) {
          product.cantidad = quantity;
        }
      }

      UI.updateStats(this.products);
      this.applyFilters();
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      UI.showToast('No se pudo actualizar la cantidad', 'error');
      await this.loadProducts();
    }
  },

  /**
   * Elimina un producto
   */
  async handleDeleteProduct(id) {
    try {
      await API.deleteProduct(id);
      this.products = this.products.filter(p => (p._id || p.id) !== id);
      UI.updateStats(this.products);
      this.applyFilters();
      UI.showToast('Producto eliminado', 'success');
    } catch (error) {
      UI.showToast('Error al eliminar el producto', 'error');
    }
  },

  /**
   * Filtra productos en la pantalla de búsqueda
   */
  handleSearch(query) {
    const lowerQuery = query.toLowerCase().trim();
    const filtered = lowerQuery
      ? this.products.filter(p => p.nombre && p.nombre.toLowerCase().includes(lowerQuery))
      : [];
    UI.renderSearchResults(filtered, query);
  },

  /**
   * Registra el service worker para PWA
   */
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('service-worker.js')
        .then(() => console.log('Service Worker registrado'))
        .catch(err => console.error('Error registrando Service Worker:', err));
    }
  }
};

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => App.init());
