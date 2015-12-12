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
