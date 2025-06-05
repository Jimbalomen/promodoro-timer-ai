import TimerModel from "../models/TimerModel.js";
import TimerView from "../views/TimerView.js";

export default class TimerController {
    constructor(model, view){
        this.model = model;
        this.view = view;

        //Initialize observer pattern
        this.model.addChangeListener(model => this.view.updateDisplay(model));

        //Bind event handlers
        this.view.bindStartStop(this.handleStartStop.bind(this));
        this.view.bindModeSelection(this.handleModeSelection.bind(this));

        //Initial display update
        this.view.updateDisplay(this.model);    
    }

    handleStartStop(action) {
        if (action === 'start') {
            this.model.start();
        } else {
            this.model.stop();
        }
    }

    handleModeSelection(mode) {
        this.model.stop();
        this.model.setMode(mode);
    }
}