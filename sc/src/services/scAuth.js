(function () {
    angular.module('sociocortex').service('scAuth', ['$localStorage', '$q', '$http', 'scUtil', function scAuthentication($localStorage, $q, $http, scUtil) {
        return {
            getUser: getUserDetails,
            login: login,
            logout: logout,
            isAuthenticated: isAuthenticated,
            setAuthorizationHeader: setAuthorizationHeader
        };

        function getUserDetails() {
            return $localStorage.userDetails;
        }

        function login(user, password, callback, error) {
            $localStorage.credentials = {
                user: user,
                password: password
            };

            var deferred = $q.defer();

            requestCurrentUser().then(function (res) {
                $localStorage.userDetails = res.data;

                if (callback && angular.isFunction(callback)) {
                    res = callback(res.data);
                } else {
                    res = res.data;
                }

                deferred.resolve(res);
            }, function (err) {
                delete $localStorage.credentials;
                delete $localStorage.userDetails;

                if (error && angular.isFunction(error)) {
                    err = error(err);
                }

                deferred.reject(err);
            });

            return deferred.promise;
        }

        function requestCurrentUser() {
            setAuthorizationHeader();
            return $q(function performRequest(resolve, reject) {
                $http({
                    url: scUtil.getFullUrl(scUtil.paths.usersMe),
                    method: 'GET'
                }).then(resolve, reject);
            });
        }

        function logout() {
            delete $localStorage.credentials;
            delete $localStorage.userDetails;
        }

        function isAuthenticated() {
            return !!$localStorage.userDetails;
        }

        function setAuthorizationHeader() {
            if ($localStorage.credentials) {
                $http.defaults.headers.common.Authorization = 'Basic ' + window.btoa('' + $localStorage.credentials.user + ':' + $localStorage.credentials.password);
            }
            else {
                delete $http.defaults.headers.common.Authorization;
            }
        }
    }]);
})();
