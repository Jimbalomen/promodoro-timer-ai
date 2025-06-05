export default class TimerModel{
    constructor(){
        //Timer configuration
        this.modes = {
            promodoro: 25 * 60,// 25 minutes in seconds
            shortBreak: 5 * 60, // 5 minutes in seconds
            longBreak: 15 * 60,// 15 minutes in seconds
        };

        //current state
        this.currentMode = 'promodoro'; // default mode
        this.timeRemaining = this.modes.promodoro; // default time remaining
        this.isRunning = false; // timer is not running by default
        this.interval = null; // interval ID for the timer
        this.promodoroCount = 0; // count of completed pomodoros
        this.listeners = [];
    }

    //observer pattern - add listener for state changes
    addChangeListener(listener) {
        this.listeners.push(listener);
    }

    //notify all listeners of state change
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

    start(){
        // Don't start if already running
        if (this.isRunning) return;

        this.isRunning = true; // set timer to running state
        const startTime = Date.now(); // get current time in milliseconds
        const initialRemaining = this.timeRemaining; // store initial time remaining

        this.interval = setInterval(() => {
            const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000); // calculate elapsed time in seconds
            this.timeRemaining = Math.max(0, initialRemaining - elapsedSeconds); // update time remaining, ensuring it doesn't go below 0

            //Timer completed
            if(this.timeRemaining === 0){
                this.stop(); // stop the timer
                this.handleTimerComplete();
            }

            this.notifyListeners();
        }, 1000); // update every second
        
        this.notifyListeners(); // notify listeners of state change
    }

    stop(){
        if (!this.isRunning) return; // do nothing if timer is not running

        this.isRunning = false; // set timer to not running state
        clearInterval(this.interval); // clear the interval
        this.interval = null; // reset interval ID
        this.notifyListeners(); // notify listeners of state change
    }

    reset(){
        this.stop(); // stop the timer
        this.timeRemaining = this.modes[this.currentMode]; // reset time remaining to current mode
        this.notifyListeners(); // notify listeners of state change
    }

    handleTimerComplete(){
        //play notification sound
        const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3'); 
        audio.play(); // play the notification sound

        //After completing a pomodoro, move to break mode
        if(this.currentMode === 'promodoro'){
            this.promodoroCount++; 
            //check if it's time for a long break
            if(this.promodoroCount % 4 === 0){
                this.setMode('longBreak'); // switch to long break mode
            }
            else{
                this.setMode('shortBreak'); // switch to short break mode
            }
        }else{
            this.setMode('promodoro'); // switch back to pomodoro mode
        }
    }

    getTimeForDisplay(){
        const minutes = Math.floor(this.timeRemaining / 60); // calculate minutes
        const seconds = this.timeRemaining % 60; // calculate seconds
        return {
            minutes: String(minutes).padStart(2, '0'),
            seconds: String(seconds).padStart(2, '0')
        }; // format time as MM:SS
    }
    
    getProgressPercentage(){
        const totalTime = this.modes[this.currentMode]; // get total time for current mode
        return ((totalTime - this.timeRemaining) / totalTime) * 100; // calculate progress percentage
    }
}


