class VictoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'VictoryScene' });
    }

    init(data) {
        this.difficulty = data.difficulty || 'HARD';
        this.fireStarted = data.fireStarted || false;
    }

    create() {
        const { width, height } = this.cameras.main;

        // Fondo - negro sólido o degradado según si hubo incendio
        if (this.fireStarted) {
            // Crear degradado rojo (abajo) a negro (arriba)
            const gradient = this.add.graphics();
            for (let y = 0; y < height; y++) {
                const progress = y / height;
                const red = Math.floor(255 * (1 - progress));
                const color = Phaser.Display.Color.GetColor(red, 0, 0);
                gradient.fillStyle(color, 1);
                gradient.fillRect(0, y, width, 1);
            }
            gradient.setDepth(0);
        } else {
            // Fondo negro normal
            const background = this.add.rectangle(width / 2, height / 2, width, height, 0x000000);
            background.setOrigin(0.5);
            background.setDepth(0);
        }

        // Imagen de Congratulations centrada
        const congratulations = this.add.image(width / 2, height / 2, 'Congratulations');
        congratulations.setOrigin(0.5, 0.5);
        
        // Escalar para que quepa en pantalla
        const scaleX = (width * 0.9) / congratulations.width;
        const scaleY = (height * 0.9) / congratulations.height;
        const scale = Math.min(scaleX, scaleY, 1);
        congratulations.setScale(scale);

        // Fade in al entrar
        this.cameras.main.fadeIn(500, 0, 0, 0);

        // Permitir click para volver al menú
        this.input.once('pointerdown', () => {
            this.goBackToMenu();
        });

        // También permitir con ENTER o ESPACIO
        this.input.keyboard.on('keydown-ENTER', () => {
            this.goBackToMenu();
        });

        this.input.keyboard.on('keydown-SPACE', () => {
            this.goBackToMenu();
        });
    }

    goBackToMenu() {
        // Fade out antes de cambiar de escena
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.time.delayedCall(500, () => {
            this.scene.start('MenuScene');
        });
    }
}
