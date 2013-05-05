/**
 * Google closure inspired event dispatch system.
 *
 * Usage:
 *
 * var rocket, euston;
 * EventBus.listen(rocket, "ready", euston.startCountDown, euston);
 * EventBus.dispatch("ready", euston);
 */
(function(ns){
    var UID = 0;
    var UID_FIELD = "_uid";

    /**
     * Provides a centralized Bus for listening and dispatching events.
     * The bus allows any object to dispatch/publish event and any other object to listen for those.
     * @constructor
     */
    var EventBus = function() {
        this._currTargets = {};
    };

    /**
     * Sets up a listener for the eventName on target, the given callback will be called.
     * @param {Object} target
     * @param {String} eventName
     * @param {Function} callback
     * @param {Object} context
     * @throws {Error} if the channel does not exist.
     */
    EventBus.prototype.listen = function(target, eventName, callback, context) {
        var uid, listenersForTarget, listenersForName;

        // Give a UID for the target if it does not have one.
        uid = target[UID_FIELD];
        if(!uid) {
            uid = target[UID_FIELD] = this._getUID();
        }

        // Check if we have a map of listeners for this target or create a new one.
        if(!this._currTargets[uid]) {
            listenersForTarget = this._currTargets[uid] = {};
        }

        // Check if there are any listeners for this event name or create a new array.
        if(!listenersForTarget[eventName]) {
            listenersForName = listenersForTarget[eventName] = [];
        }

        listenersForName.push({
            callback: callback,
            context: context
        });
    };

    /**
     * @param {Object} target
     * @param {String} eventName
     * @param {Function} callback
     * @param {Object} context
     * @returns {Boolean} true if we managed to successfully remoe the event, false otherwise.
     */
    EventBus.prototype.unlisten = function(target, eventName, callback, context) {
        if(target[UID_FIELD] && this._currTargets[UID_FIELD] && this._currTargets[UID_FIELD][eventName]) {
            var listeners = this._currTargets[UID_FIELD][eventName];
            var count = listeners.length;
            for(var i = 0; i < count; i++) {
                if(listeners[i].callback === callback && listeners[i].context === context) {
                    listeners.splice(i, 1);
                    break;
                }
            }

            // TODO: Delete the listenersForName & listenersForTarget if the arrays/maps are empty?
        }
    };

    /**
     * @param {Object} target
     * @param {String} eventName
     * @throws {Error} if the channel does not exist.
     */
    EventBus.prototype.dispatch = function(target, eventName) {
        if(this._currTargets[UID_FIELD] && this._currTargets[UID_FIELD][eventName]) {
            var listeners = this._currTargets[UID_FIELD][eventName];
            var count = listeners.length;
            for(var i = 0; i < count; i++) {
                listeners[i].callback.call(listeners[i].context, event);
            }
        }
    };

    EventBus.prototype._getUID = function() {
        return UID++;
    };

})(window);