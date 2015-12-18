/**
 * @license sc-angular v0.6.4
 * (c) 2015 Sebis
 * License: Sebis Proprietary
 * https://bitbucket.org/sebischair/sc-angular
 */
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

(function () {
    angular.module('sociocortex').service('scData', ['$resource', 'scUtil', 'scAuth', function scCrudService($resource, scUtil, scAuth) {
        scAuth.setAuthorizationHeader();

        var Entity = $resource(scUtil.getFullUrl(scUtil.paths.entities + "/:id"),
            {
                id: "@id"
            },
            {
                update: {
                    method: "PUT"
                },
                queryByEntityType: {
                    method: "GET",
                    url: scUtil.getFullUrl(scUtil.paths.entityTypes + "/:id/" + scUtil.paths.entities),
                    isArray: true
                },
                queryByWorkspace: {
                    method: "GET",
                    url: scUtil.getFullUrl(scUtil.paths.workspaces + "/:id/" + scUtil.paths.entities),
                    isArray: true
                },
                getAttributes: {
                    method: "GET",
                    url: scUtil.getFullUrl(scUtil.paths.entities + "/:id/" + scUtil.paths.attributes),
                    isArray: true
                },
                getFiles: {
                    method: "GET",
                    url: scUtil.getFullUrl(scUtil.paths.entities + "/:id/" + scUtil.paths.files),
                    isArray: true
                }
            });

        // turns this: '{ "attributes": [{ "values": [ 18.4 ], "name": "Price", "type": "number" }]}'
        // into this:  '{ "attributes": { "Price": 18.4 }}' 
        Entity.objectifyAttributes = function (x) {
            if (angular.isArray(x)) {
                var unwrappedEntities = [];
                for (var i = 0; i < x.length; i++) {
                    unwrappedEntities.push(unwrapEntity(x[i]));
                }
                return unwrappedEntities;
            } else {
                return unwrapEntity(x);
            }

            function unwrapEntity(entity) {

                if (!entity.attributes) {
                    entity.attributes = {};
                }

                if (angular.isArray(entity.attributes)) {
                    var unwrappedAttributes = {};
                    angular.forEach(entity.attributes, function (currAttr) {
                        unwrappedAttributes[currAttr.name] = currAttr.values.length === 1 ? currAttr.values[0] : currAttr.values;
                    });
                    entity.attributes = unwrappedAttributes;
                }

                return entity;
            }
        };

        // turns this:  '{ "attributes": { "Price": 18.4 }}' 
        // into this: '{ "attributes": [{ "values": [ 18.4 ], "name": "Price"}]}'
        Entity.arrayifyAttributes = function (x) {
            if (angular.isArray(x)) {
                var wrappedEntities = [];
                for (var i = 0; i < x.length; i++) {
                    wrappedEntities.push(wrapEntity(x[i]));
                }
                return wrappedEntities;
            } else {
                return wrapEntity(x);
            }

            function wrapEntity(entity) {

                if (!entity.attributes) {
                    entity.attributes = [];
                }

                if (angular.isObject(entity.attributes)) {
                    var wrappedAttributes = [];
                    angular.forEach(entity.attributes, function (value, name) {
                        if (angular.isUndefined(value) || value == null) {
                            wrappedAttributes.push({ name: name, values: [] });
                        } else if (angular.isArray(value)) {
                            wrappedAttributes.push({ name: name, values: value });
                        } else {
                            wrappedAttributes.push({ name: name, values: [value] });
                        }
                    });

                    entity.attributes = wrappedAttributes;
                }

                return entity;
            }
        };

        delete Entity.query;

        var Workspace = $resource(scUtil.getFullUrl(scUtil.paths.workspaces + "/:id"),
            {
                id: "@id"
            },
            {
                update: {
                    method: "PUT"
                },
                getEntities: {
                    method: "GET",
                    url: scUtil.getFullUrl(scUtil.paths.workspaces + "/:id/" + scUtil.paths.entities),
                    isArray: true
                },
                getEntityTypes: {
                    method: "GET",
                    url: scUtil.getFullUrl(scUtil.paths.workspaces + "/:id/" + scUtil.paths.entityTypes),
                    isArray: true
                }
            });

        var Attribute = $resource(scUtil.getFullUrl(scUtil.paths.attributes + "/:id"),
            {
                id: "@id"
            },
            {
                update: {
                    method: "PUT"
                },
                queryByEntity: {
                    method: "GET",
                    url: scUtil.getFullUrl(scUtil.paths.entities + "/:id/" + scUtil.paths.attributes),
                    isArray: true
                }
            });

        delete Attribute.query;

        var File = $resource(scUtil.getFullUrl(scUtil.paths.files + "/:id"),
            {
                id: "@id"
            },
            {
                update: {
                    method: "PUT"
                },
                queryByEntity: {
                    method: "GET",
                    url: scUtil.getFullUrl(scUtil.paths.entities + "/:id/" + scUtil.paths.files),
                    isArray: true
                },
                download: {
                    method: "GET",
                    url: scUtil.getFullUrl(scUtil.paths.files + "/:id/content")
                }
            });

        delete File.query;

        var Task = $resource(scUtil.getFullUrl(scUtil.paths.tasks + "/:id"),
            {
                id: "@id"
            },
            {
                update: {
                    method: "PUT"
                },
                getAttributes: {
                    method: "GET",
                    url: scUtil.getFullUrl(scUtil.paths.tasks + "/:id/" + scUtil.paths.attributes),
                    isArray: true
                }
            });

        var Expertise = $resource(scUtil.getFullUrl(scUtil.paths.expertises + "/:id"),
            {
                id: "@id"
            },
            {
                update: {
                    method: "PUT"
                }
            });

        return {
            Entity: Entity,
            File: File,
            Workspace: Workspace,
            Attribute: Attribute,
            Task: Task,
            Expertise: Expertise
        };
    }]);
})();

(function () {
    angular.module('sociocortex').service('scModel', ['$resource', 'scUtil', 'scAuth', function scCrudService($resource, scUtil, scAuth) {
        scAuth.setAuthorizationHeader();

        var EntityType = $resource(scUtil.getFullUrl(scUtil.paths.entityTypes + "/:id"),
            {
                id: "@id"
            },
            {
                update:
                    {
                        method: "PUT"
                    },
                queryByWorkspace:
                    {
                        method: "GET",
                        url: scUtil.getFullUrl(scUtil.paths.workspaces + "/:id/" + scUtil.paths.entityTypes),
                        isArray: true
                    },
                getAttributeDefinitions:
                   {
                       method: "GET",
                       url: scUtil.getFullUrl(scUtil.paths.entityTypes + "/:id/" + scUtil.paths.attributeDefinitions),
                       isArray: true
                   },
                getEntities: {
                    method: "GET",
                    url: scUtil.getFullUrl(scUtil.paths.entityTypes + "/:id/" + scUtil.paths.entities),
                    isArray: true
                },
            });

        delete EntityType.query;

        var AttributeDefinition = $resource(scUtil.getFullUrl(scUtil.paths.attributeDefinitions + "/:id"),
           {
               id: "@id"
           },
           {
               update:
                    {
                        method: "PUT"
                    },
               queryByEntityType:
                   {
                       method: "GET",
                       url: scUtil.getFullUrl(scUtil.paths.entityTypes + "/:id/" + scUtil.paths.attributeDefinitions),
                       isArray: true
                   }
           });

        delete AttributeDefinition.query;

        return {
            EntityType: EntityType,
            AttributeDefinition: AttributeDefinition
        };
    }]);
})();

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

            if (angular.isUndefined(p1) || angular.isObject(p1)) {
                context = p1;

                if (angular.isString(p2)) {
                    restriction = p2;
                    callback = p3;
                    error = p4;
                }
                else {
                    callback = p2;
                    error = p3;
                }

            } else {
                if (angular.isString(p1)) {
                    restriciton = p1;
                    callback = p2;
                    error = p3;
                } else {
                    callback = p1;
                    error = p2;
                }
            }

            var cacheKey = "hints";

            if (context) {
                cacheKey += "#" + JSON.stringify(context);
            }

            if (restriction) {
                cacheKey += "#" + restriction;
            }

            var cachedHints = autoCompleteCache.get(cacheKey);

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
                autoCompleteCache.put(cacheKey, res);

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

            if (angular.isObject(p2)) {
                context = p1;
                data = p2;
                callback = p3;
                error = p4;
            } else if (angular.isObject(p1)) {
                data = p1;
                callback = p2;
                error = p3;
            } else {
                callback = p1;
                error = p2;
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

            if (angular.isObject(p2)) {
                context = p1;
                data = p2;
                callback = p3;
                error = p4;
            } else if (angular.isObject(p1)) {
                data = p1;
                callback = p2;
                error = p3;
            } else {
                callback = p1;
                error = p2;
            }

            var deferred = $q.defer();

            mxlRequest({
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

(function () {
    angular.module('sociocortex').service('scPrincipal', ['$resource', 'scUtil', 'scAuth', function scCrudService($resource, scUtil, scAuth) {
        scAuth.setAuthorizationHeader();

        var User = $resource(scUtil.getFullUrl(scUtil.paths.users + "/:id"),
            {
                id: "@id"
            },
            {
                update:
                    {
                        method: "PUT"
                    },
                picture: {
                    method: "GET",
                    url: scUtil.getFullUrl(scUtil.paths.users + "/:id/picture")
                },
                me: {
                    method: "GET",
                    url: scUtil.getFullUrl(scUtil.paths.usersMe)
                },
                myPicture: {
                    method: "GET",
                    url: scUtil.getFullUrl(scUtil.paths.usersMe + "/picture")
                }
            });

        var Group = $resource(scUtil.getFullUrl(scUtil.paths.groups + "/:id"),
           {
               id: "@id"
           },
           {
               update:
                    {
                        method: "PUT"
                    }
           });

        return {
            User: User,
            Group: Group
        };
    }]);
})();

(function () {
    angular.module('sociocortex').service('scUtil', scUtil);

    scUtil.$inject = ['scConnection'];
    function scUtil(scConnection) {

        var paths = getPaths();

        return {
            getFullUrl: getFullUrl,
            getRelativeUrl: getRelativeUrl,
            paths: paths,
            isEntity: isOfType(paths.entities),
            isTask: isOfType(paths.tasks),
            isAttribute: isOfType(paths.attributes),
            isFile: isOfType(paths.files),
            isEntityType: isOfType(paths.entityTypes),
            isTaskDefinition: isOfType(paths.taskDefinitions),
            isAttributeDefinition: isOfType(paths.attributeDefinitions),
            isWorkspace: isOfType(paths.workspaces),
            isUser: isOfType(paths.users),
            isGroup: isOfType(paths.groups),
            isDerivedAttributeDefinition: isOfType(paths.derivedAttributeDefinitions),
            isCustomFunction: isOfType(paths.customFunctions)
        };

        function isOfType(type) {
            return function isOfTypeFunction(obj) {
                return angular.isObject(obj) && obj.href && obj.href.indexOf('/' + type + '/') > 0;
            }
        }

        function combinePaths(str1, str2) {
            if (str1.charAt(str1.length - 1) === '/') {
                str1 = str1.substr(0, str1.length - 1);
            }

            if (str2.charAt(0) === '/') {
                str2 = str2.substr(1, scConnection.baseUri.length - 1);
            }

            return str1 + '/' + str2;
        }

        function getRelativeUrl(link) {
            if (isLinkObject(link)) {
                link = link.href;
            } else if (!angular.isString(link)) {
                throw new TypeError("The parameter must be a of type 'link object' or 'string'");
            }

            var prefix = getFullUrl('');
            if (link.indexOf(prefix) !== 0) {
                throw new Error('The given URL does not start with the proper prefix of "' + prefix + "'");
            } else {
                // if 1 is subtracted the returned url will contain a prefixed slash
                return link.substr(prefix.length - 1);
            }
        }

        function isLinkObject(link) {
            return angular.isObject(link)
                && !!link.id
                && !!link.href
                && !!link.name;
        }

        function getFullUrl(urlPart) {
            return combinePaths(combinePaths(scConnection.baseUri, 'api/' + scConnection.apiVersion), urlPart);
        }

        function getPaths() {
            return {
                entities: 'entities',
                attributes: 'attributes',
                files: 'files',
                entityTypes: 'entityTypes',
                attributeDefinitions: 'attributeDefinitions',
                workspaces: 'workspaces',
                users: 'users',
                usersMe: 'users/me',
                groups: 'groups',
                derivedAttributeDefinitions: 'derivedAttributeDefinitions',
                customFunctions: 'customFunctions',
                tasks: 'tasks',
                taskDefinitions: 'taskDefinitions',
                expertises: 'expertises'
            };
        }
    }
})();
