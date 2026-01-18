class HeartMonitorWidget {
    constructor(scene, x, y, width, height) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.scrollX = 0;
        
        // Estados de estrés (0 = normal, 1 = morado, 2 = rojo)
        this.stressState = 0;
        this.lineColor = 0x00ff00; // Verde por defecto
        this.amplitude = 35; // Amplitud base de la onda
        this.frameColor = 0x00ff00; // Color del marco

        // Marco del monitor
        this.frame = scene.add.rectangle(x, y, width, height, 0x1a1a1a);
        this.frame.setStrokeStyle(2, this.frameColor);
        this.frame.setDepth(5);

        // Pantalla del monitor
        this.screen = scene.add.rectangle(x, y, width - 10, height - 10, 0x0a0a0a);
        this.screen.setDepth(4);

        // Graphics para la onda
        this.graphics = scene.make.graphics({ x: 0, y: 0, add: true });
        this.graphics.setDepth(6);

        // Crear máscara para contener la onda
        const maskGraphics = scene.make.graphics({ x: 0, y: 0, add: false });
        maskGraphics.fillStyle(0xffffff, 1);
        maskGraphics.fillRect(
            x - width / 2 + 5,
            y - height / 2 + 5,
            width - 10,
            height - 10
        );
        
        const mask = maskGraphics.createGeometryMask();
        this.graphics.setMask(mask);

        // Animación del desplazamiento
        scene.tweens.add({
            targets: this,
            scrollX: 300,
            duration: 3000,
            repeat: -1,
            ease: 'Linear',
            onUpdate: () => {
                this.draw();
            }
        });

        this.draw();
    }
    
    /**
     * Actualiza el estado de estrés según el tiempo restante
     * @param {number} timeRemaining - Tiempo restante en segundos
     * @param {number} totalTime - Tiempo total en segundos
     */
    updateStressState(timeRemaining, totalTime) {
        const halfTime = totalTime / 2;
        const lastMinuteHalf = 90; // 1:30 en segundos
        
        // Estado rojo: últimos 1:30
        if (timeRemaining <= lastMinuteHalf && timeRemaining > 0) {
            if (this.stressState !== 2) {
                this.stressState = 2;
                this.lineColor = 0xff0000; // Rojo
                this.frameColor = 0xff0000;
                this.amplitude = 55; // Amplitud máxima
                this.frame.setStrokeStyle(2, this.frameColor);
            }
        }
        // Estado morado: desde mitad del tiempo hasta 1:30 antes del fin
        else if (timeRemaining <= halfTime && timeRemaining > lastMinuteHalf) {
            if (this.stressState !== 1) {
                this.stressState = 1;
                this.lineColor = 0xbb00ff; // Morado
                this.frameColor = 0xbb00ff;
                this.amplitude = 45; // Amplitud intermedia
                this.frame.setStrokeStyle(2, this.frameColor);
            }
        }
        // Estado normal: inicio hasta mitad del tiempo
        else if (timeRemaining > halfTime) {
            if (this.stressState !== 0) {
                this.stressState = 0;
                this.lineColor = 0x00ff00; // Verde
                this.frameColor = 0x00ff00;
                this.amplitude = 35; // Amplitud base
                this.frame.setStrokeStyle(2, this.frameColor);
            }
        }
    }

    draw() {
        this.graphics.clear();
        this.graphics.lineStyle(2.5, this.lineColor, 1);

        const startX = this.x - this.width / 2 + 10;
        const centerY = this.y;
        const waveLength = 300;

        let isFirstPoint = true;

        // Dibujar la onda desplazada con amplitud dinámica
        for (let i = 0; i < this.width - 20; i++) {
            // Calcular posición en la onda con desplazamiento
            const wavePos = (i + this.scrollX) % waveLength;
            let y = centerY;

            // Patrón de pulso cardíaco (con amplitud variable)
            if (wavePos < 20) {
                y = centerY;
            } else if (wavePos < 45) {
                y = centerY - this.amplitude * 0.4 * Math.sin(((wavePos - 20) / 25) * Math.PI);
            } else if (wavePos < 50) {
                y = centerY;
            } else if (wavePos < 80) {
                y = centerY - this.amplitude * Math.sin(((wavePos - 50) / 30) * Math.PI);
            } else if (wavePos < 120) {
                y = centerY + this.amplitude * 0.5 * Math.sin(((wavePos - 80) / 40) * Math.PI);
            } else if (wavePos < 140) {
                y = centerY - this.amplitude * 0.3 * Math.sin(((wavePos - 120) / 20) * Math.PI);
            } else {
                y = centerY;
            }

            const screenX = startX + i;

            if (isFirstPoint) {
                this.graphics.moveTo(screenX, y);
                isFirstPoint = false;
            } else {
                this.graphics.lineTo(screenX, y);
            }
        }

        this.graphics.strokePath();
    }

    destroy() {
        this.frame.destroy();
        this.screen.destroy();
        this.graphics.destroy();
    }
}
