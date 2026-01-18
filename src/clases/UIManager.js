class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.elements = {};
    }

    /**
     * Crea un texto UI
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     * @param {string} text - Contenido del texto
     * @param {object} style - Estilos del texto
     * @param {string} key - Identificador único
     */
    createText(x, y, text, style = {}, key = null) {
        const defaultStyle = {
            font: '24px Arial',
            fill: '#ffffff',
            align: 'left',
            ...style
        };

        const textObj = this.scene.add.text(x, y, text, defaultStyle);

        if (key) {
            this.elements[key] = textObj;
        }

        return textObj;
    }

    /**
     * Actualiza el contenido de un texto UI
     * @param {string} key - Identificador del elemento
     * @param {string} text - Nuevo contenido
     */
    updateText(key, text) {
        if (this.elements[key]) {
            this.elements[key].setText(text);
        }
    }

    /**
     * Crea una barra de progreso
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     * @param {number} width - Ancho de la barra
     * @param {number} height - Alto de la barra
     * @param {string} color - Color en hexadecimal
     * @param {string} key - Identificador único
     */
    createProgressBar(x, y, width, height, color = '#00ff00', key = null) {
        const barBg = this.scene.add.rectangle(x, y, width, height, 0x333333);
        barBg.setStrokeStyle(2, 0x666666);

        const bar = this.scene.add.rectangle(x - (width / 2) + (width / 2), y, width, height, color);
        bar.setStrokeStyle(2, color);

        const barObj = {
            bg: barBg,
            bar: bar,
            maxWidth: width,
            updateProgress: (percentage) => {
                const newWidth = Math.max(0, (percentage / 100) * width);
                bar.width = newWidth;
                bar.x = x - (width / 2) + (newWidth / 2);
            }
        };

        if (key) {
            this.elements[key] = barObj;
        }

        return barObj;
    }

    /**
     * Obtiene un elemento UI
     * @param {string} key - Identificador del elemento
     * @returns {object}
     */
    getElement(key) {
        return this.elements[key];
    }

    /**
     * Elimina un elemento UI
     * @param {string} key - Identificador del elemento
     */
    removeElement(key) {
        if (this.elements[key]) {
            if (this.elements[key].destroy) {
                this.elements[key].destroy();
            }
            delete this.elements[key];
        }
    }

    /**
     * Limpia todos los elementos UI
     */
    clear() {
        Object.keys(this.elements).forEach(key => {
            this.removeElement(key);
        });
        this.elements = {};
    }
}
