/**
 * "Classical" event dispatching system. Classes that do need to dispatch event should extend the EventDispatcher.
 */
(function (ns) {
  var UID = 0;

  /**
   * Inner class used for clarity. It describes what is stored within the listeners array.
   * @constructor
   */
  var EventListener = function () {
    this.eventName = "";
    this.callback = null;
    this.context = null;
  };

  /**
   * Utility method to actually perform the event dispatch.
   */
  EventListener.prototype.trigger = function () {
    this.callback.call(this.context, this.event);
  };

  /**
   * The base class to be used for custom events. Only requires an eventName.
   * @param {String} eventName
   * @constructor
   */
  var Event = function (eventName) {
    this.name = eventName;
  };


  /**
   * The event dispatcher allows a class to dispatch event and trigger callbacks on listening objects.
   * @constructor
   */
  var EventDispatcher = function () {
    this._currentListeners = {};
  };

  /**
   *
   * @param {String} eventName , the name of the event to listen to.
   * @param {Function} callback , the callback to trigger when the event is triggered.
   * @param {Object} context , the context to use when triggering the callback.
   * @returns {EventListener}
   */
  EventDispatcher.prototype.listen = function (eventName, callback, context) {
    var listener = new EventListener();
    listener.callback = callback;
    listener.context = context;
    listener.eventName = eventName;

    if (!this._currentListeners[eventName]) {
      this._currentListeners[eventName] = [];
    }

    this._currentListeners[eventName].push(listener);

    return listener;
  };

  /**
   * Mirror function of listen.
   * Removes the listener identified by the combination of the given parameters.
   * @param {String} eventName
   * @param {Function} callback
   * @param {Object} context
   * @returns {boolean}
   */
  EventDispatcher.prototype.unlisten = function (eventName, callback, context) {
    var currentListenersForName = this._currentListeners[eventName],
      i = 0,
      listener = null,
      count = currentListenersForName ? currentListenersForName.length : 0;

    for (; i < count; i++) {
      listener = currentListenersForName[i];
      if (listener.callback === callback && listener.context === context) {
        currentListenersForName.splice(i, 1);
        if (currentListenersForName.length === 0) {
          delete this._currentListeners[eventName];
        }
        return true;
      }
    }

    return false;
  };

  /**
   * If the EventListener returned from listen was stored, this method allows for it to be easily removed.
   * @param {EventListener} listener
   * @returns {boolean}
   */
  EventDispatcher.prototype.unlistenListener = function (listener) {
    var currentListenersForName = this._currentListeners[listener.eventName];
    var index = currentListenersForName.indexOf(listener);
    if (index !== -1) {
      currentListenersForName.splice(index, 1);
      return true;
    }
    return false;
  };

  /**
   * @param {Event|String} event , the event object to dispatch or String.
   */
  EventDispatcher.prototype.dispatchEvent = function (event) {
    var eventName = typeof event === "string" ? event : event.name;
    var currentListenersForName = this._currentListeners[eventName];
    if (currentListenersForName) {
      for (var i = 0, count = currentListenersForName.length; i < count; i++) {
        currentListenersForName[i].trigger(event);
      }
    }
  };

  EventDispatcher.prototype._getUID = function () {
    return UID++;
  };

  ns.EventDispatcher = EventDispatcher;
})(window);