class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.sounds = {};
    }

    /**
     * Añade un sonido al gestor
     * @param {string} key - Identificador único del sonido
     * @param {string} audioKey - Clave del audio en Phaser
     * @param {object} config - Configuración del sonido
     */
    addSound(key, audioKey, config = {}) {
        this.sounds[key] = {
            key: audioKey,
            config: {
                volume: config.volume || 1,
                loop: config.loop || false,
                ...config
            }
        };
    }

    /**
     * Reproduce un sonido
     * @param {string} key - Identificador del sonido
     */
    play(key) {
        if (this.sounds[key]) {
            this.scene.sound.play(this.sounds[key].key, this.sounds[key].config);
        }
    }

    /**
     * Detiene un sonido
     * @param {string} key - Identificador del sonido
     */
    stop(key) {
        if (this.sounds[key]) {
            this.scene.sound.stopByKey(this.sounds[key].key);
        }
    }

    /**
     * Detiene todos los sonidos
     */
    stopAll() {
        this.scene.sound.stopAll();
    }

    /**
     * Cambia el volumen de un sonido
     * @param {string} key - Identificador del sonido
     * @param {number} volume - Volumen (0-1)
     */
    setVolume(key, volume) {
        if (this.sounds[key]) {
            const sound = this.scene.sound.get(this.sounds[key].key);
            if (sound) {
                sound.setVolume(volume);
            }
        }
    }
}
