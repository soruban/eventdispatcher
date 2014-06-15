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
    eventBus.listen("event1", callback1, this);
    eventBus.dispatch("event1");
    expect(count1).toBe(1);
  });

  it("triggers a callback on multiple listener when an event is dispatched", function () {
    eventBus.listen("event1", callback1, this);
    eventBus.listen("event2", callback2, this);
    eventBus.listen("event1", callback3, this);

    eventBus.dispatch("event1");
    expect(count1).toBe(1);
    expect(count2).toBe(0);
    expect(count3).toBe(1);
  });

  it("triggers a callback on listeners for different events", function () {
    eventBus.listen("event1", callback1, this);
    eventBus.listen("event2", callback2, this);
    eventBus.listen("event3", callback3, this);

    eventBus.dispatch("event1");
    eventBus.dispatch("event2");
    eventBus.dispatch("event3");
    eventBus.dispatch("event3");
    expect(count1).toBe(1);
    expect(count2).toBe(1);
    expect(count3).toBe(2);
  });

  it("stops triggering callbacks when a listener is cleared", function () {
    eventBus.listen("event1", callback1, this);
    eventBus.dispatch("event1");
    eventBus.unlisten("event1", callback1, this);
    eventBus.dispatch("event1");

    expect(count1).toBe(1);
  });

  it("does not trigger callbacks when no listeners exist for an event", function () {
    eventBus.listen("event1", callback1, this);
    eventBus.dispatch("event1");
    eventBus.dispatch("event2");

    expect(count1).toBe(1);
    expect(count2).toBe(0);
    expect(count3).toBe(0);
  });

  //==================================================================================================================
  //  Event dispatching on various channels.
  //==================================================================================================================

  it("triggers callback on an event channel", function () {
    eventBus.channel("channel1");
    eventBus.listen("event1", callback1, this, "channel1");
    eventBus.dispatch("event1", null, "channel1");
    expect(count1).toBe(1);
  });

  it("triggers callbacks on different channels appropriately", function () {
    eventBus.channel("channel1");
    eventBus.listen("event1", callback1, this, "channel1");
    eventBus.dispatch("event1", null, "channel1");

    eventBus.channel("channel2");
    eventBus.listen("event2", callback2, this, "channel2");
    eventBus.dispatch("event2", null, "channel2");
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
      bus0.listen("event1", dummyObj.foo, this, "channel0");
      bus0.dispatch("event1", null, "channel0");
      channel0.mute();

      bus0.dispatch("event1", null, "channel0");

      expect(dummyObj.foo.calls.count()).toBe(1);
    });

    it("triggers callbacks once the channel is unmuted", function () {
      spyOn(dummyObj, 'foo');
      bus0.listen("event1", dummyObj.foo, this, "channel0");
      channel0.mute();
      channel0.unmute();
      debugger;

      bus0.dispatch("event1", null, "channel0");
      expect(dummyObj.foo.calls.count()).toBe(1);
    });
  });

  it("does not allow dispatching on a non-existing channel", function () {
    var error;
    try {
      eventBus.dispatch("event1", null, "channel1");
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.message).toEqual("Channel channel1 does not exists.");
  });

  it("should only add one listener when adding the same listener signature multiple times.", function(){
    var channel = eventBus.channel("channel1");
    eventBus.listen("event1", callback1, this, "channel1");
    eventBus.listen("event1", callback1, this, "channel1");
    eventBus.listen("event1", callback1, this, "channel1");

    var allListeners = channel.getListeners("event1");
    expect(allListeners.length).toBe(1);
  });
});