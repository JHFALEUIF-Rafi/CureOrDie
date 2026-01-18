class DNAProgressBar {
    constructor(scene, x, y, width, height, progress = 50) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.progress = progress;
        this.animOffset = 0;

        // Marco del medidor (rotado verticalmente)
        this.frame = scene.add.rectangle(x, y, height, width, 0x1a1a1a);
        this.frame.setStrokeStyle(2, 0x00ff00);
        this.frame.setDepth(4);

        // Fondo de la barra (rotado verticalmente)
        this.background = scene.add.rectangle(x, y, height - 10, width - 10, 0x0a0a0a);
        this.background.setDepth(4);

        // Graphics para dibujar la hélice de ADN
        this.graphics = scene.make.graphics({ x: 0, y: 0, add: true });
        this.graphics.setDepth(6);

        // Crear máscara (rotada verticalmente)
        const maskGraphics = scene.make.graphics({ x: 0, y: 0, add: false });
        maskGraphics.fillStyle(0xffffff, 1);
        maskGraphics.fillRect(
            x - height / 2 + 5,
            y - width / 2 + 5,
            height - 10,
            width - 10
        );
        const mask = maskGraphics.createGeometryMask();
        this.graphics.setMask(mask);

        // Animación
        scene.tweens.add({
            targets: this,
            animOffset: 360,
            duration: 4000,
            repeat: -1,
            ease: 'Linear',
            onUpdate: () => {
                this.draw();
            }
        });

        this.draw();
    }

    draw() {
        this.graphics.clear();

        const startY = this.y + this.width / 2 - 10; // Comienza abajo
        const endY = this.y - this.width / 2 + 10;   // Termina arriba
        const centerX = this.x;
        const amplitude = 20;

        // Dibujar dos hélices (una azul, una roja) que forman el ADN
        // Hélice 1 (Azul)
        this.graphics.lineStyle(2, 0x0099ff, 1);
        this.graphics.beginPath();
        
        for (let y = startY; y >= endY; y -= 2) {
            const progress = (startY - y) / (startY - endY);
            const angle = (progress * 360 + this.animOffset) * Math.PI / 180;
            const offsetX = Math.sin(angle) * amplitude;
            
            if (y === startY) {
                this.graphics.moveTo(centerX + offsetX, y);
            } else {
                this.graphics.lineTo(centerX + offsetX, y);
            }
        }
        this.graphics.strokePath();

        // Hélice 2 (Roja) - opuesta a la primera
        this.graphics.lineStyle(2, 0xff0099, 1);
        this.graphics.beginPath();
        
        for (let y = startY; y >= endY; y -= 2) {
            const progress = (startY - y) / (startY - endY);
            const angle = (progress * 360 + this.animOffset + 180) * Math.PI / 180;
            const offsetX = Math.sin(angle) * amplitude;
            
            if (y === startY) {
                this.graphics.moveTo(centerX + offsetX, y);
            } else {
                this.graphics.lineTo(centerX + offsetX, y);
            }
        }
        this.graphics.strokePath();

        // Dibujar conexiones entre hélices (pares de bases)
        this.graphics.lineStyle(1, 0xcccccc, 0.5);
        for (let y = startY; y >= endY; y -= 20) {
            const progress = (startY - y) / (startY - endY);
            const angle1 = (progress * 360 + this.animOffset) * Math.PI / 180;
            const angle2 = (progress * 360 + this.animOffset + 180) * Math.PI / 180;
            const offsetX1 = Math.sin(angle1) * amplitude;
            const offsetX2 = Math.sin(angle2) * amplitude;
            
            this.graphics.beginPath();
            this.graphics.moveTo(centerX + offsetX1, y);
            this.graphics.lineTo(centerX + offsetX2, y);
            this.graphics.strokePath();
        }
    }

    setProgress(progress) {
        this.progress = Math.min(100, Math.max(0, progress));
    }

    destroy() {
        this.frame.destroy();
        this.background.destroy();
        this.graphics.destroy();
    }
}
