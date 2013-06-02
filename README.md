eventdispatcher
===============

Various ways of dispatching event (eventdispatcher and eventbus).


Basic usage:

    // The example below will cause an event to be created and dispatched on the default event channel.
    var bus = new EventBus();
    
    var Car = function() {
      bus.listen("turnLeft", this, this._onTurnLeft);
    };
    
    Car.prototype._onTurnLeft = function() {
      console.log("turn");
    };
    
    var Wheel = function() {
    }
    
    Wheel.prototype.turn = function() {
      bus.dispatch("turnLeft");
    }
    
    var car = new Car();
    new Wheel().turn;

  
Event channels:

    // The example below makes use of a custom event channel to dispatch events.
    var bus = new EventBus();
    var channel = bus.getChannel("VW");
    
    var Car = function(channel) {
      channel.listen("turnLeft", this, this._onTurnLeft);
      // OR bus.listen("turnLeft", this, this._onTurnLeft, "VW");
    };
    
    Car.prototype._onTurnLeft = function() {
      console.log("turn");
    };
    
    var Wheel = function(channel) {
      this._channel = channel;
    }
    
    Wheel.prototype.turn = function() {
      this._channel.dispatch("turnLeft");
      // OR bus.dispatch("turnLeft", "VW");
    }
    
    var car = new Car();
    new Wheel().turn;

Putting it all together, Events, EventChannel & the Bus.

    // We will now also use a custom Event class.
    var bus = new EventBus();
    var channel = bus.getChannel("VW");
    
    /**
     * A custom event class to store all event names and define what can be passed in the message.
     */
    var DrivingEvent = function(eventName, turnAngle, target) {
      this.turnAngle = turnAngle;
    }
    DrivingEvent.prototype = Object.create(Event.Prototype); // Event being the custom event class used in the library.
    
    DrivingEvent.TURN_LEFT = "turnLeft"; // Store the events as 'constants' for documentation and clarity.
    DrivingEvent.TURN_RIGHT = "turnRight"; // etc...
    
    var Car = function(channel) {
      channel.listen(DrivingEvent.TURN_LEFT, this, this._onTurnLeft);
      // OR bus.listen(DrivingEvent.TURN_LEFT, this, this._onTurnLeft, "VW");
    };
    
    Car.prototype._onTurnLeft = function(event) {
      console.log("turning by " + event.turnAngle);
    };
    
    var Wheel = function(channel) {
      this._channel = channel;
    }
    
    Wheel.prototype.turn = function() {
      var event = new DrivingEvent(DrivingEvent.TURN_LEFT, 20);
      this._channel.dispatch(event);
      // OR bus.dispatch(event, "VW");
    }
    
    var car = new Car();
    new Wheel().turn;
