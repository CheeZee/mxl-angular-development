var MAX_TIME_MS = 3000;

function log(logValue) {

    var logPrefix = ">>>>>>>>>>>>>>>>> ";

    if(angular.isArray(logValue)) {
        for (var i = 0; i < logValue.length; i++) {
            console.log(logPrefix + "[" + i + "]: " + JSON.stringify(logValue[i]));
        }
    } else {
        console.log(logPrefix + JSON.stringify(logValue));
    }
}