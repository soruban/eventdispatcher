/**
 * EventBus that is made of one or more "channels" on which events are dispatched from and listened to.
 *
 * Only one instance of the EventBus should be created.
 * EventChannels should only be created via EventBus.createChannel()
 */
(function(ns){
    var DEFAULT_CHANNEL = "default_channel";

    //==================================================================================================================
    //  EventChannel
    //==================================================================================================================

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

    //==================================================================================================================
    //  EventChannel
    //==================================================================================================================

    /**
     * An event channel is a 'dedicated bus' with an id that allows objects to dispatch and receive events.
     * It should not be created explicitly, the event bus will create and dispose of event channels as needed.
     * @constructor
     * @param {String} channelId , the id of this channel.
     */
    var EventChannel = function(channelId) {
        /**
         * The id of the channel
         * @type {String}
         * @private
         */
        this._id = channelId;

        /**
         * A map in which the event name are keys and the values are Arrays containing the callbacks and contexts.
         * @type {Object.<Array.<{callback:function(Event=), context:Object}>>}
         * @private
         */
        this._listeners = {};

        /**
         * Counter for ID generation.
         * @type {number}
         * @private
         */
        this._UID = 0;
    };

    /**
     *
     * @param {String} eventName , the name of the event to listen to.
     * @param {Function} callback , the callback to trigger when the event is triggered on the target.
     * @param {Object} context , the context to use in the callback.
     */
    EventChannel.prototype.listen = function(eventName, callback, context) {
        // Check if there are any listeners for this event name or create a new array.
        if(!this._listeners[eventName]) {
            this._listeners[eventName] = [];
        }

        this._listeners[eventName].push({
            callback: callback,
            context: context
        });
    };

    /**
     * Clears the listener for a given combination of eventName, callback and context.
     * @param {String} eventName
     * @param {Function} callback
     * @param {Object} context
     */
    EventChannel.prototype.unlisten = function(eventName, callback, context) {
        var listeners = this._listeners[eventName];
        var count = listeners.length;
        for(var i = 0; i < count; i++) {
            if(listeners[i].callback === callback && listeners[i].context === context) {
                listeners.splice(i, 1);
                break;
            }
        }
    };

    /**
     * Dispatches the provided event, triggering the appropriate callbacks.
     * @param {Event|String} event
     */
    EventChannel.prototype.dispatch = function(event) {
        if(!this._muted) {
            var eventName = typeof event === "string" ? event : event.type;
            var listeners = this._listeners[eventName];

            // Ensure we have listeners for that event name.
            if(listeners) {
                var count = listeners.length;
                for(var i = 0; i < count; i++) {
                    listeners[i].callback.call(listeners[i].context, event);
                }
            }
        }
    };

    /**
     * Mutes this channel, preventing it from dispatching events.
     */
    EventChannel.prototype.mute = function() {
        this._muted = true;
    };

    /**
     * Unmutes the channel, allowing events to be dispatched.
     */
    EventChannel.prototype.unmute = function() {
        this._muted = false;
    };

    /**
     * UID generator.
     * @returns {number}
     * @private
     */
    EventChannel.prototype._getUID = function() {
        return this._UID++;
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
        this._UID = 0;
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
        channelId =  channelId === undefined ? DEFAULT_CHANNEL : channelId;

        if(!this._channels[channelId]) {
            throw new Error("Channel does not exists");
        }
        else {
            this._channels[channelId].listen(eventName, callback, context);
        }
    };

    /**
     * @param {String} eventName
     * @param {Function} callback
     * @param {Object} context
     * @param {String=} channelId , optional, the name of the channel to set the listen on.
     * @returns {Boolean} true if we managed to successfully remove the event, false otherwise.
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
     * @param {String} eventName
     * @param {String=} channelId , optional, the name of the channel to set the listen on.
     * @throws {Error} if a channel was supplied and does not exists.
     */
    EventBus.prototype.dispatch = function(eventName, channelId) {
        channelId =  channelId === undefined ? DEFAULT_CHANNEL : channelId;

        if(!this._channels[channelId]) {
            throw new Error("Channel " + channelId + " does not exists.");
        }
        else {
            return this._channels[channelId].dispatch(eventName, channelId);
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
            var channel = new EventChannel(id);
            this._channels[id] = channel;
            return channel;
        }
    };

    /**
     * Returns the channel for the given id if it exists or null.
     * @param {String} channelId
     * @returns {EventChannel}
     */
    EventBus.prototype.getChannel = function(channelId) {
        return this._channels[channelId] || null;
    };

    /**
     * If the channel exists, removes it.
     * @param channelId
     * @returns {boolean} , true if we found a channel and removed it, false otherwise.
     */
    EventBus.prototype.destroyChannel = function(channelId) {
        if(this._channels[channelId]) {
            this._channels[channelId] = null;
            delete  this._channels[channelId];
            return true;
        }
        else {
            return false;
        }
    };

    /**
     * @param {String} id
     * @returns {boolean}
     */
    EventBus.prototype.hasChannel = function(id) {
        return !!this._channels[id];
    };

    /**
     * Auto-incremented ID generator.
     * @returns {number}
     * @private
     */
    EventBus.prototype._getUID = function() {
        return this._UID++;
    };


    // Register the classes within the given namespace.
    ns.EventBus = EventBus;
    ns.SEvent = Event;
})(window);