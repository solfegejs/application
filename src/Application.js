/* @flow */
import assert from "assert"
import path from "path"
import EventEmitter from "events"
import type {BundleInterface} from "./BundleInterface"
import packageJson from "../package.json"

// Private properties and methods
const _start:Symbol = Symbol();
const _consoleError:Symbol = Symbol();

/**
 * SolfegeJS application
 */
export default class Application extends EventEmitter
{
    static EVENT_BUNDLES_INITIALIZED:string    = "bundles_initialized";
    static EVENT_BUNDLES_BOOTED:string         = "bundles_booted";
    static EVENT_START:string                  = "start";
    static EVENT_END:string                    = "end";
    static EVENT_ERROR:string                  = "error";

    /**
     * Parameters
     */
    parameters:Map<string, *>;

    /**
     * Bundle list
     */
    bundles:Set<BundleInterface>;

    /**
     * Constructor
     */
    constructor():void
    {
        super();

        // Initialize parameter list
        this.parameters = new Map;
        this.setParameter("main_directory_path", path.dirname(require.main.filename));

        // Initialize the bundle registry
        this.bundles = new Set();

        this.enableDefaultErrorListener();
    }

    /**
     * Enable default error listener
     */
    enableDefaultErrorListener():void
    {
        // $FlowFixMe
        this.on(Application.EVENT_ERROR, this[_consoleError]);
    }

    /**
     * Disable default error listener
     */
    disableDefaultErrorListener():void
    {
        // $FlowFixMe
        this.removeListener(Application.EVENT_ERROR, this[_consoleError]);
    }

    /**
     * Set parameter
     *
     * @param   {string}    name    Parameter name
     * @param   {*}         value   Parameter value
     */
    setParameter(name:string, value:*):void
    {
        const nameType:string = typeof name;
        if (nameType !== "string") {
            throw new TypeError(`Parameter name should be a string, invalid type: ${nameType}`);
        }

        this.parameters.set(name, value);
    }

    /**
     * Get parameter value
     *
     * @param   {string}    name    Parameter name
     * @return  {*}         value   Parameter value
     */
    getParameter(name:string):*
    {
        return this.parameters.get(name);
    }

    /**
     * Add a bundle to the registry
     *
     * @param   {BundleInterface}   bundle  A bundle
     */
    addBundle(bundle:BundleInterface):void
    {
        // Check the validity
        // @todo Check the other methods
        assert.strictEqual(typeof bundle.getPath, "function", `The bundle ${bundle.toString()} must implement getPath method`);

        // Add to the registry
        this.bundles.add(bundle);
    }

    /**
     * Get bundles
     *
     * @return  {Set}           The bundles
     */
    getBundles():Set<BundleInterface>
    {
        return this.bundles;
    }

    /**
     * Get bundle directory path
     *
     * @param   {BundleInterface}   bundle  Bundle instance
     * @return  {string}                    Bundle directory path
     */
    getBundleDirectoryPath(bundle:BundleInterface):?string
    {
        return bundle.getPath();
    }

    /**
     * Start the application
     *
     * @param   {Array}     parameters  Application parameters
     */
    start(parameters:Array<string> = []):void
    {
        let self:Application = this;

        // $FlowFixMe
        this[_start](parameters)
            .then(async () => {
                await self.emit(Application.EVENT_END, self);
            })
            .catch(async (error) => {
                await self.emit(Application.EVENT_ERROR, error);
            })
        ;
    }

    /**
     * Start the application in an async method
     *
     * @param   {Array<string>}     parameters  Parameters
     */
    // $FlowFixMe
    async [_start](parameters:Array<String> = []):void
    {
        // Install bundle dependencies
        // @todo Check DependentBundleInterface
        for (let bundle of this.bundles) {
            if (typeof bundle.installDependencies === "function") {
                if (bundle.installDependencies.constructor.name === "AsyncFunction") {
                    await bundle.installDependencies(this);
                } else {
                    bundle.installDependencies(this);
                }
            }
        }

        // Initialize registered bundles
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

        // Boot registered bundles
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

        // Start the application
        this.emit(Application.EVENT_START, this, parameters);
    }

    /**
     * Get string format of the instance
     *
     * @return  {string}    String format
     */
    inspect():string
    {
        let properties = {
            solfegeApplicationVersion: packageJson.version,
            bundleCount: this.bundles.size,
        };
        let output = "SolfegeJS/Application ";
        output += JSON.stringify(properties, null, "  ");

        return output;
    }

    /**
     * Write an error to the stderr
     *
     * @param   {Error}     error   Error instance
     */
    // $FlowFixMe
    [_consoleError](error)
    {
        console.error("[Solfege Error]", error);
    }
}
