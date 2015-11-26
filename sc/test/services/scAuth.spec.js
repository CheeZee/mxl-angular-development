/// <reference path="../../typings/angularjs/angular.d.ts"/>
/// <reference path="../../typings/jasmine/jasmine.d.ts"/>
/// <reference path="../../typings/lodash/lodash.d.ts"/>
/* global inject */
/* global ngMidwayTester */

describe('scAuth', function () {
    var tester, scAuth;

    beforeEach(function () {
        tester = ngMidwayTester('sociocortex');
        tester.inject('scConnection').baseUri = 'http://localhost:8083/intern/tricia';

        scAuth = tester.inject('scAuth');
    });

    afterEach(function () {
        tester.destroy();
        tester = null;
    });

    describe('login', function () {
        it('signs in to sociocortex and checks the returned user object', function (done) {
            scAuth.login('mustermann@test.sc', 'ottto', function (user) {
                expect(user).toBeDefined();
                expect(user.name).toEqual("Max Mustermann");
                expect(scAuth.isAuthenticated()).toEqual(true);

                done();
            });
        }, MAX_TIME_MS);
    });

    describe('logout', function () {
        it('signs out the current user', function (done) {
            scAuth.logout();
            expect(scAuth.isAuthenticated()).toEqual(false);
            done();
        });
    });
});