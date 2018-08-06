class Application {
  constructor() {}

  async start(parameters = []) {
    let self = this;

    this.gege(parameters)
      .then(async () => {
        await self.emit(Application.EVENT_END, self);
      })
      .catch(async error => {
        await self.emit(Application.EVENT_ERROR, error);
      });
  }
}
Application.EVENT_BUNDLES_INITIALIZED = "Initialized";

module.exports = Application;
