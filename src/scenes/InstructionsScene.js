class InstructionsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'InstructionsScene' });
    }

    init(data) {
        this.difficulty = data.difficulty || 'HARD';
    }

    create() {
        const { width, height } = this.cameras.main;

        // Fondo negro estático
        const background = this.add.rectangle(width / 2, height / 2, width, height, 0x000000);
        background.setOrigin(0.5);

        // Imagen de instrucciones centrada
        const instrucciones = this.add.image(width / 2, height / 2, 'instrucciones');
        instrucciones.setOrigin(0.5, 0.5);
        
        // Escalar para que quepa en pantalla
        const scaleX = (width * 0.9) / instrucciones.width;
        const scaleY = (height * 0.9) / instrucciones.height;
        const scale = Math.min(scaleX, scaleY, 1);
        instrucciones.setScale(scale);

        // Texto para omitir
        const skipText = this.add.text(width / 2, height - 50, 'Click para omitir', {
            font: '20px Arial',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Animación de parpadeo del texto
        this.tweens.add({
            targets: skipText,
            alpha: { from: 1, to: 0.3 },
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Fade in al entrar
        this.cameras.main.fadeIn(500, 0, 0, 0);

        // Timer de 10 segundos
        this.time.delayedCall(10000, () => {
            this.startGame();
        });

        // Permitir click para omitir
        this.input.once('pointerdown', () => {
            this.startGame();
        });
    }

    startGame() {
        // Fade out antes de cambiar de escena
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.time.delayedCall(500, () => {
            this.scene.start('GameScene', { difficulty: this.difficulty });
        });
    }
}
