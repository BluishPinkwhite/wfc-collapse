
// @author Tammie Hladilů
// 26.11.2023


let workerChanges = [];
// amount of WORKER_FINISHED packets in workerChanges, when 0 or 1, a worker is simulating, when 2, the main loop here waits
let workerFinishes = 0;

// if the worker start interval is waiting
let newWorkerWaiting = false;
let activeWorkers = [];


function startWorker() {
    if (window.Worker) {
        const worker = new Worker(URL.createObjectURL(new Blob(["("+workerCode.toString()+")()"], {type: 'text/javascript'})));

        activeWorkers.push(worker);

        worker.postMessage({
            command: consts.worker.START,
            consts,
            config,
            allTiles: tileSet.tiles
        });


        worker.onmessage = function(ev) {
            ev = ev.data;

            // worker finished -> start working on next simulation
            if(ev.command == consts.worker.WORKER_FINISHED) {
                activeWorkers.splice(activeWorkers.indexOf(worker), 1);
                
                // get all changes from worker simulation
                workerChanges.push(...ev.allChanges);

                console.log(ev.statistics);

                // track finish, when below 2, start new worker
                workerFinishes++;
                workerChanges.push([{
                    command: consts.worker.WORKER_FINISHED
                }])
                newWorkerWaiting = true;

                // do nothing, wait till visualisation finishes to start a new worker
                let interval = setInterval(() => {
                    if(workerFinishes < 1) {
                        newWorkerWaiting = false;

                        startWorker();
                        clearInterval(interval);
                        console.log("Visualisation not throttled - starting new worker!");
                    }
                    else {
                        console.log("   Waiting for simulation to finish");
                    }
                }, config.speed * 25 + 10);
            }
        }
    } else {
        console.log('Your device doesn\'t support web workers, crap.');
    }
}

startWorker()