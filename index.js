'use strict';

const EventEmitter = require('events');

const SerialPort = require('serialport');
const ERPParser = require('erp-parser');
const EEPParser = require('eep-parser');

const _config = {};
// var _knownDevices = null;
var _eepParser = null;
var _learnMode = false;
var _serialport = null;

class EPC extends EventEmitter {
    constructor(options) {
        super();

        if (options === undefined || options === null) {
            options = {};
        }

        _config.port = options.port ? options.port : '/dev/ttyS3';
        _config.baudrate = options.baudrate ? options.baudrate : 57600;
        _config.baseId = options.baseId ? options.baseId : '00000000';

        const knownDevices = options.knownDevices ? options.knownDevices : [];

        _eepParser = new EEPParser({knownDevices: knownDevices});
        console.log(_eepParser.getDevices());
        _serialport = new SerialPort(_config.port, { baudRate: _config.baudrate, autoOpen: false });
    }

    startLearnMode() {
        _learnMode = true;
    }

    stopLearnMode() {
        _learnMode = false;
    }

    addKnownDevice(senderId, eep) {
        if (senderId && eep) {
            _eepParser.addDevice(senderId, eep);
        }
    }

    // setKnownDevices(knownDevices) {
    //     _knownDevices = knownDevices;
    // }

    open() {
        const parser = new ERPParser();
        _serialport.pipe(parser);

        _serialport.open((err) => {
            if (err) {
                this.emit('esp-error', err);
            }
        });

        console.log('Waiting for imput');

        parser.on('data', (buf) => {
            const packet = _eepParser.parse(buf);

            console.log(packet);

            if (_learnMode && packet && packet.learnMode) {
                console.log(packet);
                this.emit('new-device', packet);
            } else if (packet && !packet.learnMode) {
                console.log(packet);
                this.emit('known-device', packet);
            } else {
                // TODO: Device unknown
                console.log(packet);
            }
        });
    }

    write() {
        //_serialport.write();

    }
}

module.exports = EPC;