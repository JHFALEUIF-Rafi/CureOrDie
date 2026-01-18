class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    create() {
        // Escena de inicio que carga configuraciones iniciales
        this.scene.start('PreloadScene');
    }
}
