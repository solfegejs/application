const {EventEmitter} = require("events");
const path = require("path");
const assert = require("assert");

class Application extends EventEmitter {
  constructor() {
    super();

    this.parameters = new Map;
    this.setParameter("main_directory_path", path.dirname(require.main.filename));

    this.bundles = new Set();
  }

  setParameter(name, value) {
    assert(typeof name === "string", new TypeError(`Parameter name should be a string, invalid type: ${typeof name}`));

    this.parameters.set(name, value);
  }

  getParameter(name) {
      return this.parameters.get(name);
  }

  addBundle(bundle) {
    assert(bundle.getPath === "function", new TypeError(`Invalid bundle, getPath() method is missing`));

    this.bundles.add(bundle);
  }

  getBundles() {
    return this.bundles;
  }

  async start(parameters = []) {
    try {
      await this.installBundleDependencies();
      await this.initializeBundles();
      await this.bootBundles();
      await this.emit(Application.EVENT_START, this, parameters);
      await this.emit(Application.EVENT_END, this);
    } catch (error) {
      await this.emit(Application.EVENT_ERROR, error);
    }
  }

  async installBundleDependencies() {
    for (let bundle of this.bundles) {
      if (typeof bundle.installDependencies === "function") {
        if (bundle.installDependencies.constructor.name === "AsyncFunction") {
          await bundle.installDependencies(this);
        } else {
          bundle.installDependencies(this);
        }
      }
    }
  }

  async initializeBundles() {
    for (let bundle of this.bundles) {
      if (typeof bundle.initialize === "function") {
        if (bundle.initialize.constructor.name === "AsyncFunction") {
          await bundle.initialize(this);
        } else {
          bundle.initialize(this);
        }
      }
    }
    await this.emit(Application.EVENT_BUNDLES_INITIALIZED, this);
  }

  async bootBundles() {
    for (let bundle of this.bundles) {
      if (typeof bundle.boot === "function") {
        if (bundle.boot.constructor.name === "AsyncFunction") {
          await bundle.boot();
        } else {
          bundle.boot();
        }
      }
    }
    await this.emit(Application.EVENT_BUNDLES_BOOTED, this);
  }
}
Application.EVENT_BUNDLES_INITIALIZED = "bundles_initialized";
Application.EVENT_BUNDLES_BOOTED = "bundles_booted";
Application.EVENT_START = "start";
Application.EVENT_END = "end";
Application.EVENT_ERROR = "error";

module.exports = Application;
