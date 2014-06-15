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

module.exports = Event;