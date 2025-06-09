// Add localStorage at the beginning of the file without modifying existing code
// This will run before the existing code

// localStorage helper functions
const storage = {
    saveSettings: function(settings) {
        localStorage.setItem('promodoro-settings', JSON.stringify(settings));
    },
    loadSettings: function() {
        const saved = localStorage.getItem('promodoro-settings');
        return saved ? JSON.parse(saved) : null;
    },
    saveTaskList: function(tasks) {
        localStorage.setItem('promodoro-tasks', JSON.stringify(tasks));
    },
    loadTaskList: function() {
        const saved = localStorage.getItem('promodoro-tasks');
        return saved ? JSON.parse(saved) : [];
    },
    saveStats: function(stats) {
        localStorage.setItem('promodoro-stats', JSON.stringify(stats));
    },
    loadStats: function() {
        const saved = localStorage.getItem('promodoro-stats');
        return saved ? JSON.parse(saved) : { totalPomodoros: 0, totalWorkTime: 0 };
    },
    saveTaskHistory: function(taskHistory) {
        localStorage.setItem('promodoro-task-history', JSON.stringify(taskHistory));
    },
    loadTaskHistory: function() {
        const saved = localStorage.getItem('promodoro-task-history');
        return saved ? JSON.parse(saved) : {};
    },
    saveSessionHistory: function(sessions) {
        localStorage.setItem('promodoro-session-history', JSON.stringify(sessions));
    },
    loadSessionHistory: function() {
        const saved = localStorage.getItem('promodoro-session-history');
        return saved ? JSON.parse(saved) : [];
    },
    saveCustomSound: function(soundData) {
        localStorage.setItem('promodoro-custom-sound', JSON.stringify(soundData));
    },
    loadCustomSound: function() {
        const saved = localStorage.getItem('promodoro-custom-sound');
        return saved ? JSON.parse(saved) : null;
    }
};

// Combined non-module version of the app

// Timer Model
class TimerModel {
    constructor() {
        // Timer configuration with default values
        this.modes = {
            promodoro: 25 * 60, // 25 minutes in seconds
            shortBreak: 5 * 60, // 5 minutes in seconds
            longBreak: 15 * 60 // 15 minutes in seconds
        };

        // Store default values for reset functionality
        this.defaultModes = {
            promodoro: 25 * 60,
            shortBreak: 5 * 60,
            longBreak: 15 * 60
        };

        // Current state
        this.currentMode = 'promodoro'; // default mode
        this.timeRemaining = this.modes.promodoro; // default time remaining
        this.isRunning = false; // timer is not running by default
        this.interval = null; // interval ID for the timer
        this.promodoroCount = 0; // count of completed pomodoros
        this.listeners = [];
        
        // Alarm settings
        this.alarmEnabled = true;
        this.alarmSound = 'https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3';
        
        // Auto start next session
        this.autoStartNextSession = true;
        
        // Current task tracking
        this.currentTaskId = null;
        this.taskHistory = storage.loadTaskHistory() || {};
        this.sessionHistory = storage.loadSessionHistory() || [];
        
        // Load saved settings if available
        this.loadSavedSettings();
    }

    // Load settings from localStorage if available
    loadSavedSettings() {
        const savedSettings = storage.loadSettings();
        if (savedSettings) {
            // Apply saved timer durations
            if (savedSettings.modes) {
                this.modes = savedSettings.modes;
                this.timeRemaining = this.modes[this.currentMode];
            }
            
            // Apply saved alarm settings
            if (typeof savedSettings.alarmEnabled !== 'undefined') {
                this.alarmEnabled = savedSettings.alarmEnabled;
            }
            
            if (savedSettings.alarmSound) {
                this.alarmSound = savedSettings.alarmSound;
            }
            
            // Apply saved auto-start setting
            if (typeof savedSettings.autoStartNextSession !== 'undefined') {
                this.autoStartNextSession = savedSettings.autoStartNextSession;
            }
            
            // Apply saved pomodoro count
            if (typeof savedSettings.promodoroCount !== 'undefined') {
                this.promodoroCount = savedSettings.promodoroCount;
            }
        }
        
        // Load custom sound if available
        const customSound = storage.loadCustomSound();
        if (customSound) {
            this.customSoundName = customSound.name;
            this.customSoundUrl = customSound.url;
        }
    }
    
    // Save current settings to localStorage
    saveSettings() {
        const settings = {
            modes: this.modes,
            alarmEnabled: this.alarmEnabled,
            alarmSound: this.alarmSound,
            autoStartNextSession: this.autoStartNextSession,
            promodoroCount: this.promodoroCount
        };
        
        storage.saveSettings(settings);
    }

    // Observer pattern - add listener for state changes
    addChangeListener(listener) {
        this.listeners.push(listener);
    }

    // Notify all listeners of state change
    notifyListeners() {
        this.listeners.forEach((listener) => listener(this));
    }

    setMode(mode) {
        if (this.modes.hasOwnProperty(mode)) {
            this.currentMode = mode;
            this.timeRemaining = this.modes[mode];
            this.isRunning = false;
            clearInterval(this.interval); // clear any existing interval
            this.interval = null; // reset interval ID
            this.notifyListeners(); // notify listeners of state change
        }
    }

    // Update timer duration for a specific mode
    updateModeDuration(mode, minutes) {
        if (this.modes.hasOwnProperty(mode)) {
            // Convert minutes to seconds
            const seconds = Math.max(1, parseInt(minutes, 10)) * 60;
            this.modes[mode] = seconds;
            
            // If we're updating the current mode, update the time remaining as well
            if (mode === this.currentMode && !this.isRunning) {
                this.timeRemaining = seconds;
            }
            
            // Save settings after update
            this.saveSettings();
            
            this.notifyListeners();
        }
    }

    // Reset mode durations to defaults
    resetToDefaults() {
        this.modes = {...this.defaultModes};
        this.setMode(this.currentMode); // Reset current mode with new duration
    }

    // Toggle alarm on/off
    toggleAlarm() {
        this.alarmEnabled = !this.alarmEnabled;
        
        // Save settings after toggle
        this.saveSettings();
        
        this.notifyListeners();
        return this.alarmEnabled;
    }
    
    // Toggle auto start next session
    toggleAutoStart() {
        this.autoStartNextSession = !this.autoStartNextSession;
        
        // Save settings after toggle
        this.saveSettings();
        
        this.notifyListeners();
        return this.autoStartNextSession;
    }

    // Change alarm sound
    setAlarmSound(soundUrl) {
        this.alarmSound = soundUrl;
        
        // Save settings after update
        this.saveSettings();
    }

    // Set custom sound with file info
    setCustomSound(soundUrl, fileName) {
        this.alarmSound = soundUrl;
        this.customSoundName = fileName;
        this.customSoundUrl = soundUrl;
        
        // Save custom sound info
        storage.saveCustomSound({
            name: fileName,
            url: soundUrl
        });
        
        // Save settings after update
        this.saveSettings();
    }
    
    // Get custom sound info
    getCustomSoundInfo() {
        return {
            name: this.customSoundName,
            url: this.customSoundUrl
        };
    }

    start() {
        // Don't start if already running
        if (this.isRunning) return;

        this.isRunning = true; // set timer to running state
        const startTime = Date.now(); // get current time in milliseconds
        const initialRemaining = this.timeRemaining; // store initial time remaining

        this.interval = setInterval(() => {
            const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000); // calculate elapsed time in seconds
            this.timeRemaining = Math.max(0, initialRemaining - elapsedSeconds); // update time remaining, ensuring it doesn't go below 0

            // Timer completed
            if (this.timeRemaining === 0) {
                this.stop(); // stop the timer
                this.handleTimerComplete();
            }

            this.notifyListeners();
        }, 1000); // update every second

        this.notifyListeners(); // notify listeners of state change
    }

    stop() {
        if (!this.isRunning) return; // do nothing if timer is not running

        this.isRunning = false; // set timer to not running state
        clearInterval(this.interval); // clear the interval
        this.interval = null; // reset interval ID
        this.notifyListeners(); // notify listeners of state change
    }

    reset() {
        this.stop(); // stop the timer
        this.timeRemaining = this.modes[this.currentMode]; // reset time remaining to current mode
        this.notifyListeners(); // notify listeners of state change
    }

    handleTimerComplete() {
        // Play notification sound if enabled
        if (this.alarmEnabled) {
            this.playAlarmSound();
        }

        // Record session for current task if this was a promodoro
        if (this.currentMode === 'promodoro') {
            this.recordTaskSession();
            this.promodoroCount++;
            
            // Save stats after completing a pomodoro
            this.saveSettings();
            
            // check if it's time for a long break
            if(this.promodoroCount % 4 === 0){
                this.setMode('longBreak'); // switch to long break mode
            }
            else{
                this.setMode('shortBreak'); // switch to short break mode
            }
        } else {
            this.setMode('promodoro'); // switch back to pomodoro mode
        }
        
        // Auto-start the next session if enabled
        if (this.autoStartNextSession) {
            setTimeout(() => this.start(), 500); // Small delay to ensure UI updates first
        }
    }

    getTimeForDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60); // calculate minutes
        const seconds = this.timeRemaining % 60; // calculate seconds
        return {
            minutes: String(minutes).padStart(2, '0'),
            seconds: String(seconds).padStart(2, '0')
        }; // format time as MM:SS
    }

    getProgressPercentage() {
        const totalTime = this.modes[this.currentMode]; // get total time for current mode
        return ((totalTime - this.timeRemaining) / totalTime) * 100; // calculate progress percentage
    }

    // Set the current active task
    setCurrentTask(taskId) {
        this.currentTaskId = taskId;
        this.notifyListeners();
    }

    // Record a completed session for the current task
    recordTaskSession() {
        const now = new Date();
        const session = {
            timestamp: now.getTime(),
            date: now.toLocaleDateString(),
            time: now.toLocaleTimeString(),
            duration: this.modes[this.currentMode] / 60, // in minutes
            mode: this.currentMode,
            taskId: this.currentTaskId
        };
        
        // Always record to global session history
        this.sessionHistory.push(session);
        storage.saveSessionHistory(this.sessionHistory);
        
        // If there's a current task, record to task-specific history too
        if (this.currentTaskId) {
            // Initialize history array for this task if it doesn't exist
            if (!this.taskHistory[this.currentTaskId]) {
                this.taskHistory[this.currentTaskId] = [];
            }
            
            // Add the session to task history
            this.taskHistory[this.currentTaskId].push(session);
            
            // Save to storage
            storage.saveTaskHistory(this.taskHistory);
        }
        
        // Notify listeners that task session was recorded (this will update the UI)
        this.notifyListeners();
        
        return session;
    }

    // Get history for a specific task
    getTaskHistory(taskId) {
        return this.taskHistory[taskId] || [];
    }

    // Get session count for a specific task
    getTaskSessionCount(taskId) {
        return this.taskHistory[taskId] ? this.taskHistory[taskId].length : 0;
    }
    
    // Improved sound playing with fallback for local files
    playAlarmSound() {
        try {
            let audioUrl = this.alarmSound;
            
            // If it's a custom sound with base64 data, use it directly
            if (this.customSoundUrl) {
                audioUrl = this.customSoundUrl;
            }
            
            const audio = new Audio(audioUrl);
            
            // For local file usage, add error handling with fallback
            audio.addEventListener('error', (e) => {
                console.log('Audio error:', e);
                // Fallback to browser's default notification sound
                this.playFallbackSound();
            });
            
            audio.play().catch(e => {
                console.log('Could not play audio, trying fallback:', e);
                this.playFallbackSound();
            });
            
        } catch (error) {
            console.log('Audio creation failed, using fallback:', error);
            this.playFallbackSound();
        }
    }
    
    // Fallback sound using Web Audio API or system notification
    playFallbackSound() {
        try {
            // Try to create a simple beep using Web Audio API
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800; // Frequency in Hz
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 1);
            
            // Also show notification if available
            this.showNotification();
        } catch (error) {
            console.log('Web Audio API not available:', error);
            // Last resort: vibration and notification
            if (navigator.vibrate) {
                navigator.vibrate([200, 100, 200, 100, 200]);
            }
            this.showNotification();
        }
    }
    
    // Show browser notification
    showNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Timer Complete! 🍅', {
                body: `${this.currentMode} session complete!`,
                icon: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="%23d95550"/></svg>',
                tag: 'promodoro-timer'
            });
        }
    }
    
    // Export all app data
    exportData() {
        const data = {
            settings: {
                modes: this.modes,
                alarmEnabled: this.alarmEnabled,
                alarmSound: this.alarmSound,
                autoStartNextSession: this.autoStartNextSession,
                promodoroCount: this.promodoroCount
            },
            tasks: storage.loadTaskList(),
            taskHistory: this.taskHistory,
            sessionHistory: this.sessionHistory,
            customSound: storage.loadCustomSound(),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        return data;
    }
    
    // Import app data
    importData(data) {
        try {
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid data format');
            }
            
            // Handle compact versions from QR codes
            if (data.version === '1.0-compact' || data.version === '1.0-settings-only') {
                console.log('Importing compact data from QR code');
            }
            
            // Import settings
            if (data.settings) {
                if (data.settings.modes) {
                    this.modes = data.settings.modes;
                }
                if (typeof data.settings.alarmEnabled !== 'undefined') {
                    this.alarmEnabled = data.settings.alarmEnabled;
                }
                if (data.settings.alarmSound) {
                    this.alarmSound = data.settings.alarmSound;
                }
                if (typeof data.settings.autoStartNextSession !== 'undefined') {
                    this.autoStartNextSession = data.settings.autoStartNextSession;
                }
                if (typeof data.settings.promodoroCount !== 'undefined') {
                    this.promodoroCount = data.settings.promodoroCount;
                }
            }
            
            // Import tasks
            if (data.tasks && Array.isArray(data.tasks)) {
                storage.saveTaskList(data.tasks);
            }
            
            // Import task history
            if (data.taskHistory) {
                this.taskHistory = data.taskHistory;
                storage.saveTaskHistory(this.taskHistory);
            }
            
            // Import session history
            if (data.sessionHistory) {
                this.sessionHistory = data.sessionHistory;
                storage.saveSessionHistory(this.sessionHistory);
            }
            
            // Import custom sound
            if (data.customSound) {
                storage.saveCustomSound(data.customSound);
                this.customSoundName = data.customSound.name;
                this.customSoundUrl = data.customSound.url;
            }
            
            // Save all settings
            this.saveSettings();
            
            // Reset current mode time
            this.timeRemaining = this.modes[this.currentMode];
            
            // Notify listeners
            this.notifyListeners();
            
            return true;
        } catch (error) {
            console.error('Import failed:', error);
            return false;
        }
    }
}

// Timer View
class TimerView {
    constructor() {
        // DOM elements
        this.progressEl = document.getElementById('progress');
        this.minutesEl = document.getElementById('minutes');
        this.secondsEl = document.getElementById('seconds');
        this.timerControlEl = document.getElementById('timer-control');
        this.modeButtonsContainer = document.querySelector('.mode-buttons');
        this.promodoroCountEl = document.getElementById('promodoro-count');
        this.settingsEl = document.getElementById('settings-btn');
        this.alarmToggleEl = document.getElementById('alarm-toggle');

        // Map of mode to background colors
        this.modeColors = {
            promodoro: '#d95550',
            shortBreak: '#4c9195',
            longBreak: '#457ca3'
        };

        // Set references that will be set by controller
        this.model = null;
        this.controller = null;
        
        // Create settings panel if it doesn't exist
        this.createSettingsPanel();
        
        // Create digital clock
        this.createDigitalClock();
        
        // Start the clock
        this.startClock();
        
        // Add modal close handlers
        this.bindModalHandlers();
    }
    
    createDigitalClock() {
        if (!document.getElementById('digital-clock')) {
            // Create clock container
            const clockContainer = document.createElement('div');
            clockContainer.id = 'digital-clock';
            clockContainer.className = 'digital-clock';
            
            // Add clock elements
            clockContainer.innerHTML = `
                <div class="clock-time">00:00:00</div>
                <div class="clock-date">Mon, Jan 1</div>
            `;
            
            // Insert at the beginning of container
            const container = document.querySelector('.container');
            if (container) {
                container.insertBefore(clockContainer, container.firstChild);
            } else {
                document.body.appendChild(clockContainer);
            }
            
            // Add CSS for clock
            if (!document.getElementById('clock-styles')) {
                const styleEl = document.createElement('style');
                styleEl.id = 'clock-styles';
                styleEl.textContent = `
                    .digital-clock {
                        position: fixed;
                        top: 20px;
                        left: 20px;
                        background: rgba(255, 255, 255, 0.2);
                        color: white;
                        padding: 10px 16px;
                        border-radius: 10px;
                        text-align: center;
                        font-family: monospace;
                        z-index: 100;
                    }
                    .clock-time {
                        font-size: 18px;
                        font-weight: bold;
                    }
                    .clock-date {
                        font-size: 14px;
                        margin-top: 4px;
                    }
                `;
                document.head.appendChild(styleEl);
            }
        }
    }
    
    startClock() {
        const updateClock = () => {
            const now = new Date();
            const timeElement = document.querySelector('.clock-time');
            const dateElement = document.querySelector('.clock-date');
            
            if (timeElement && dateElement) {
                // Format time as HH:MM:SS
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                const seconds = String(now.getSeconds()).padStart(2, '0');
                timeElement.textContent = `${hours}:${minutes}:${seconds}`;
                
                // Format date as Day, Month Date
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const day = days[now.getDay()];
                const month = months[now.getMonth()];
                const date = now.getDate();
                dateElement.textContent = `${day}, ${month} ${date}`;
            }
        };
        
        // Update immediately then set interval
        updateClock();
        setInterval(updateClock, 1000);
    }

    createSettingsPanel() {
        // Create settings panel if it doesn't exist yet
        if (!document.getElementById('settings-panel')) {
            const settingsPanel = document.createElement('div');
            settingsPanel.id = 'settings-panel';
            settingsPanel.className = 'settings-panel';
            settingsPanel.style.display = 'none';
            
            settingsPanel.innerHTML = `
                <div class="settings-header">
                    <h3>Settings</h3>
                    <button id="close-settings">×</button>
                </div>
                <div class="settings-content">
                    <div class="settings-section">
                        <h4>Time (minutes)</h4>
                        <div class="time-settings">
                            <div class="time-setting">
                                <label for="promodoro-time">Promodoro</label>
                                <input type="number" id="promodoro-time" min="1" max="60" value="25">
                            </div>
                            <div class="time-setting">
                                <label for="short-break-time">Short Break</label>
                                <input type="number" id="short-break-time" min="1" max="30" value="5">
                            </div>
                            <div class="time-setting">
                                <label for="long-break-time">Long Break</label>
                                <input type="number" id="long-break-time" min="1" max="60" value="15">
                            </div>
                        </div>
                        <button id="reset-defaults">Reset to Defaults</button>
                    </div>
                    <div class="settings-section">
                        <h4>Sound</h4>
                        <div class="sound-settings">
                            <div class="sound-setting">
                                <label for="alarm-toggle">Alarm</label>
                                <input type="checkbox" id="alarm-toggle" checked>
                            </div>
                            <div class="sound-setting">
                                <label for="alarm-sound">Notification Sound:</label>
                                <select id="alarm-sound">
                                    <option value="https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3">Default Beep</option>
                                    <option value="https://assets.mixkit.co/sfx/preview/mixkit-bell-notification-933.mp3">Bell</option>
                                    <option value="https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3">Chime</option>
                                    <option value="https://assets.mixkit.co/sfx/preview/mixkit-pristine-ding-282.mp3">Ding</option>
                                    <option value="https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3">Soft Tone</option>
                                    <option value="custom">Custom Sound</option>
                                </select>
                                <input type="file" id="custom-sound-upload" accept="audio/*" style="display: none; margin-top: 5px;">
                                <div id="current-custom-sound" style="display: none; margin-top: 5px; font-size: 12px; color: #666;"></div>
                                <button type="button" id="test-sound-btn">Test Sound</button>
                            </div>
                        </div>
                    </div>
                    <div class="settings-section">
                        <h4>Behavior</h4>
                        <div class="behavior-settings">
                            <div class="behavior-setting">
                                <label for="auto-start-toggle">Auto-start next session</label>
                                <input type="checkbox" id="auto-start-toggle" checked>
                            </div>
                        </div>
                    </div>
                    <div class="settings-section">
                        <h4>📱 Data Sync</h4>
                        <div class="sync-settings">
                            <div class="sync-setting">
                                <label>Transfer your data between devices:</label>
                                <div class="sync-buttons">
                                    <button type="button" id="export-data-btn" class="sync-btn export-btn">📤 Export Data</button>
                                    <button type="button" id="import-data-btn" class="sync-btn import-btn">📥 Import Data</button>
                                    <button type="button" id="generate-qr-btn" class="sync-btn qr-btn">📱 Share via QR</button>
                                </div>
                                <input type="file" id="import-file" accept=".json" style="display: none;">
                                <div id="qr-container" class="qr-container" style="display: none;">
                                    <div id="qr-code"></div>
                                    <p>Scan with your mobile device to transfer data</p>
                                    <button type="button" onclick="document.getElementById('qr-container').style.display='none'">Close QR</button>
                                </div>
                                <div id="sync-status" class="sync-status"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="settings-footer">
                    <button id="save-settings">Save Settings</button>
                </div>
            `;
            
            document.querySelector('.container').appendChild(settingsPanel);
            
            // Add settings button if it doesn't exist
            if (!this.settingsEl) {
                const settingsBtn = document.createElement('button');
                settingsBtn.id = 'settings-btn';
                settingsBtn.innerHTML = '⚙️';
                settingsBtn.className = 'settings-button';
                document.querySelector('.container').appendChild(settingsBtn);
                this.settingsEl = settingsBtn;
            }

            // Add CSS for settings
            if (!document.getElementById('settings-styles')) {
                const styleEl = document.createElement('style');
                styleEl.id = 'settings-styles';
                styleEl.textContent = `
                    .settings-button {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: rgba(255, 255, 255, 0.2);
                        border: none;
                        color: white;
                        font-size: 20px;
                        border-radius: 50%;
                        width: 40px;
                        height: 40px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 0;
                        line-height: 1;
                        z-index: 100;
                    }
                    .settings-button:hover {
                        background: rgba(255, 255, 255, 0.3);
                    }
                    .settings-panel {
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background: white;
                        color: #333;
                        padding: 20px;
                        border-radius: 10px;
                        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
                        z-index: 1000;
                        max-width: 500px;
                        width: 90%;
                    }
                    .settings-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 20px;
                        padding-bottom: 10px;
                        border-bottom: 1px solid #eee;
                    }
                    .settings-header h3 {
                        margin: 0;
                        color: #333;
                    }
                    #close-settings {
                        background: none;
                        border: none;
                        font-size: 24px;
                        cursor: pointer;
                        color: #666;
                    }
                    .settings-section {
                        margin-bottom: 20px;
                    }
                    .settings-section h4 {
                        margin: 0 0 10px;
                        color: #555;
                    }
                    .time-settings, .sound-settings, .behavior-settings {
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                        margin-bottom: 15px;
                    }
                    .time-setting, .sound-setting, .behavior-setting {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        flex-wrap: wrap;
                    }
                    .time-setting input[type="number"] {
                        width: 60px;
                        padding: 5px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                    }
                    .sound-setting select, .sound-setting input[type="file"] {
                        flex: 1;
                        margin-left: 10px;
                        min-width: 0;
                    }
                    .sound-setting button {
                        margin-left: 10px;
                        flex-shrink: 0;
                    }
                    .settings-footer {
                        margin-top: 20px;
                        text-align: right;
                    }
                    #save-settings, #reset-defaults, #test-sound-btn {
                        padding: 8px 16px;
                        background: #4c9195;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    }
                    #reset-defaults, #test-sound-btn {
                        background: #777;
                        padding: 5px 10px;
                        font-size: 12px;
                    }
                    #save-settings:hover {
                        background: #457ca3;
                    }
                    #alarm-sound {
                        padding: 5px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                    }
                    #current-custom-sound {
                        font-size: 12px;
                        color: #666;
                        margin-top: 5px;
                        padding: 4px 8px;
                        background: #f5f5f5;
                        border-radius: 3px;
                        border: 1px solid #ddd;
                        word-wrap: break-word;
                        overflow-wrap: break-word;
                        max-width: 100%;
                        box-sizing: border-box;
                    }
                    .container {
                        position: relative;
                        padding-top: 60px;
                    }
                    .sync-settings {
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                    }
                    .sync-setting {
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                    }
                    .sync-buttons {
                        display: flex;
                        gap: 10px;
                        flex-wrap: wrap;
                    }
                    .sync-btn {
                        padding: 8px 16px;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 500;
                        transition: all 0.2s ease;
                        flex: 1;
                        min-width: 120px;
                    }
                    .export-btn {
                        background: #4CAF50;
                        color: white;
                    }
                    .export-btn:hover {
                        background: #45a049;
                    }
                    .import-btn {
                        background: #2196F3;
                        color: white;
                    }
                    .import-btn:hover {
                        background: #1976D2;
                    }
                    .qr-btn {
                        background: #FF9800;
                        color: white;
                    }
                    .qr-btn:hover {
                        background: #F57C00;
                    }
                    .qr-container {
                        text-align: center;
                        padding: 20px;
                        background: #f9f9f9;
                        border-radius: 8px;
                        margin-top: 15px;
                        max-height: 400px;
                        overflow-y: auto;
                    }
                    .qr-container p {
                        margin: 10px 0 0 0;
                        font-size: 12px;
                        color: #666;
                    }
                    .qr-container button {
                        margin-top: 10px;
                        padding: 5px 10px;
                        background: #FF9800;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                    }
                    .sync-status {
                        font-size: 12px;
                        padding: 8px;
                        border-radius: 4px;
                        margin-top: 5px;
                        text-align: center;
                        display: none;
                    }
                    .sync-status.success {
                        background: #d4edda;
                        color: #155724;
                        border: 1px solid #c3e6cb;
                        display: block;
                    }
                    .sync-status.error {
                        background: #f8d7da;
                        color: #721c24;
                        border: 1px solid #f5c6cb;
                        display: block;
                    }
                    .sync-status.info {
                        background: #d1ecf1;
                        color: #0c5460;
                        border: 1px solid #bee5eb;
                        display: block;
                    }
                `;
                document.head.appendChild(styleEl);
            }
        }
    }

    // Method to set the controller reference
    setController(controller) {
        this.controller = controller;
    }
    
    // Method to set the model reference
    setModel(model) {
        this.model = model;
    }

    // Method to bind modal close handlers
    bindModalHandlers() {
        // Add close functionality
        const closeBtn = document.getElementById('close-settings');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                const settingsPanel = document.getElementById('settings-panel');
                if (settingsPanel) {
                    settingsPanel.style.display = 'none';
                }
            });
        }
        
        // Close when clicking outside
        const modal = document.getElementById('history-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                    setTimeout(() => modal.remove(), 300);
                }
            });
        }
    }

    updateDisplay(model) {
        // Update timer display
        const { minutes, seconds } = model.getTimeForDisplay();
        this.minutesEl.textContent = minutes.toString().padStart(2, '0');
        this.secondsEl.textContent = seconds.toString().padStart(2, '0');
        
        // Update progress bar
        const progressPercentage = model.getProgressPercentage();
        this.progressEl.style.width = `${progressPercentage}%`;
        
        // Update start/stop button
        if (model.isRunning) {
            this.timerControlEl.textContent = 'Stop';
            this.timerControlEl.dataset.action = 'stop';
        } else {
            this.timerControlEl.textContent = 'Start';
            this.timerControlEl.dataset.action = 'start';
        }
        
        // Update mode buttons to show active state
        const modeButtons = document.querySelectorAll('.mode-buttons button');
        modeButtons.forEach((button) => {
            if (button.dataset.mode === model.currentMode) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });

        // Update background color based on current mode
        document.body.style.backgroundColor = this.modeColors[model.currentMode];

        // Update pomodoro count display if it exists
        if (this.promodoroCountEl) {
            this.promodoroCountEl.textContent = model.promodoroCount;
        }

        // Update settings panel to match model
        this.updateSettingsPanelValues(model);

        // Update title with remaining time
        document.title = `${minutes}:${seconds} - Promodoro Timer`;
        
        // Update current task display
        this.updateCurrentTaskDisplay(model);
    }
    
    updateCurrentTaskDisplay(model) {
        // Update task header to show current task
        const taskContainer = document.querySelector('.task-container h3');
        if (taskContainer) {
            if (model.currentTaskId) {
                const currentTaskElement = document.querySelector(`li[data-task-id="${model.currentTaskId}"] .task-text`);
                if (currentTaskElement) {
                    const taskText = currentTaskElement.textContent;
                    const truncatedText = taskText.length > 25 ? taskText.substring(0, 25) + '...' : taskText;
                    taskContainer.innerHTML = `Current Task: <span style="color: white; font-weight: bold;">${truncatedText}</span>`;
                } else {
                    taskContainer.textContent = 'Current Task: (Task not found)';
                }
            } else {
                taskContainer.textContent = 'Current Task: None selected';
            }
        }
        
        // Update visual selection in task list
        document.querySelectorAll('#task-list li').forEach(li => {
            li.classList.remove('selected-task');
            if (li.dataset.taskId === model.currentTaskId) {
                li.classList.add('selected-task');
            }
        });
        
        // Update session badges for all tasks
        this.updateSessionBadges(model);
        
        // Update quick task selector if it exists
        this.updateQuickTaskSelector(model);
    }
    
    updateSessionBadges(model) {
        // Update session count badges for all tasks
        document.querySelectorAll('#task-list li').forEach(li => {
            const taskId = li.dataset.taskId;
            const sessionBadge = li.querySelector('.session-badge');
            if (sessionBadge && taskId) {
                const sessionCount = model.getTaskSessionCount(taskId);
                sessionBadge.textContent = sessionCount || 0;
                sessionBadge.title = `${sessionCount || 0} completed sessions`;
            }
        });
    }
    
    updateQuickTaskSelector(model) {
        let quickSelector = document.getElementById('quick-task-selector');
        
        // Create quick selector if it doesn't exist
        if (!quickSelector) {
            const taskContainer = document.querySelector('.task-container');
            if (taskContainer) {
                const selectorContainer = document.createElement('div');
                selectorContainer.className = 'quick-selector-container';
                selectorContainer.innerHTML = `
                    <label for="quick-task-selector">Quick Switch:</label>
                    <select id="quick-task-selector">
                        <option value="">Select a task...</option>
                    </select>
                `;
                
                // Insert after the h3 but before the input
                const h3 = taskContainer.querySelector('h3');
                if (h3 && h3.nextSibling) {
                    taskContainer.insertBefore(selectorContainer, h3.nextSibling);
                } else {
                    taskContainer.appendChild(selectorContainer);
                }
                
                quickSelector = document.getElementById('quick-task-selector');
                
                // Add change event listener
                if (quickSelector) {
                    quickSelector.addEventListener('change', (e) => {
                        if (e.target.value && this.controller) {
                            this.controller.handleSelectTask(e.target.value);
                        }
                    });
                }
            }
        }
        
        if (quickSelector) {
            // Clear existing options
            quickSelector.innerHTML = '<option value="">Select a task...</option>';
            
            // Add tasks to selector
            const taskList = document.getElementById('task-list');
            if (taskList) {
                taskList.querySelectorAll('li').forEach(li => {
                    const taskId = li.dataset.taskId;
                    const taskText = li.querySelector('.task-text').textContent;
                    const option = document.createElement('option');
                    option.value = taskId;
                    option.textContent = taskText.length > 30 ? taskText.substring(0, 30) + '...' : taskText;
                    
                    if (taskId === model.currentTaskId) {
                        option.selected = true;
                    }
                    
                    quickSelector.appendChild(option);
                });
            }
        }
    }

    updateSettingsPanelValues(model) {
        // Update timer duration inputs
        const promodoroTimeInput = document.getElementById('promodoro-time');
        const shortBreakTimeInput = document.getElementById('short-break-time');
        const longBreakTimeInput = document.getElementById('long-break-time');
        
        if (promodoroTimeInput) {
            promodoroTimeInput.value = Math.floor(model.modes.promodoro / 60);
        }
        if (shortBreakTimeInput) {
            shortBreakTimeInput.value = Math.floor(model.modes.shortBreak / 60);
        }
        if (longBreakTimeInput) {
            longBreakTimeInput.value = Math.floor(model.modes.longBreak / 60);
        }
        
        // Update sound selection
        const soundSelect = document.getElementById('alarm-sound');
        const customSoundDiv = document.getElementById('current-custom-sound');
        
        if (soundSelect && customSoundDiv) {
            console.log('Current alarm sound:', model.alarmSound);
            console.log('Custom sound URL:', model.customSoundUrl);
            
            if (model.customSoundUrl && model.alarmSound === model.customSoundUrl) {
                // Show custom sound
                soundSelect.value = 'custom';
                customSoundDiv.innerHTML = `Custom sound: ${model.customSoundName || 'Unknown'}`;
                customSoundDiv.style.display = 'block';
            } else {
                // Check if the current sound is one of the predefined options
                const options = Array.from(soundSelect.options);
                const matchingOption = options.find(option => option.value === model.alarmSound);
                
                if (matchingOption) {
                    soundSelect.value = model.alarmSound;
                    console.log('Set sound to:', model.alarmSound);
                } else {
                    // If no match, default to first option but keep the current sound
                    console.log('No matching option found, using current sound');
                    soundSelect.value = model.alarmSound || soundSelect.options[0].value;
                }
                customSoundDiv.style.display = 'none';
            }
        }
        
        // Update checkboxes
        const alarmToggle = document.getElementById('alarm-toggle');
        if (alarmToggle) {
            alarmToggle.checked = model.alarmEnabled;
        }
        
        const autoStartToggle = document.getElementById('auto-start-toggle');
        if (autoStartToggle) {
            autoStartToggle.checked = model.autoStartNextSession;
        }
    }

    bindStartStop(handler) {
        this.timerControlEl.addEventListener('click', () => {
            const action = this.timerControlEl.dataset.action;
            handler(action);
        });
    }

    bindModeSelection(handler) {
        // Check if we have buttons to bind to
        if (!this.modeButtonsContainer) {
            console.error('Mode buttons container not found');
            return;
        }

        // Get all mode buttons directly
        const buttons = this.modeButtonsContainer.querySelectorAll('button[data-mode]');

        if (buttons.length === 0) {
            console.error('No mode buttons found in container');
            return;
        }

        // Add event listeners to each button individually
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const mode = button.dataset.mode;
                console.log('Mode button clicked:', mode);
                handler(mode);
            });
        });
    }

    bindSettingsControls(handlers) {
        const { open, close, save, resetDefaults, toggleAlarm, toggleAutoStart, testSound, exportData, importData } = handlers;
        
        // Settings button click handler
        if (this.settingsEl) {
            this.settingsEl.addEventListener('click', open);
        }
        
        // Close settings button
        const closeBtn = document.getElementById('close-settings');
        if (closeBtn) {
            closeBtn.addEventListener('click', close);
        }
        
        // Save settings button
        const saveBtn = document.getElementById('save-settings');
        if (saveBtn) {
            saveBtn.addEventListener('click', save);
        }
        
        // Reset to defaults button
        const resetBtn = document.getElementById('reset-defaults');
        if (resetBtn) {
            resetBtn.addEventListener('click', resetDefaults);
        }
        
        // Alarm toggle
        const alarmToggle = document.getElementById('alarm-toggle');
        if (alarmToggle) {
            alarmToggle.addEventListener('change', toggleAlarm);
        }
        
        // Auto-start toggle
        const autoStartToggle = document.getElementById('auto-start-toggle');
        if (autoStartToggle) {
            autoStartToggle.addEventListener('change', toggleAutoStart);
        }
        
        // Test sound button
        const testSoundBtn = document.getElementById('test-sound-btn');
        if (testSoundBtn) {
            testSoundBtn.addEventListener('click', testSound);
        }
        
        // Export data button
        const exportBtn = document.getElementById('export-data-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', exportData);
        }
        
        // Import data button and file input
        const importBtn = document.getElementById('import-data-btn');
        const importFile = document.getElementById('import-file');
        if (importBtn && importFile) {
            importBtn.addEventListener('click', () => {
                // Also show option to paste data directly
                const pasteData = prompt('📥 You can either:\n1. Click OK to select a file, or\n2. Paste your data here directly:');
                if (pasteData && pasteData.trim()) {
                    try {
                        const data = JSON.parse(pasteData);
                        importData({ target: { result: JSON.stringify(data) } });
                        return;
                    } catch (error) {
                        this.showSyncStatus('❌ Invalid JSON data pasted', 'error');
                        return;
                    }
                }
                importFile.click();
            });
            
            importFile.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file && file.type === 'application/json') {
                    importData(file);
                } else if (file) {
                    this.showSyncStatus('Please select a valid JSON file', 'error');
                }
                // Reset file input
                importFile.value = '';
            });
        }
        
        // QR code generator button
        const qrBtn = document.getElementById('generate-qr-btn');
        if (qrBtn) {
            qrBtn.addEventListener('click', () => {
                this.generateQRCode();
            });
        }
        
        // Custom sound upload functionality
        const soundSelect = document.getElementById('alarm-sound');
        const customSoundUpload = document.getElementById('custom-sound-upload');
        const currentCustomSoundDiv = document.getElementById('current-custom-sound');
        
        if (soundSelect && customSoundUpload && currentCustomSoundDiv) {
            // Handle sound selection change
            soundSelect.addEventListener('change', (e) => {
                console.log('Sound selection changed to:', e.target.value);
                if (e.target.value === 'custom') {
                    customSoundUpload.style.display = 'block';
                    customSoundUpload.click();
                } else {
                    customSoundUpload.style.display = 'none';
                    currentCustomSoundDiv.style.display = 'none';
                    // Immediately save the new sound selection
                    this.model.setAlarmSound(e.target.value);
                    console.log('Sound updated to:', e.target.value);
                }
            });
            
            // Handle custom sound upload
            customSoundUpload.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    // Check if it's an audio file
                    if (!file.type.startsWith('audio/')) {
                        alert('Please select an audio file');
                        soundSelect.value = soundSelect.options[0].value; // Reset to default
                        customSoundUpload.style.display = 'none';
                        return;
                    }
                    
                    // Create URL for the uploaded file
                    const audioUrl = URL.createObjectURL(file);
                    
                    // Store the custom sound URL (you might want to save this to localStorage)
                    this.model.setCustomSound(audioUrl, file.name);
                    
                    // Show current custom sound info
                    currentCustomSoundDiv.innerHTML = `Custom sound: ${file.name}`;
                    currentCustomSoundDiv.style.display = 'block';
                    
                    // Update the select to show custom option
                    soundSelect.value = 'custom';
                    
                    console.log('Custom sound uploaded:', file.name);
                } else {
                    // If no file selected, revert to default
                    soundSelect.value = soundSelect.options[0].value;
                    customSoundUpload.style.display = 'none';
                    currentCustomSoundDiv.style.display = 'none';
                }
            });
        }
    }
    
    // Show sync status message
    showSyncStatus(message, type) {
        const statusElement = document.getElementById('sync-status');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `sync-status ${type}`;
            
            // Hide after 5 seconds
            setTimeout(() => {
                statusElement.className = 'sync-status';
            }, 5000);
        }
    }
    
    // Generate QR code for data sharing
    generateQRCode() {
        const qrContainer = document.getElementById('qr-container');
        const qrCodeDiv = document.getElementById('qr-code');
        
        if (!qrContainer || !qrCodeDiv) return;
        
        try {
            // Create a smaller version of data for QR code (only essential settings)
            const compactData = {
                settings: {
                    modes: this.model.modes,
                    promodoroCount: this.model.promodoroCount
                },
                tasks: storage.loadTaskList().map(task => ({ text: task.text, completed: task.completed })), // Remove IDs and extra data
                version: '1.0-compact'
            };
            
            const dataStr = JSON.stringify(compactData);
            
            // Check if data is still too large for QR code
            if (dataStr.length > 2000) {
                // If still too large, offer only settings
                const settingsOnly = {
                    settings: compactData.settings,
                    version: '1.0-settings-only'
                };
                const settingsStr = JSON.stringify(settingsOnly);
                
                if (settingsStr.length > 2000) {
                    this.showSyncStatus('⚠️ Data too large for QR code. Use Export/Import instead.', 'info');
                    return;
                } else {
                    this.generateQR(settingsStr, qrContainer, qrCodeDiv, 'Settings only (tasks excluded due to size)');
                    return;
                }
            }
            
            this.generateQR(dataStr, qrContainer, qrCodeDiv, 'Complete data');
        } catch (error) {
            console.error('QR generation failed:', error);
            this.showSyncStatus('❌ Failed to generate QR code.', 'error');
        }
    }
    
    // Helper method to generate QR code
    generateQR(dataStr, qrContainer, qrCodeDiv, description) {
        // Clear previous QR code
        qrCodeDiv.innerHTML = '';
        
        // Try multiple QR generation methods
        if (this.tryQRLibrary(dataStr, qrCodeDiv, description)) {
            qrContainer.style.display = 'block';
            this.showSyncStatus(`✅ QR code generated! ${description}`, 'success');
        } else if (this.tryOnlineQR(dataStr, qrCodeDiv, description)) {
            qrContainer.style.display = 'block';
            this.showSyncStatus(`✅ QR code generated online! ${description}`, 'success');
        } else {
            // Ultimate fallback: Enhanced text display with copy functionality
            this.createTextFallback(dataStr, qrCodeDiv, description);
            qrContainer.style.display = 'block';
            this.showSyncStatus('📋 Showing data as text. Copy to transfer manually.', 'info');
        }
    }
    
    // Try the QRCode library
    tryQRLibrary(dataStr, qrCodeDiv, description) {
        try {
            if (typeof QRCode !== 'undefined') {
                const size = dataStr.length > 1000 ? 150 : (dataStr.length > 500 ? 175 : 200);
                const qr = new QRCode(qrCodeDiv, {
                    text: dataStr,
                    width: size,
                    height: size,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.M
                });
                return true;
            }
        } catch (error) {
            console.log('QRCode library failed:', error);
        }
        return false;
    }
    
    // Try online QR generator as fallback
    tryOnlineQR(dataStr, qrCodeDiv, description) {
        try {
            // Use Google Charts API for QR generation
            const encodedData = encodeURIComponent(dataStr);
            const size = dataStr.length > 1000 ? 150 : (dataStr.length > 500 ? 175 : 200);
            const qrUrl = `https://chart.googleapis.com/chart?chs=${size}x${size}&cht=qr&chl=${encodedData}`;
            
            const img = document.createElement('img');
            img.src = qrUrl;
            img.alt = 'QR Code';
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            
            // Test if the image loads
            img.onload = () => {
                qrCodeDiv.appendChild(img);
            };
            
            img.onerror = () => {
                console.log('Online QR generation failed');
                return false;
            };
            
            qrCodeDiv.appendChild(img);
            return true;
        } catch (error) {
            console.log('Online QR generation failed:', error);
        }
        return false;
    }
    
    // Enhanced text fallback with copy functionality
    createTextFallback(dataStr, qrCodeDiv, description) {
        const fallbackDiv = document.createElement('div');
        fallbackDiv.style.cssText = `
            padding: 15px; 
            background: #f8f9fa; 
            border: 2px dashed #dee2e6; 
            border-radius: 8px; 
            font-family: monospace; 
            font-size: 11px;
            line-height: 1.4;
            max-height: 200px;
            overflow-y: auto;
        `;
        
        fallbackDiv.innerHTML = `
            <div style="margin-bottom: 10px; font-weight: bold; color: #495057;">
                📱 Manual Transfer Data (${description})
            </div>
            <div style="background: white; padding: 10px; border-radius: 4px; word-break: break-all; margin-bottom: 10px; border: 1px solid #dee2e6;">
                ${dataStr}
            </div>
            <button onclick="navigator.clipboard.writeText('${dataStr.replace(/'/g, "\\'")}').then(() => alert('✅ Data copied to clipboard!')).catch(() => alert('❌ Copy failed. Please select and copy manually.'))" 
                    style="padding: 8px 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; margin-right: 8px;">
                📋 Copy Data
            </button>
            <small style="color: #6c757d; display: block; margin-top: 8px;">
                💡 Tip: Copy this data and paste it into the Import field on your other device
            </small>
        `;
        
        qrCodeDiv.appendChild(fallbackDiv);
    }

    bindTaskInput(addTaskHandler, deleteTaskHandler, selectTaskHandler, viewHistoryHandler) {
        const taskInput = document.getElementById('task-input');
        const taskList = document.getElementById('task-list');
        
        if (taskInput && taskList) {
            // Load saved tasks
            const savedTasks = storage.loadTaskList();
            if (savedTasks.length > 0) {
                savedTasks.forEach(task => {
                    this.addTaskToList(task.text, task.completed, task.id);
                });
            }
            
            // Handle enter key in task input
            taskInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && taskInput.value.trim() !== '') {
                    const taskText = taskInput.value.trim();
                    addTaskHandler(taskText);
                    taskInput.value = '';
                }
            });
            
            // Handle clicks on tasks and buttons
            taskList.addEventListener('click', (e) => {
                const li = e.target.closest('li');
                if (!li) return;
                
                const taskId = li.dataset.taskId;
                
                // Handle select button clicks
                if (e.target.classList.contains('select-task')) {
                    if (selectTaskHandler) {
                        // Remove selected class from all tasks
                        taskList.querySelectorAll('li').forEach(item => {
                            item.classList.remove('selected-task');
                        });
                        
                        // Add selected class to this task
                        li.classList.add('selected-task');
                        selectTaskHandler(taskId);
                    }
                    return;
                }
                
                // Handle delete button clicks
                if (e.target.classList.contains('delete-task')) {
                    if (deleteTaskHandler) {
                        const index = Array.from(taskList.children).indexOf(li);
                        deleteTaskHandler(index, taskId);
                        li.remove();
                        this.saveTaskListState();
                    }
                    return;
                }
                
                // Handle history button clicks
                if (e.target.classList.contains('history-task')) {
                    if (viewHistoryHandler) {
                        viewHistoryHandler(taskId);
                    }
                    return;
                }
                
                // Handle task completion toggle (clicking on task text/content)
                if (e.target.classList.contains('task-text') || e.target.classList.contains('task-content')) {
                    li.classList.toggle('completed');
                    this.saveTaskListState();
                }
            });
        }
    }
    
    addTaskToList(taskText, completed = false, taskId = null) {
        const taskList = document.getElementById('task-list');
        if (taskList) {
            // Generate a unique ID if not provided
            if (!taskId) {
                taskId = 'task_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
            }
            
            const li = document.createElement('li');
            li.dataset.taskId = taskId;
            
            // Create task content container
            const taskContent = document.createElement('div');
            taskContent.className = 'task-content';
            
            // Create task text span
            const taskSpan = document.createElement('span');
            taskSpan.textContent = taskText;
            taskSpan.className = 'task-text';
            taskContent.appendChild(taskSpan);
            
            // Add session count badge
            const sessionCount = this.model ? this.model.getTaskSessionCount(taskId) : 0;
            const sessionBadge = document.createElement('span');
            sessionBadge.className = 'session-badge';
            sessionBadge.textContent = sessionCount || 0;
            sessionBadge.title = `${sessionCount || 0} completed sessions`;
            taskContent.appendChild(sessionBadge);
            
            li.appendChild(taskContent);
            
            // Create action buttons container
            const actionBtns = document.createElement('div');
            actionBtns.className = 'task-actions';
            
            // Create select task button
            const selectBtn = document.createElement('button');
            selectBtn.innerHTML = '✓';
            selectBtn.className = 'select-task';
            selectBtn.title = 'Select this task';
            selectBtn.setAttribute('aria-label', 'Select this task');
            actionBtns.appendChild(selectBtn);
            
            // Create history button
            const historyBtn = document.createElement('button');
            historyBtn.innerHTML = '&#128337;'; // Clock emoji
            historyBtn.className = 'history-task';
            historyBtn.title = 'View session history';
            historyBtn.setAttribute('aria-label', 'View session history');
            actionBtns.appendChild(historyBtn);
            
            // Create delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '&times;';
            deleteBtn.className = 'delete-task';
            deleteBtn.title = 'Delete task';
            deleteBtn.setAttribute('aria-label', 'Delete task');
            actionBtns.appendChild(deleteBtn);
            
            li.appendChild(actionBtns);
            
            // Add completed class if needed
            if (completed) {
                li.classList.add('completed');
            }
            
            // Add selected class if this is the current task
            if (this.model && this.model.currentTaskId === taskId) {
                li.classList.add('selected-task');
            }
            
            taskList.appendChild(li);
            
            // Save task list state
            this.saveTaskListState();
            
            return taskId;
        }
        return null;
    }
    
    saveTaskListState() {
        const taskList = document.getElementById('task-list');
        if (taskList) {
            const tasks = [];
            taskList.querySelectorAll('li').forEach(li => {
                const taskText = li.querySelector('.task-text').textContent;
                tasks.push({
                    id: li.dataset.taskId,
                    text: taskText,
                    completed: li.classList.contains('completed')
                });
            });
            
            storage.saveTaskList(tasks);
        }
    }

    // Add a method to show the task history modal
    showTaskHistory(taskId) {
        // Remove any existing modal
        const existingModal = document.getElementById('history-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Get task history
        const history = this.model.getTaskHistory(taskId);
        const taskText = document.querySelector(`li[data-task-id="${taskId}"] .task-text`).textContent;
        
        // Calculate statistics
        const totalSessions = history.length;
        const totalMinutes = history.reduce((sum, session) => sum + session.duration, 0);
        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;
        
        // Find most productive day
        const dayStats = {};
        history.forEach(session => {
            const day = session.date;
            dayStats[day] = (dayStats[day] || 0) + 1;
        });
        const mostProductiveDay = Object.keys(dayStats).reduce((a, b) => dayStats[a] > dayStats[b] ? a : b, 'N/A');
        
        // Group sessions by date for daily view
        const sessionsByDate = {};
        history.forEach(session => {
            const date = session.date;
            if (!sessionsByDate[date]) {
                sessionsByDate[date] = [];
            }
            sessionsByDate[date].push(session);
        });
        
        // Create modal
        const modal = document.createElement('div');
        modal.id = 'history-modal';
        modal.className = 'modal';
        modal.style.display = 'block';
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content history-modal-content';
        
        // Add header with better styling and tabs
        modalContent.innerHTML = `
            <div class="history-header">
                <span class="close-modal">&times;</span>
                <div class="history-title">
                    <h2>📊 Session History</h2>
                    <div class="task-name">"${taskText}"</div>
                </div>
            </div>
            
            <div class="history-stats">
                <div class="stat-card">
                    <div class="stat-number">${totalSessions}</div>
                    <div class="stat-label">Sessions</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${totalHours}h ${remainingMinutes}m</div>
                    <div class="stat-label">Total Time</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0}m</div>
                    <div class="stat-label">Avg Session</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${totalSessions > 0 ? mostProductiveDay : 'N/A'}</div>
                    <div class="stat-label">Most Active Day</div>
                </div>
            </div>
            
            <div class="history-content">
                <div id="daily-view" class="tab-content active"></div>
            </div>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Populate daily view
        const dailyView = modal.querySelector('#daily-view');
        if (history.length > 0) {
            // Sort dates in descending order (newest first) using timestamp
            const sortedDates = Object.keys(sessionsByDate).sort((a, b) => {
                // Get the most recent session timestamp for each date to sort by
                const aTimestamp = Math.max(...sessionsByDate[a].map(s => s.timestamp));
                const bTimestamp = Math.max(...sessionsByDate[b].map(s => s.timestamp));
                return bTimestamp - aTimestamp;
            });
            
            sortedDates.forEach(date => {
                const daySessions = sessionsByDate[date];
                const dayMinutes = daySessions.reduce((sum, session) => sum + session.duration, 0);
                const dayHours = Math.floor(dayMinutes / 60);
                const dayRemainingMinutes = dayMinutes % 60;
                
                const dayGroup = document.createElement('div');
                dayGroup.className = 'day-group';
                
                dayGroup.innerHTML = `
                    <div class="day-header">
                        <div class="day-info">
                            <h4>${date}</h4>
                            <span class="day-stats">${daySessions.length} sessions • ${dayHours > 0 ? dayHours + 'h ' : ''}${dayRemainingMinutes}m</span>
                        </div>
                    </div>
                    <div class="day-sessions">
                        ${daySessions.sort((a, b) => b.timestamp - a.timestamp).map(session => {
                            const modeIcon = session.mode === 'promodoro' ? '🍅' : (session.mode === 'shortBreak' ? '☕' : '🛋️');
                            const modeLabel = session.mode === 'promodoro' ? 'Work' : (session.mode === 'shortBreak' ? 'Short Break' : 'Long Break');
                            
                            return `
                                <div class="session-item">
                                    <span class="session-icon">${modeIcon}</span>
                                    <span class="session-type">${modeLabel}</span>
                                    <span class="session-time">🕐 ${session.time}</span>
                                    <span class="session-duration">${session.duration}m</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
                
                dailyView.appendChild(dayGroup);
            });
        } else {
            dailyView.innerHTML = `
                <div class="empty-history">
                    <div class="empty-icon">📝</div>
                    <h3>No sessions yet</h3>
                    <p>Start working on this task to see your session history here!</p>
                </div>
            `;
        }
        

        
        // Add close functionality
        const closeBtn = modal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
                setTimeout(() => modal.remove(), 300);
            });
        }
        
        // Close when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                setTimeout(() => modal.remove(), 300);
            }
        });
    }
}

// Timer Controller
class TimerController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        
        // Set references in view
        this.view.setController(this);
        this.view.setModel(model);
        
        // Add listener for model changes
        this.model.addChangeListener((model) => {
            this.view.updateDisplay(model);
        });
        
        // Bind event handlers
        this.view.bindStartStop(this.handleStartStop.bind(this));
        this.view.bindModeSelection(this.handleModeSelection.bind(this));
        this.view.bindSettingsControls({
            open: this.handleOpenSettings.bind(this),
            close: this.handleCloseSettings.bind(this),
            save: this.handleSaveSettings.bind(this),
            resetDefaults: this.handleResetDefaults.bind(this),
            toggleAlarm: this.handleToggleAlarm.bind(this),
            toggleAutoStart: this.handleToggleAutoStart.bind(this),
            testSound: this.handleTestSound.bind(this),
            exportData: this.handleExportData.bind(this),
            importData: this.handleImportData.bind(this)
        });
        
        this.view.bindTaskInput(
            this.handleAddTask.bind(this), 
            this.handleDeleteTask.bind(this), 
            this.handleSelectTask.bind(this),
            this.handleViewTaskHistory.bind(this)
        );
        
        // Initial display update
        this.view.updateDisplay(this.model);
        
        // Request notification permission
        this.requestNotificationPermission();
    }

    handleStartStop(action) {
        console.log('Start/Stop action:', action);
        if (action === 'start') {
            this.model.start();
        } else {
            this.model.stop();
        }
    }

    handleModeSelection(mode) {
        console.log('Mode selected:', mode);
        this.model.stop();
        this.model.setMode(mode);
    }
    
    handleOpenSettings() {
        const settingsPanel = document.getElementById('settings-panel');
        if (settingsPanel) {
            settingsPanel.style.display = 'block';
        }
    }
    
    handleCloseSettings() {
        const settingsPanel = document.getElementById('settings-panel');
        if (settingsPanel) {
            settingsPanel.style.display = 'none';
        }
    }
    
    handleSaveSettings() {
        // Get values from form
        const promodoroTime = document.getElementById('promodoro-time').value;
        const shortBreakTime = document.getElementById('short-break-time').value;
        const longBreakTime = document.getElementById('long-break-time').value;
        
        // Save updated settings
        this.model.updateModeDuration('promodoro', promodoroTime);
        this.model.updateModeDuration('shortBreak', shortBreakTime);
        this.model.updateModeDuration('longBreak', longBreakTime);
        
        // Handle sound selection
        const soundSelect = document.getElementById('alarm-sound');
        if (soundSelect) {
            if (soundSelect.value === 'custom' && this.model.customSoundUrl) {
                // Keep the current custom sound
                this.model.setAlarmSound(this.model.customSoundUrl);
            } else if (soundSelect.value !== 'custom') {
                // Use predefined sound
                this.model.setAlarmSound(soundSelect.value);
            }
        }
        
        // Force update the settings panel to reflect current values
        this.view.updateSettingsPanelValues(this.model);
        
        // Save settings explicitly
        this.model.saveSettings();
        
        // Close settings panel
        this.handleCloseSettings();
    }
    
    handleResetDefaults() {
        this.model.resetToDefaults();
    }
    
    handleToggleAlarm() {
        const alarmToggle = document.getElementById('alarm-toggle');
        if (alarmToggle) {
            this.model.toggleAlarm();
            alarmToggle.checked = this.model.alarmEnabled;
        }
    }
    
    handleToggleAutoStart() {
        const autoStartToggle = document.getElementById('auto-start-toggle');
        if (autoStartToggle) {
            this.model.toggleAutoStart();
            autoStartToggle.checked = this.model.autoStartNextSession;
        }
    }
    
    handleTestSound() {
        console.log('Testing sound');
        if (this.model.alarmEnabled) {
            this.model.playAlarmSound();
        }
    }
    
    handleAddTask(taskText) {
        const taskId = this.view.addTaskToList(taskText, false);
        // Automatically select the new task
        this.handleSelectTask(taskId);
    }
    
    handleDeleteTask(index, taskId) {
        console.log('Deleting task at index:', index, 'with ID:', taskId);
        
        // If this is the current task, clear the current task
        if (this.model.currentTaskId === taskId) {
            this.model.setCurrentTask(null);
        }
        
        // The actual removal from the DOM is handled in the view
    }
    
    handleSelectTask(taskId) {
        console.log('Selecting task with ID:', taskId);
        this.model.setCurrentTask(taskId);
    }
    
    handleViewTaskHistory(taskId) {
        console.log('Viewing history for task with ID:', taskId);
        this.view.showTaskHistory(taskId);
    }
    
    requestNotificationPermission() {
        // Request permission for notifications
        if ('Notification' in window) {
            if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
                Notification.requestPermission();
            }
        }
    }
    
    handleExportData() {
        try {
            const data = this.model.exportData();
            const dataStr = JSON.stringify(data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            // Create download link
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `promodoro-data-${new Date().toISOString().split('T')[0]}.json`;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up
            URL.revokeObjectURL(url);
            
            this.view.showSyncStatus('✅ Data exported successfully! File downloaded.', 'success');
        } catch (error) {
            console.error('Export failed:', error);
            this.view.showSyncStatus('❌ Export failed. Please try again.', 'error');
        }
    }
    
    handleImportData(file) {
        // Handle both file input and direct data paste
        if (file.target && file.target.result) {
            // Direct data paste
            this.processImportData(file.target.result);
        } else {
            // File upload
            const reader = new FileReader();
            
            reader.onload = (e) => {
                this.processImportData(e.target.result);
            };
            
            reader.onerror = () => {
                this.view.showSyncStatus('❌ Failed to read file.', 'error');
            };
            
            reader.readAsText(file);
        }
    }
    
    processImportData(dataString) {
        try {
            const data = JSON.parse(dataString);
            const success = this.model.importData(data);
            
            if (success) {
                // Refresh the view to show imported data
                this.view.updateDisplay(this.model);
                this.view.updateSettingsPanelValues(this.model);
                
                // Reload task list
                const savedTasks = storage.loadTaskList();
                const taskList = document.getElementById('task-list');
                if (taskList) {
                    taskList.innerHTML = '';
                    savedTasks.forEach(task => {
                        this.view.addTaskToList(task.text, task.completed, task.id);
                    });
                }
                
                this.view.showSyncStatus('✅ Data imported successfully!', 'success');
            } else {
                this.view.showSyncStatus('❌ Import failed. Invalid data format.', 'error');
            }
        } catch (error) {
            console.error('Import failed:', error);
            this.view.showSyncStatus('❌ Import failed. Invalid JSON data.', 'error');
        }
    }
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded, initializing app');
    
    // Initialize the MVC components
    const model = new TimerModel();
    const view = new TimerView();
    const controller = new TimerController(model, view);
    
    console.log('App initialized successfully');
});

// Add CSS for task list
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
        #task-list {
            max-height: 200px;
            overflow-y: auto;
            margin-bottom: 10px;
            padding-right: 5px;
        }
        
        #task-list::-webkit-scrollbar {
            width: 6px;
        }
        
        #task-list::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
        }
        
        #task-list::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
            border-radius: 3px;
        }
        
        #task-list::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.5);
        }
        
        #task-list li {
            cursor: pointer;
            padding: 8px 5px;
            transition: all 0.3s;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            margin-bottom: 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        #task-list li.completed .task-text {
            text-decoration: line-through;
            opacity: 0.6;
        }
        
        #task-list li:hover {
            background-color: rgba(255, 255, 255, 0.1);
        }
        
        .task-text {
            flex-grow: 1;
            margin-right: 10px;
        }
        
        .delete-task {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            font-size: 14px;
            line-height: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            padding: 0;
            opacity: 0.7;
            transition: all 0.2s;
            flex-shrink: 0;
        }
        
        .delete-task:hover {
            opacity: 1;
            background: rgba(255, 255, 255, 0.3);
        }
    `;
    document.head.appendChild(style);
});

// Add CSS for task history
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
        /* Existing styles... */

        /* Task item with history badge */
        .task-content {
            display: flex;
            align-items: center;
            flex-grow: 1;
            margin-right: 10px;
        }

        .session-badge {
            background-color: rgba(255, 255, 255, 0.2);
            color: white;
            border-radius: 50%;
            min-width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            margin-left: 8px;
            padding: 0 4px;
        }

        .task-actions {
            display: flex;
            gap: 5px;
        }

        .history-task {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            font-size: 12px;
            line-height: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            padding: 0;
            opacity: 0.7;
            transition: all 0.2s;
        }

        .history-task:hover {
            opacity: 1;
            background: rgba(255, 255, 255, 0.3);
        }

        /* Selected task styling */
        li.selected-task {
            background-color: rgba(255, 255, 255, 0.15);
            border-left: 3px solid rgba(255, 255, 255, 0.7);
            padding-left: 7px;
        }

        /* Current task indicator */
        .task-container h3 {
            margin-bottom: 15px;
            padding: 8px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 5px;
            font-size: 14px;
            border-left: 3px solid #FF9800;
        }
        
        /* Enhanced selected task styling */
        li.selected-task {
            background: linear-gradient(135deg, rgba(255, 152, 0, 0.15), rgba(255, 152, 0, 0.05));
            border-left: 4px solid #FF9800;
            padding-left: 6px;
            box-shadow: inset 0 0 10px rgba(255, 152, 0, 0.1);
            animation: selectedTaskGlow 2s ease-in-out infinite alternate;
        }
        
        @keyframes selectedTaskGlow {
            from { box-shadow: inset 0 0 10px rgba(255, 152, 0, 0.1); }
            to { box-shadow: inset 0 0 15px rgba(255, 152, 0, 0.2); }
        }
        
        /* Task selection hint */
        #task-list:empty::after {
            content: "Add tasks above and click to select which one you're working on";
            color: rgba(255, 255, 255, 0.6);
            font-style: italic;
            font-size: 12px;
            padding: 20px;
            text-align: center;
            display: block;
        }
        
        /* Improved task actions */
        .task-actions {
            display: flex;
            gap: 8px;
            opacity: 0.7;
            transition: opacity 0.2s;
        }
        
        #task-list li:hover .task-actions {
            opacity: 1;
        }
        
        .select-task {
            background: rgba(255, 152, 0, 0.3);
            border: none;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            font-size: 12px;
            line-height: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            padding: 0;
            opacity: 0.7;
            transition: all 0.2s;
            flex-shrink: 0;
        }
        
        .select-task:hover {
            opacity: 1;
            background: rgba(255, 152, 0, 0.5);
            transform: scale(1.1);
        }
        
        li.selected-task .select-task {
            background: rgba(255, 152, 0, 0.8);
            opacity: 1;
        }

        /* Quick task selector styling */
        .quick-selector-container {
            margin-bottom: 10px;
            padding: 8px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 5px;
            border-left: 3px solid rgba(255, 255, 255, 0.3);
        }
        
        .quick-selector-container label {
            display: block;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.8);
            margin-bottom: 5px;
        }
        
        #quick-task-selector {
            width: 100%;
            padding: 6px 8px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            color: white;
            font-size: 13px;
        }
        
        #quick-task-selector option {
            background: #2c3e50;
            color: white;
        }
        
        #quick-task-selector:focus {
            outline: none;
            border-color: rgba(255, 255, 255, 0.5);
            background: rgba(255, 255, 255, 0.15);
        }
        
        /* Enhanced History Modal Styling */
        .history-modal-content {
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
        }
        
        .history-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #e0e0e0;
        }
        
        .history-title h2 {
            margin: 0 0 5px 0;
            color: #333;
            font-size: 24px;
        }
        
        .task-name {
            color: #FF9800;
            font-weight: bold;
            font-size: 16px;
            font-style: italic;
        }
        
        .history-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 15px;
            margin-bottom: 25px;
        }
        
        .stat-card {
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            border: 1px solid #dee2e6;
            border-radius: 10px;
            padding: 15px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: transform 0.2s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        
        .stat-number {
            font-size: 20px;
            font-weight: bold;
            color: #d95550;
            margin-bottom: 5px;
        }
        
        .stat-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .history-list {
            margin-top: 20px;
        }
        
        .history-list-header {
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .history-list-header h3 {
            margin: 0;
            color: #555;
            font-size: 18px;
        }
        
        .history-item {
            background: linear-gradient(135deg, #ffffff, #f8f9fa);
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 12px 15px;
            margin-bottom: 10px;
            transition: all 0.2s ease;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .history-item:hover {
            transform: translateX(5px);
            box-shadow: 0 2px 6px rgba(0,0,0,0.15);
            border-color: #FF9800;
        }
        
        .history-item-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        
        .session-info {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .session-icon {
            font-size: 18px;
        }
        
        .session-type {
            font-weight: bold;
            color: #333;
            font-size: 14px;
        }
        
        .session-duration {
            background: #FF9800;
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
        }
        
        .history-item-details {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #666;
        }
        
        .session-date, .session-time {
            display: flex;
            align-items: center;
            gap: 4px;
        }
        
        .empty-history {
            text-align: center;
            padding: 40px 20px;
            color: #666;
        }
        
        .empty-icon {
            font-size: 48px;
            margin-bottom: 15px;
        }
        
        .empty-history h3 {
            margin: 0 0 10px 0;
            color: #777;
        }
        
        .empty-history p {
            margin: 0;
            font-style: italic;
            color: #999;
        }
        
        /* Tab Styles */
        .history-tabs {
            display: flex;
            gap: 8px;
            margin-bottom: 20px;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 10px;
        }
        
        .tab-button {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            color: #666;
            padding: 10px 16px;
            border-radius: 6px 6px 0 0;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s ease;
            position: relative;
        }
        
        .tab-button:hover {
            background: #e9ecef;
            color: #333;
        }
        
        .tab-button.active {
            background: #FF9800;
            color: white;
            border-color: #FF9800;
            transform: translateY(2px);
        }
        
        .tab-button.active::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            right: 0;
            height: 2px;
            background: #FF9800;
        }
        
        .tab-content {
            display: none;
        }
        
        .tab-content.active {
            display: block;
        }
        
        /* Daily View Styles */
        .day-group {
            margin-bottom: 25px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .day-header {
            background: linear-gradient(135deg, #FF9800, #f57c00);
            color: white;
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .day-info h4 {
            margin: 0 0 5px 0;
            font-size: 16px;
            font-weight: bold;
        }
        
        .day-stats {
            font-size: 13px;
            opacity: 0.9;
        }
        
        .day-sessions {
            background: white;
            padding: 15px 20px;
        }
        
        .session-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 8px 0;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .session-item:last-child {
            border-bottom: none;
        }
        
        .session-item .session-icon {
            font-size: 16px;
            width: 20px;
            text-align: center;
        }
        
        .session-item .session-type {
            flex: 1;
            font-weight: 500;
            color: #333;
            font-size: 14px;
        }
        
        .session-item .session-time {
            color: #666;
            font-size: 12px;
            min-width: 80px;
        }
        
        .session-item .session-duration {
            background: #FF9800;
            color: white;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 11px;
            font-weight: bold;
            min-width: 35px;
            text-align: center;
        }
        
        /* Mobile Responsive */
        @media (max-width: 480px) {
            .history-stats {
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
            }
            
            .stat-card {
                padding: 10px;
            }
            
            .stat-number {
                font-size: 16px;
            }
            
            .tab-button {
                padding: 8px 12px;
                font-size: 13px;
            }
            
            .day-header {
                padding: 12px 15px;
            }
            
            .day-sessions {
                padding: 12px 15px;
            }
            
            .session-item {
                gap: 8px;
                padding: 6px 0;
            }
            
            .session-item .session-type {
                font-size: 13px;
            }
            
            .session-item .session-time {
                font-size: 11px;
                min-width: 60px;
            }
            
            .history-item {
                padding: 10px 12px;
            }
        }
    `;
    document.head.appendChild(style);
}); 