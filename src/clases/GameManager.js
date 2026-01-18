class GameManager {
    constructor(scene) {
        this.scene = scene;
        this.isGameActive = false;
        this.gameState = 'MENU'; // MENU, PLAYING, PAUSED, GAME_OVER, VICTORY
    }

    /**
     * Inicia el juego
     * @param {string} difficulty - Dificultad ('HARD' o 'INSANE')
     */
    startGame(difficulty) {
        this.isGameActive = true;
        this.gameState = 'PLAYING';
        this.difficulty = difficulty;
    }

    /**
     * Pausa el juego
     */
    pauseGame() {
        this.gameState = 'PAUSED';
    }

    /**
     * Reanuda el juego
     */
    resumeGame() {
        this.gameState = 'PLAYING';
    }

    /**
     * Termina el juego (game over)
     * @param {string} reason - Razón de la derrota
     */
    gameOver(reason) {
        this.isGameActive = false;
        this.gameState = 'GAME_OVER';
        this.gameOverReason = reason;
    }

    /**
     * Marca victoria
     */
    victory() {
        this.isGameActive = false;
        this.gameState = 'VICTORY';
    }

    /**
     * Obtiene el estado actual del juego
     * @returns {string}
     */
    getState() {
        return this.gameState;
    }

    /**
     * Verifica si el juego está activo
     * @returns {boolean}
     */
    isActive() {
        return this.isGameActive;
    }

    /**
     * Reinicia el juego
     */
    reset() {
        this.isGameActive = false;
        this.gameState = 'MENU';
        this.difficulty = null;
        this.gameOverReason = null;
    }
}
