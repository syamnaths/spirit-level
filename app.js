// ========================================
// SPIRIT LEVEL PWA - Main Application
// ========================================

class SpiritLevel {
    constructor() {
        // State Management
        this.currentMode = 'horizontal'; // horizontal, vertical, angle
        this.isHolding = false;
        this.feedbackEnabled = true;
        this.calibrationOffset = { x: 0, y: 0, z: 0 };
        this.isLevelPrevious = false;

        // Sensor Data
        this.rawAngles = { x: 0, y: 0, z: 0 };
        this.filteredAngles = { x: 0, y: 0, z: 0 };

        // Low-pass filter parameters
        this.filterAlpha = 0.2; // Higher = less filtering, more responsive

        // Tolerance for level detection (in degrees)
        this.levelTolerance = 0.2;

        // Animation frame ID
        this.animationFrameId = null;

        // Permission granted flag
        this.permissionGranted = false;

        // Screen orientation tracking
        this.screenOrientation = 'portrait'; // portrait or landscape

        // Initialize
        this.init();
    }

    // ========================================
    // INITIALIZATION
    // ========================================
    init() {
        this.cacheDOM();
        this.checkBrowserSupport();
        this.setupEventListeners();
        this.initializeProtractor();
        this.detectOrientation();

        // Register Service Worker
        this.registerServiceWorker();
    }

    cacheDOM() {
        // Overlays
        this.permissionOverlay = document.getElementById('permissionOverlay');
        this.unsupportedOverlay = document.getElementById('unsupportedOverlay');
        this.requestPermissionBtn = document.getElementById('requestPermissionBtn');

        // Mode buttons
        this.modeButtons = {
            horizontal: document.getElementById('modeHorizontal'),
            vertical: document.getElementById('modeVertical'),
            angle: document.getElementById('modeAngle')
        };

        // Display elements
        this.angleValue = document.getElementById('angleValue');
        this.levelStatus = document.getElementById('levelStatus');
        this.bubble = document.getElementById('bubble');
        this.vialContainer = document.getElementById('vialContainer');
        this.angleFinderContainer = document.getElementById('angleFinderContainer');
        this.angleLine = document.getElementById('angleLine');

        // Control buttons
        this.calibrateBtn = document.getElementById('calibrateBtn');
        this.holdBtn = document.getElementById('holdBtn');
        this.holdBtnText = document.getElementById('holdBtnText');
        this.feedbackToggle = document.getElementById('feedbackToggle');
        this.feedbackBtnText = document.getElementById('feedbackBtnText');
    }

    // ========================================
    // BROWSER SUPPORT CHECK
    // ========================================
    checkBrowserSupport() {
        if (!window.DeviceOrientationEvent) {
            this.showUnsupportedMessage();
            return false;
        }
        return true;
    }

    showUnsupportedMessage() {
        this.permissionOverlay.classList.add('hidden');
        this.unsupportedOverlay.classList.remove('hidden');
    }

    // ========================================
    // EVENT LISTENERS
    // ========================================
    setupEventListeners() {
        // Permission request
        this.requestPermissionBtn.addEventListener('click', () => this.requestPermission());

        // Mode switching
        Object.keys(this.modeButtons).forEach(mode => {
            this.modeButtons[mode].addEventListener('click', () => this.switchMode(mode));
        });

        // Control buttons
        this.calibrateBtn.addEventListener('click', () => this.calibrate());
        this.holdBtn.addEventListener('click', () => this.toggleHold());
        this.feedbackToggle.addEventListener('click', () => this.toggleFeedback());

        // Page visibility (battery optimization)
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());

        // Orientation change detection
        window.addEventListener('orientationchange', () => this.detectOrientation());
        window.addEventListener('resize', () => this.detectOrientation());
    }

    // ========================================
    // PERMISSION HANDLING
    // ========================================
    async requestPermission() {
        try {
            // iOS 13+ requires permission request
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                const permission = await DeviceOrientationEvent.requestPermission();
                if (permission === 'granted') {
                    this.startSensorListening();
                } else {
                    alert('Permission denied. The app needs motion sensor access to function.');
                }
            } else {
                // Android and older iOS
                this.startSensorListening();
            }
        } catch (error) {
            console.error('Permission error:', error);
            alert('Error requesting sensor permission: ' + error.message);
        }
    }

    startSensorListening() {
        this.permissionGranted = true;
        this.permissionOverlay.classList.add('hidden');

        // Start listening to device orientation
        window.addEventListener('deviceorientation', (event) => this.handleOrientation(event));

        // Start animation loop
        this.startAnimationLoop();
    }

    // ========================================
    // ORIENTATION DETECTION
    // ========================================
    detectOrientation() {
        // Detect if device is in portrait or landscape
        const width = window.innerWidth;
        const height = window.innerHeight;

        if (width > height) {
            this.screenOrientation = 'landscape';
        } else {
            this.screenOrientation = 'portrait';
        }

        console.log('Screen orientation:', this.screenOrientation);
    }

    // ========================================
    // SENSOR DATA HANDLING
    // ========================================
    handleOrientation(event) {
        if (this.isHolding) return;

        // Get raw angles from device
        // beta: front-to-back tilt (-180 to 180)
        // gamma: left-to-right tilt (-90 to 90)
        // alpha: compass direction (0 to 360)

        let beta = event.beta || 0;
        let gamma = event.gamma || 0;
        let alpha = event.alpha || 0;

        // Adjust sensor readings based on screen orientation
        if (this.screenOrientation === 'landscape') {
            // In landscape mode, swap and adjust axes
            this.rawAngles = {
                x: -gamma,    // Gamma becomes the front-back tilt
                y: beta,      // Beta becomes the left-right tilt
                z: alpha      // Alpha stays the same
            };
        } else {
            // Portrait mode - normal mapping
            this.rawAngles = {
                x: beta,      // Front-back tilt
                y: gamma,     // Left-right tilt
                z: alpha      // Compass direction
            };
        }

        // Apply low-pass filter
        this.applyLowPassFilter();
    }

    // ========================================
    // LOW-PASS FILTER (Noise Reduction)
    // ========================================
    applyLowPassFilter() {
        // Low-pass filter formula: filtered = alpha * raw + (1 - alpha) * filtered_prev
        this.filteredAngles.x = this.filterAlpha * this.rawAngles.x +
                                (1 - this.filterAlpha) * this.filteredAngles.x;
        this.filteredAngles.y = this.filterAlpha * this.rawAngles.y +
                                (1 - this.filterAlpha) * this.filteredAngles.y;
        this.filteredAngles.z = this.filterAlpha * this.rawAngles.z +
                                (1 - this.filterAlpha) * this.filteredAngles.z;
    }

    // ========================================
    // ANIMATION LOOP (requestAnimationFrame)
    // ========================================
    startAnimationLoop() {
        const animate = () => {
            if (this.permissionGranted && !document.hidden) {
                this.updateDisplay();
            }
            this.animationFrameId = requestAnimationFrame(animate);
        };
        animate();
    }

    stopAnimationLoop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    // ========================================
    // DISPLAY UPDATE
    // ========================================
    updateDisplay() {
        let angle = 0;
        let bubbleOffset = 0;

        // Calculate angle based on current mode
        switch (this.currentMode) {
            case 'horizontal':
                // Use gamma (left-right tilt) for horizontal level
                angle = this.filteredAngles.y - this.calibrationOffset.y;
                bubbleOffset = this.calculateBubblePosition(angle);
                this.updateVial(bubbleOffset, angle);
                break;

            case 'vertical':
                // Use beta (front-back tilt) for vertical level
                // Adjust for vertical orientation (90 degrees is plumb)
                let verticalAngle = this.filteredAngles.x - this.calibrationOffset.x;
                angle = 90 - Math.abs(verticalAngle);
                bubbleOffset = this.calculateBubblePosition(verticalAngle - 90);
                this.updateVial(bubbleOffset, angle);
                break;

            case 'angle':
                // Use gamma for angle finder
                angle = this.filteredAngles.y - this.calibrationOffset.y;
                this.updateAngleFinder(angle);
                break;
        }

        // Update numerical display
        this.updateAngleDisplay(angle);

        // Check if level and provide feedback
        this.checkLevelStatus(angle);
    }

    calculateBubblePosition(angle) {
        // Map angle to bubble position
        // Clamp angle to reasonable range (-45 to 45 degrees)
        const clampedAngle = Math.max(-45, Math.min(45, angle));

        // Convert to percentage position
        // -45° = 0%, 0° = 50%, 45° = 100%
        const percentage = ((clampedAngle + 45) / 90) * 100;

        return percentage;
    }

    updateVial(bubbleOffset, angle) {
        // Update bubble position
        this.bubble.style.left = `${bubbleOffset}%`;

        // Add visual feedback for level state
        if (Math.abs(angle) <= this.levelTolerance) {
            this.bubble.classList.add('level');
        } else {
            this.bubble.classList.remove('level');
        }
    }

    updateAngleFinder(angle) {
        // Update protractor angle line
        const angleInRadians = (angle + 90) * (Math.PI / 180);
        const lineLength = 100;
        const centerX = 150;
        const centerY = 150;

        const x2 = centerX + lineLength * Math.cos(angleInRadians);
        const y2 = centerY - lineLength * Math.sin(angleInRadians);

        this.angleLine.setAttribute('x2', x2);
        this.angleLine.setAttribute('y2', y2);
    }

    updateAngleDisplay(angle) {
        // Format angle to 1 decimal place
        const formattedAngle = Math.abs(angle).toFixed(1);
        this.angleValue.textContent = `${formattedAngle}°`;

        // Update color based on level status
        if (Math.abs(angle) <= this.levelTolerance) {
            this.angleValue.classList.remove('off-level');
            this.levelStatus.classList.remove('off-level');
            this.levelStatus.textContent = 'LEVEL';
        } else {
            this.angleValue.classList.add('off-level');
            this.levelStatus.classList.add('off-level');
            this.levelStatus.textContent = `OFF BY ${formattedAngle}°`;
        }
    }

    // ========================================
    // LEVEL STATUS & FEEDBACK
    // ========================================
    checkLevelStatus(angle) {
        const isLevel = Math.abs(angle) <= this.levelTolerance;
        const is90Degrees = Math.abs(Math.abs(angle) - 90) <= this.levelTolerance;

        // Trigger feedback when becoming level
        if ((isLevel || is90Degrees) && !this.isLevelPrevious && this.feedbackEnabled) {
            this.provideFeedback();
        }

        this.isLevelPrevious = isLevel || is90Degrees;
    }

    provideFeedback() {
        // Haptic feedback (vibration)
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }

        // Audio feedback (optional - can add beep sound)
        this.playBeep();
    }

    playBeep() {
        // Create simple beep using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            console.log('Audio feedback not available:', error);
        }
    }

    // ========================================
    // MODE SWITCHING
    // ========================================
    switchMode(mode) {
        this.currentMode = mode;

        // Update button states
        Object.keys(this.modeButtons).forEach(m => {
            this.modeButtons[m].classList.toggle('active', m === mode);
        });

        // Show/hide appropriate display
        if (mode === 'angle') {
            this.vialContainer.classList.add('hidden');
            this.angleFinderContainer.classList.remove('hidden');
        } else {
            this.vialContainer.classList.remove('hidden');
            this.angleFinderContainer.classList.add('hidden');

            // Toggle vertical rotation
            if (mode === 'vertical') {
                this.vialContainer.classList.add('vertical');
            } else {
                this.vialContainer.classList.remove('vertical');
            }
        }
    }

    // ========================================
    // CALIBRATION
    // ========================================
    calibrate() {
        // Set current orientation as 0.0° baseline
        this.calibrationOffset = {
            x: this.filteredAngles.x,
            y: this.filteredAngles.y,
            z: this.filteredAngles.z
        };

        // Visual feedback
        this.calibrateBtn.textContent = 'Calibrated!';
        this.calibrateBtn.classList.add('active');

        setTimeout(() => {
            this.calibrateBtn.textContent = 'Calibrate';
            this.calibrateBtn.classList.remove('active');
        }, 1000);
    }

    // ========================================
    // HOLD/LOCK FEATURE
    // ========================================
    toggleHold() {
        this.isHolding = !this.isHolding;

        if (this.isHolding) {
            this.holdBtnText.textContent = 'Release';
            this.holdBtn.classList.add('active');
        } else {
            this.holdBtnText.textContent = 'Hold';
            this.holdBtn.classList.remove('active');
        }
    }

    // ========================================
    // FEEDBACK TOGGLE
    // ========================================
    toggleFeedback() {
        this.feedbackEnabled = !this.feedbackEnabled;
        this.feedbackBtnText.textContent = `Feedback: ${this.feedbackEnabled ? 'ON' : 'OFF'}`;

        if (this.feedbackEnabled) {
            this.feedbackToggle.classList.add('active');
        } else {
            this.feedbackToggle.classList.remove('active');
        }
    }

    // ========================================
    // PAGE VISIBILITY (Battery Optimization)
    // ========================================
    handleVisibilityChange() {
        if (document.hidden) {
            // Stop animation loop when app is in background
            this.stopAnimationLoop();
        } else {
            // Resume when app returns to foreground
            if (this.permissionGranted) {
                this.startAnimationLoop();
            }
        }
    }

    // ========================================
    // PROTRACTOR INITIALIZATION
    // ========================================
    initializeProtractor() {
        const degreeMarks = document.getElementById('degreeMarks');

        // Create degree marks from -90 to 90
        for (let deg = -90; deg <= 90; deg += 10) {
            const angle = (deg + 90) * (Math.PI / 180);
            const radius = 120;
            const centerX = 150;
            const centerY = 150;

            const x = centerX + radius * Math.cos(angle);
            const y = centerY - radius * Math.sin(angle);

            // Create tick mark
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            const tickLength = (deg % 30 === 0) ? 15 : 8;

            const x1 = centerX + (radius - tickLength) * Math.cos(angle);
            const y1 = centerY - (radius - tickLength) * Math.sin(angle);

            line.setAttribute('x1', x1);
            line.setAttribute('y1', y1);
            line.setAttribute('x2', x);
            line.setAttribute('y2', y);
            line.setAttribute('stroke-width', (deg % 30 === 0) ? '2' : '1');

            degreeMarks.appendChild(line);

            // Create text label for major marks
            if (deg % 30 === 0) {
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                const textRadius = radius - 25;
                const textX = centerX + textRadius * Math.cos(angle);
                const textY = centerY - textRadius * Math.sin(angle);

                text.setAttribute('x', textX);
                text.setAttribute('y', textY);
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('dominant-baseline', 'middle');
                text.textContent = deg;

                degreeMarks.appendChild(text);
            }
        }
    }

    // ========================================
    // SERVICE WORKER REGISTRATION
    // ========================================
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/service-worker.js');
                console.log('Service Worker registered:', registration);
            } catch (error) {
                console.log('Service Worker registration failed:', error);
            }
        }
    }
}

// ========================================
// INITIALIZE APP
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    const app = new SpiritLevel();
});
