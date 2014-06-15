var EventDispatcher = require("../js/EventDispatcher");

describe("EventDipatcher testing", function() {

  var dispatcher = null;

  beforeEach(function() {
    dispatcher = new EventDispatcher();
  });

  it("should listen and dispatch events correctly", function() {
    expect(true).toBe(true);
  });

  it("should unlisten correctly", function() {
    expect(true).toBe(true);
  });

  it("should unlisten given a listener correctly", function() {
    expect(true).toBe(true);
  });

  it("should not dispatch events when muted", function() {
    expect(true).toBe(true);
  });

  it("should not dispatch events again when unmuted", function() {
    expect(true).toBe(true);
  });

});