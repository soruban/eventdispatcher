/**
 * EventBus that is made of one or more "channels" on which events are dispatched and listened to.
 */
(function(ns){
    var UID = 0;
    var DEFAULT_CHANNEL = "default_channel";

    /**
     * The base class to be used for custom events. Only requires an eventName.
     * @constructor
     * @param {String} eventName
     * @param {Object=} target , optional, the target of the event.
     */
    var Event = function(eventName, target) {
        this.name = eventName;
        this.target = target;
    };

    /**
     * An event channel allows is a 'dedicated bus' with an id that allows obejct to dispatch and received events.
     * It should not be created explicitly, the event bus will create and dispose of event channels as needed.
     * @constructor
     */
    var EventChannel = function(channelId) {
        if(!channelId) {
            channelId = new Date().getMilliseconds() + ""  + Math.round(Math.random() * 1000);
        }
        this._id = channelId;
        this._listeners = {};
    };

    /**
     *
     * @param {Event|String} eventName , the name of the event to listen to.
     * @param {Function} callback , the callback to trigger when the event is triggered on the target.
     * @param {Object} context , the context to use in the callback.
     */
    EventChannel.prototype.listen = function(eventName, callback, context) {
        var listenersForName;

        // Check if there are any listeners for this event name or create a new array.
        if(!this._listeners[eventName]) {
            listenersForName = this._listeners[eventName] = [];
        }

        listenersForName.push({
            callback: callback,
            context: context
        });
    };

    EventChannel.prototype.unlisten = function(eventName, callback, context) {
        var listeners = this._currTargets[eventName];
        var count = listeners.length;
        for(var i = 0; i < count; i++) {
            if(listeners[i].callback === callback && listeners[i].context === context) {
                listeners.splice(i, 1);
                break;
            }
        }
    };

    EventChannel.prototype.dispatch = function(target, event) {
        if(!this._muted) {
            var eventName = typeof event === "string" ? event : event.type;
            var listeners = this._currTargets[eventName];
            var count = listeners.length;
            for(var i = 0; i < count; i++) {
                listeners[i].callback.call(listeners[i].context, event);
            }
        }
    };

    EventChannel.prototype.mute = function() {
        this._muted = true;
    };

    EventChannel.prototype.unmute = function() {
        this._muted = false;
    };

    EventChannel.prototype._getUID = function() {
        return UID++;
    };


    /**
     * Provides a centralized Bus for listening and dispatching events.
     * The bus allows any object to dispatch/publish event and any other object to listen for those.
     * This implementation makes uses of "channels" to allow users to create dedicated channels for grouping various events.
     * Objects may create event channels and dispatch to object on the specific channel only.
     * By default all event are dispatched on the default channel.
     * @constructor
     */
    var EventBus = function() {
        this._channels = {};
        this._channels[DEFAULT_CHANNEL] = new EventChannel(DEFAULT_CHANNEL);
    };

    /**
     * Sets up a listener for the eventName on target, the given callback will be called.
     * @param {String} eventName
     * @param {Function} callback
     * @param {Object} context
     * @param {String=} channelId , optional, the name of the channel to set the listen on.
     * @throws {Error} if the channel does not exist.
     */
    EventBus.prototype.listen = function(eventName, callback, context, channelId) {
        if(channelId && !this._channels[id]) {
            throw new Error("Channel does not exists");
        }
        else {
            channelId = channelId || DEFAULT_CHANNEL;
            this._channels[channelId].listen(eventName, callback, context);
        }
    };

    /**
     * @param {String} eventName
     * @param {Function} callback
     * @param {Object} context
     * @param {String=} channelId , optional, the name of the channel to set the listen on.
     * @returns {Boolean} true if we managed to successfully remoe the event, false otherwise.
     */
    EventBus.prototype.unlisten = function(eventName, callback, context, channelId) {
        if(channelId && !this._channels[channelId]) {
            return false;
        }
        else {
            channelId = channelId || DEFAULT_CHANNEL;
            return this._channels[channelId].unlisten(eventName, callback, context);
        }
    };

    /**
     * @param {Object} target
     * @param {String} eventName
     * @param {String=} channel , optional, the name of the channel to set the listen on.
     * @throws {Error} if the channel does not exist.
     */
    EventBus.prototype.dispatch = function(target, eventName, channel) {
        if(channel && !this._channels[id]) {
            throw new Error("Channel does not exists");
        }
        else {
            channel = channel || DEFAULT_CHANNEL;
            return this._channels[channel].dispatch(target, eventName, callback);
        }
    };

    /**
     * Creates a dedicated channel with the given id. This id can then be used in the listen, unlisten and dispatch
     * functions.
     * @param id
     * @throws {Error} if the channel already exists.
     */
    EventBus.prototype.createChannel = function(id) {
        if(this._channels[id]) {
            throw new Error("Channel " + id + " already exists.");
        }
        else {
            this._channels[id] = new EventChannel(id);
        }
    };

    /**
     * Returns the channel for the given id if it exists or null.
     * @param {String} id
     * @returns {EventChannel}
     */
    EventBus.prototype.getChannel = function(id) {
        return this._channels[id] || null;
    };

    /**
     * @param {String} id
     * @returns {boolean}
     */
    EventBus.prototype.hasChannel = function(id) {
        return !!this._channels[id];
    };

})(window);