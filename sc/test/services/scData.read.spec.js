/// <reference path="../../typings/angularjs/angular.d.ts"/>
/// <reference path="../../typings/jasmine/jasmine.d.ts"/>
/// <reference path="../../typings/lodash/lodash.d.ts"/>
/* global inject */
/* global ngMidwayTester */

describe('scData (read access)', function () {
    var tester, scAuth, scData;

    beforeEach(function () {
        tester = ngMidwayTester('sociocortex');
        tester.inject('scConnection').baseUri = 'http://localhost:8083/intern/tricia';

        scAuth = tester.inject('scAuth');
        scData = tester.inject('scData');


        scAuth.login('mustermann@test.sc', 'ottto');
    });

    afterEach(function () {
        scAuth.logout();
        tester.destroy();
        tester = null;
    });

    describe('entities', function () {

        describe('without parameters', function () {

            describe('queryByEntityType', function () {
                it('Retrieving all entities of type Customer in the Northwind workspace', function (done) {
                    scData.Entity.queryByEntityType({ id: 'nwcustomer' }, function (data) {
                        expect(data).toBeDefined();
                        expect(data).toBeArrayOfObjects();
                        expect(data).toBeArrayOfSize(13);

                        var entity = data[0];

                        expect(entity.id).toBeDefined();
                        expect(entity.href).toBeDefined();
                        expect(entity.name).toBeDefined();
                        expect(entity.attributes).toBeUndefined();

                        done();
                    });

                }, MAX_TIME_MS);
            });

            describe('queryAll', function () {
                it('should not work', function () {
                    expect(scData.Entity.query).toBeUndefined();
                });
            });

            describe('queryByWorkspace', function () {
                it('Retrieving all entities of the Northwind workspace', function (done) {
                    scData.Entity.queryByWorkspace({ id: 'northwind' }, function (data) {
                        expect(data).toBeDefined();
                        expect(data).toBeArrayOfObjects();
                        expect(data).toBeArrayOfSize(121);

                        var entity = data[0];

                        expect(entity.id).toBeDefined();
                        expect(entity.href).toBeDefined();
                        expect(entity.name).toBeDefined();
                        expect(entity.attributes).toBeUndefined();

                        done();
                    });

                }, MAX_TIME_MS);
            });
        });

        describe('with parameters', function () {
            describe('attributes', function () {
                it('Retrieving all customers in the Northwind workspace with parameters', function (done) {
                    scData.Entity.queryByEntityType({ id: 'nwcustomer', attributes: 'Birth date, Company' }, function (data) {
                        expect(data).toBeDefined();
                        expect(data).toBeArrayOfObjects();
                        expect(data).toBeArrayOfSize(13);

                        var entity = data[0];

                        expect(entity.id).toBeDefined();
                        expect(entity.href).toBeDefined();
                        expect(entity.name).toBeDefined();
                        expect(entity.attributes).toBeDefined();

                        entity = scData.Entity.objectifyAttributes(entity);

                        expect(entity.attributes["Birth date"]).toBeDefined();
                        expect(entity.attributes["Birth date"]).toBeIso8601();
                        expect(entity.attributes.Company).toBeDefined();
                        expect(entity.attributes.Company).toBeString();

                        done();
                    });

                }, MAX_TIME_MS);

                it('Retrieving all products in the Northwind workspace with parameters', function (done) {
                    scData.Entity.queryByEntityType({ id: 'nwproduct', attributes: 'Category,Price' }, function (data) {
                        expect(data).toBeDefined();
                        expect(data).toBeArrayOfObjects();
                        expect(data).toBeArrayOfSize(39);

                        var entity = data[0];

                        expect(entity.id).toBeDefined();
                        expect(entity.href).toBeDefined();
                        expect(entity.name).toBeDefined();
                        expect(entity.attributes).toBeDefined();

                        entity = scData.Entity.objectifyAttributes(entity);

                        expect(entity.attributes.Category).toBeDefined();
                        expect(entity.attributes.Category).toBeObject();
                        expect(entity.attributes.Category.id).toBeDefined();
                        expect(entity.attributes.Category.href).toBeDefined();
                        expect(entity.attributes.Category.name).toBeDefined();
                        expect(entity.attributes.Price).toBeDefined();
                        expect(entity.attributes.Price).toBeNumber();

                        scData.Entity.get(entity.attributes.Category, function (data) {
                            expect(data).toBeDefined();
                            expect(data).toBeObject();
                            expect(data.name).toBeDefined();
                            done();
                        });
                    });

                }, MAX_TIME_MS);
            });
            describe('meta', function () {
                it('Retrieving all customers in the Northwind workspace with meta attributes', function (done) {
                    scData.Entity.queryByEntityType({ id: 'nwcustomer', meta: 'versions, workspace' }, function (data) {
                        expect(data).toBeDefined();
                        expect(data).toBeArrayOfObjects();
                        expect(data).toBeArrayOfSize(13);

                        var entity = data[0];

                        expect(entity.id).toBeDefined();
                        expect(entity.href).toBeDefined();
                        expect(entity.name).toBeDefined();
                        expect(entity.versions).toBeDefined();
                        expect(entity.versions).toBeArray();
                        expect(entity.workspace).toBeDefined();
                        expect(entity.workspace).toBeObject();

                        scData.Workspace.get(entity.workspace, function (data) {
                            expect(data).toBeDefined();
                            expect(data).toBeObject();
                            expect(data.name).toBeDefined();
                            expect(data.name).toEqual("Northwind");
                            done();
                        });

                        done();
                    });

                }, MAX_TIME_MS);
            });
            describe('content', function () {
                it('Retrieving the Northwind dashboard with its content', function (done) {
                    scData.Entity.get({ id: 'dashboard', content: true }, function (data) {
                        expect(data).toBeDefined();
                        expect(data.content).toBeDefined();
                        expect(data.content).toBeString();
                        done();
                    });

                }, MAX_TIME_MS);
            });
        });

        describe('incoming references', function () {
            it('gets all order of Thomas Hardy', function (done) {
                scData.Entity.get({ id: 'hardy', meta: "incomingReferences", attributes: "", content: false }, function (hardy) {
                    expect(hardy.incomingReferences).toBeDefined();
                    expect(hardy.incomingReferences).toBeObject();
                    expect(hardy.incomingReferences.Customer).toBeDefined();
                    expect(hardy.incomingReferences.Customer).toBeArray();
                    expect(hardy.incomingReferences.Customer).toBeArrayOfSize(4);

                    done();
                });
            });
        });

        describe('complex attributes type', function () {
            it('gets address of Thomas Hardy', function (done) {
                scData.Entity.get({ id: 'hardy', meta: "", attributes: "Address", content: false }, function (hardy) {
                    scData.Entity.objectifyAttributes(hardy);

                    expect(hardy.attributes).toBeObject();
                    expect(hardy.attributes.Address).toBeObject();
                    expect(hardy.attributes.Address.street).toEqual("Boltzmannstr. 3");

                    done();
                });
            });
        });

        it('objectify and arrayify attributes', function () {
            
            var entity = {
                attributes: [
                          { name: "strName", values: ["Hello World"] },
                          { name: "numName", values: [1.2, 3.4] },
                      { name: "boolName", values: [true, false] }
                ]
            };

            var unwrapped = scData.Entity.objectifyAttributes(entity);

            expect(unwrapped.attributes).toBeDefined();
            expect(unwrapped.attributes).toBeObject();
            expect(unwrapped.attributes.strName).toBeDefined();
            expect(unwrapped.attributes.strName).toBeString();
            expect(unwrapped.attributes.numName).toBeDefined();
            expect(unwrapped.attributes.numName).toBeArrayOfNumbers();
            expect(unwrapped.attributes.boolName).toBeDefined();
            expect(unwrapped.attributes.boolName).toBeArrayOfBooleans();

            var wrapped = scData.Entity.arrayifyAttributes(entity);

            expect(unwrapped.attributes).toBeDefined();
            expect(unwrapped.attributes).toBeArrayOfSize(3);

            for (var i = 0; i < unwrapped.attributes.length; i++) {
                var currAttr = unwrapped.attributes[i];

                if (currAttr.name === "strName") {
                    expect(currAttr.values).toBeArrayOfSize(1);
                    expect(currAttr.values[0]).toEqual("Hello World");
                } else if (currAttr.name === "numName") {
                    expect(currAttr.values).toBeArrayOfSize(2);
                    expect(currAttr.values[0]).toEqual(1.2);
                    expect(currAttr.values[1]).toEqual(3.4);
                } else if (currAttr.name === "boolName") {
                    expect(currAttr.values).toBeArrayOfSize(2);
                    expect(currAttr.values[0]).toEqual(true);
                    expect(currAttr.values[1]).toEqual(false);
                }
            }
        });
    });

    describe('workspaces', function () {
        it('Retrieving all workspaces', function (done) {
            scData.Workspace.query(function (data) {
                expect(data).toBeDefined();
                expect(data).toBeArrayOfObjects();

                done();
            });


        }, MAX_TIME_MS);

        it('Retrieving entity hierarchy from Northwind workspace', function (done) {
            scData.Workspace.get({ id: 'northwind', meta: 'entityTree' }, function (data) {
                expect(data.entityTree).toBeDefined();
                expect(data.entityTree).toBeObject();
                expect(data.entityTree.children).toBeDefined();
                expect(data.entityTree.children).toBeArray();
                expect(data.entityTree.children).toBeArrayOfSize(1);
                expect(data.entityTree.children[0].children).toBeUndefined();
                done();
            });

        }, MAX_TIME_MS);
    });

    describe('attributes', function () {
        it('Retrieving Thomas Hardy and all his attributes', function (done) {
            scData.Entity.get({ id: 'hardy' }, function (entity) {
                expect(entity).toBeDefined();
                expect(entity).toBeObject();

                expect(entity.id).toBeDefined();
                expect(entity.href).toBeDefined();
                expect(entity.name).toBeDefined();
                expect(entity.attributes).toBeDefined();

                angular.forEach(entity.attributes, function (attr) {
                    if (attr.name === "Company") {
                        scData.Attribute.get(attr, function (data) {
                            expect(data.name).toEqual(attr.name);
                            expect(data.id).toEqual(attr.id);
                            done();
                        });
                    }
                });

            });

        }, MAX_TIME_MS);

        it('Retrieving all attributes of Thomas Hardy', function (done) {
            scData.Attribute.queryByEntity({ id: 'hardy' }, function (attributes) {
                expect(attributes).toBeDefined();
                expect(attributes).toBeArray();

                scData.Entity.get({ id: 'hardy' , meta:''}, function (hardy) {
                    expect(attributes).toBeArrayOfSize(hardy.attributes.length);
                    done();
                });
            });

        }, MAX_TIME_MS);

        describe('queryAll', function () {
            it('should not work', function () {
                expect(scData.Attribute.query).toBeUndefined();
            });
        });
    });

    describe('files', function () {
        it('Retrieving all picture of homepage', function (done) {
            scData.Workspace.get({ id: 'northwind' }, function (northwind) {
                expect(northwind.rootEntity).toBeObject();

                scData.File.queryByEntity(northwind.rootEntity, function (files) {
                    expect(files).toBeArrayOfSize(4);
                    done();
                });
            });

            scData.File.get({ id: 'northwindpng' }, function (northwindpng) {
                expect(northwindpng.name).toEqual("NorthwindDataModel.png");
                done();
            });

        }, MAX_TIME_MS);


        it('Retrieving one picture', function (done) {
            scData.File.get({ id: 'northwindpng' }, function (northwindpng) {
                expect(northwindpng.name).toEqual("NorthwindDataModel.png");
                done();
            });

        }, MAX_TIME_MS);

        it('Download one picture', function (done) {
            scData.File.download({ id: 'northwindpng' }, function (northwindpng) {
                //expect(northwindpng).toBeDefined();
                done();
            });

        }, MAX_TIME_MS);
    });
});