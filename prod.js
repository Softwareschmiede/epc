const EPC = require('./index');

const epc = new EPC();

epc.on('epc-error', err => {
    console.log(err);
});

epc.on('new-device', device => {
    console.log(device);
});

epc.on('known-device', device => {
    console.log(device);
});

epc.open();