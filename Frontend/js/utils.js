/**
 * Utilidades generales de la aplicación
 */

const Utils = {
  /**
   * Formatea una fecha a formato legible (dd/mm/yyyy)
   */
  formatDate(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  },

  /**
   * Escapa caracteres HTML para prevenir XSS
   */
  escapeHtml(text) {
    if (typeof text !== 'string') return text;
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * Devuelve una fecha mínima válida para inputs date
   */
  getTodayDate() {
    return new Date().toISOString().split('T')[0];
  },

  /**
   * Genera un ID temporal para productos creados localmente
   */
  generateTempId() {
    return 'temp_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }
};
