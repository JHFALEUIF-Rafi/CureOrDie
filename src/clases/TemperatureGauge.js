class TemperatureGauge {
    constructor(scene, x, y, width, height, initialTemp = 25) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.temperature = initialTemp;
        this.maxTemp = 165;
        this.minTemp = 0;
        
        // Crear el contenedor gráfico
        this.graphics = scene.make.graphics({
            add: true
        });
        this.graphics.setDepth(10);
        
        // Crear máscara de geometría
        const mask = scene.make.graphics({
            add: false
        });
        mask.fillStyle(0xffffff, 1);
        // Máscara para el rectángulo rotado
        mask.fillRect(x - height / 2, y - width / 2, height, width);
        const geometryMask = new Phaser.Display.Masks.GeometryMask(scene, mask);
        this.graphics.setMask(geometryMask);
        
        this.draw();
    }
    
    draw() {
        this.graphics.clear();
        
        // Dibujar un rectángulo vertical (termómetro) con las mismas proporciones que el ADN
        const tubeWidth = this.height;  // Usar height como ancho
        const tubeHeight = this.width;  // Usar width como alto
        
        const rectX = this.x - tubeWidth / 2;
        const rectY = this.y - tubeHeight / 2;
        
        // Calcular el relleno basado en la temperatura
        const tempRange = this.maxTemp - this.minTemp;
        const tempProgress = (this.temperature - this.minTemp) / tempRange;
        const filledHeight = tubeHeight * tempProgress;
        
        // Determinar color del relleno según temperatura
        let fillColor = 0x00cc00; // Verde por defecto
        
        if (this.temperature >= 140) {
            fillColor = 0xff0000; // Rojo (peligro extremo)
        } else if (this.temperature >= 100) {
            fillColor = 0xff8800; // Naranja (incendio iniciado)
        } else if (this.temperature >= 70) {
            fillColor = 0xffff00; // Amarillo (advertencia)
        }
        
        // Dibujar el relleno con color dinámico
        this.graphics.fillStyle(fillColor, 1);
        this.graphics.fillRect(
            rectX + 2,
            rectY + tubeHeight - filledHeight + 2,
            tubeWidth - 4,
            filledHeight - 4
        );
        
        // Dibujar el borde con color dinámico
        this.graphics.lineStyle(6, fillColor, 1);
        this.graphics.strokeRect(
            rectX,
            rectY,
            tubeWidth,
            tubeHeight
        );
    }
    
    setTemperature(temp) {
        this.temperature = Math.max(this.minTemp, Math.min(this.maxTemp, temp));
        this.draw();
    }
    
    getTemperature() {
        return this.temperature;
    }
    
    destroy() {
        this.graphics.destroy();
    }
}



