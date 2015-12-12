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
