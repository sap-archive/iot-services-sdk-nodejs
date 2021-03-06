const IoT = require('./model/IoT');
const IoTAPIService = require('./IoTAPIService');

const iotService = new IoTAPIService();
const iot = new IoT();

/**
 * Returns Promise based Array of Measure </br>
 * It will returns only last 100 readings per sensor-capability </br>
 * @param deviceId
 * @param sensors
 * @param capabilities
 */
function getMeasures({deviceId, sensors, capabilities}) {
    // TODO add filters for sensors and capabilities
    return _callMeasures(deviceId)
}

function _callMeasures(requestedDeviceId) {

    return iotService.list(iot.tenant.sensors,)
        .then((sensors) => {
            return Promise.all(
                sensors
                    .filter(sensor => sensor.deviceId === requestedDeviceId)
                    .map(_getCapabilityId)
            );
        })
        .then(_arrayFlatten)
        .then(entries => {
            return Promise.all(
                entries
                    .map(_getSingleMeasures)
            );
        })
        .then(_arrayFlatten)
        .then(measures => {
            return measures;
        })
}

function _arrayFlatten(arr) {
    return arr.reduce((a1, a2) => a1.concat(a2));
}

function _getSingleMeasures(entry) {

    return iotService.list(iot.tenant.measures, {
        sensorId: entry.sensorId,
        capabilityId: entry.capId
    });
}

function _getCapabilityId(deviceSensor) {
    return iotService.list(iot.tenant.sensorTypes, {
        id: deviceSensor.sensorTypeId
    })
        .then(sensorType => {
            const sensorId = deviceSensor.id;
            const capIds = sensorType.capabilities.map(c => c.id);
            return capIds.map(c => {
                return {
                    sensorId: sensorId,
                    capId: c
                }
            });
        })
}

module.exports.listMeasures = getMeasures;