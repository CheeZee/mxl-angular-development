(function () {
    angular.module('sociocortex').service('scUtil', ['scConnection', function scCore(scConnection) {
        return {
            getFullUrl: function (urlPart) {
                return combinePaths(combinePaths(scConnection.baseUri, 'api/' + scConnection.apiVersion), urlPart);
            },
            paths:
                {
                    entities: 'entities',
                    attributes: 'attributes',
                    entityTypes: 'entityTypes',
                    attributeDefinitions: 'attributeDefinitions',
                    workspaces: 'workspaces',
                    users: 'users',
                    usersMe: 'users/me',
                    groups: 'groups',
                    derivedAttributeDefinitions: 'derivedAttributeDefinitions',
                    customFunctions: 'customFunctions'
                },
            isEntity: function (obj) { return isOfType(obj, this.paths.entities); },
            isAttribute: function (obj) { return isOfType(obj, this.paths.attributes); },
            isEntityType: function (obj) { return isOfType(obj, this.paths.entityTypes); },
            isAttributeDefinition: function (obj) { return isOfType(obj, this.paths.attributeDefinitions); },
            isWorkspace: function (obj) { return isOfType(obj, this.paths.workspaces); },
            isUser: function (obj) { return isOfType(obj, this.paths.users); },
            isGroup: function (obj) { return isOfType(obj, this.paths.groups); },
            isDerivedAttributeDefinition: function (obj) { return isOfType(obj, this.paths.derivedAttributeDefinitions); },
            isCustomFunction: function (obj) { return isOfType(obj, this.paths.customFunctions); }
        };

        function isOfType(obj, type) {
            return angular.isObject(obj) && obj.href && obj.href.indexOf('/' + type + '/') > 0;
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
    }]);
})();
