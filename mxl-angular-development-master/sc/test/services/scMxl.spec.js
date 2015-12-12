/// <reference path="../../typings/angularjs/angular.d.ts"/>
/// <reference path="../../typings/jasmine/jasmine.d.ts"/>
/// <reference path="../../typings/lodash/lodash.d.ts"/>
/* global inject */
/* global ngMidwayTester */

describe('scMxl', function () {
    var tester, scAuth, scMxl, scData, scModel;

    beforeEach(function () {
        tester = ngMidwayTester('sociocortex');
        tester.inject('scConnection').baseUri = 'http://localhost:8083/intern/tricia';

        scAuth = tester.inject('scAuth');
        scMxl = tester.inject('scMxl');
        scData = tester.inject('scData');
        scModel = tester.inject('scModel');


        scAuth.login('mustermann@test.sc', 'ottto');
    });

    afterEach(function () {
        scAuth.logout();
        tester.destroy();
        tester = null;
    });

    describe('query', function () {


        describe('without context', function () {
            it('sum of northwind.product prices', function (done) {
                scMxl.query({ expression: 'find (Northwind.Product).count()', expectedType: 'Number' }, function (result) {
                    expect(result.value).toBeDefined();
                    expect(result.value).toEqual(39);
                    done();
                });
            }, MAX_TIME_MS);

            it('checks actuality of query', function (done) {
                scMxl.query({ expression: 'find (Northwind.Product).sum(Price)', expectedType: 'Number' }, function (result) {

                    var sum = result.value;
                    expect(result.value).toBeNumber();

                    scData.Entity.save({ name: 'Tartar', entityType: { id: 'nwproduct' }, attributes: [{ name: 'Price', values: [10] }, { name: 'Category', values: [{ id: 'meat' }] }] }, function (tartar) {
                        expect(tartar).toBeDefined();

                        scMxl.query({ expression: 'find (Northwind.Product).sum(Price)', expectedType: 'Number' }, function (result) {
                            expect(result.value).toBeGreaterThan(sum);

                            sum = result.value;

                            scData.Entity.delete(tartar, function (result) {
                                expect(result.success).toBeTrue();

                                scMxl.query({ expression: 'find (Northwind.Product).sum(Price)', expectedType: 'Number' }, function (result) {
                                    expect(result.value).toBeLessThan(sum);

                                    done();
                                });

                            });

                        });
                    });

                });
            }, MAX_TIME_MS);
        });

        describe('in workspace', function () {
            it('sum of product prices', function (done) {
                scMxl.query({ workspace: { id: 'northwind' } }, { expression: 'find Product.count()', expectedType: 'Number' }, function (result) {
                    expect(result.value).toBeDefined();
                    expect(result.value).toEqual(39);
                    done();
                });
            }, MAX_TIME_MS);
        });

        describe('in entity', function () {
            it('turnover of tofu', function (done) {
                scMxl.query({ entity: { id: 'tofu' } }, { expression: 'get Order whereis Product.sum(this.Price * Quantity)', expectedType: 'Number' }, function (result) {
                    expect(result.value).toBeDefined();
                    expect(result.value).toEqual(2325);

                    done();
                });
            }, MAX_TIME_MS);

        });
    });

    describe('validate', function () {

        describe('without context', function () {

            it('sum of northwind.product prices', function (done) {
                scMxl.validate({ expression: 'find (Northwind.Product).count()', expectedType: 'Number' }, function (result) {
                    expect(result.type).toBeDefined();
                    expect(result.type.name).toEqual('Number');
                    done();
                });
            }, MAX_TIME_MS);



        });

        describe('in workspace', function () {
            it('sum of product prices', function (done) {
                scMxl.validate({ workspace: { id: 'northwind' } }, { expression: 'find Product.select({name,Price})' }, function (result) {
                    expect(result.type).toBeDefined();
                    expect(result.type.name).toEqual('Sequence');
                    expect(result.type.elementType.name).toEqual('Structure')
                    expect(result.type.elementType.attributeTypes.Price.name).toEqual('Number');

                    done();
                });
            }, MAX_TIME_MS);
        });

        describe('in entity type', function () {
            it('sum of product prices', function (done) {
                scMxl.validate({ entityType: { id: 'nworder' } }, { expression: 'Product.Price * Quantity' }, function (result) {
                    expect(result.type).toBeDefined();
                    expect(result.type.name).toEqual('Number');

                    done();
                });
            }, MAX_TIME_MS);
        });

        describe('in entity', function () {
            it('sum of product prices', function (done) {
                scMxl.validate({ entity: { id: 'order01' } }, { expression: 'Product.Price * Quantity' }, function (result) {
                    expect(result.type).toBeDefined();
                    expect(result.type.name).toEqual('Number');

                    done();
                });
            }, MAX_TIME_MS);
        });
    });

    describe('autoComplete', function () {

        it('without context', function (done) {
            scMxl.autoComplete(function (result) {
                expect(result.staticFunctions).toBeArrayOfObjects();
                expect(result.memberFunctions).toBeArrayOfObjects();
                expect(result.globalIdentifiers).toBeArrayOfObjects();
                expect(result.basicTypes).toBeArrayOfObjects();
                expect(result.customTypes).toBeUndefined();
                expect(result.workspaces).toBeArrayOfObjects();
                expect(result.attributes).toBeUndefined();
                expect(result.builtinAttributes).toBeArrayOfObjects();
                done();
            });
        }, MAX_TIME_MS);

        it('in workspace', function (done) {
            scMxl.autoComplete({ workspace: { id: 'northwind' } }, function (result) {
                expect(result.staticFunctions).toBeArrayOfObjects();
                expect(result.memberFunctions).toBeArrayOfObjects();
                expect(result.globalIdentifiers).toBeArrayOfObjects();
                expect(result.basicTypes).toBeArrayOfObjects();
                expect(result.customTypes).toBeArrayOfObjects();
                expect(result.workspaces).toBeArrayOfObjects();
                expect(result.attributes).toBeArrayOfObjects();
                expect(result.builtinAttributes).toBeArrayOfObjects();
                done();
            });
        }, MAX_TIME_MS);

        it('in workspace, restricted to a Sequence', function (done) {
            scMxl.autoComplete({ workspace: { id: 'northwind' } }, 'Sequence', function (result) {
                expect(result.staticFunctions).toBeUndefined();
                expect(result.memberFunctions).toBeArrayOfObjects();
                expect(result.globalIdentifiers).toBeUndefined();
                expect(result.basicTypes).toBeUndefined();
                expect(result.customTypes).toBeUndefined();
                expect(result.workspaces).toBeUndefined();
                expect(result.attributes).toBeUndefined();
                expect(result.builtinAttributes).toBeUndefined();
                done();
            });
        }, MAX_TIME_MS);

        it('in workspace, restricted to a Customer', function (done) {
            scMxl.autoComplete({ workspace: { id: 'northwind' } }, 'Customer', function (result) {
                expect(result.staticFunctions).toBeUndefined();
                expect(result.memberFunctions).toBeArrayOfObjects();
                expect(result.globalIdentifiers).toBeUndefined();
                expect(result.basicTypes).toBeUndefined();
                expect(result.customTypes).toBeUndefined();
                expect(result.workspaces).toBeUndefined();
                expect(result.attributes).toBeArrayOfObjects();
                expect(result.builtinAttributes).toBeArrayOfObjects();
                done();
            });
        }, MAX_TIME_MS);

        it('in workspace, restricted to a Number', function (done) {
            scMxl.autoComplete({ workspace: { id: 'northwind' } }, 'Number', function (result) {
                expect(result.staticFunctions).toBeUndefined();
                expect(result.memberFunctions).toBeArrayOfObjects();
                expect(result.globalIdentifiers).toBeUndefined();
                expect(result.basicTypes).toBeUndefined();
                expect(result.customTypes).toBeUndefined();
                expect(result.workspaces).toBeUndefined();
                expect(result.attributes).toBeUndefined();
                expect(result.builtinAttributes).toBeUndefined();
                done();
            });
        }, MAX_TIME_MS);
    });
});