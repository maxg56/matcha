// Simple event emitter pour les changements de préférences
class PreferencesEventEmitter {
  private listeners: Array<() => void> = [];

  subscribe(callback: () => void): () => void {
    this.listeners.push(callback);
    
    // Retourne une fonction de désabonnement
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  emit(): void {
    this.listeners.forEach(callback => callback());
  }
}

export const preferencesEventEmitter = new PreferencesEventEmitter();