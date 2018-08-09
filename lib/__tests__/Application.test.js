const Application = require("../Application");
const packageJson = require("../../package.json");

describe("Application", () => {
  let application;
  beforeEach(() => {
    application = new Application;
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("start()", () => {
    it("should emit a start event", async () => {
      const spy = jest.spyOn(application, "emit");
      await application.start();

      expect(spy).toBeCalledWith(Application.EVENT_START, application, []);
    });

    it("should emit an end event at the end", async () => {
      const spy = jest.spyOn(application, "emit");
      await application.start();

      expect(spy).toHaveBeenLastCalledWith(Application.EVENT_END, application);
    });

    it("should call installDependencies method on each bundles", async () => {
      const bundle1 = {
        getPath: () => __dirname,
        installDependencies: jest.fn()
      };
      const asyncSpy = jest.fn();
      const bundle2 = {
        getPath: () => __dirname,
        installDependencies: async () => {
          asyncSpy();
        }
      };

      application.addBundle(bundle1);
      application.addBundle(bundle2);
      await application.start();
      expect(bundle1.installDependencies).toHaveBeenCalled();
      expect(asyncSpy).toHaveBeenCalled();
    });

    it("should emit EVENT_BUNDLE_DEPENDENCIES_INSTALLED after installing dependencies", async () => {
      const callOrder = [];
      const bundle1 = {
        getPath: () => __dirname,
        installDependencies: () => {
          callOrder.push("installDependencies 1");
        }
      };
      const bundle2 = {
        getPath: () => __dirname,
        installDependencies: async () => {
          callOrder.push("installDependencies 2");
        }
      };
      application.addListener(Application.EVENT_BUNDLE_DEPENDENCIES_INSTALLED, async () => {
        callOrder.push("event");
      });

      application.addBundle(bundle1);
      application.addBundle(bundle2);
      await application.start();
      expect(callOrder).toEqual(["installDependencies 1", "installDependencies 2", "event"]);
    });

    it("should call initialize method on each bundles", async () => {
      const bundle1 = {
        getPath: () => __dirname,
        initialize: jest.fn()
      };
      const asyncSpy = jest.fn();
      const bundle2 = {
        getPath: () => __dirname,
        initialize: async () => {
          asyncSpy();
        }
      };

      application.addBundle(bundle1);
      application.addBundle(bundle2);
      await application.start();
      expect(bundle1.initialize).toHaveBeenCalled();
      expect(asyncSpy).toHaveBeenCalled();
    });

    it("should emit EVENT_BUNDLES_INITIALIZED after bundle initializations", async () => {
      const callOrder = [];
      const bundle1 = {
        getPath: () => __dirname,
        initialize: () => {
          callOrder.push("initialize 1");
        }
      };
      const bundle2 = {
        getPath: () => __dirname,
        initialize: async () => {
          callOrder.push("initialize 2");
        }
      };
      application.addListener(Application.EVENT_BUNDLES_INITIALIZED, async () => {
        callOrder.push("event");
      });

      application.addBundle(bundle1);
      application.addBundle(bundle2);
      await application.start();
      expect(callOrder).toEqual(["initialize 1", "initialize 2", "event"]);
    });

    it("should call boot method on each bundles", async () => {
      const bundle1 = {
        getPath: () => __dirname,
        boot: jest.fn()
      };
      const asyncSpy = jest.fn();
      const bundle2 = {
        getPath: () => __dirname,
        boot: async () => {
          asyncSpy();
        }
      };

      application.addBundle(bundle1);
      application.addBundle(bundle2);
      await application.start();
      expect(bundle1.boot).toHaveBeenCalled();
      expect(asyncSpy).toHaveBeenCalled();
    });

    it("should emit EVENT_BUNDLES_BOOTED after bundle bootstrap", async () => {
      const callOrder = [];
      const bundle1 = {
        getPath: () => __dirname,
        boot: () => {
          callOrder.push("boot 1");
        }
      };
      const bundle2 = {
        getPath: () => __dirname,
        boot: async () => {
          callOrder.push("boot 2");
        }
      };
      application.addListener(Application.EVENT_BUNDLES_BOOTED, async () => {
        callOrder.push("event");
      });

      application.addBundle(bundle1);
      application.addBundle(bundle2);
      await application.start();
      expect(callOrder).toEqual(["boot 1", "boot 2", "event"]);
    });

    it("should call the bundle methods in the right order", async () => {
      const callOrder = [];
      application.addListener(Application.EVENT_START, async () => {
        callOrder.push("start");
      });
      application.addListener(Application.EVENT_BUNDLE_DEPENDENCIES_INSTALLED, async () => {
        callOrder.push("installed");
      });
      application.addListener(Application.EVENT_BUNDLES_INITIALIZED, async () => {
        callOrder.push("initialized");
      });
      application.addListener(Application.EVENT_BUNDLES_BOOTED, async () => {
        callOrder.push("booted");
      });
      application.addListener(Application.EVENT_END, async () => {
        callOrder.push("end");
      });

      await application.start();
      expect(callOrder).toEqual(["installed", "initialized", "booted", "start", "end"]);
    });

    it("should catch and rethrow errors", async () => {
      const error = new Error("arf");
      const errorListener = jest.fn();
      application.addListener(Application.EVENT_START, async() => {
        throw error;
      });

      expect(application.start()).rejects.toEqual(error);
    });

    it("should emit an event when an error occurred", async () => {
      const error = new Error("ouch");
      const errorListener = jest.fn();
      application.addListener(Application.EVENT_START, async() => {
        throw error;
      });
      application.addListener(Application.EVENT_ERROR, async err => {
        errorListener(err);
      });

      try {
        await application.start();
      } catch (err) {}
      expect(errorListener).toBeCalledWith(error);
    });
  });

  describe("setParameter()", () => {
    it("should store parameter", () => {
      application.setParameter("foo", "bar");

      expect(application.getParameter("foo")).toEqual("bar");
    });

    it("should throw an error if the parameter name is not a string", () => {
      expect(() => {
        application.setParameter(42, "bar");
      }).toThrowErrorMatchingSnapshot();
    });
  });

  describe("addBundle()", () => {
    const bundle = {
      getPath: () => __dirname
    };
    const bundleWithoutGetPath = {};
    const bundleWithoutDirectory = {
      getPath: () => 42
    };

    it("should store bundle", () => {
      application.addBundle(bundle);
      expect(application.getBundles()).toContain(bundle);
    });

    it("should throw an error if the bundle does not have getPath() method", () => {
      expect(() => {
        application.addBundle(bundleWithoutGetPath);
      }).toThrowErrorMatchingSnapshot();
    });

    it("should throw an error if the bundle.getPath() does not return a directory", () => {
      expect(() => {
        application.addBundle(bundleWithoutDirectory);
      }).toThrowErrorMatchingSnapshot();
    });
  });

  describe("inspect()", () => {
    it("should return a summary of the application", () => {
      const output = application.inspect();
      const expected = "SolfegeJS/Application {" +
        `\n  "version": "${packageJson.version}",` +
        `\n  "bundleCount": 0`+
        `\n}`;

      expect(output).toEqual(expected);
    });
  });
});
