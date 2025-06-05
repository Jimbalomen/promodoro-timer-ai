export default class TimerView{
    constructor(){
        //DOM elements
        this.minutesEl = document.getElementById('minutes');
        this.secondsEl = document.getElementById('seconds');
        this.progressEl = document.getElementById('progress');
        this.timerControlEl = document.getElementById('timer-control');
        this.modeButtonsContainer = document.querySelector('.mode-buttons');
        this.promodoroCountEl = document.getElementById('promodoro-count');

        //Map of mode to background colors
        this.modeColors = {
            promodoro: '#d95550',
            shortBreak: '#4c9195',
            longBreak: '#457ca3'
        };
    }
    
    updateDisplay(model){
        //Update timer display
        const timeDisplay = model.getTimeForDisplay();
        this.minutesEl.textContent = timeDisplay.minutes;
        this.secondsEl.textContent = timeDisplay.seconds;

        //Update progress bar
        const progressPercentage = model.getProgressPercentage();
        this.progressEl.style.width = `${progressPercentage}%`;

        //Update start/stop button
        if (model.isRunning) {
            this.timerControlEl.textContent = 'Pause';
            this.timerControlEl.dataset.action = 'stop';
        } else {
            this.timerControlEl.textContent = 'Start';
            this.timerControlEl.dataset.action = 'start';
        }

        //Update mode buttons to show active state
        const modeButtons = document.querySelectorAll('.mode-buttons button');
        modeButtons.forEach((button) => {
            if (button.dataset.mode === model.currentMode){
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });

        //Update background color based on current mode
        document.body.style.backgroundColor = this.modeColors[model.currentMode];

        //Update pomodoro count display if it exists
        if (this.promodoroCountEl) {
            this.promodoroCountEl.textContent = model.promodoroCount;
        }
        
        //Update title with remaining time
        document.title = `${timeDisplay.minutes}:${timeDisplay.seconds} - Promodoro Timer`;
    }

    bindStartStop(handler){
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
}