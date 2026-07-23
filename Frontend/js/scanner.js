/**
 * Manejo del escáner de códigos de barras
 */

const Scanner = {
  html5QrCode: null,
  isScanning: false,
  onScanSuccess: null,

  elements: {},

  /**
   * Inicializa el escáner
   */
  init() {
    this.elements = {
      overlay: document.getElementById('scanner-overlay'),
      container: document.getElementById('scanner-container'),
      closeBtn: document.getElementById('scanner-close'),
      manualBtn: document.getElementById('scanner-manual')
    };

    this.bindEvents();
  },

  /**
   * Vincula eventos del escáner
   */
  bindEvents() {
    this.elements.closeBtn.addEventListener('click', () => this.close());
    this.elements.manualBtn.addEventListener('click', () => {
      this.close();
      document.getElementById('product-barcode').focus();
    });
  },

  /**
   * Abre el escáner
   */
  async open() {
    this.elements.overlay.classList.add('active');
    
    if (!window.Html5Qrcode) {
      alert('La librería del escáner no está disponible. Verificá tu conexión a internet.');
      this.close();
      return;
    }

    try {
      this.html5QrCode = new Html5Qrcode('scanner-container');
      
      const config = { 
        fps: 10, 
        qrbox: { width: 250, height: 150 },
        aspectRatio: 1.0
      };

      await this.html5QrCode.start(
        { facingMode: 'environment' },
        config,
        this.handleScan.bind(this),
        this.handleScanFailure.bind(this)
      );
      
      this.isScanning = true;
    } catch (error) {
      console.error('Error al iniciar el escáner:', error);
      alert('No se pudo iniciar la cámara. Asegurate de dar permisos de cámara.');
      this.close();
    }
  },

  /**
   * Cierra el escáner
   */
  async close() {
    if (this.html5QrCode && this.isScanning) {
      try {
        await this.html5QrCode.stop();
        await this.html5QrCode.clear();
      } catch (error) {
        console.error('Error al detener el escáner:', error);
      }
      this.isScanning = false;
    }
    this.elements.overlay.classList.remove('active');
  },

  /**
   * Maneja un código detectado
   */
  handleScan(decodedText) {
    if (this.onScanSuccess) {
      this.onScanSuccess(decodedText);
    }
    this.close();
  },

  /**
   * Maneja errores de escaneo (cuadros sin código)
   */
  handleScanFailure(error) {
    // No hacemos nada, es normal cuando no hay código en pantalla
  }
};
