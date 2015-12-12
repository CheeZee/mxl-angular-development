(function () {
    angular.module('sociocortex', ['ngStorage', 'ngResource']);

    var SC_DEFAULT_URI = 'http://server.sociocortex.com';

    // Initiate with default value
    angular.module('sociocortex').value('scConnection', {
        baseUri: SC_DEFAULT_URI,
        apiVersion: 'v1'        
    });

    angular.module('sociocortex').config(['$sceDelegateProvider', function ($sceDelegateProvider) {
        $sceDelegateProvider.resourceUrlWhitelist(['self', SC_DEFAULT_URI + '/api/**']);
    }]);
})();
