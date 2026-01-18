class EnergySystem {
    constructor(initialEnergy = 100, difficulty = 'HARD') {
        this.maxEnergy = initialEnergy;
        this.currentEnergy = initialEnergy;
        this.difficulty = difficulty;
        
        // Consumo por segundo según dificultad
        // HARD: ~0.2% por segundo (energía se agota en ~500 segundos)
        // INSANE: ~0.35% por segundo (energía se agota en ~285 segundos)
        this.consumptionRate = difficulty === 'HARD' ? 0.2 : 0.35;
        
        // Multiplicador de consumo (se incrementa con ventilador activo)
        this.consumptionMultiplier = 1.0;
        
        this.onEnergyChange = null;
        this.onEnergyDepleted = null;
        this.onLowEnergy = null; // Callback cuando llega a 10%
    }

    /**
     * Consume energía gradualmente (llamado cada frame o tick)
     * @param {number} deltaTime - Tiempo transcurrido en segundos
     * @returns {boolean} True si aún hay energía
     */
    update(deltaTime) {
        if (this.currentEnergy <= 0) {
            if (this.onEnergyDepleted) {
                this.onEnergyDepleted();
            }
            return false;
        }

        const consumption = (this.consumptionRate * this.consumptionMultiplier * deltaTime); // Consumir porcentaje por segundo con multiplicador
        const wasAboveTen = this.currentEnergy > 10;
        
        this.currentEnergy = Math.max(0, this.currentEnergy - consumption);

        if (this.onEnergyChange) {
            this.onEnergyChange(this.currentEnergy);
        }

        // Disparar evento cuando llega a 10%
        if (wasAboveTen && this.currentEnergy <= 10 && this.onLowEnergy) {
            this.onLowEnergy();
        }

        if (this.currentEnergy <= 0 && this.onEnergyDepleted) {
            this.onEnergyDepleted();
        }

        return this.currentEnergy > 0;
    }

    /**
     * Consume energía inmediatamente
     * @param {number} amount - Cantidad a consumir (en porcentaje)
     * @returns {boolean} True si había suficiente energía
     */
    consume(amount) {
        if (this.currentEnergy <= 0) {
            if (this.onEnergyDepleted) {
                this.onEnergyDepleted();
            }
            return false;
        }

        this.currentEnergy = Math.max(0, this.currentEnergy - amount);

        if (this.onEnergyChange) {
            this.onEnergyChange(this.currentEnergy);
        }

        if (this.currentEnergy <= 0 && this.onEnergyDepleted) {
            this.onEnergyDepleted();
        }

        return true;
    }

    /**
     * Restaura energía a un valor específico
     * @param {number} amount - Cantidad a restaurar (en porcentaje)
     */
    restore(amount) {
        this.currentEnergy = Math.min(this.maxEnergy, this.currentEnergy + amount);

        if (this.onEnergyChange) {
            this.onEnergyChange(this.currentEnergy);
        }
    }

    /**
     * Restaura la energía a un porcentaje específico
     * @param {number} percentage - Porcentaje a restaurar (0-100)
     */
    restoreToPercentage(percentage) {
        this.currentEnergy = Math.min(this.maxEnergy, (percentage / 100) * this.maxEnergy);

        if (this.onEnergyChange) {
            this.onEnergyChange(this.currentEnergy);
        }
    }

    /**
     * Restaura la energía al máximo
     */
    restoreMax() {
        this.currentEnergy = this.maxEnergy;

        if (this.onEnergyChange) {
            this.onEnergyChange(this.currentEnergy);
        }
    }

    /**
     * Retorna el porcentaje de energía actual
     * @returns {number} Porcentaje (0-100)
     */
    getPercentage() {
        return (this.currentEnergy / this.maxEnergy) * 100;
    }

    /**
     * Verifica si la energía está disponible
     * @param {number} amount - Cantidad a verificar
     * @returns {boolean}
     */
    hasEnergy(amount) {
        return this.currentEnergy >= amount;
    }

    /**
     * Obtiene la energía actual
     * @returns {number}
     */
    getCurrentEnergy() {
        return this.currentEnergy;
    }

    /**
     * Reinicia el sistema de energía
     */
    reset() {
        this.currentEnergy = this.maxEnergy;
        this.consumptionMultiplier = 1.0;
        if (this.onEnergyChange) {
            this.onEnergyChange(this.currentEnergy);
        }
    }

    /**
     * Establece el multiplicador de consumo
     * @param {number} multiplier - Multiplicador (1.0 = normal, >1.0 = más rápido)
     */
    setConsumptionMultiplier(multiplier) {
        this.consumptionMultiplier = Math.max(1.0, multiplier);
    }
}
