var EventDispatcher = require('./EventDispatcher');

/**
 * EventBus that is made of one or more "channels" on which events are dispatched from and listened to.
 *
 * Only one instance of the EventBus should be created.
 * EventChannels should only be created via EventBus.channel()
 */
var DEFAULT_CHANNEL = "default_channel";

/**
 * Provides a centralized Bus for listening and dispatching events.
 * The bus allows any object to dispatch/publish event and any other object to listen for those.
 * This implementation makes uses of "channels" to allow users to create dedicated channels for grouping various events.
 * Objects may create event channels and dispatch to object on the specific channel only.
 * By default all event are dispatched on the default channel.
 * @constructor
 */
var EventBus = function () {
  this._channels = {};
  this._channels[DEFAULT_CHANNEL] = new EventDispatcher(DEFAULT_CHANNEL);
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
EventBus.prototype.listen = function (eventName, callback, context, channelId) {
  channelId = channelId === undefined ? DEFAULT_CHANNEL : channelId;

  if (!this._channels[channelId]) {
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
EventBus.prototype.unlisten = function (eventName, callback, context, channelId) {
  if (channelId && !this._channels[channelId]) {
    return false;
  }
  else {
    channelId = channelId || DEFAULT_CHANNEL;
    return this._channels[channelId].unlisten(eventName, callback, context);
  }
};

/**
 * @param {String|Object} event
 * @param {String=} channelId , optional, the name of the channel to set the listen on.
 * @throws {Error} if a channel was supplied and does not exists.
 */
EventBus.prototype.dispatch = function (event, channelId) {
  channelId = channelId === undefined ? DEFAULT_CHANNEL : channelId;

  if (!this._channels[channelId]) {
    throw new Error("Channel " + channelId + " does not exists.");
  }
  else {
    return this._channels[channelId].dispatch(event, channelId);
  }
};

/**
 * Creates a dedicated channel with the given id. This id can then be used in the listen, unlisten and dispatch
 * functions.
 * If no id is provided, a default ID will be generated.
 * @param id
 * @throws {Error} if the channel already exists.
 */
EventBus.prototype._createChannel = function (id) {
  if (id === undefined) {
    id = DEFAULT_CHANNEL + "_" + this._getUID();
  }

  if (this._channels[id]) {
    throw new Error("Channel " + id + " already exists.");
  }
  else {
    var channel = new EventDispatcher(id);
    this._channels[id] = channel;
    return channel;
  }
};

/**
 * Returns the channel for the given id if it exists or null.
 * @param {String} channelId
 * @returns {EventDispatcher}
 */
EventBus.prototype.channel = function (channelId) {
  var channel = this._channels[channelId];
  if (!this.hasChannel(channelId)) {
    channel = this._createChannel(channelId);
  }
  return channel;
};

/**
 * If the channel exists, removes it.
 * @param channelId
 * @returns {boolean} , true if we found a channel and removed it, false otherwise.
 */
EventBus.prototype.destroyChannel = function (channelId) {
  if (this._channels[channelId]) {
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
EventBus.prototype.hasChannel = function (id) {
  return this._channels[id] != null;
};

/**
 * Auto-incremented ID generator.
 * @returns {number}
 * @private
 */
EventBus.prototype._getUID = function () {
  return this._UID++;
};

module.exports = EventBus;