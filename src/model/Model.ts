import { EventEmitter } from 'events';
import Log from '../utils/Log';
import log from './log';
// import AudioFxManager from '../audio/AudioFxManager';
// import { CognitiveServicesConfig, CognitiveServicesConfigOptions } from 'cognitiveserviceslib';
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
    // AudioFxManager.getInstance(); // initialize the AudioFxManager
  }

  setAppSettings(settings: AppSettingsOptions): void {
    this.log.debug(`setAppSettings:`, settings);
    this.settings.init(settings);
    this.settings.saveToLocalStorage();
  }

  //// CognitiveHub

  getCognitiveHubClientController(reset: boolean = false): CognitiveHubClientController | undefined {
    if (reset) {
      if (this._cognitiveHubClientController) {
        this._cognitiveHubClientController.dispose()
        this._cognitiveHubClientController = undefined
      }
    }
    if (this._cognitiveHubClientController) {
      return this._cognitiveHubClientController;
    } else {
      console.log(`getCognitiveHubClientController:`, this.settings)
      if (this.settings.CognitiveHubOptions.authUrl && this.settings.CognitiveHubOptions.username && this.settings.CognitiveHubOptions.password) {
        this._cognitiveHubClientController = new CognitiveHubClientController(this.settings.CognitiveHubOptions.serviceUrl, this.settings.CognitiveHubOptions.authUrl, this.settings.CognitiveHubOptions.username, this.settings.CognitiveHubOptions.password);
        return this._cognitiveHubClientController;
      } else {
        return undefined
      }
    }
  }
}
