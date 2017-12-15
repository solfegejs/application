import Application from "../../lib/Application";
import MyBundle from "./Bundle";

// Create application instance
let application = new Application;
application.addBundle(new MyBundle);

// Start the application
let parameters = process.argv.slice(2);
application.start(parameters);
