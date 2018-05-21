declare module "solfegejs-application" {
    declare class Application {
        setParameter(name:string, value:*):void;
        getParameter(name:string):*;
        addBundle(bundle:BundleInterface):void;
        getBundles():Set<BundleInterface>;
        start(parameters:Array<string> = []):void;
    }

    declare type BundleInterface {
        getPath():string;
    }

    declare type InitializableBundleInterface {
        initialize(application:Application):void;
    }

    declare type DependentBundleInterface {
        getDependencies():Array<BundleInterface>;
    }

    declare type BootableBundleInterface {
        boot():void;
    }
}
