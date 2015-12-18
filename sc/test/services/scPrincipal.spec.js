/// <reference path="../../typings/angularjs/angular.d.ts"/>
/// <reference path="../../typings/jasmine/jasmine.d.ts"/>
/// <reference path="../../typings/lodash/lodash.d.ts"/>
/* global inject */
/* global ngMidwayTester */

describe('scPrincipal', function () {
    var tester, scAuth, scPrincipal;

    beforeEach(function () {
        tester = ngMidwayTester('sociocortex');
        tester.inject('scConnection').baseUri = 'http://localhost:8083/intern/tricia';


        scAuth = tester.inject('scAuth');
        scPrincipal = tester.inject('scPrincipal');

        scAuth.login('mustermann@test.sc', 'ottto');
    });

    afterEach(function () {
        scAuth.logout();
        tester.destroy();
        tester = null;
    });

    describe('users', function () {
        describe('read', function () {



            it('Retrieving all users', function (done) {
                scPrincipal.User.query(function (users) {
                    expect(users).toBeArrayOfObjects();
                    expect(users).toBeArrayOfSize(3);

                    done();
                });

            }, MAX_TIME_MS);

            it('Retrieving thomas', function (done) {
                scPrincipal.User.get({ id: 'thomas' }, function (thomas) {
                    expect(thomas).toBeObject();
                    expect(thomas.name).toEqual('Thomas Reschenhofer');

                    done();
                });

            }, MAX_TIME_MS);


            it('Retrieving me', function (done) {
                scPrincipal.User.me(function (me) {
                    expect(me).toBeObject();
                    expect(me.name).toEqual('Max Mustermann');
                    expect(me.groups).toBeDefined();
                    expect(me.groups).toBeArrayOfSize(1);

                    done();
                });

            }, MAX_TIME_MS);

            it('Retrieving profile picture of thomas', function (done) {
                scPrincipal.User.picture({ id: 'thomas' }, function (pic) {
                    expect(pic).toBeObject();

                    done();
                });

            }, MAX_TIME_MS);

            it('Retrieving my profile picture', function (done) {
                scPrincipal.User.myPicture(function (pic) {
                    expect(pic).toBeObject();

                    done();
                });

            }, MAX_TIME_MS);
        });

        describe('write', function () {
            it('editing username of me', function (done) {
                scPrincipal.User.update({ id: 'me' }, { name: 'Chief Architect' }, function (max) {
                    expect(max).toBeObject();
                    expect(max.name).toEqual('Chief Architect');

                    scPrincipal.User.update({ id: 'me' }, { name: 'Max Mustermann' }, function (max) {
                        expect(max).toBeObject();
                        expect(max.name).toEqual('Max Mustermann');

                        done();
                    });
                });

            }, MAX_TIME_MS);

            it('creating and deleting user peter', function (done) {
                scPrincipal.User.save({ name: 'Peter', email:'peter@test.sc' }, function (peter) {
                    expect(peter).toBeObject();
                    expect(peter.name).toEqual('Peter');
                    expect(peter.email).toEqual('peter@test.sc');

                    scPrincipal.User.delete(peter, function (result) {
                        expect(result.success).toBeTrue();
                        done();
                    });
                });

            }, MAX_TIME_MS);
        });
    });

    describe('groups', function () {
        describe('read', function () {

            it('Retrieving all groups', function (done) {
                scPrincipal.Group.query(function (groups) {
                    expect(groups).toBeArrayOfObjects();
                    expect(groups).toBeArrayOfSize(1);
                    done();
                });

            }, MAX_TIME_MS);

            it('Retrieving admins', function (done) {
                scPrincipal.Group.get({id:'administrators'},function (admins) {
                    expect(admins).toBeObject();
                    expect(admins.name).toEqual('Administrators');
                    done();
                });

            }, MAX_TIME_MS);

        });

        describe('write', function () {
            
            it('creating,editing, and deleting group developers', function (done) {
                scPrincipal.Group.save({ name: 'Developers', administrators: [{ id: 'thomas' }] }, function (developers) {
                    expect(developers).toBeObject();
                    expect(developers.name).toEqual('Developers');

                    scPrincipal.Group.delete(developers, function (result) {
                        expect(result.success).toBeTrue();
                        done();
                    });
                });

            }, MAX_TIME_MS);
        });
    });
});