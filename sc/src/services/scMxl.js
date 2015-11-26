(function () {
    angular.module('sociocortex').service('scMxl', ['$cacheFactory', '$q', '$http', 'scAuth', 'scUtil', function scMxlService($cacheFactory, $q, $http, scAuth, scUtil) {
        var autoCompleteCache = $cacheFactory('mxlAutoCompleteCache');
        scAuth.setAuthorizationHeader();

        return {
            autoComplete: autoComplete,
            query: query,
            validate: validate
        };

        function autoComplete(p1, p2, p3, p4) {
            var context, restriction, callback, error;

            if (angular.isObject(p1)) {
                context = p1;

                if (angular.isString(p2)) {
                    restriction = p2;
                    callback = p3;
                    error = p4;
                } else {
                    callback = p2;
                    error = p3;
                }
            } else if (angular.isString(p1)) {
                restriciton = p1;
                callback = p2;
                error = p3;
            } else if (angular.isFunction(p1)) {
                callback = p1;
                error = p2;
            } else {
                context = p1;
                restriction = p2;
                callback = p3;
                error = p4;
            }

            var cachedHints = autoCompleteCache.get(JSON.stringify(context));

            var deferred = $q.defer();

            if (cachedHints) {
                return deferred.resolve(cachedHints);
            }

            mxlRequest({
                httpMethod: 'GET',
                context: context,
                mxlMethod: 'mxlAutoCompletionHints',
                params: { restrict: restriction }
            }, function (res) {
                autoCompleteCache.put(JSON.stringify(context), res);

                if (callback && angular.isFunction(callback)) {
                    res = callback(res);
                }

                deferred.resolve(res);
            }, function (err) {
                if (error && angular.isFunction(error)) {
                    err = error(err);
                }
                deferred.reject(err);
            });
            return deferred.promise;
        }

        function query(p1, p2, p3, p4) {
            var context, data, callback, error;

            if (angular.isObject(p1) && angular.isObject(p2)) {
                context = p1;
                data = p2;
                callback = p3;
                error = p4;
            } else if (angular.isObject(p1) && angular.isFunction(p2)) {
                data = p1;
                callback = p2;
                error = p3;
            } else {
                context = p1;
                restriction = p2;
                callback = p3;
                error = p4;
            }

            var deferred = $q.defer();

            mxlRequest({
                httpMethod: 'POST',
                context: context,
                mxlMethod: 'mxlQuery',
                data: data
            }, function (res) {
                if (callback && angular.isFunction(callback)) {
                    res = callback(res);
                }

                deferred.resolve(res);
            }, function (err) {
                if (error && angular.isFunction(error)) {
                    err = error(err);
                }
                deferred.reject(err);
            });
            return deferred.promise;
        }

        function validate(p1, p2, p3, p4) {
            var context, data, callback, error;

            if (angular.isObject(p1) && angular.isObject(p2)) {
                context = p1;
                data = p2;
                callback = p3;
                error = p4;
            } else if (angular.isObject(p1) && angular.isFunction(p2)) {
                data = p1;
                callback = p2;
                error = p3;
            } else {
                context = p1;
                restriction = p2;
                callback = p3;
                error = p4;
            }

            var deferred = $q.defer();

            return mxlRequest({
                httpMethod: 'POST',
                context: context,
                mxlMethod: 'mxlValidation',
                data: data
            }, function (res) {
                if (callback && angular.isFunction(callback)) {
                    res = callback(res);
                }

                deferred.resolve(res);
            }, function (err) {
                if (error && angular.isFunction(error)) {
                    err = error(err);
                }
                deferred.reject(err);
            });
            return deferred.promise;
        }

        function mxlRequest(options, callback, error) {
            var path = '';

            if (options.context) {
                if (options.context.entity) {
                    path = scUtil.paths.entities + '/' + options.context.entity.id + '/';
                } else if (options.context.entityType) {
                    path = scUtil.paths.entityTypes + '/' + options.context.entityType.id + '/';
                } else if (options.context.workspace) {
                    path = scUtil.paths.workspaces + '/' + options.context.workspace.id + '/';
                }
            }

            path = scUtil.getFullUrl(path + options.mxlMethod);

            return $http({
                method: options.httpMethod,
                url: path,
                data: options.data,
                params: options.params
            }).then(function (res) {
                return callback(res.data);
            }, function (res) {
                if (error) {
                    return error(res.data);
                }
            });
        }
    }]);


})();
