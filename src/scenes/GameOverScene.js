class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.reason = data.reason || 'DERROTA';
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

        // Imagen de Game Over centrada
        const gameOverImage = this.add.image(width / 2, height / 2 - 50, 'GameOver');
        gameOverImage.setOrigin(0.5, 0.5);
        
        // Escalar para que quepa en pantalla
        const scaleX = (width * 0.8) / gameOverImage.width;
        const scaleY = (height * 0.7) / gameOverImage.height;
        const scale = Math.min(scaleX, scaleY, 1);
        gameOverImage.setScale(scale);

        // Mensaje de razón de derrota debajo
        const reasonText = this.add.text(width / 2, height / 2 + 150, this.reason, {
            font: 'bold 28px Arial',
            fill: '#ff0000',
            align: 'center'
        });
        reasonText.setOrigin(0.5, 0.5);

        // Texto para continuar (más pequeño, debajo del reason)
        const continueText = this.add.text(width / 2, height - 80, 'Click para continuar', {
            font: '18px Arial',
            fill: '#ffffff',
            align: 'center'
        });
        continueText.setOrigin(0.5);

        // Animación de parpadeo del texto
        this.tweens.add({
            targets: continueText,
            alpha: { from: 1, to: 0.3 },
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Fade in al entrar
        this.cameras.main.fadeIn(500, 0, 0, 0);

        // Permitir click en cualquier parte para volver al menú
        this.input.once('pointerdown', () => {
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
