/// <reference path="../../typings/angularjs/angular.d.ts"/>
/// <reference path="../../typings/jasmine/jasmine.d.ts"/>
/// <reference path="../../typings/lodash/lodash.d.ts"/>
/* global inject */
/* global ngMidwayTester */

describe('scData (write access)', function () {
    var tester, scAuth, scData;

    beforeEach(function () {
        tester = ngMidwayTester('sociocortex');
        tester.inject('scConnection').baseUri = 'http://localhost:8083/intern/tricia';

        scAuth = tester.inject('scAuth');
        scData = tester.inject('scData');


        scAuth.login('mustermann@test.sc', 'ottto')

    });

    afterEach(function () {
        scAuth.logout();
        tester.destroy();
        tester = null;
    });


    describe('workspace', function () {


        it('create, update, then delete', function (done) {
            scData.Workspace.query(function (workspacesInitially) {

                scData.Workspace.save({ name: "Dummy" }, function (dummy) {
                    expect(dummy instanceof scData.Workspace).toBeTrue();
                    expect(dummy.id).toBeDefined();
                    expect(dummy.name).toEqual("Dummy");

                    dummy.name = "Test";

                    scData.Workspace.query(function (workspacesAfterInsert) {

                        expect(workspacesInitially.length).toEqual(workspacesAfterInsert.length - 1);

                        scData.Workspace.update({ id: dummy.id }, dummy, function (test) {
                            expect(test instanceof scData.Workspace).toBeTrue();
                            expect(test.id).toBeDefined();
                            expect(test.id).toEqual(dummy.id);
                            expect(test.name).toEqual("Test");

                            scData.Workspace.delete(test, function (result) {
                                expect(result.success).toBeTrue();

                                scData.Workspace.query(function (workspacesAfterDelete) {
                                    expect(workspacesInitially.length).toEqual(workspacesAfterDelete.length);
                                    done();
                                });

                            });
                        });
                    });
                });
            });
        }, MAX_TIME_MS);
    });

    describe('entity', function () {
        it('update name of Thomas Hardy', function (done) {

            scData.Entity.update({ id: "hardy" }, { name: "John Doe" }, function (doe) {
                expect(doe.name).toEqual("John Doe");

                scData.Entity.update(doe, { name: "Thomas Hardy" }, function (hardy) {
                    expect(hardy.name).toEqual("Thomas Hardy");
                    done();
                });
            });
        }, MAX_TIME_MS);

        it('update price of Tofu', function (done) {

            scData.Entity.update({ id: "tofu" }, { attributes: [{ name: "Price", values: [50] }] }, function (tofu1) {
                tofu1 = scData.Entity.objectifyAttributes(tofu1);
                expect(tofu1.attributes.Price).toEqual(50);

                scData.Entity.update({ id: "tofu" }, { attributes: [{ name: "Price", values: [23.25] }] }, function (tofu2) {
                    tofu2 = scData.Entity.objectifyAttributes(tofu2);
                    expect(tofu2.attributes.Price).toEqual(23.25);
                    done();
                });
            });
        }, MAX_TIME_MS);

        it('update category of Tofu', function (done) {

            scData.Entity.get({ id: 'seafood' }, function (seafood) {
                scData.Entity.update({ id: "tofu" }, { attributes: [{ name: "Category", values: [seafood] }] }, function (tofu1) {
                    tofu1 = scData.Entity.objectifyAttributes(tofu1);
                    expect(tofu1.attributes.Category.id).toEqual(seafood.id);

                    scData.Entity.update({ id: "tofu" }, { attributes: [{ name: "Category", values: [{ id: "produce" }] }] }, function (tofu2) {
                        tofu2 = scData.Entity.objectifyAttributes(tofu2);
                        expect(tofu2.attributes.Category.id).toEqual("produce");
                        done();
                    });
                });
            });

        }, MAX_TIME_MS);

        it('create and delete john doe as customer with free attribute', function (done) {

            var doe = scData.Entity.arrayifyAttributes({
                name: "John Doe",
                attributes: {
                    "Birth date": new Date(1988, 01, 01),
                    Company: "sebis"
                },

                entityType: {
                    id: "nwcustomer"
                }
            });

            scData.Entity.save(doe, function (doe) {
                expect(doe.id).toBeDefined();

                doe = scData.Entity.objectifyAttributes(doe);

                expect(doe.attributes).toBeObject();
                expect(doe.attributes.Company).toEqual("sebis");
                expect(doe.attributes["Birth date"]).toBeIso8601();

                scData.Entity.update({ id: doe.id }, { attributes: [{ name: "Middle name", values: ["Charles"] }] }, function (doe) {

                    doe = scData.Entity.objectifyAttributes(doe);
                    expect(doe.attributes).toBeObject();
                    expect(doe.attributes["Middle name"]).toEqual("Charles");

                    scData.Entity.delete(doe, function (result) {
                        expect(result.success).toBeTrue();
                        done();
                    });
                });

            });
        }, MAX_TIME_MS);

        it('create product with free attribute of different types', function (done) {

            var schnitzel = scData.Entity.arrayifyAttributes({
                name: "Wiener Schnitzel",
                attributes: {
                    Price: 10,
                    Category: { id: 'meat' }
                },

                entityType: {
                    id: "nwproduct"
                }
            });

            scData.Entity.save(schnitzel, function (schnitzel) {
                expect(schnitzel.id).toBeDefined();

                schnitzel = scData.Entity.objectifyAttributes(schnitzel);

                log(schnitzel);

                expect(schnitzel.attributes).toBeObject();
                expect(schnitzel.attributes.Price).toBeNumber();
                expect(schnitzel.attributes.Category.name).toBeString();

                scData.Entity.update(schnitzel, {
                    attributes: [{ name: 'Price', values: ["15"] },
                        { name: 'Calories', values: [1500] },
                        { name: 'Favorite by', values: [{ id: 'hardy' }, { id: 'ashworth' }] },
                        { name: 'Invented at', values: [new Date(1500, 1, 1)] },
                        {name:'For beginners', values:[true]}
                    ]
                }, function (schnitzel) {

                    schnitzel = scData.Entity.objectifyAttributes(schnitzel);
                    
                    log(schnitzel);

                    expect(schnitzel.attributes).toBeObject();
                    expect(schnitzel.attributes.Calories).toBeNumber();
                    expect(schnitzel.attributes["Favorite by"]).toBeArrayOfObjects();
                    expect(schnitzel.attributes["Invented at"]).toBeIso8601();
                    expect(schnitzel.attributes["For beginners"]).toBeBoolean();

                    scData.Entity.delete(schnitzel, function (result) {
                        expect(result.success).toBeTrue();
                        done();
                    });
                });

            });
        }, MAX_TIME_MS);

        it('set parent page of tofu', function (done) {

            scData.Entity.update({ id: 'tofu' }, { parent: { href: "entities/seafood" } }, function (tofu) {
                expect(tofu.parent).toBeDefined();
                expect(tofu.parent.id).toEqual("seafood");

                scData.Entity.update(tofu, { parent: null }, function (tofu) {
                    expect(tofu.parent).toBeUndefined();
                    done();
                })
            });

        }, MAX_TIME_MS);

        it('set content of tofu', function (done) {
            scData.Entity.update({ id: 'tofu' }, { content: 'das ist anscheinend <b>sehr</b> gesund...' }, function (tofu) {
                expect(tofu.content).toBeDefined();
                expect(tofu.content).toBeString();
                expect(tofu.content).toEqual('das ist anscheinend <b>sehr</b> gesund...');

                scData.Entity.update(tofu, { content: null }, function (tofu) {
                    expect(tofu.content).toBeUndefined();
                    done();
                });
            });
        });
    });

    describe('attributes', function () {
        it('update company of Thomas Hardy', function (done) {
            scData.Entity.get({ id: "hardy" }, function (hardy) {
                var company;

                angular.forEach(hardy.attributes, function (attr) {
                    if (attr.name === "Company") {
                        company = attr;
                    }
                });

                expect(company).toBeDefined();
                expect(company.id).toBeDefined();

                scData.Attribute.update(company, { values: ["sebis", "tum"] }, function (company) {
                    expect(company.values).toBeArrayOfSize(2);
                    expect(company.values[0]).toEqual("sebis");
                    expect(company.values[1]).toEqual("tum");

                    scData.Entity.get({ id: hardy.id }, function (hardy) {
                        hardy = scData.Entity.objectifyAttributes(hardy);

                        expect(hardy.attributes.Company[0]).toEqual("sebis");
                        expect(hardy.attributes.Company[1]).toEqual("tum");

                        scData.Attribute.update(company, { values: ['Around the Horn'] }, function (company) {
                            expect(company.values).toBeArrayOfSize(1);
                            expect(company.values[0]).toEqual('Around the Horn');
                            done();
                        });
                    });
                });
            });
        }, MAX_TIME_MS);

        it('create, edit, and delete free attribute of Thomas hardy', function (done) {
            scData.Attribute.save({ entity: { id: 'hardy' }, name: 'Middle name', values: ['Charles', 'Darwin'] }, function (middleName) {
                expect(middleName.id).toBeDefined();

                scData.Attribute.update(middleName, { name: 'Middlename' }, function (middleName) {
                    expect(middleName.name).toEqual('Middlename');
                    expect(middleName.values).toEqual(['Charles', 'Darwin']);

                    scData.Entity.get({ id: 'hardy' }, function (hardy) {
                        hardy = scData.Entity.objectifyAttributes(hardy);

                        expect(hardy.attributes.Middlename).toEqual(['Charles', 'Darwin']);

                        scData.Attribute.delete(middleName, function (result) {
                            expect(result.success).toBeTrue();
                            done();
                        });
                    });

                });


            });

        }, MAX_TIME_MS);
    });
});