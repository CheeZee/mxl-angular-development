describe('scModel (read access)', function () {
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
        it('Retrieving all entity types of the Northwind workspace', function (done) {
            scModel.EntityType.queryByWorkspace({ id: 'northwind' }, function (types) {
                expect(types).toBeArrayOfObjects();
                expect(types).toBeArrayOfSize(6);

                done();
            });

        }, MAX_TIME_MS);

        it('Retrieving Customer type Northwind workspace', function (done) {
            scModel.EntityType.get({ id: 'nwcustomer' }, function (customer) {
                expect(customer).toBeObject();
                expect(customer.name).toEqual('Customer');
                expect(customer.workspace.id).toEqual('northwind');
                expect(customer.namePlural).toEqual('Customers');
                expect(customer.attributeDefinitions).toBeArrayOfObjects();
                expect(customer.attributeDefinitions).toBeArrayOfSize(4);

                done();
            });

        }, MAX_TIME_MS);
    });

    describe('attributeDefinitions', function () {
        it('Retrieving all attribute definition of the Customer type', function (done) {
            scModel.AttributeDefinition.queryByEntityType({ id: 'nwcustomer' }, function (attributeDefinitions) {
                expect(attributeDefinitions).toBeArrayOfObjects();
                expect(attributeDefinitions).toBeArrayOfSize(4);

                done();
            });

        }, MAX_TIME_MS);

        it('Retrieving Company attribute definition of the Customer type', function (done) {
            scModel.AttributeDefinition.get({ id: 'nwcustomercompany' }, function (company) {
                expect(company).toBeObject();
                expect(company.entityType.id).toEqual('nwcustomer');
                expect(company.multiplicity).toEqual('exactlyOne');
                expect(company.attributeType).toEqual('Text');
                expect(company.description).toBeUndefined();
                expect(company.options).toBeUndefined();

                done();
            });

        }, MAX_TIME_MS);

        it('Retrieving Sex attribute definition of the Customer type', function (done) {
            scModel.AttributeDefinition.get({ id: 'nwcustomersex' }, function (sex) {
                expect(sex).toBeObject();
                expect(sex.entityType.id).toEqual('nwcustomer');
                expect(sex.multiplicity).toEqual('exactlyOne');
                expect(sex.attributeType).toEqual('Enumeration');
                expect(sex.description).toBeUndefined();
                expect(sex.options).toBeDefined();
                expect(sex.options.enumerationValues).toBeArrayOfSize(2);
                expect(sex.options.enumerationValues).toEqual(["male","female"]);

                done();
            });

        }, MAX_TIME_MS);

        it('Retrieving Interested in attribute definition of the Customer type', function (done) {
            scModel.AttributeDefinition.get({ id: 'nwcustomerinterestedin' }, function (ii) {
                expect(ii).toBeObject();
                expect(ii.entityType.id).toEqual('nwcustomer');
                expect(ii.multiplicity).toEqual('any');
                expect(ii.attributeType).toEqual('Link');
                expect(ii.description).toBeUndefined();
                expect(ii.options).toBeDefined();
                expect(ii.options.entityType.id).toEqual('nwproduct');

                done();
            });

        }, MAX_TIME_MS);

        it('Retrieving Birth date attribute definition of the Customer type', function (done) {
            scModel.AttributeDefinition.get({ id: 'nwcustomerbirthdate' }, function (birthdate) {
                expect(birthdate).toBeObject();
                expect(birthdate.entityType.id).toEqual('nwcustomer');
                expect(birthdate.multiplicity).toEqual('exactlyOne');
                expect(birthdate.attributeType).toEqual('Date');
                expect(birthdate.description).toBeUndefined();
                expect(birthdate.options).toBeUndefined();

                done();
            });

        }, MAX_TIME_MS);

        it('Retrieving Price attribute definition of the Product type', function (done) {
            scModel.AttributeDefinition.get({ id: 'nwproductprice' }, function (price) {
                expect(price).toBeObject();
                expect(price.entityType.id).toEqual('nwproduct');
                expect(price.multiplicity).toEqual('exactlyOne');
                expect(price.attributeType).toEqual('Number');
                expect(price.description).toBeUndefined();
                expect(price.options).toBeUndefined();

                done();
            });

        }, MAX_TIME_MS);

        it('Retrieving Category attribute definition of the Product type', function (done) {
            scModel.AttributeDefinition.get({ id: 'nwproductcategory' }, function (price) {
                expect(price).toBeObject();
                expect(price.entityType.id).toEqual('nwproduct');
                expect(price.multiplicity).toEqual('exactlyOne');
                expect(price.attributeType).toEqual('Link');
                expect(price.description).toBeUndefined();
                expect(price.options).toBeDefined();
                expect(price.options.resourceType).toEqual('entities');
                expect(price.options.entityType.id).toEqual('nwcategory');

                done();
            });

        }, MAX_TIME_MS);
    });
});