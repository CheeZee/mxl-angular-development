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
