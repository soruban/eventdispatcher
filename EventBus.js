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
     *
     * @param {Object} target , the object that will be the publisher of the event.
     * @param {Event|String} eventName , the name of the event to listen to.
     * @param {Function} callback , the callback to trigger when the event is triggered on the target.
     * @param {Object} context , the context to use in the callback.
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

    EventBus.prototype.unlisten = function(target, eventName, callback, context) {
        if(target[UID_FIELD] && this._currTargets[UID_FIELD] && this._currTargets[UID_FIELD][eventName]) {
            var listeners = this._currTargets[UID_FIELD][eventName];
            var count = listeners.count;
            for(var i = 0; i < count; i++) {
                if(listeners[i].callback === callback && listeners[i].context === context) {
                    listeners.splice(i, 1);
                    break;
                }
            }

            // TODO: Delete the listenersForName & listenersForTarget if the arrays/maps are empty?
        }
    };

    EventBus.prototype.dispatch = function(target, event) {
        if(target[UID_FIELD] && this._currTargets[UID_FIELD] && this._currTargets[UID_FIELD][eventName]) {
            var listeners = this._currTargets[UID_FIELD][eventName];
            var count = listeners.count;
            for(var i = 0; i < count; i++) {
                listeners[i].callback.call(listeners[i].context, event);
            }
        }
    };

    EventBus.prototype._getUID = function() {
        return UID++;
    };
})(window);