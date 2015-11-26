(function () {
    angular.module('sociocortex').service('scData', ['$resource', 'scUtil', 'scAuth', function scCrudService($resource, scUtil, scAuth) {
        scAuth.setAuthorizationHeader();

        var Entity = $resource(scUtil.getFullUrl(scUtil.paths.entities + "/:id"),
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
                        url: scUtil.getFullUrl(scUtil.paths.entityTypes + "/:id/" + scUtil.paths.entities),
                        isArray: true
                    },
                queryByWorkspace:
                    {
                        method: "GET",
                        url: scUtil.getFullUrl(scUtil.paths.workspaces + "/:id/" + scUtil.paths.entities),
                        isArray: true
                    },
                getAttributes:
                   {
                       method: "GET",
                       url: scUtil.getFullUrl(scUtil.paths.entities + "/:id/" + scUtil.paths.attributes),
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
                
                if(!entity.attributes){
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

                        if (angular.isArray(value)) {
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
               update:
                    {
                        method: "PUT"
                    },
               getEntities:
                   {
                       method: "GET",
                       url: scUtil.getFullUrl(scUtil.paths.workspaces + "/:id/" + scUtil.paths.entities),
                       isArray: true
                   },
               getEntityTypes:
                   {
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
               update:
                    {
                        method: "PUT"
                    },
               queryByEntity:
                    {
                        method: "GET",
                        url: scUtil.getFullUrl(scUtil.paths.entities + "/:id/" + scUtil.paths.attributes),
                        isArray: true
                    }
           });

        delete Attribute.query;

        return {
            Entity: Entity,
            Workspace: Workspace,
            Attribute: Attribute
        };
    }]);
})();
