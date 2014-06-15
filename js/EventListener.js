/**
 * Inner class used for clarity. It describes what is stored within the listeners array.
 * @constructor
 */
var EventListener = function (name, callback, context) {
  this.eventName = name;
  this.callback = callback;
  this.context = context;
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

module.exports = EventListener;