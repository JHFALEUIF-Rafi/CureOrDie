const gameConfig = {
    type: Phaser.AUTO,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1920,
        height: 1080,
        expandParent: true,
        orientation: Phaser.Scale.Orientation.LANDSCAPE,
        fullscreenTarget: 'parent',
        min: {
            width: 800,
            height: 450
        }
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    backgroundColor: '#000000',
    scene: [
        BootScene,
        PreloadScene,
        MenuScene,
        InstructionsScene,
        GameScene,
        VictoryScene,
        GameOverScene,
        UIScene
    ]
};

const game = new Phaser.Game(gameConfig);
