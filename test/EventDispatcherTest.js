var EventDispatcher = require("../js/EventDispatcher");

describe("EventDipatcher testing", function() {

  var dispatcher = null;
  var dummyObject = null;
  var dummyData = null;

  beforeEach(function() {
    dispatcher = new EventDispatcher();
    dummyObject = {
      foo: function(){}
    };
    dummyData = {a: 1, b: "2"};
  });

  it("should listen and dispatch events correctly", function() {
    spyOn(dummyObject, 'foo').and.callThrough();
    dispatcher.listen('test', dummyObject.foo, dummyObject);
    dispatcher.dispatch('test');

    expect(dummyObject.foo).toHaveBeenCalled();
  });

  it("should listen and dispatch events correctly with the correct data", function() {
    spyOn(dummyObject, 'foo').and.callThrough();
    dispatcher.listen('test', dummyObject.foo, dummyObject);
    dispatcher.dispatch('test', dummyData);

    expect(dummyObject.foo).toHaveBeenCalledWith(dummyData);
  });

  it("should unlisten correctly", function() {
    spyOn(dummyObject, 'foo').and.callThrough();
    dispatcher.listen('test', dummyObject.foo, dummyObject);
    dispatcher.unlisten('test', dummyObject.foo, dummyObject);
    dispatcher.dispatch('test', dummyData);

    expect(dummyObject.foo).not.toHaveBeenCalled();
  });

  it("should unlisten given a listener correctly", function() {
    spyOn(dummyObject, 'foo').and.callThrough();
    var listener = dispatcher.listen('test', dummyObject.foo, dummyObject);
    dispatcher.unlistenListener(listener);

    expect(dummyObject.foo).not.toHaveBeenCalled();  });

  it("should not dispatch events when muted", function() {
    spyOn(dummyObject, 'foo').and.callThrough();
    dispatcher.listen('test', dummyObject.foo, dummyObject);
    dispatcher.mute();
    dispatcher.dispatch('test');

    expect(dummyObject.foo).not.toHaveBeenCalled();
  });

  it("should not dispatch events again when unmuted", function() {
    spyOn(dummyObject, 'foo').and.callThrough();
    dispatcher.listen('test', dummyObject.foo, dummyObject);
    dispatcher.mute();
    dispatcher.unmute();
    dispatcher.dispatch('test');

    expect(dummyObject.foo).toHaveBeenCalled();
  });

});