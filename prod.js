const EPC = require('./index');

const knownDevices = [
    {
        senderId: '0181383F',
        eep: 'a5-02-05'
    },
    {
        senderId: '0181CB4B',
        eep: 'a5-02-05'
    },
]

const epc = new EPC({knownDevices: knownDevices});

epc.on('epc-error', err => {
    console.log(err);
});

epc.on('new-device', device => {
    console.log(device);
});

epc.on('known-device', device => {
    console.log(device);
});

console.log('Open port');

epc.open();