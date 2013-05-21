describe("EventBus testing", function() {
    var count1 = 0, count2 = 0, count3 = 0;
    var eventBus = new EventBus();
    eventBus.listen("event1", callback1, this);
    eventBus.listen("event2", callback2, this);
    eventBus.listen("event1", callback3, this);

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
        count1 = count2 = count3 = 0;
    });

    it("triggers callback1 when event1 is dispatched", function() {
        eventBus.dispatch("event1");
        expect(count1).toBe(1);
    });

    it("triggers callback1 and callback3 when event1 is dispatched", function() {
        eventBus.dispatch("event1");
        expect(count1).toBe(1);
        expect(count2).toBe(0);
        expect(count3).toBe(1);
    });
});