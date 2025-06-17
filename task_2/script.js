class Stopwatch {
    constructor() {
        this.startTime = 0;
        this.elapsedTime = 0;
        this.isRunning = false;
        this.intervalId = null;
        this.lapCount = 0;
        
        this.initializeElements();
        this.attachEventListeners();
    }
    
    initializeElements() {
        this.minutesDisplay = document.getElementById('minutes');
        this.secondsDisplay = document.getElementById('seconds');
        this.millisecondsDisplay = document.getElementById('milliseconds');
        this.startBtn = document.getElementById('startBtn');
        this.lapBtn = document.getElementById('lapBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.lapList = document.getElementById('lapList');
    }
    
    attachEventListeners() {
        this.startBtn.addEventListener('click', () => this.toggleStopwatch());
        this.lapBtn.addEventListener('click', () => this.recordLap());
        this.resetBtn.addEventListener('click', () => this.reset());
    }
    
    toggleStopwatch() {
        if (this.isRunning) {
            this.stop();
        } else {
            this.start();
        }
    }
    
    start() {
        this.startTime = Date.now() - this.elapsedTime;
        this.isRunning = true;
        this.intervalId = setInterval(() => this.updateDisplay(), 10);
        
        this.startBtn.textContent = 'Stop';
        this.startBtn.className = 'btn stop';
        this.lapBtn.disabled = false;
    }
    
    stop() {
        this.isRunning = false;
        clearInterval(this.intervalId);
        
        this.startBtn.textContent = 'Start';
        this.startBtn.className = 'btn start';
        this.lapBtn.disabled = true;
    }
    
    reset() {
        this.stop();
        this.elapsedTime = 0;
        this.lapCount = 0;
        this.updateDisplay();
        this.clearLaps();
        
        this.startBtn.textContent = 'Start';
        this.startBtn.className = 'btn start';
        this.lapBtn.disabled = true;
    }
    
    updateDisplay() {
        if (this.isRunning) {
            this.elapsedTime = Date.now() - this.startTime;
        }
        
        const time = this.formatTime(this.elapsedTime);
        this.minutesDisplay.textContent = time.minutes;
        this.secondsDisplay.textContent = time.seconds;
        this.millisecondsDisplay.textContent = time.milliseconds;
    }
    
    formatTime(timeInMs) {
        const totalSeconds = Math.floor(timeInMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = Math.floor((timeInMs % 1000) / 10);
        
        return {
            minutes: minutes.toString().padStart(2, '0'),
            seconds: seconds.toString().padStart(2, '0'),
            milliseconds: milliseconds.toString().padStart(2, '0')
        };
    }
    
    recordLap() {
        if (!this.isRunning) return;
        
        this.lapCount++;
        const lapTime = this.formatTime(this.elapsedTime);
        const lapTimeString = `${lapTime.minutes}:${lapTime.seconds}:${lapTime.milliseconds}`;
        
        if (this.lapList.querySelector('.no-laps')) {
            this.lapList.innerHTML = '';
        }
        
        const lapItem = document.createElement('div');
        lapItem.className = 'lap-item';
        lapItem.innerHTML = `
            <span class="lap-number">Lap ${this.lapCount}</span>
            <span class="lap-time">${lapTimeString}</span>
        `;
        
        this.lapList.insertBefore(lapItem, this.lapList.firstChild);
    }
    
    clearLaps() {
        this.lapList.innerHTML = '<p class="no-laps">No lap times recorded</p>';
    }
}

// Initialize the stopwatch when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Stopwatch();
});
