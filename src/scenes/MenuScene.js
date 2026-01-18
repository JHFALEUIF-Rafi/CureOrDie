class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
        this.selectedDifficulty = 'HARD'; // Dificultad por defecto
    }

    create() {
        const { width, height } = this.cameras.main;

        // Música de menú en loop
        if (!this.menuMusic) {
            this.menuMusic = this.sound.add('MenuSound', { loop: true, volume: 0.6 });
        }
        if (!this.menuMusic.isPlaying) {
            this.menuMusic.play();
        }

        // Fondo del menú - centrado y escalado manteniendo proporción
        const background = this.add.image(width / 2, height / 2, 'fondoMenu');
        background.setOrigin(0.5, 0.5);
        
        // Escalar manteniendo aspecto ratio sin distorsionar
        const scaleX = width / background.width;
        const scaleY = height / background.height;
        const scale = Math.min(scaleX, scaleY);
        background.setScale(scale);

        // Título
        const titulo = this.add.image(width / 2, height * 0.25, 'titulo');
        titulo.setOrigin(0.5, 0.5);
        titulo.setScale(0.8);

        // Botón JUGAR (único, centrado)
        const botonJugar = this.add.image(width / 2, 700, 'botonJugarB');
        botonJugar.setOrigin(0.5, 0.5);
        botonJugar.setInteractive({ useHandCursor: true });
        botonJugar.setScale(1.2);

        // Efecto hover para botón JUGAR
        botonJugar.on('pointerover', () => {
            botonJugar.setTexture('botonJugarR');
        });

        botonJugar.on('pointerout', () => {
            botonJugar.setTexture('botonJugarB');
        });

        botonJugar.on('pointerdown', () => {
            this.startGame(this.selectedDifficulty);
        });

        // Botón DIFÍCIL (izquierda)
        const botonDificil = this.add.image(width * 0.4, height * 0.75, 'dificil');
        botonDificil.setOrigin(0.5, 0.5);
        botonDificil.setScale(0.7);
        botonDificil.setInteractive({ useHandCursor: true });
        botonDificil.setAlpha(1); // Seleccionado por defecto

        // Botón DEMENTE (derecha)
        const botonDemente = this.add.image(width * 0.6, height * 0.75, 'demente');
        botonDemente.setOrigin(0.5, 0.5);
        botonDemente.setScale(0.7);
        botonDemente.setInteractive({ useHandCursor: true });
        botonDemente.setAlpha(0.5); // No seleccionado

        // Efecto hover y selección para DIFÍCIL
        botonDificil.on('pointerover', () => {
            if (this.selectedDifficulty !== 'HARD') {
                botonDificil.setScale(0.75);
            }
        });

        botonDificil.on('pointerout', () => {
            if (this.selectedDifficulty !== 'HARD') {
                botonDificil.setScale(0.7);
            }
        });

        botonDificil.on('pointerdown', () => {
            this.selectedDifficulty = 'HARD';
            botonDificil.setAlpha(1);
            botonDificil.setScale(0.7);
            botonDemente.setAlpha(0.5);
            botonDemente.setScale(0.7);
        });

        // Efecto hover y selección para DEMENTE
        botonDemente.on('pointerover', () => {
            if (this.selectedDifficulty !== 'INSANE') {
                botonDemente.setScale(0.75);
            }
        });

        botonDemente.on('pointerout', () => {
            if (this.selectedDifficulty !== 'INSANE') {
                botonDemente.setScale(0.7);
            }
        });

        botonDemente.on('pointerdown', () => {
            this.selectedDifficulty = 'INSANE';
            botonDemente.setAlpha(1);
            botonDemente.setScale(0.7);
            botonDificil.setAlpha(0.5);
            botonDificil.setScale(0.7);
        });

        // Botón Pantalla Completa (esquina superior derecha)
        const fullscreenButton = this.add.rectangle(width - 60, 50, 100, 50, 0x1a472a);
        fullscreenButton.setStrokeStyle(2, 0x00ff00);
        fullscreenButton.setInteractive({ useHandCursor: true });

        const fullscreenText = this.add.text(width - 60, 50, 'FULLSCREEN', {
            font: 'bold 12px Arial',
            fill: '#00ff00',
            align: 'center'
        }).setOrigin(0.5);

        fullscreenButton.on('pointerover', () => {
            fullscreenButton.setFillStyle(0x2d5a3d);
            fullscreenText.setFill('#00ff88');
        });

        fullscreenButton.on('pointerout', () => {
            fullscreenButton.setFillStyle(0x1a472a);
            fullscreenText.setFill('#00ff00');
        });

        fullscreenButton.on('pointerdown', () => {
            this.scale.toggleFullscreen();
        });
    }

    startGame(difficulty) {
        if (this.menuMusic && this.menuMusic.isPlaying) {
            this.menuMusic.stop();
        }
        // Iniciar ambiente de juego (loop) al salir del menú
        this.sound.stopByKey('Enviroment');
        this.sound.play('Enviroment', { loop: true, volume: 0.5 });
        // Pasamos la dificultad a InstructionsScene
        this.scene.start('InstructionsScene', { difficulty: difficulty });
    }
}
