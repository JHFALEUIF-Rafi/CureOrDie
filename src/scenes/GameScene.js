class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        this.difficulty = data.difficulty || 'HARD';
    }

    create() {
        const { width, height } = this.cameras.main;

        // Asegurar ambiente activo durante la partida
        this.sound.stopByKey('Enviroment');
        this.sound.play('Enviroment', { loop: true, volume: 0.5 });

        // Ambient aleatorio superpuesto
        this.time.addEvent({
            delay: 15000,
            loop: true,
            callback: () => {
                if (!gameActive) return;
                if (Math.random() < 0.3) {
                    this.sound.play('EnviromentRandom', { volume: 0.5 });
                }
            }
        });

        const playButtonBeep = () => {
            this.sound.play('BotonesBeep', { volume: 0.35 });
        };

        const stopGameAudio = () => {
            this.sound.stopByKey('Enviroment');
            this.sound.stopByKey('Fire');
        };

        // ==================== SISTEMA DE TIEMPO ====================
        // Establecer duración según dificultad
        const gameDuration = this.difficulty === 'HARD' ? 300 : 480; // 5 min (HARD) o 8 min (INSANE)
        let timeRemaining = gameDuration;
        let gameActive = true;

        // ==================== SISTEMA DE ENERGÍA ====================
        const energySystem = new EnergySystem(100, this.difficulty);
        let energyResetCooldown = false;

        // ==================== SISTEMA DE TEMPERATURA ====================
        const temperatureSystem = new TemperatureSystem(20, 165);
        let ventiladorEncendido = false;
        let fireStarted = false;
        let ventiladorDurabilityValue = 100;
        let ventiladorResetCooldown = false;
        let electroshockDurabilityValue = 100;
        let electroshockResetCooldown = false;

        // Crear texto de tiempo en la pantalla
        const timeDisplay = this.add.text(width - 150, 50, '', {
            font: 'bold 32px Arial',
            fill: '#ff0000'
        });
        timeDisplay.setOrigin(0.5, 0.5);
        timeDisplay.setDepth(100);

        // Función para formatear tiempo (MM:SS)
        const updateTimeDisplay = () => {
            const minutes = Math.floor(timeRemaining / 60);
            const seconds = timeRemaining % 60;
            timeDisplay.setText(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
        };

        // Inicializar display
        updateTimeDisplay();

        // Temporizador principal
        this.time.addEvent({
            delay: 1000,
            callback: () => {
                if (gameActive && timeRemaining > 0) {
                    timeRemaining--;
                    updateTimeDisplay();

                    // Actualizar estado de estrés del monitor de signos vitales
                    heartMonitor.updateStressState(timeRemaining, gameDuration);

                    // Actualizar temperatura cada segundo
                    if (!ventiladorEncendido) {
                        // Si ventilador está OFF, la temperatura sube 0.5 grados por segundo
                        temperatureSystem.increase(0.5);
                    } else {
                        // Si ventilador está ON, la temperatura baja lentamente 0.2 grados
                        // Pero si hay incendio, no puede bajar de 100°C
                        if (fireStarted && temperatureSystem.getCurrentTemp() <= 100) {
                            // Ya está en el mínimo permitido durante incendio
                        } else {
                            temperatureSystem.decrease(0.2);
                        }
                    }

                    // GAME OVER por tiempo agotado
                    if (timeRemaining <= 0) {
                        gameActive = false;
                        console.log('GAME OVER: Tiempo agotado');
                        stopGameAudio();
                        this.sound.play('GameOver', { volume: 0.8 });
                        this.scene.start('GameOverScene', { reason: 'TIEMPO AGOTADO' });
                    }
                }
            },
            repeat: gameDuration
        });

        // Fondo de la oficina (izquierda, centrado verticalmente)
        let officeBackground = this.add.image(0, height / 2, 'fondoDefault');
        officeBackground.setOrigin(0, 0.5);
        
        // Mantener aspecto ratio sin distorsionar
        // Calcular escala para que el alto ocupe la altura de la pantalla
        const scale = height / officeBackground.height;
        officeBackground.setScale(scale);
        officeBackground.setDepth(1);

        // Ancho del área de oficina
        const officeWidth = officeBackground.width * scale;

        // Barra de PC (parte inferior, centrada con respecto al fondodefault)
        const barraPC = this.add.image(officeWidth / 2, height - 20, 'BarraPc');
        barraPC.setOrigin(0.5, 1);
        // Ajustar escala proporcionalmente (mucho más pequeña)
        const barraPCScale = (officeWidth * 0.6) / barraPC.width;
        barraPC.setScale(barraPCScale);
        barraPC.setDepth(15);
        barraPC.setInteractive();

        // Monitor que se mostrará al hacer click en BarraPc
        const monitor = this.add.image(officeWidth / 2, height + 200, 'Monitor');
        monitor.setOrigin(0.5, 1);
        const monitorScale = (officeWidth * 1.1) / monitor.width;
        monitor.setScale(monitorScale);
        monitor.setDepth(10);
        monitor.setVisible(false);

        // ==================== SISTEMA DE VACUNA ====================
        const vaccineSystem = new VaccineSystem(this.difficulty);

        // Estado del zombie y función para cambiar el fondo según fase/incendio
        let zombiePhase = 0; // 0=fuera, 1=se acerca (sin cambio), 2=puerta, 3=dentro
        let zombiePhaseTimer = null; // temporizador de 8s cuando está dentro

        const resolveOfficeTexture = () => {
            if (fireStarted) {
                // Si hay incendio, usar fondos de incendio correspondientes a cada fase
                if (zombiePhase >= 3) return 'fondoIncendioFase3'; // Fase 3 en incendio
                if (zombiePhase === 2) return 'fondoIncendioFase2'; // Fase 2 en incendio
                return 'fondoIncendio'; // Fases 0-1 en incendio (base)
            }
            // Sin incendio, fondos normales
            if (zombiePhase >= 3) return 'fondoFase3';
            if (zombiePhase === 2) return 'fondoFase2';
            return 'fondoDefault';
        };

        const updateOfficeBackground = () => {
            const newTexture = resolveOfficeTexture();
            console.log(`Actualizando fondo: ${newTexture} (fireStarted: ${fireStarted}, zombiePhase: ${zombiePhase})`);
            officeBackground.setTexture(newTexture);
            // Mantener misma posición y dimensiones que el fondo inicial
            officeBackground.setDisplaySize(officeWidth, height);
            officeBackground.setOrigin(0, 0.5);
            officeBackground.setPosition(0, height / 2);
        };

        const clearZombieTimer = () => {
            if (zombiePhaseTimer) {
                zombiePhaseTimer.remove(false);
                zombiePhaseTimer = null;
            }
        };

        // Crear 7 círculos iluminables para la vacuna
        const vaccineCircles = [];
        const circleStartX = officeWidth / 2 - 210;
        const circleSpacing = 70;
        const circleY = height - 520;
        const circleRadius = 20;

        for (let i = 0; i < 7; i++) {
            const circleX = circleStartX + (i * circleSpacing);
            const circle = this.add.circle(circleX, circleY, circleRadius, 0x333333);
            circle.setStrokeStyle(2, 0x00ff00);
            circle.setDepth(11);
            circle.setVisible(false);
            vaccineCircles.push(circle);
        }

        // Colores para las bases nucleotídicas
        const baseColors = [0xff0000, 0xffff00, 0x0000ff, 0x00ff00]; // Rojo, Amarillo, Azul, Verde

        // Botones/Tabs del monitor (MAIN, SECURITY, SERVICE)
        const tabNames = ['MAIN', 'SECURITY', 'SERVICE'];
        const tabs = [];
        const monitorDisplayY = height - 80; // Más cercano a la pantalla del monitor
        const tabStartX = officeWidth / 2 - 200;
        const tabSpacing = 200;
        
        tabNames.forEach((tabName, index) => {
            const tabX = tabStartX + (index * tabSpacing);
            
            // Dibujar borde del tab (más grande)
            const tabGraphics = this.make.graphics({
                add: true
            });
            tabGraphics.lineStyle(3, 0x00ff00, 1);
            tabGraphics.strokeRect(tabX - 85, monitorDisplayY - 520, 170, 50);
            tabGraphics.setDepth(11);
            tabGraphics.setVisible(false);
            
            // Texto del tab (más grande)
            const tabText = this.add.text(tabX, monitorDisplayY - 495, tabName, {
                font: 'bold 22px Arial',
                fill: '#00ff00'
            });
            tabText.setOrigin(0.5, 0.5);
            tabText.setDepth(12);
            tabText.setVisible(false);
            
            // Hacer el tab interactivo
            tabText.setInteractive();
            tabText.on('pointerdown', () => {
                playButtonBeep();
                if (tabName === 'MAIN') {
                    welcomeText.setVisible(false);
                    btnElectroshock.setVisible(false);
                    btnVentilador.setVisible(false);
                    electroshockDurability.setVisible(false);
                    ventiladorDurability.setVisible(false);
                    serviceButtons.forEach(item => {
                        item.button.setVisible(false);
                        item.label.setVisible(false);
                    });
                    // NO mostrar nucleotideChain (cadena)
                    nucleotideBases.forEach(base => {
                        base.image.setVisible(true);
                        base.text.setVisible(true);
                    });
                    vaccineCircles.forEach(circle => {
                        circle.setVisible(true);
                    });
                    
                    // Iniciar patrón si no está en juego
                    if (!vaccineSystem.isPlayingSequence && !vaccineSystem.isPlayerTurn) {
                        vaccineSystem.generateNewSequence();
                        this.time.delayedCall(300, () => {
                            playSequence();
                        });
                    }
                } else if (tabName === 'SECURITY') {
                    welcomeText.setVisible(false);
                    nucleotideBases.forEach(base => {
                        base.image.setVisible(false);
                        base.text.setVisible(false);
                    });
                    vaccineCircles.forEach(circle => {
                        circle.setVisible(false);
                    });
                    conexionImage.setVisible(false);
                    serviceButtons.forEach(item => {
                        item.button.setVisible(false);
                        item.label.setVisible(false);
                    });
                    btnElectroshock.setVisible(true);
                    btnVentilador.setVisible(true);
                    electroshockDurability.setVisible(true);
                    ventiladorDurability.setVisible(true);
                } else if (tabName === 'SERVICE') {
                    welcomeText.setVisible(false);
                    btnElectroshock.setVisible(false);
                    btnVentilador.setVisible(false);
                    electroshockDurability.setVisible(false);
                    ventiladorDurability.setVisible(false);
                    nucleotideBases.forEach(base => {
                        base.image.setVisible(false);
                        base.text.setVisible(false);
                    });
                    vaccineCircles.forEach(circle => {
                        circle.setVisible(false);
                    });
                    serviceButtons.forEach(item => {
                        item.button.setVisible(true);
                        item.label.setVisible(true);
                    });
                }
            });
            
            tabs.push({ graphics: tabGraphics, text: tabText });
        });

        // Texto WELCOME! centrado en el monitor
        const welcomeText = this.add.text(officeWidth / 2, height - 420, 'WELCOME!', {
            font: 'bold 48px Arial',
            fill: '#00ff00'
        });
        welcomeText.setOrigin(0.5, 0.5);
        welcomeText.setDepth(11);
        welcomeText.setVisible(false);

        // Botones de seguridad (SECURITY tab)
        const btnElectroshock = this.add.image(officeWidth / 2 - 150, height - 420, 'BtnElectroshock');
        btnElectroshock.setOrigin(0.5, 0.5);
        btnElectroshock.setScale(1);
        btnElectroshock.setDepth(11);
        btnElectroshock.setVisible(false);
        btnElectroshock.setInteractive({ useHandCursor: true });

        // Durabilidad de Electroshock
        const electroshockDurability = this.add.text(officeWidth / 2 - 150, height - 300, '100%', {
            font: 'bold 24px Arial',
            fill: '#00ff00'
        });
        electroshockDurability.setOrigin(0.5, 0.5);
        electroshockDurability.setDepth(11);
        electroshockDurability.setVisible(false);

        const btnVentilador = this.add.image(officeWidth / 2 + 150, height - 420, 'BtnVentilador');
        btnVentilador.setOrigin(0.5, 0.5);
        btnVentilador.setScale(1);
        btnVentilador.setDepth(11);
        btnVentilador.setVisible(false);
        btnVentilador.setInteractive({ useHandCursor: true });

        // Durabilidad de Ventilador
        const ventiladorDurability = this.add.text(officeWidth / 2 + 150, height - 300, '100%', {
            font: 'bold 24px Arial',
            fill: '#00ff00'
        });
        ventiladorDurability.setOrigin(0.5, 0.5);
        ventiladorDurability.setDepth(11);
        ventiladorDurability.setVisible(false);

        // Imagen de conexión (vacía para no causar errores)
        const conexionImage = this.add.rectangle(officeWidth / 2, height - 100, 100, 50, 0x000000, 0);
        conexionImage.setDepth(11);
        conexionImage.setVisible(false);

        // Evento para botón electroshock
        btnElectroshock.on('pointerdown', () => {
                this.sound.play('Electroshock', { volume: 0.8 });
            if (!electroshockResetCooldown && electroshockDurabilityValue > 0) {
                // Reducir 15% de energía de golpe
                energySystem.consume(15);
                // Efecto visual de oscurecimiento breve al usar electroshock
                runDistraction();
                console.log('Electroshock activado: se ejecuta transición de oscurecimiento');
                
                // Reducir durabilidad en 20%
                electroshockDurabilityValue = Math.max(0, electroshockDurabilityValue - 20);
                electroshockDurability.setText(`${electroshockDurabilityValue}%`);
                
                // Si durabilidad llega a 0, marcar que necesita reset
                if (electroshockDurabilityValue <= 0) {
                    electroshockResetCooldown = true;
                    btnElectroshock.setTint(0xff0000);
                    electroshockDurability.setFill('#ff0000');
                }

                // Solo tiene efecto real contra el zombie en fase 3
                if (zombiePhase === 3) {
                    zombiePhase = 0;
                    clearZombieTimer();
                    updateOfficeBackground();
                    this.sound.play('ZAuyentado', { volume: 0.7 });
                    console.log('Electroshock repelió al zombie: vuelta a fase 0');
                } else {
                    console.log('Electroshock usado sin zombie en fase 3 (energía desperdiciada)');
                }
            }
        });

        // Evento para botón ventilador
        btnVentilador.on('pointerdown', () => {
            playButtonBeep();
            if (!ventiladorResetCooldown && ventiladorDurabilityValue > 0) {
                ventiladorEncendido = !ventiladorEncendido;
                ventiladorDurabilityValue = Math.max(0, ventiladorDurabilityValue - 15);
                
                // Actualizar multiplicador de consumo de energía
                // Si ventilador está ON, consumo es 2x más rápido
                if (ventiladorEncendido) {
                    energySystem.setConsumptionMultiplier(2.0);
                    this.sound.play('Ventilador', { loop: true, volume: 0.3 });
                } else {
                    energySystem.setConsumptionMultiplier(1.0);
                    this.sound.stopByKey('Ventilador');
                }
                
                // Actualizar texto de durabilidad
                ventiladorDurability.setText(`${ventiladorDurabilityValue}%`);
                
                // Cambiar color del botón según estado
                btnVentilador.setTint(ventiladorEncendido ? 0x00ff00 : 0xffffff);
                
                // Si durabilidad llega a 0, marcar que necesita reset
                if (ventiladorDurabilityValue <= 0) {
                    ventiladorResetCooldown = true;
                    btnVentilador.setTint(0xff0000);
                    ventiladorDurability.setFill('#ff0000');
                    ventiladorEncendido = false;
                    energySystem.setConsumptionMultiplier(1.0);
                    this.sound.stopByKey('Ventilador');
                }
            }
        });

        // Botones de servicio (SERVICE tab) - 3 botones RESET
        const serviceButtons = [];
        const serviceLabels = ['ELECTROSHOCK', 'VENTILATION', 'ENERGY'];
        const serviceStartY = height - 500;
        const serviceSpacingY = 80;
        let energyPercentLabel = null;

        serviceLabels.forEach((label, index) => {
            const yPos = serviceStartY + (index * serviceSpacingY);
            
            // Botón RESET (izquierda)
            const resetBtn = this.add.image(officeWidth / 2 - 180, yPos, 'RESET');
            resetBtn.setOrigin(0.5, 0.5);
            resetBtn.setScale(1);
            resetBtn.setDepth(11);
            resetBtn.setVisible(false);
            resetBtn.setInteractive({ useHandCursor: true });
            
            // Texto de la función (derecha)
            const labelText = this.add.text(officeWidth / 2 + 20, yPos, label, {
                font: 'bold 28px Arial',
                fill: '#00ff00'
            });
            labelText.setOrigin(0, 0.5);
            labelText.setDepth(11);
            labelText.setVisible(false);
            
            // Evento para botones de reset
            resetBtn.on('pointerdown', () => {
                playButtonBeep();
                if (index === 0) { // ELECTROSHOCK reset
                    if (electroshockResetCooldown) {
                        resetBtn.setInteractive(false);
                        labelText.setText('RESETTING... 4s');
                        labelText.setFill('#ffff00');
                        
                        this.time.delayedCall(4000, () => {
                            electroshockDurabilityValue = 100;
                            electroshockResetCooldown = false;
                            
                            electroshockDurability.setText('100%');
                            electroshockDurability.setFill('#00ff00');
                            btnElectroshock.clearTint();
                            labelText.setText('ELECTROSHOCK');
                            labelText.setFill('#00ff00');
                            resetBtn.setInteractive(true);
                        });
                    }
                } else if (index === 1) { // VENTILATION reset
                    if (ventiladorResetCooldown) {
                        resetBtn.setInteractive(false);
                        labelText.setText('RESETTING... 4s');
                        labelText.setFill('#ffff00');
                        
                        this.time.delayedCall(4000, () => {
                            ventiladorDurabilityValue = 100;
                            ventiladorResetCooldown = false;
                            ventiladorEncendido = false;
                            
                            // Resetear multiplicador de consumo de energía
                            energySystem.setConsumptionMultiplier(1.0);
                            
                            ventiladorDurability.setText('100%');
                            ventiladorDurability.setFill('#00ff00');
                            btnVentilador.clearTint();
                            labelText.setText('VENTILATION');
                            labelText.setFill('#00ff00');
                            resetBtn.setInteractive(true);
                        });
                    }
                } else if (index === 2) { // ENERGY reset
                    // Solo disponible desde 15%
                    if (energySystem.getPercentage() <= 15 && !energyResetCooldown) {
                        resetBtn.setInteractive(false);
                        energyPercentLabel.setText('RESETTING... 7s');
                        energyPercentLabel.setFill('#ffff00');
                        energyResetCooldown = true;
                        
                        this.time.delayedCall(7000, () => {
                            // Restaurar energía al 80%
                            energySystem.restoreToPercentage(80);
                            
                            // Resetear multiplicador de consumo de energía
                            energySystem.setConsumptionMultiplier(1.0);
                            
                            // Ocultar imagen de advertencia de energía baja
                            warningImage.setVisible(false);
                            
                            // Resetear temperatura respetando el estado de incendio
                            if (fireStarted) {
                                temperatureSystem.setTemperature(100); // Mínimo si hay incendio
                            } else {
                                temperatureSystem.setTemperature(20); // Normal si no hay incendio
                            }
                            
                            // Resetear ventilador
                            ventiladorEncendido = false;
                            ventiladorDurabilityValue = 100;
                            ventiladorDurability.setText('100%');
                            ventiladorDurability.setFill('#00ff00');
                            btnVentilador.clearTint();
                            
                            // Resetear durabilidad de electroshock
                            electroshockDurabilityValue = 100;
                            electroshockResetCooldown = false;
                            electroshockDurability.setText('100%');
                            electroshockDurability.setFill('#00ff00');
                            btnElectroshock.clearTint();
                            
                            energyResetCooldown = false;
                            labelText.setText('ENERGY');
                            labelText.setFill('#00ff00');
                            resetBtn.setInteractive(true);
                        });
                    }
                }
            });
            
            serviceButtons.push({ button: resetBtn, label: labelText });
        });

        // Guardar referencia al label de energía para actualizaciones
        energyPercentLabel = serviceButtons[2].label;

        // Imagen de advertencia de energía baja (esquina superior izquierda)
        const warningImage = this.add.image(80, 60, 'Warning');
        warningImage.setOrigin(0.5, 0.5);
        warningImage.setScale(0.8);
        warningImage.setDepth(100);
        warningImage.setVisible(false);

        // Callbacks de energía
        energySystem.onEnergyChange = (currentEnergy) => {
            const percentage = energySystem.getPercentage();
            
            // Actualizar label en SERVICE tab
            if (energyPercentLabel && !energyResetCooldown) {
                energyPercentLabel.setText(`ENERGY: ${Math.round(percentage)}%`);
                
                // Cambiar color según nivel
                if (percentage <= 10) {
                    energyPercentLabel.setFill('#ff0000');
                    serviceButtons[2].button.setTint(0xff0000);
                } else if (percentage <= 15) {
                    energyPercentLabel.setFill('#ffff00');
                    serviceButtons[2].button.clearTint();
                } else {
                    energyPercentLabel.setFill('#00ff00');
                    serviceButtons[2].button.clearTint();
                }
            }
        };

        energySystem.onLowEnergy = () => {
            warningImage.setVisible(true);
            this.sound.play('ErrorSound', { volume: 0.7 });
        };

        energySystem.onEnergyDepleted = () => {
            gameActive = false;
            console.log('GAME OVER: Energía agotada');
            stopGameAudio();
            this.sound.play('GameOver', { volume: 0.8 });
            this.scene.start('GameOverScene', { reason: 'ENERGÍA AGOTADA' });
        };

        // Actualizar label inicial de energía
        energyPercentLabel.setText(`ENERGY: ${Math.round(energySystem.getPercentage())}%`);
        const nucleotideChain = this.add.text(officeWidth / 2, height - 520, 'O−O−O−O−O−O−O', {
            font: 'bold 32px Arial',
            fill: '#00ff00'
        });
        nucleotideChain.setOrigin(0.5, 0.5);
        nucleotideChain.setDepth(11);
        nucleotideChain.setVisible(false);

        // Bases nucleotídicas (imágenes de dibujos) - ahora interactivas
        const nucleotideBases = [];
        const baseNames = ['ADENINE', 'GUANINE', 'CYTOSINE', 'THYMINE'];
        const baseImages = ['Adenine', 'Guanine', 'Cytosine', 'Thymine'];
        const baseStartX = officeWidth / 2 - 220;
        const baseSpacing = 150;

        baseNames.forEach((baseName, index) => {
            const baseX = baseStartX + (index * baseSpacing);
            const baseY = height - 380;

            // Imagen del dibujo de la base
            const baseImage = this.add.image(baseX, baseY, baseImages[index]);
            baseImage.setOrigin(0.5, 0.5);
            baseImage.setScale(0.8);
            baseImage.setDepth(11);
            baseImage.setVisible(false);
            baseImage.setInteractive({ useHandCursor: true });

            // Evento de clic en la base
            baseImage.on('pointerdown', () => {
                playButtonBeep();
                if (vaccineSystem.isPlayerTurn && !vaccineSystem.isPlayingSequence) {
                    // Reproducir efecto visual en la imagen
                    baseImage.setTint(baseColors[index]);
                    
                    // Registrar el input
                    const isCorrect = vaccineSystem.addPlayerInput(index);
                    
                    if (isCorrect) {
                        // Iluminar el círculo correspondiente con el color del patrón
                        const playerPosition = vaccineSystem.playerSequence.length - 1;
                        const patternColor = vaccineSystem.currentSequence[playerPosition];
                        vaccineCircles[playerPosition].setFillStyle(baseColors[patternColor]);
                        
                        // Actualizar dnaPercent
                        dnaPercent.setText(`${vaccineSystem.getProgress()}%`);
                        
                        // Verificar si completó la vacuna
                        if (vaccineSystem.getProgress() >= 100) {
                            gameActive = false;
                            console.log('VICTORIA: ¡Vacuna completada!');
                            stopGameAudio();
                            this.sound.play('YouWin', { volume: 0.8 });
                            // Transicionar a VictoryScene
                            this.scene.start('VictoryScene', { difficulty: this.difficulty, fireStarted: fireStarted });
                        }
                    }
                    
                    // Restaurar color después de 200ms
                    this.time.delayedCall(200, () => {
                        baseImage.clearTint();
                    });
                }
            });

            // Nombre de la base
            const baseText = this.add.text(baseX, baseY + 90, baseName, {
                font: 'bold 14px Arial',
                fill: '#00ff00'
            });
            baseText.setOrigin(0.5, 0.5);
            baseText.setDepth(12);
            baseText.setVisible(false);

            nucleotideBases.push({ image: baseImage, text: baseText });
        });

        // Función para reproducir el patrón visualmente
        const playSequence = () => {
            vaccineSystem.isPlayingSequence = true;
            vaccineSystem.isPlayerTurn = false;

            const displaySpeed = this.difficulty === 'HARD' ? 400 : 300;
            let delay = 300;
            
            vaccineSystem.currentSequence.forEach((baseIndex, step) => {
                const circleIndex = step; // 0-6 para los 7 círculos
                
                this.time.delayedCall(delay, () => {
                    // Iluminar el círculo en esa posición con el color correspondiente
                    vaccineCircles[circleIndex].setFillStyle(baseColors[baseIndex]);
                    
                    // Restaurar color después del tiempo de display
                    this.time.delayedCall(displaySpeed, () => {
                        vaccineCircles[circleIndex].setFillStyle(0x333333);
                    });
                });
                
                delay += displaySpeed + 150;
            });

            // Permitir input del jugador después de mostrar el patrón
            this.time.delayedCall(delay + 200, () => {
                vaccineSystem.isPlayingSequence = false;
                vaccineSystem.isPlayerTurn = true;
            });
        };

        // Callback cuando hay error en el patrón
        vaccineSystem.onIncorrectPattern = () => {
            console.log('Patrón incorrecto, reiniciando...');
            
            // Limpiar círculos
            vaccineCircles.forEach(circle => {
                circle.setFillStyle(0x333333);
            });
            vaccineSystem.playerSequence = [];
            
            // Reiniciar la secuencia después de 1 segundo
            this.time.delayedCall(1000, () => {
                playSequence();
            });
        };

        // Callback cuando se completa una secuencia correctamente
        vaccineSystem.onSequenceComplete = (progress) => {
            this.sound.play('CadenaCompletada', { volume: 0.8 });
            // Si no está completo, generar nuevo patrón después de una pausa
            if (progress < 100) {
                this.time.delayedCall(800, () => {
                    // Limpiar círculos para nuevo patrón
                    vaccineCircles.forEach(circle => {
                        circle.setFillStyle(0x333333);
                    });
                    
                    vaccineSystem.generateNewSequence();
                    playSequence();
                });
            }
        };

        // Evento click en BarraPc
        barraPC.on('pointerdown', () => {
            if (!monitor.visible) {
                monitor.setVisible(true);
                this.sound.play('Monitor', { volume: 0.15 });
                // Mostrar tabs y welcome inicialmente
                tabs.forEach(tab => {
                    tab.graphics.setVisible(true);
                    tab.text.setVisible(true);
                });
                welcomeText.setVisible(true);
                // Animación de abajo hacia arriba
                this.tweens.add({
                    targets: monitor,
                    y: height - 5,
                    duration: 500,
                    ease: 'Power2.easeOut'
                });
            } else {
                // Detener sonido del monitor al cerrarlo
                this.sound.stopByKey('Monitor');
                // Animación de arriba hacia abajo
                this.tweens.add({
                    targets: monitor,
                    y: height + 200,
                    duration: 500,
                    ease: 'Power2.easeIn',
                    onComplete: () => {
                        monitor.setVisible(false);
                        // Ocultar tabs, welcome y contenido
                        tabs.forEach(tab => {
                            tab.graphics.setVisible(false);
                            tab.text.setVisible(false);
                        });
                        welcomeText.setVisible(false);
                        nucleotideChain.setVisible(false);
                        btnElectroshock.setVisible(false);
                        btnVentilador.setVisible(false);
                        electroshockDurability.setVisible(false);
                        ventiladorDurability.setVisible(false);
                        serviceButtons.forEach(item => {
                            item.button.setVisible(false);
                            item.label.setVisible(false);
                        });
                        nucleotideBases.forEach(base => {
                            base.image.setVisible(false);
                            base.text.setVisible(false);
                        });
                        vaccineCircles.forEach(circle => {
                            circle.setVisible(false);
                        });
                    }
                });
            }
        });

        // Fondo gris para el lado derecho (área de controles)
        const controlsBackground = this.add.rectangle(
            officeWidth + (width - officeWidth) / 2,
            height / 2,
            width - officeWidth,
            height,
            0x2a2a2a
        );
        controlsBackground.setOrigin(0.5);

        // ==================== MONITOR DE SIGNOS VITALES ====================
        const monitorX = officeWidth + (width - officeWidth) / 2;
        const monitorY = 100;
        const monitorWidth = (width - officeWidth) * 0.8;
        const monitorHeight = 150;

        // Crear widget del monitor cardiaco
        const heartMonitor = new HeartMonitorWidget(this, monitorX, monitorY, monitorWidth, monitorHeight);

        // Guardar las referencias de tiempo para actualizar el monitor
        const gameTimeData = {
            total: gameDuration,
            remaining: timeRemaining
        };

        // Texto de vitales (debajo del cuadro del monitor)
        const vitalsText = this.add.text(monitorX - monitorWidth / 2 + 15, monitorY + 95, 'SIGNOS VITALES', {
            font: 'bold 12px Arial',
            fill: '#00ff00'
        });
        vitalsText.setDepth(20);

        // Mostrar BPM (latidos por minuto)
        const bpmText = this.add.text(monitorX - monitorWidth / 2 + 15, monitorY + 115, 'BPM: 85', {
            font: '11px Arial',
            fill: '#00ff00'
        });
        bpmText.setDepth(20);

        // Mostrar temperatura
        const tempText = this.add.text(monitorX + monitorWidth / 2 - 80, monitorY + 115, 'TEMP: 36.5°C', {
            font: '11px Arial',
            fill: '#00ff00'
        });
        tempText.setDepth(20);

        // Mostrar oxígeno
        const oxygenText = this.add.text(monitorX + monitorWidth / 2 - 70, monitorY + 95, 'O2: 98%', {
            font: '11px Arial',
            fill: '#00ff00'
        });
        oxygenText.setDepth(20);

        // ==================== MEDIDOR DE ADN ====================
        const dnaX = 1328;
        const dnaY = 600;
        const dnaWidth = 700;
        const dnaHeight = 300;

        // Crear barra de progreso de ADN
        const dnaBar = new DNAProgressBar(this, dnaX, dnaY, dnaWidth, dnaHeight, 0);

        // ==================== MEDIDOR DE TEMPERATURA ====================
        const tempX = 1700;
        const tempY = dnaY;
        const tempGauge = new TemperatureGauge(this, tempX, tempY, dnaWidth, dnaHeight, 11.25);

        // Etiqueta de ADN abajo
        const dnaPercent = this.add.text(1180, height - 100, '0%', {
            font: 'bold 32px Arial',
            fill: '#00ff00'
        });
        dnaPercent.setDepth(20);

        // Etiqueta de Temperatura abajo
        const tempPercent = this.add.text(1550, height - 100, '20°C', {
            font: 'bold 32px Arial',
            fill: '#00cc00'
        });
        tempPercent.setDepth(20);

        // Filtro de pantalla para efecto de calor
        const heatFilter = this.add.rectangle(width / 2, height / 2, width, height, 0xff0000, 0);
        heatFilter.setDepth(1000);

        // Filtro de oscurecimiento intermitente para distraer al jugador
        const distractionOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0);
        distractionOverlay.setDepth(10000);
        distractionOverlay.setScrollFactor(0); // mantener fijo en pantalla
        distractionOverlay.setBlendMode(Phaser.BlendModes.NORMAL); // oscurecer de forma directa
        let isDistractionRunning = false;
        let distractionTween = null;

        // Callback cuando la temperatura llega a 100 grados (inicio de incendio)
        temperatureSystem.onFireStart = () => {
            if (!fireStarted) {
                fireStarted = true;
                updateOfficeBackground();
                this.sound.play('Fire', { loop: true, volume: 0.6 });
                // Sonido de inicio del incendio (fase 1)
                const fireStartSound = Math.random() < 0.5 ? 'ZLejos' : 'ZsegundoMov';
                this.sound.play(fireStartSound, { volume: 0.4 });
                console.log('¡INCENDIO! La oficina ha comenzado a arder');
            }
        };

        // Callback para actualizaciones de temperatura
        temperatureSystem.onTemperatureChange = (temp) => {
            // Actualizar gauge visual con la temperatura real
            tempGauge.setTemperature(temp);

            // Actualizar texto de temperatura
            tempPercent.setText(`${Math.round(temp)}°C`);

            // Cambiar color según temperatura
            let fillColor = '#00cc00'; // Verde por defecto
            let fillR = 0;
            let fillG = 204;
            let fillB = 0;

            if (temp >= 140) {
                // Rojo (peligro extremo)
                fillColor = '#ff0000';
                fillR = 255;
                fillG = 0;
                fillB = 0;
                heatFilter.setAlpha(Math.min(0.6, (temp - 140) / 25 * 0.6));
            } else if (temp >= 100) {
                // Naranja (incendio)
                fillColor = '#ff8800';
                fillR = 255;
                fillG = 136;
                fillB = 0;
                heatFilter.setAlpha(0.3);
            } else if (temp >= 70) {
                // Amarillo (advertencia)
                fillColor = '#ffff00';
                fillR = 255;
                fillG = 255;
                fillB = 0;
                heatFilter.setAlpha(0.15);
            }

            tempPercent.setFill(fillColor);

            // GAME OVER si temperatura alcanza 165°C
            if (temp >= 165 && gameActive) {
                gameActive = false;
                console.log('GAME OVER: La oficina se incendió completamente');
                stopGameAudio();
                this.sound.play('GameOver', { volume: 0.8 });
                this.scene.start('GameOverScene', { reason: 'OFICINA INCENDIADA', fireStarted: true });
            }
        };

        // Inicializar callback
        temperatureSystem.onTemperatureChange(temperatureSystem.getCurrentTemp());

        // Oscurecimiento aleatorio según estrés del monitor: morado = baja prob., rojo = mayor prob.
        const scene = this; // Capturar referencia de escena
        const runDistraction = (isStressDistraction = false) => {
            if (!gameActive) return;
            if (distractionTween) {
                distractionTween.stop();
            }
            
            // Reproducir sonido de respiración solo para distracciones de estrés
            if (isStressDistraction) {
                this.sound.play('RespiracionAgitada', { volume: 0.4 });
            }
            
            distractionOverlay.setPosition(width / 2, height / 2);
            distractionOverlay.setSize(width, height);
            distractionOverlay.setVisible(true);
            distractionOverlay.setDepth(10000);
            // Asegurar fillAlpha en 0 antes de animar
            distractionOverlay.setFillStyle(0x000000, 0);
            scene.children.bringToTop(distractionOverlay);

            distractionTween = scene.tweens.add({
                targets: distractionOverlay,
                fillAlpha: 1.0,
                duration: 800,
                ease: 'Linear',
                yoyo: true,
                hold: 150,
                onComplete: () => {
                    distractionOverlay.setFillStyle(0x000000, 0);
                    distractionOverlay.setVisible(false);
                    distractionTween = null;
                }
            });
        };

        this.time.addEvent({
            delay: 3000,
            loop: true,
            callback: () => {
                if (!gameActive) return;
                const stress = heartMonitor.stressState;
                let chance = 0;
                if (stress === 1) {
                    chance = 0.08; // morado: baja frecuencia
                } else if (stress === 2) {
                    chance = 0.20; // rojo: mayor frecuencia
                }

                if (chance > 0 && Math.random() < chance) {
                    console.log(`Distracción disparada (estrés: ${stress})`);
                    runDistraction(true);
                }
            }
        });

        // ==================== ZOMBIE: OPORTUNIDADES DE MOVIMIENTO ====================
        // Mecánica de dado: cada chequeo ambos lanzan 1-4; si coinciden, avanza fase
        const zombieCheckInterval = this.difficulty === 'HARD' ? 8000 : 6000;

        const advanceZombiePhase = () => {
            if (!gameActive) return;
            if (zombiePhase < 3) {
                zombiePhase += 1;
                updateOfficeBackground();
                console.log(`Zombie avanzó a fase ${zombiePhase}`);

                // Sonidos según la fase
                if (zombiePhase === 1) {
                    // Aleatoriamente entre ZLejos y ZsegundoMov
                    const zombieSound = Math.random() < 0.5 ? 'ZLejos' : 'ZsegundoMov';
                    this.sound.play(zombieSound, { volume: 0.4 });
                } else if (zombiePhase === 2) {
                    this.sound.play('ZPuerta', { volume: 0.4 });
                } else if (zombiePhase === 3) {
                    this.sound.play('ZFase3', { volume: 0.4 });
                    // Tiempo límite de 8s para usar electroshock
                    clearZombieTimer();
                    zombiePhaseTimer = this.time.delayedCall(8000, () => {
                        if (gameActive && zombiePhase === 3) {
                            gameActive = false;
                            console.log('GAME OVER: Zombie entró y no fue repelido');
                            stopGameAudio();
                            this.sound.play('GameOver', { volume: 0.8 });
                            this.scene.start('GameOverScene', { reason: 'ATAQUE ZOMBIE', fireStarted });
                        }
                    });
                }

                // Si hay fuego activo, reproducir también sonidos de incendio con la misma lógica
                if (fireStarted) {
                    if (zombiePhase === 1) {
                        const fireSound = Math.random() < 0.5 ? 'ZLejos' : 'ZsegundoMov';
                        this.sound.play(fireSound, { volume: 0.4 });
                    } else if (zombiePhase === 2) {
                        this.sound.play('ZPuerta', { volume: 0.4 });
                    } else if (zombiePhase === 3) {
                        this.sound.play('ZFase3', { volume: 0.4 });
                    }
                }
            } else {
                // Ya estaba en fase 3 y ocurre otra oportunidad -> Game Over inmediato
                gameActive = false;
                console.log('GAME OVER: Ataque zombie');
                stopGameAudio();
                this.sound.play('GameOver', { volume: 0.8 });
                this.scene.start('GameOverScene', { reason: 'ATAQUE ZOMBIE', fireStarted });
            }
        };

        this.time.addEvent({
            delay: zombieCheckInterval,
            loop: true,
            callback: () => {
                if (!gameActive) return;
                const machineRoll = Phaser.Math.Between(1, 4);
                const zombieRoll = Phaser.Math.Between(1, 4);
                if (machineRoll === zombieRoll) {
                    console.log(`Chequeo zombie: máquina ${machineRoll} vs zombie ${zombieRoll} → avanza`);
                    advanceZombiePhase();
                } else {
                    console.log(`Chequeo zombie: máquina ${machineRoll} vs zombie ${zombieRoll} → se queda`);
                }
            }
        });

        // Guardar referencias para usar en update()
        this.energySystem = energySystem;
        this.warningImage = warningImage;
        this.gameActive = () => gameActive;
    }

    update(time, delta) {
        // delta es el tiempo en ms desde el último frame
        // Convertir a segundos
        const deltaSeconds = delta / 1000;
        
        // Actualizar consumo de energía
        if (this.energySystem) {
            this.energySystem.update(deltaSeconds);
        }
    }
}
