const NodeEventEmitter = require("events").EventEmitter;

module.exports = class EventEmitter {
  constructor() {
    this.emitter = new NodeEventEmitter;
    this.on = this.addListener;
  }

  addListener(eventName, listener) {
    this.emitter.addListener(eventName, listener);
  }

  async emit(eventName, ...parameters) {
    const listeners = this.emitter.listeners(eventName);
    for (let index = 0; index < listeners.length; index++) {
      await listeners[index].apply(listeners[index], parameters);
    }
  }
};
