var assert = require('assert');

suite('Units', function() {
  test('in the server', function(done, server) {
    server.eval(function() {
      settler = new HAI.Settler(100,200,2,50);
      Units.addUnit(settler);
      
      var units = Units.find().fetch();
      emit('units', units);
    });

    server.once('units', function(units) {
      assert.equal(units.length, 1);
      done();
    });
  });
});