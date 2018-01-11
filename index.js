'use strict';

const EventEmitter = require('events');

const SerialPort = require('serialport');
const ERPParser = require('erp-parser');
const EEPParser = require('eep-parser');

const _config = {};
var _knownDevices = null;
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

        _knownDevices = options.knownDevices ? options.knownDevices : [];
        _serialport = new SerialPort(_config.port, { baudRate: _config.baudrate, autoOpen: false });
    }

    startLearnMode() {
        _learnMode = true;
    }

    stopLearnMode() {
        _learnMode = false;
    }

    addKnownDevice(senderId, eep) {
        if (senderId && eep && _knownDevices.find((device) => { return device.senderId === senderId; }) === undefined) {
            _knownDevices.push({senderId: senderId, eep: eep}); // Add error handling (senderId exists)
        }
    }

    setKnownDevices(knownDevices) {
        _knownDevices = knownDevices;
    }

    open() {
        const parser = new ESP3Parser();
        _serialport.pipe(parser);

        _serialport.open((err) => {
            if (err) {
                this.emit('esp-error', err);
            }
        });

        parser.on('data', (buf) => {

            const eepParser = new EEPParser();
            eepParser.addDevices(_knownDevices);

            const packet = eepParser.parse(buf);

            if (_learnMode && packet && packet.learnMode) {
                this.emit('new-device', packet);
            } else if (packet && !packet.learnMode) {
                this.emit('known-device', packet);
            } else {
                console.log(packet);
            }
        });
    }

    write() {
        //_serialport.write();

    }
}

module.exports = EPC;