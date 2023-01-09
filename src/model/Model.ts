import { EventEmitter } from 'events';
import Log from '../utils/Log';
import log from './log';
import AppSettings, { AppSettingsOptions } from './AppSettings';
import CognitiveHubClientController from './CognitiveHubClientController';


export default class Model extends EventEmitter{

  public log: Log;
  public settings: AppSettings;

  private _cognitiveHubClientController: CognitiveHubClientController | undefined;

  constructor() {
    super()
    this.log = log;
    this.settings = new AppSettings();
  }

  setAppSettings(settings: AppSettingsOptions): void {
    this.log.debug(`setAppSettings:`, settings);
    this.settings.init(settings);
    this.settings.saveToLocalStorage();
  }

  //// CognitiveHub

  getCognitiveHubClientController(serviceUrl: string, authUrl: string, controllerAccountId: string, controllerPassword: string, reset: boolean = false): CognitiveHubClientController | undefined {
    if (reset) {
      if (this._cognitiveHubClientController) {
        this._cognitiveHubClientController.dispose()
        this._cognitiveHubClientController = undefined
      }
    }
    if (this._cognitiveHubClientController) {
      return this._cognitiveHubClientController;
    } else {
      console.log(`getCognitiveHubClientController:`, serviceUrl, authUrl, controllerAccountId)
      if (serviceUrl && authUrl && controllerAccountId && controllerPassword) {
        this._cognitiveHubClientController = new CognitiveHubClientController(serviceUrl, authUrl, controllerAccountId, controllerPassword);
        return this._cognitiveHubClientController;
      } else {
        return undefined
      }
    }
  }
}
