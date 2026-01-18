class TemperatureSystem {
    constructor(initialTemp = 20, maxTemp = 165) {
        this.currentTemp = initialTemp;
        this.minTemp = 0;
        this.maxTemp = maxTemp;
        this.onTemperatureChange = null;
        this.onOverheat = null;
        this.onFireHazard = null;
        this.onFireStart = null; // Nueva callback para cuando empieza el incendio (100°)
    }

    /**
     * Incrementa la temperatura
     * @param {number} amount - Cantidad a incrementar
     */
    increase(amount) {
        const wasBelow100 = this.currentTemp < 100;
        this.currentTemp = Math.min(this.maxTemp, this.currentTemp + amount);

        if (this.onTemperatureChange) {
            this.onTemperatureChange(this.currentTemp);
        }

        // Verificar si se alcanzó 100 grados (inicio de incendio)
        if (wasBelow100 && this.currentTemp >= 100 && this.onFireStart) {
            this.onFireStart();
        }

        // Verificar si hay peligro de fuego
        if (this.currentTemp >= this.maxTemp * 0.95 && this.onFireHazard) {
            this.onFireHazard();
        }

        // Verificar si se ha sobrecalentado (165 grados = game over)
        if (this.currentTemp >= this.maxTemp && this.onOverheat) {
            this.onOverheat();
        }
    }

    /**
     * Disminuye la temperatura (ej: activando el ventilador)
     * @param {number} amount - Cantidad a disminuir
     */
    decrease(amount) {
        this.currentTemp = Math.max(this.minTemp, this.currentTemp - amount);

        if (this.onTemperatureChange) {
            this.onTemperatureChange(this.currentTemp);
        }
    }

    /**
     * Retorna el porcentaje de temperatura (0-100)
     * @returns {number}
     */
    getPercentage() {
        return (this.currentTemp / this.maxTemp) * 100;
    }

    /**
     * Verifica si está en estado crítico
     * @returns {boolean}
     */
    isCritical() {
        return this.currentTemp >= this.maxTemp * 0.8;
    }

    /**
     * Verifica si se ha alcanzado el sobrecalentamiento
     * @returns {boolean}
     */
    isOverheated() {
        return this.currentTemp >= this.maxTemp;
    }

    /**
     * Obtiene la temperatura actual
     * @returns {number}
     */
    getCurrentTemp() {
        return this.currentTemp;
    }

    /**
     * Reinicia el sistema de temperatura
     */
    reset() {
        this.currentTemp = 20;
        if (this.onTemperatureChange) {
            this.onTemperatureChange(this.currentTemp);
        }
    }

    /**
     * Establece la temperatura a un valor específico
     * @param {number} temp - Temperatura a establecer
     */
    setTemperature(temp) {
        this.currentTemp = Math.max(this.minTemp, Math.min(this.maxTemp, temp));
        if (this.onTemperatureChange) {
            this.onTemperatureChange(this.currentTemp);
        }
    }
}
