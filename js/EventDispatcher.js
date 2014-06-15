var EventListener = require('./EventListener');

/**
* "Classical" event dispatching system. Classes that do need to dispatch event should extend the EventDispatcher.
*/
var UID = 0;
var ENABLE_SAME_LISTENER_ADD = false;

/**
 * An event channel is a 'dedicated bus' with an id that allows objects to dispatch and receive events.
 * It should not be created explicitly, the event bus will create and dispose of event channels as needed.
 * @constructor
 * @param {string=} id , the id of this channel.
 */
var EventDisptacher = function (id) {
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
EventDisptacher.prototype.listen = function (eventName, callback, context) {
  var listener = new EventListener(eventName, callback, context);

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
 * Mirror function of listen.
 * Removes the listener identified by the combination of the given parameters.
 * @param {String} eventName
 * @param {Function} callback
 * @param {Object} context
 * @returns {boolean} whether the listener was found and deleted.
 */
EventDisptacher.prototype.unlisten = function (eventName, callback, context) {
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
 * @param {EventListener} listener
 * @returns {boolean} Whether a listener equal to the current one is already stored.
 * @private
 */
EventDisptacher.prototype._hasListener = function(listener) {
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
 * If the EventListener returned from listen was stored, this method allows for it to be easily removed.
 * @param {EventListener} listener
 * @returns {boolean}
 */
EventDisptacher.prototype.unlistenListener = function (listener) {
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
 * @param {String} eventName , the event object to dispatch or String.
 * @param {Object} data , data to pass witht the event.
 */
EventDisptacher.prototype.dispatch = function (eventName, data) {
  if (!this._muted) {
    var currentListenersForName = this._listeners[eventName];
    if (currentListenersForName != null) {
      for (var i = 0, count = currentListenersForName.length; i < count; i++) {
        currentListenersForName[i].trigger(data);
      }
    }
  }
};


/**
 * Mutes this channel, preventing it from dispatching events.
 */
EventDisptacher.prototype.mute = function () {
  this._muted = true;
};

/**
 * Unmutes the channel, allowing events to be dispatched.
 */
EventDisptacher.prototype.unmute = function () {
  this._muted = false;
};

/**
 * @param {string} eventName
 * @returns {Array} A shallow clone array of all the listeners corresponding to a specific event name or an empty
 * array if none.
 */
EventDisptacher.prototype.getListeners = function(eventName) {
  if(this._listeners[eventName]) {
    return this._listeners[eventName].slice(0);
  }
  else {
    return [];
  }
};

EventDisptacher.prototype._getUID = function () {
  return UID++;
};

module.exports = EventDisptacher;