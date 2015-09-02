'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var osmCtrlStub = {
  index: 'osmCtrl.index'
};

var routerStub = {
  get: sinon.spy()
};

// require the index with our stubbed out modules
var osmIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './osm.controller': osmCtrlStub
});

describe('Osm API Router:', function() {

  it('should return an express router instance', function() {
    osmIndex.should.equal(routerStub);
  });

  describe('GET /api/osms', function() {

    it('should route to osm.controller.index', function() {
      routerStub.get
        .withArgs('/', 'osmCtrl.index')
        .should.have.been.calledOnce;
    });

  });

});
