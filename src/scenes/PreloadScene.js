class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        // Cargar imágenes del menú
        this.load.image('fondoMenu', 'assets/images/FondoMenú.png');
        this.load.image('titulo', 'assets/images/Título.png');
        this.load.image('botonJugarB', 'assets/images/BotonJugarB.png');
        this.load.image('botonJugarR', 'assets/images/BotonJugarR.png');
        this.load.image('dificil', 'assets/images/DIFICIL.png');
        this.load.image('demente', 'assets/images/DEMENTE.png');
        this.load.image('instrucciones', 'assets/images/Instrucciones.png');
        this.load.image('Congratulations', 'assets/images/Congratulations.png');
        this.load.image('GameOver', 'assets/images/Game over.png');

        // Cargar imágenes del juego
        this.load.image('fondoDefault', 'assets/images/FondoDefault.png');
        this.load.image('fondoFase2', 'assets/images/FondoFase2.png');
        this.load.image('fondoFase3', 'assets/images/FondoFase3.png');
        this.load.image('fondoIncendio', 'assets/images/FondoIncendio.png');
        this.load.image('fondoIncendio2', 'assets/images/FondoIncendio 2.png');
        this.load.image('fondoIncendioFase2', 'assets/images/FondoIncendioFase2.png');
        this.load.image('fondoIncendioFase3', 'assets/images/FondoIncendio Fase3.png');
        this.load.image('BarraPc', 'assets/images/BarraPc.png');
        this.load.image('Monitor', 'assets/images/Monitor.png');
        this.load.image('Adenine', 'assets/images/AdeninaDibujo.png');
        this.load.image('Guanine', 'assets/images/GuaninaDibujo.png');
        this.load.image('Cytosine', 'assets/images/CitosinaDibujo.png');
        this.load.image('Thymine', 'assets/images/TiminaDibujo.png');
        // Botones alternativos
        this.load.image('BtnAdenina', 'assets/images/BtnAdenina.png');
        this.load.image('BtnGuanina', 'assets/images/BtnGuanina.png');
        this.load.image('BtnCitosina', 'assets/images/BtnCitosina.png');
        this.load.image('BtnTimina', 'assets/images/BtnTimina.png');
        // Botones de seguridad
        this.load.image('BtnElectroshock', 'assets/images/BtnElectroshock.png');
        this.load.image('BtnVentilador', 'assets/images/BtnVentilador.png');
        this.load.image('RESET', 'assets/images/RESET.png');
        this.load.image('Warning', 'assets/images/Warning.png');

        // Audio
        this.load.audio('MenuSound', 'assets/audio/MenuSound.mp3');
        this.load.audio('BotonesBeep', 'assets/audio/BotonesBeep.mp3');
        this.load.audio('CadenaCompletada', 'assets/audio/CadenaCompletada.mp3');
        this.load.audio('Electroshock', 'assets/audio/Electroshock.mp3');
        this.load.audio('Enviroment', 'assets/audio/Enviroment.mp3');
        this.load.audio('EnviromentRandom', 'assets/audio/EnviromentRandom.mp3');
        this.load.audio('ErrorSound', 'assets/audio/ErrorSound.mp3');
        this.load.audio('GameOver', 'assets/audio/GameOver.mp3');
        this.load.audio('Monitor', 'assets/audio/Monitor.mp3');
        this.load.audio('RespiracionAgitada', 'assets/audio/RespiracionAgitada.mp3');
        this.load.audio('Fire', 'assets/audio/Fire.mp3');
        this.load.audio('Ventilador', 'assets/audio/Ventilador.mp3');
        this.load.audio('YouWin', 'assets/audio/YouWin.mp3');
        this.load.audio('ZLejos', 'assets/audio/ZLejos.mp3');
        this.load.audio('ZsegundoMov', 'assets/audio/ZsegundoMov.mp3');
        this.load.audio('ZPuerta', 'assets/audio/ZPuerta.mp3');
        this.load.audio('ZFase3', 'assets/audio/ZFase3.mp3');
        this.load.audio('ZAuyentado', 'assets/audio/ZAuyentado.mp3');
    }

    create() {
        this.scene.start('MenuScene');
    }
}
