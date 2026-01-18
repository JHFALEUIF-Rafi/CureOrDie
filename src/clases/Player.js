class Player {
    constructor(scene, x = 960, y = 540) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.isAlive = true;
        this.isTransformed = false; // Para el efecto de transformación en zombie
        this.infectionLevel = 0; // 0-100, representa cuánto se está transformando
    }

    /**
     * Actualiza el nivel de infección del jugador
     * @param {number} delta - Delta de infección
     */
    updateInfection(delta) {
        this.infectionLevel = Math.min(100, this.infectionLevel + delta);

        if (this.infectionLevel >= 100) {
            this.isTransformed = true;
        }
    }

    /**
     * Obtiene el nivel de infección actual
     * @returns {number}
     */
    getInfectionLevel() {
        return this.infectionLevel;
    }

    /**
     * Verifica si el jugador está vivo
     * @returns {boolean}
     */
    alive() {
        return this.isAlive;
    }

    /**
     * Mata al jugador
     */
    kill() {
        this.isAlive = false;
    }

    /**
     * Reinicia el estado del jugador
     */
    reset() {
        this.isAlive = true;
        this.isTransformed = false;
        this.infectionLevel = 0;
    }
}
