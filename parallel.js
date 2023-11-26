
// @author Tammie Hladilů
// 26.11.2023


let workerChanges = [];
// amount of WORKER_FINISHED packets in workerChanges, when 0 or 1, a worker is simulating, when 2, the main loop here waits
let workerFinishes = 0;


function startWorker() {
    if (window.Worker) {
        const myWorker = new Worker(URL.createObjectURL(new Blob(["("+workerCode.toString()+")()"], {type: 'text/javascript'})));

        myWorker.postMessage({
            command: consts.worker.START,
            consts,
            config,
            allTiles
        });
        // console.log('Created new worker and start message posted...');


        myWorker.onmessage = function(ev) {
            ev = ev.data;

            // console.log('Message received from worker: ' + ev.command);

            // worker step done, save data
            if(ev.command == consts.worker.STEP_COMPLETE) {
                workerChanges.push(ev.changes);
            }

            // worker finished -> start working on next simulation
            else if(ev.command == consts.worker.WORKER_FINISHED) {

                // track finish, when below 2, start new worker
                workerFinishes++;
                workerChanges.push([{
                    command: consts.worker.WORKER_FINISHED
                }])

                // do nothing, wait till visualisation finishes to start a new worker
                let interval = setInterval(() => {
                    if(workerFinishes < 2) {
                        startWorker();
                        clearInterval(interval);
                        console.log("Visualisation not throttled - starting new worker!");
                    }
                    else {
                        console.log("   Waiting for simulation to finish");
                    }
                }, config.speed * 25);
            }
        }
    } else {
        console.log('Your device doesn\'t support web workers, crap.');
    }
}

startWorker()