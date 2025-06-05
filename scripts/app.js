import TimerModel from './models/TimerModel.js'
import TimerView from './views/TimerView.js';
import TimerController from './controllers/TimerController.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the MVC components
    const model = new TimerModel();
    const view = new TimerView();
    const controller = new TimerController(model, view);
});


