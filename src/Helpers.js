// Funciones auxiliares del juego

/**
 * Convierte segundos a formato MM:SS
 * @param {number} seconds - Segundos a convertir
 * @returns {string} Formato MM:SS
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Genera un número aleatorio entre min y max (inclusive)
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {number} Número aleatorio
 */
function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Verifica si un objeto está dentro de los límites de la pantalla
 * @param {Phaser.GameObjects.Sprite} sprite - El sprite a verificar
 * @param {Phaser.Cameras.Camera} camera - La cámara principal
 * @returns {boolean} True si está dentro de los límites
 */
function isInBounds(sprite, camera) {
    return sprite.x > 0 && 
           sprite.x < camera.width && 
           sprite.y > 0 && 
           sprite.y < camera.height;
}

/**
 * Calcula la distancia entre dos puntos
 * @param {number} x1 - Coordenada X del primer punto
 * @param {number} y1 - Coordenada Y del primer punto
 * @param {number} x2 - Coordenada X del segundo punto
 * @param {number} y2 - Coordenada Y del segundo punto
 * @returns {number} Distancia entre los puntos
 */
function getDistance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Mapea un valor de un rango a otro
 * @param {number} value - Valor a mapear
 * @param {number} inMin - Mínimo del rango de entrada
 * @param {number} inMax - Máximo del rango de entrada
 * @param {number} outMin - Mínimo del rango de salida
 * @param {number} outMax - Máximo del rango de salida
 * @returns {number} Valor mapeado
 */
function mapRange(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}
