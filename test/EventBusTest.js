describe("EventBus testing", function() {
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

    beforeEach(function(){
        eventBus = new EventBus();
        count1 = count2 = count3 = 0;
    });

    //==================================================================================================================
    //  Event dispatching on default channel.
    //==================================================================================================================

    it("triggers a callback on single listener when an event is dispatched", function() {
        eventBus.listen("event1", callback1, this);
        eventBus.dispatch("event1");
        expect(count1).toBe(1);
    });

    it("triggers a callback on multiple listener when an event is dispatched", function() {
        eventBus.listen("event1", callback1, this);
        eventBus.listen("event2", callback2, this);
        eventBus.listen("event1", callback3, this);

        eventBus.dispatch("event1");
        expect(count1).toBe(1);
        expect(count2).toBe(0);
        expect(count3).toBe(1);
    });

    it("triggers a callback on listeners for different events", function() {
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

    it("stops triggering callbacks when a listener is cleared", function() {
        eventBus.listen("event1", callback1, this);
        eventBus.dispatch("event1");
        eventBus.unlisten("event1", callback1, this);
        eventBus.dispatch("event1");

        expect(count1).toBe(1);
    });

    //==================================================================================================================
    //  Event dispatching on various channels.
    //==================================================================================================================

    it("triggers callback on an event channel", function() {
        eventBus.createChannel("channel1");
        eventBus.listen("event1", callback1, this, "channel1");
        eventBus.dispatch("event1", "channel1");
        expect(count1).toBe(1);
    });
});