class VaccineSystem {
    constructor(difficulty = 'HARD') {
        this.difficulty = difficulty;
        this.progress = 0; // 0-100% 
        this.progressPerSequence = difficulty === 'HARD' ? 10 : 5; // 10% (HARD) o 5% (INSANE)
        this.totalSteps = 7; // Siempre 7 círculos por secuencia
        this.currentSequence = []; // Patrón de 7 colores (0-3)
        this.playerSequence = []; // Lo que ha presionado el jugador
        this.isPlayingSequence = false;
        this.isPlayerTurn = false;
        this.onSequenceComplete = null;
        this.onVaccineComplete = null;
        this.onIncorrectPattern = null;
    }

    /**
     * Genera una nueva secuencia de 7 colores
     */
    generateNewSequence() {
        this.currentSequence = [];
        for (let i = 0; i < this.totalSteps; i++) {
            this.currentSequence.push(Math.floor(Math.random() * 4)); // 0-3 para 4 bases
        }
        this.playerSequence = [];
        return this.currentSequence;
    }

    /**
     * Obtiene la secuencia actual
     */
    getCurrentSequence() {
        return this.currentSequence;
    }

    /**
     * Agrega un input del jugador
     * @param {number} baseIndex - 0-3 para ADENINE, GUANINE, CYTOSINE, THYMINE
     * @returns {boolean} true si es correcto, false si es incorrecto
     */
    addPlayerInput(baseIndex) {
        this.playerSequence.push(baseIndex);
        
        // Verificar si el color es correcto
        if (baseIndex !== this.currentSequence[this.playerSequence.length - 1]) {
            // Patrón incorrecto
            this.playerSequence = [];
            if (this.onIncorrectPattern) {
                this.onIncorrectPattern();
            }
            return false;
        }

        // Verificar si completó todo el patrón
        if (this.playerSequence.length === this.currentSequence.length) {
            // Completó el patrón correctamente
            this.completeSequence();
            return true;
        }

        return true;
    }

    /**
     * Completa una secuencia
     */
    completeSequence() {
        this.progress = Math.min(100, this.progress + this.progressPerSequence);
        
        if (this.onSequenceComplete) {
            this.onSequenceComplete(this.progress);
        }

        if (this.progress >= 100) {
            if (this.onVaccineComplete) {
                this.onVaccineComplete();
            }
        }
    }

    /**
     * Obtiene el progreso actual
     */
    getProgress() {
        return this.progress;
    }

    /**
     * Reinicia el sistema
     */
    reset() {
        this.progress = 0;
        this.currentSequence = [];
        this.playerSequence = [];
        this.isPlayingSequence = false;
        this.isPlayerTurn = false;
    }
}
