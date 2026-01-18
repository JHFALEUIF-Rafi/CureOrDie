class Timer {
    constructor(scene, duration) {
        this.scene = scene;
        this.duration = duration; // en segundos
        this.elapsed = 0;
        this.isRunning = false;
        this.onComplete = null;
        this.onTick = null;
    }

    /**
     * Inicia el temporizador
     */
    start() {
        this.isRunning = true;
        this.elapsed = 0;
        this.startTime = Date.now();
    }

    /**
     * Detiene el temporizador
     */
    stop() {
        this.isRunning = false;
    }

    /**
     * Pausa el temporizador
     */
    pause() {
        this.isRunning = false;
    }

    /**
     * Reanuda el temporizador
     */
    resume() {
        this.isRunning = true;
        this.startTime = Date.now() - (this.elapsed * 1000);
    }

    /**
     * Actualiza el temporizador (debe llamarse en update)
     */
    update() {
        if (!this.isRunning) return;

        this.elapsed = (Date.now() - this.startTime) / 1000;

        if (this.onTick) {
            this.onTick(this.elapsed);
        }

        if (this.elapsed >= this.duration) {
            this.elapsed = this.duration;
            this.isRunning = false;
            if (this.onComplete) {
                this.onComplete();
            }
        }
    }

    /**
     * Retorna el tiempo restante
     * @returns {number} Tiempo restante en segundos
     */
    getRemaining() {
        return Math.max(0, this.duration - this.elapsed);
    }

    /**
     * Retorna el porcentaje de progreso (0-100)
     * @returns {number} Porcentaje de progreso
     */
    getProgress() {
        return (this.elapsed / this.duration) * 100;
    }

    /**
     * Verifica si el temporizador ha finalizado
     * @returns {boolean}
     */
    isFinished() {
        return this.elapsed >= this.duration;
    }

    /**
     * Reinicia el temporizador
     */
    reset() {
        this.elapsed = 0;
        this.isRunning = false;
    }
}
