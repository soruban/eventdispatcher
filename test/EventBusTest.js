var EventBus = require('../js/EventBus');

describe("EventBus testing", function () {
  var count1 = 0, count2 = 0, count3 = 0;
  var eventBus = null;

  function callback1() {
    count1++;
  }

  function callback2() {
    count2++;
  }

  function callback3() {
    count3++;
  }

  beforeEach(function () {
    eventBus = new EventBus();
    count1 = count2 = count3 = 0;
  });

  afterEach(function () {
    eventBus = null;
  });

  //==================================================================================================================
  //  Event dispatching on default channel.
  //==================================================================================================================

  it("triggers a callback on single listener when an event is dispatched", function () {
    eventBus.listen(null, "event1", callback1, this);
    eventBus.dispatch(null, "event1");
    expect(count1).toBe(1);
  });

  it("triggers a callback on multiple listener when an event is dispatched", function () {
    eventBus.listen(null, "event1", callback1, this);
    eventBus.listen(null, "event2", callback2, this);
    eventBus.listen(null, "event1", callback3, this);

    eventBus.dispatch(null, "event1");
    expect(count1).toBe(1);
    expect(count2).toBe(0);
    expect(count3).toBe(1);
  });

  it("triggers a callback on listeners for different events", function () {
    eventBus.listen(null, "event1", callback1, this);
    eventBus.listen(null, "event2", callback2, this);
    eventBus.listen(null, "event3", callback3, this);

    eventBus.dispatch(null, "event1");
    eventBus.dispatch(null, "event2");
    eventBus.dispatch(null, "event3");
    eventBus.dispatch(null, "event3");
    expect(count1).toBe(1);
    expect(count2).toBe(1);
    expect(count3).toBe(2);
  });

  it("stops triggering callbacks when a listener is cleared", function () {
    eventBus.listen(null, "event1", callback1, this);
    eventBus.dispatch(null, "event1");
    eventBus.unlisten(null, "event1", callback1, this);
    eventBus.dispatch(null, "event1");

    expect(count1).toBe(1);
  });

  it("does not trigger callbacks when no listeners exist for an event", function () {
    eventBus.listen(null, "event1", callback1, this);
    eventBus.dispatch(null, "event1");
    eventBus.dispatch(null, "event2");

    expect(count1).toBe(1);
    expect(count2).toBe(0);
    expect(count3).toBe(0);
  });

  //==================================================================================================================
  //  Event dispatching on various channels.
  //==================================================================================================================

  it("triggers callback on an event channel", function () {
    eventBus.channel("channel1");
    eventBus.listen("channel1", "event1", callback1, this);
    eventBus.dispatch("channel1", "event1", null);
    expect(count1).toBe(1);
  });

  it("triggers callbacks on different channels appropriately", function () {
    eventBus.channel("channel1");
    eventBus.listen("channel1", "event1", callback1, this);
    eventBus.dispatch("channel1", "event1");

    eventBus.channel("channel2");
    eventBus.listen("channel2", "event2", callback2, this);
    eventBus.dispatch("channel2", "event2");
    expect(count1).toBe(1);
    expect(count2).toBe(1);
    expect(count3).toBe(0);
  });


  describe("channel mutes and unmute works,", function () {
    var dummyObj = null;
    var bus0 = null;
    var channel0 = null;

    beforeEach(function(){
      dummyObj = {
        foo: function(){}
      };
      bus0 = new EventBus();
      channel0 = bus0.channel("channel0");
    });

    it("does not trigger callbacks on a muted channel", function () {
      spyOn(dummyObj, 'foo');
      bus0.listen("channel0", "event1", dummyObj.foo, this);
      bus0.dispatch("channel0", "event1");
      channel0.mute();

      bus0.dispatch("channel0", "event1");

      expect(dummyObj.foo.calls.count()).toBe(1);
    });

    it("triggers callbacks once the channel is unmuted", function () {
      spyOn(dummyObj, 'foo');
      bus0.listen("channel0", "event1", dummyObj.foo, this);
      channel0.mute();
      channel0.unmute();

      bus0.dispatch("channel0", "event1", null);
      expect(dummyObj.foo.calls.count()).toBe(1);
    });
  });

  it("does not allow dispatching on a non-existing channel", function () {
    var error;
    try {
      eventBus.dispatch("channel1", "event1");
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.message).toEqual("Channel with id 'channel1' does not exists.");
  });

  it("should only add one listener when adding the same listener signature multiple times.", function(){
    var channel = eventBus.channel("channel1");
    eventBus.listen("channel1", "event1", callback1, this);
    eventBus.listen("channel1", "event1", callback1, this);
    eventBus.listen("channel1", "event1", callback1, this);

    var allListeners = channel.getListeners("event1");
    expect(allListeners.length).toBe(1);
  });
});