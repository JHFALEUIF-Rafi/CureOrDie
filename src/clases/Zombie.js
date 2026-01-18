class Zombie {
    constructor(scene, x = 0, y = 540) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.speed = 150;
        this.isActive = false;
        this.hasEntered = false;
        this.health = 100;
        this.maxHealth = 100;
    }

    /**
     * Inicia el ataque del zombie
     */
    activate() {
        this.isActive = true;
        this.hasEntered = false;
    }

    /**
     * Desactiva el zombie
     */
    deactivate() {
        this.isActive = false;
        this.hasEntered = false;
        this.health = this.maxHealth;
    }

    /**
     * El zombie entra completamente en la oficina
     */
    enter() {
        this.hasEntered = true;
    }

    /**
     * Aplica daño al zombie
     * @param {number} damage - Cantidad de daño
     */
    takeDamage(damage) {
        this.health = Math.max(0, this.health - damage);
    }

    /**
     * Verifica si el zombie está muerto
     * @returns {boolean}
     */
    isDead() {
        return this.health <= 0;
    }

    /**
     * Obtiene la salud actual del zombie
     * @returns {number}
     */
    getHealth() {
        return this.health;
    }

    /**
     * Reinicia el zombie
     */
    reset() {
        this.deactivate();
        this.x = 0;
        this.y = 540;
    }
}
