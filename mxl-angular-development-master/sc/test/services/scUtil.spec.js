/// <reference path="../../typings/angularjs/angular.d.ts"/>
/// <reference path="../../typings/jasmine/jasmine.d.ts"/>
/// <reference path="../../typings/lodash/lodash.d.ts"/>
/* global inject */
/* global ngMidwayTester */

describe('scUtil', function () {
    var tester, scUtil, scConnection;

    var baseUri = 'http://localhost:8083/intern/tricia';

    beforeEach(function () {
        tester = ngMidwayTester('sociocortex');

        scUtil = tester.inject('scUtil');
        tester.inject('scConnection').baseUri = baseUri;
        scConnection = tester.inject('scConnection');
    });

    afterEach(function () {
        tester.destroy();
        tester = null;
    });

    it('Testing getFullUrl', function () {
        expect(scUtil).toBeDefined();
        expect(scUtil.getFullUrl).toBeFunction();
        expect(scUtil.getFullUrl("test")).toEqual(baseUri + "/api/" + scConnection.apiVersion + "/test");
    });

    it('Testing type checks', function () {
        expect(scUtil.isEntity({ href: scUtil.getFullUrl('entities/any') })).toBeTrue();
        expect(scUtil.isEntity({ href: scUtil.getFullUrl('workspaces/any') })).toBeFalse();

        expect(scUtil.isEntityType({ href: scUtil.getFullUrl('entities/any') })).toBeFalse();
        expect(scUtil.isEntityType({ href: scUtil.getFullUrl('entityTypes/any') })).toBeTrue();

        expect(scUtil.isWorkspace({ href: scUtil.getFullUrl('entities/any') })).toBeFalse();
        expect(scUtil.isWorkspace({ href: scUtil.getFullUrl('workspaces/any') })).toBeTrue();

        expect(scUtil.isAttribute({ href: scUtil.getFullUrl('attributes/any') })).toBeTrue();
        expect(scUtil.isAttribute({ href: scUtil.getFullUrl('workspaces/any') })).toBeFalse();

        expect(scUtil.isAttributeDefinition({ href: scUtil.getFullUrl('attributes/any') })).toBeFalse();
        expect(scUtil.isAttributeDefinition({ href: scUtil.getFullUrl('attributeDefinitions/any') })).toBeTrue();

        expect(scUtil.isUser({ href: scUtil.getFullUrl('groups/any') })).toBeFalse();
        expect(scUtil.isUser({ href: scUtil.getFullUrl('users/any') })).toBeTrue();

        expect(scUtil.isGroup({ href: scUtil.getFullUrl('users/any') })).toBeFalse();
        expect(scUtil.isGroup({ href: scUtil.getFullUrl('groups/any') })).toBeTrue();
    });
});