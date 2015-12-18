describe('scModel (write access)', function () {
    var tester, scAuth, scModel;

    beforeEach(function () {
        tester = ngMidwayTester('sociocortex');
        tester.inject('scConnection').baseUri = 'http://localhost:8083/intern/tricia';

        scAuth = tester.inject('scAuth');
        scModel = tester.inject('scModel');


        scAuth.login('mustermann@test.sc', 'ottto');
    });

    afterEach(function () {
        scAuth.logout();
        tester.destroy();
        tester = null;
    });

    describe('entityTypes', function () {
        it('Create, edit, and delete Service entity type', function (done) {
            scModel.EntityType.save({ name: 'Service', namePlural: 'Services', workspace: { id: 'northwind' } }, function (service) {
                expect(service.id).toBeString();
                expect(service.name).toEqual('Service');
                expect(service.namePlural).toEqual('Services');
                expect(service.workspace.id).toEqual('northwind');

                scModel.EntityType.update(service, { namePlural: 'Multiple Services' }, function (service) {
                    expect(service.namePlural).toEqual('Multiple Services');

                    scModel.AttributeDefinition.save({ name: 'Provider', entityType: service, multiplicity: 'atLeastOne', attributeType: 'Link', options: { entityType: { id: 'nwsupplier' } } }, function (provider) {
                        expect(provider).toBeDefined();
                        expect(provider.name).toEqual('Provider');
                        expect(provider.multiplicity).toEqual('atLeastOne');
                        expect(provider.attributeType).toEqual('Link');
                        expect(provider.options).toBeDefined();
                        expect(provider.options.entityType.id).toEqual('nwsupplier');
                        expect(provider.options.resourceType).toEqual('entities');

                        scModel.EntityType.delete(service, function (result) {
                            expect(result.success).toBeTrue();
                            done();
                        });

                    });
                });

               

            });

        }, MAX_TIME_MS);

    });

    describe('attributeDefinitions', function () {
        it('Create, edit, and delete additional info attribute definition for product', function (done) {
            scModel.AttributeDefinition.save({ name: 'Additional information', entityType: {id:'nwproduct'}}, function (ai) {
                expect(ai).toBeDefined();
                expect(ai.name).toEqual('Additional information');
                expect(ai.multiplicity).toEqual('maximalOne');
                expect(ai.options).toBeUndefined();
                expect(ai.attributeType).toBeUndefined();

                scModel.AttributeDefinition.update(ai, { multiplicity: 'any' }, function (ai) {
                    expect(ai).toBeDefined();
                    expect(ai.name).toEqual('Additional information');
                    expect(ai.multiplicity).toEqual('any');
                    expect(ai.options).toBeUndefined();
                    expect(ai.attributeType).toBeUndefined();

                    scModel.AttributeDefinition.update(ai, { attributeType: 'Link', options: { entityType: { id: 'nwproduct' } } }, function (ai) {
                        expect(ai).toBeDefined();
                        expect(ai.name).toEqual('Additional information');
                        expect(ai.multiplicity).toEqual('any');
                        expect(ai.options).toBeDefined();
                        expect(ai.options.entityType.id).toEqual('nwproduct');
                        expect(ai.options.resourceType).toEqual('entities');
                        expect(ai.attributeType).toBeDefined();
                        expect(ai.attributeType).toEqual('Link');

                        scModel.AttributeDefinition.update(ai, { attributeType: null }, function (ai) {
                            expect(ai).toBeDefined();
                            expect(ai.name).toEqual('Additional information');
                            expect(ai.multiplicity).toEqual('any');
                            expect(ai.options).toBeUndefined();
                            expect(ai.attributeType).toBeUndefined();

                            scModel.AttributeDefinition.delete(ai, function (result) {
                                expect(result.success).toBeTrue();
                                done();
                            });
                        });
                    });                    
                });
        });
        }, MAX_TIME_MS);
    });

    describe('attributeDefinitions', function () {
        it('Create, edit, and delete additional info attribute definition for product', function (done) {
            scModel.AttributeDefinition.save({ name: 'Additional information', entityType: { id: 'nwproduct' } }, function (ai) {
                expect(ai).toBeDefined();
                expect(ai.name).toEqual('Additional information');
                expect(ai.multiplicity).toEqual('maximalOne');
                expect(ai.options).toBeUndefined();
                expect(ai.attributeType).toBeUndefined();

                scModel.AttributeDefinition.update(ai, { multiplicity: 'any' }, function (ai) {
                    expect(ai).toBeDefined();
                    expect(ai.name).toEqual('Additional information');
                    expect(ai.multiplicity).toEqual('any');
                    expect(ai.options).toBeUndefined();
                    expect(ai.attributeType).toBeUndefined();

                    scModel.AttributeDefinition.update(ai, { attributeType: 'Link', options: { entityType: { id: 'nwproduct' } } }, function (ai) {
                        expect(ai).toBeDefined();
                        expect(ai.name).toEqual('Additional information');
                        expect(ai.multiplicity).toEqual('any');
                        expect(ai.options).toBeDefined();
                        expect(ai.options.entityType.id).toEqual('nwproduct');
                        expect(ai.options.resourceType).toEqual('entities');
                        expect(ai.attributeType).toBeDefined();
                        expect(ai.attributeType).toEqual('Link');

                        scModel.AttributeDefinition.update(ai, { attributeType: null }, function (ai) {
                            expect(ai).toBeDefined();
                            expect(ai.name).toEqual('Additional information');
                            expect(ai.multiplicity).toEqual('any');
                            expect(ai.options).toBeUndefined();
                            expect(ai.attributeType).toBeUndefined();

                            scModel.AttributeDefinition.delete(ai, function (result) {
                                expect(result.success).toBeTrue();
                                done();
                            });
                        });
                    });
                });
            });
        }, MAX_TIME_MS);

        it('Create, edit, and delete JSON attribute definition for supplier', function (done) {
            var def = 'Structure<Street:String, PostalCode:String, City:String>';

            scModel.AttributeDefinition.save({ name: 'Address', entityType: { id: 'nwsupplier' }, multiplicity:'exactlyOne', attributeType: 'json', options: { jsonTypeDefinition: def }}, function (address) {
                expect(address).toBeDefined();
                expect(address.name).toEqual('Address');
                expect(address.multiplicity).toEqual('exactlyOne');
                expect(address.options).toBeDefined();
                expect(address.options.jsonTypeDefinition).toBeDefined();
                expect(address.options.jsonTypeDefinition).toEqual(def);

                scModel.AttributeDefinition.delete(address, function (result) {
                    expect(result.success).toBeTrue();
                    done();
                });
               
        });
        }, MAX_TIME_MS);
    });
});