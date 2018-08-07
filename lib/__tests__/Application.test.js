const Application = require("../Application");

describe("Application", () => {
  let application;
  beforeEach(() => {
    application = new Application;
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

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

  it("should store parameter", async () => {
    application.setParameter("foo", "bar");

    expect(application.getParameter("foo")).toEqual("bar");
  });

  it("should throw an error if the parameter name is not a string", async () => {
    expect(() => {
      application.setParameter(42, "bar");
    }).toThrowErrorMatchingSnapshot();
  });
});
