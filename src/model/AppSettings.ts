// import { CognitiveServicesConfig, CognitiveServicesConfigOptions } from "cognitiveserviceslib"

export interface CognitiveHubControllerOptions {
    serviceUrl: string;
    authUrl: string;
    controllerAccountId: string;
    controllerPassword: string;
    targetedAccountId: string;
}

const LOCAL_STORAGE_ITEM_NAME = 'robokit-hub-controller'

const defaultCognitiveHubOptions: CognitiveHubControllerOptions = {
    serviceUrl: 'http://localhost:8082/', // 'http://reasongraph.com:8082/',
    authUrl: 'http://localhost:8082/auth', // 'http://reasongraph.com:8082/auth',
    controllerAccountId: 'controller1',
    controllerPassword: 'controller1',
    targetedAccountId: 'robot9',
}

export interface AppSettingsOptions { // extends CognitiveServicesConfigOptions {
    CognitiveHubControllerOptions: CognitiveHubControllerOptions
}

export default class AppSettings { // extends CognitiveServicesConfig {

    public CognitiveHubControllerOptions: CognitiveHubControllerOptions = defaultCognitiveHubOptions;

    constructor(options?: AppSettingsOptions) {
        // super();
        this.init(options);
    }

    init(options?: AppSettingsOptions): void {
        // console.log(`AppSettingsOptions: init`, options);
        if (options) {
            this.initWithData(options);
        } else if (this.loadFromLocalStorage()) {
            console.log(`loaded settings from local storage.`)
        } else {
            this.initWithData();
        }
    }

    initWithData(options: AppSettingsOptions | any = {}): void {
        console.log(`AppSettingsOptions: initWithData`, options);
        // super.initWithData(options)

        if (options.CognitiveHubControllerOptions) {
            this.CognitiveHubControllerOptions = options.CognitiveHubControllerOptions;
        } else {
            this.CognitiveHubControllerOptions = defaultCognitiveHubOptions;
        }
    }

    saveToLocalStorage(): boolean {
        const localStorage = window.localStorage;
        try {
            const dataText = JSON.stringify(this.json);
            localStorage.setItem(LOCAL_STORAGE_ITEM_NAME, dataText) // CognitiveServicesConfig.LOCAL_STORAGE_ITEM_NAME, dataText);
            return true;
        } catch (error) {
            console.log(`saveToLocalStorage:`, error);
            return false;
        }
    }

    loadFromLocalStorage(): boolean {
        let result = false;
        const localStorage = window ? window.localStorage : undefined;

        if (localStorage) {
            const settingsText: string | null = localStorage.getItem(LOCAL_STORAGE_ITEM_NAME) // CognitiveServicesConfig.LOCAL_STORAGE_ITEM_NAME);
            // console.log(`loadFromLocalStorage: `, settingsText);
            if (settingsText) {
                try {
                    const settings = JSON.parse(settingsText);
                    this.initWithData(settings as CognitiveHubControllerOptions) // CognitiveServicesConfigOptions);
                    result = true
                } catch (error) {
                    console.log(`loadFromLocalStorage`, error);
                }
            }
        }
        return result;
    }

    get json(): any {
        let json: any = {
            CognitiveHubControllerOptions: this.CognitiveHubControllerOptions,
        };
        return json;
    }

}