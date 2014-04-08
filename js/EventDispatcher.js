/**
 * "Classical" event dispatching system. Classes that do need to dispatch event should extend the EventDispatcher.
 */
(function (ns) {
  var UID = 0,
      ENABLE_SAME_LISTENER_ADD = false;


  //==================================================================================================================
  //  Event
  //==================================================================================================================

  /**
   * The base class to be used for custom events. Only requires an eventName.
   * @constructor
   * @param {String} eventName
   * @param {Object=} target , optional, the target of the event.
   */
  var Event = function (eventName, target) {
    this.name = eventName;
    this.target = target;
  };


  //==================================================================================================================
  //  EventListener
  //==================================================================================================================

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
   * @param {EventListener} otherListener
   * @returns {boolean}
   */
  EventListener.prototype.equals = function(otherListener) {
    return this.eventName === otherListener.eventName && this.callback === otherListener.callback &&
      this.context === otherListener.context;
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
  var EventChannel = function (id) {
    /**
     * The id of the channel
     * @type {String}
     * @private
     */
    this._id = id;

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

    /**
     * @type {boolean}
     * @private
     */
    this._muted = false;
  };

  /**
   *
   * @param {String} eventName , the name of the event to listen to.
   * @param {Function} callback , the callback to trigger when the event is triggered.
   * @param {Object} context , the context to use when triggering the callback.
   * @returns {EventListener}
   */
  EventChannel.prototype.listen = function (eventName, callback, context) {
    var listener = new EventListener();
    listener.callback = callback;
    listener.context = context;
    listener.eventName = eventName;

    if (!this._listeners[eventName]) {
      this._listeners[eventName] = [];
    }

    // Add the listener only if we do not mind adding the same listener twice OR it is not already in the current list.
    if(ENABLE_SAME_LISTENER_ADD || !this._hasListener(listener)) {
      this._listeners[eventName].push(listener);
    }

    return listener;
  };

  /**
   * @param {EventListener} listener
   * @returns {boolean} Whether a listener equal to the current one is already stored.
   * @private
   */
  EventChannel.prototype._hasListener = function(listener) {
    var listenersArr = this._listeners[listener.eventName];
    if(listenersArr) {
      var matchesListener = function(element, index, array) {
        return listener.equals(element);
      };

      return listenersArr.some(matchesListener);
    }

    return false;
  };

  /**
   * Mirror function of listen.
   * Removes the listener identified by the combination of the given parameters.
   * @param {String} eventName
   * @param {Function} callback
   * @param {Object} context
   * @returns {boolean} whether the listener was found and deleted.
   */
  EventChannel.prototype.unlisten = function (eventName, callback, context) {
    var currentListenersForName = this._listeners[eventName],
      i = 0,
      listener = null,
      count = currentListenersForName ? currentListenersForName.length : 0;

    for (; i < count; i++) {
      listener = currentListenersForName[i];
      if (listener.callback === callback && listener.context === context) {
        currentListenersForName.splice(i, 1);
        if (currentListenersForName.length === 0) {
          delete this._listeners[eventName];
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
  EventChannel.prototype.unlistenListener = function (listener) {
    var currentListenersForName = this._listeners[listener.eventName];
    var index = currentListenersForName.indexOf(listener);
    if (index !== -1) {
      currentListenersForName.splice(index, 1);
      return true;
    }
    return false;
  };

  /**
   * Dispatches the provided event, triggering the appropriate callbacks.
   * @param {Event|String} event , the event object to dispatch or String.
   */
  EventChannel.prototype.dispatch = function (event) {
    if (!this._muted) {
      var eventName = typeof event === "string" ? event : event.name;
      var currentListenersForName = this._listeners[eventName];
      if (currentListenersForName != null) {
        for (var i = 0, count = currentListenersForName.length; i < count; i++) {
          currentListenersForName[i].trigger(event);
        }
      }
    }
  };


  /**
   * Mutes this channel, preventing it from dispatching events.
   */
  EventChannel.prototype.mute = function () {
    this._muted = true;
  };

  /**
   * Unmutes the channel, allowing events to be dispatched.
   */
  EventChannel.prototype.unmute = function () {
    this._muted = false;
  };

  /**
   * @param {string} eventName
   * @returns {Array} A shallow clone array of all the listeners corresponding to a specific event name or an empty
   * array if none.
   */
  EventChannel.prototype.getListeners = function(eventName) {
    if(this._listeners[eventName]) {
      return this._listeners[eventName].slice(0);
    }
    else {
      return [];
    }
  };

  EventChannel.prototype._getUID = function () {
    return UID++;
  };

  window.EventChannel = EventChannel;
})();