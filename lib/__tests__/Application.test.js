const Application = require("../Application");

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
    it("should store bundle", () => {

    });
  });
});
