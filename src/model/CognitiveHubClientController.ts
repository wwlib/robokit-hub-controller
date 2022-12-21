import { EventEmitter } from "events";
import { CommandFactory, CommandProcessor, RCSCommand, RCSCommandAck, SynchronizedClock, TimeData } from 'robokit-command-system';

const axios = require('axios');
const { io } = require("socket.io-client");
const timesync = require('timesync');


export interface CognitiveHubLoginResponse {
    access_token: string;
    account_id: string;
    refresh_token: string;
}

export default class CognitiveHubClientController extends EventEmitter {

    private _serviceUrl: string;
    private _authUrl: string;
    private _accountId: string;
    private _password: string;
    private _accessToken: string | undefined;
    private _refreshToken: string | undefined;

    private _socket: any;
    private _timesync: any;
    private _connected: boolean;

    private _syncOffset: number
    private _synchronizedClock: SynchronizedClock | undefined;

    constructor(serviceUrl: string, authUrl: string, accountId: string, password: string) {
        super();
        this._serviceUrl = serviceUrl;
        this._authUrl = authUrl;
        this._accountId = accountId;
        this._password = password;
        this._connected = false;
        this._syncOffset = 0;
        this._synchronizedClock = new SynchronizedClock();
        this._synchronizedClock.on('1sec', this.onSynchronizedClockUpdate)
        this._synchronizedClock.startUpdate()
    }

    get connected(): boolean {
        return this._connected;
    }

    async login(): Promise<CognitiveHubLoginResponse> {
        console.log('CognitiveHubClientController: login', this._authUrl, this._accountId, this._password);
        return new Promise((resolve, reject) => {
            if (this._authUrl && this._accountId && this._password) {
                this._accessToken = '';
                this._refreshToken = '';
                axios.post(this._authUrl, {
                    accountId: this._accountId,
                    password: this._password
                },
                    {
                        headers: { 'Content-Type': 'application/json' }
                    })
                    .then((response: any) => {
                        console.log('CognitiveHubClientController: login response', response.data);
                        this._accessToken = response.data.access_token;
                        // this._accountId = response.data.account_id;
                        this._refreshToken = response.data.refresh_token;
                        resolve(response.data);
                    })
                    .catch((error: any) => {
                        console.log('CognitiveHubClientController: login error', error);
                        reject();
                    });

            } else {
                reject('Invalid authUrl, accountId and/or password.')
            }
        });
    }

    //// AUDIO

    audioStart() {
        this._socket.emit('asrAudioStart');
    }

    audioEnd() {
        this._socket.emit('asrAudioEnd');
    }

    sendAudio(data: Buffer) {
        this._socket.emit('asrAudio', data);
    }

    //// PHOTO

    sendBase64Photo(base64PhotoData: string) {
        this._socket.emit('base64Photo', base64PhotoData);
    }

    handleTimesyncChange = (offset: number) => {
        // console.log('timesync: changed offset: ' + offset + ' ms');
        this._syncOffset = offset
        if (this._synchronizedClock) {
            this._synchronizedClock.onSyncOffsetChanged(offset)
        }
        const commandData = {
            id: 'tbd',
            type: 'sync',
            name: 'syncOffset',
            payload: {
                syncOffset: offset,
            }
        }
        const rcsCommand: RCSCommand = CommandFactory.getInstance().createCommand(commandData, 'HubControllerApp', 'na', new Date().getTime() + this._syncOffset)
        if (this._socket) {
            this._socket.emit('command', rcsCommand)
        } else {
            console.log(`_timesync on change: _socket is undefined.`)
        }
    }

    async connect() {
        console.log('CognitiveHubClientController: connect', )
        if (this._connected) {
            return
        }

        const loginResponse: CognitiveHubLoginResponse = await this.login();
        console.log('CognitiveHubClientController: loginResponse', loginResponse);
        if (loginResponse && loginResponse.access_token && this._serviceUrl) {

            this._socket = io(this._serviceUrl, {
                path: '/socket-controller/',
                extraHeaders: {
                    Authorization: `Bearer ${loginResponse.access_token}`,
                },
                reconnection: false,
            });

            // timesync

            this._timesync = timesync.create({
                server: this._socket,
                interval: 5000
            });

            // this._timesync.on('sync', (state: string) => {
            //     // console.log('timesync: sync ' + state + '');
            // });

            this._timesync.on('change', this.handleTimesyncChange);

            this._timesync.send = function (socket: any, data: any, timeout: number): Promise<void> {
                //console.log('send', data);
                return new Promise(function (resolve, reject) {
                    if (socket) {
                        var timeoutFn = setTimeout(reject, timeout);
                        socket.emit('timesync', data, function () {
                            clearTimeout(timeoutFn);
                            resolve();
                        });
                    } else {
                        console.log('CognitiveHubClientController: Not sending timesync event. socket is undefined.')
                        resolve()
                    }
                });
            };

            this._socket.on('timesync', (data: any) => {
                //console.log('receive', data);
                this._timesync.receive(null, data);
            });

            // socket messages

            this._socket.on("connect", () => {
                this._connected = true;
                this.log('CognitiveHubClientController: socket connected:', this._socket.id)
            });

            this._socket.on('disconnect', () => {
                this.log('CognitiveHubClientController: on disconnect. closing...');
                this._socket = undefined
                this.dispose()
            });

            this._socket.on('command', (command: RCSCommand) => {
                this.log('CognitiveHubClientController: command', command);
                // const synchronizedTime = this._synchronizedClock ? this._synchronizedClock.synchronizedTime : -1
                if (command.name === 'base64Photo' && command.payload) { 
                    this.emit('base64Photo', command.payload) // will be received by RookitHub.tsx
                }
            });

            this._socket.on('message', (data: any) => {
                this.log('CognitiveHubClientController: on message', data);
            });

            // ASR

            this._socket.on('asrSOS', () => {
                this.log(`CognitiveHubClientController: asrSOS`);
            });

            this._socket.on('asrResult', (data: any) => {
                this.log(`CognitiveHubClientController: asrResult`, data);
            });

            this._socket.on('asrEnded', (data: any) => {
                this.log(`CognitiveHubClientController: asrEnded`, data);
                this.emit('asrEnded', data);
            });

            // TTS

            this._socket.on('ttsAudioStart', (data: any) => {
                this.log(`ttsAudioStart`, data);
                this.emit('ttsAudioStart', data);
            });

            this._socket.on('ttsAudio', (data: any) => {
                console.log(`ttsAudio`, data);
                this.emit('ttsAudio', data);
            });

            this._socket.on('ttsAudioEnd', (data: any) => {
                this.log(`ttsAudioEnd`, data);
                this.emit('ttsAudioEnd', data);
            });

            this._socket.on('ttsAudioError', (data: any) => {
                this.log(`ttsAudioError`, data);
                this.emit('ttsAudioError', data);
            });

        } else {
            throw new Error('Invalid or undefined access_token and/or serviceUrl.')
        }
    }

    onSynchronizedClockUpdate = (timeData: TimeData) => {
        let audioContextElapsedTime = 0
        this.emit('clockUpdate', { timeData, audioContextElapsedTime })
    }

    sendCommand(commandData: any, targetAccountId: string) {
        const rcsCommand: RCSCommand = CommandFactory.getInstance().createCommand(commandData, 'HubControllerApp', targetAccountId, new Date().getTime() + this._syncOffset)
        if (this._socket) {
            this._socket.emit('command', rcsCommand)
        } else {
            console.log(`CognitiveHubClientController: sendCommand: _socket is undefined.`)
        }
    }

    log(...args:any) {
        console.log(args)
        this.emit('statusMessage', args)
    }

    dispose() {
        console.log(`CognitiveHubClientController: DISPOSE`)
        if (this._socket) {
            this._socket.close();
            this._socket = undefined;
        }
        this._connected = false;
        if (this._timesync) {
            this._timesync.off('change', this.handleTimesyncChange);
            this._timesync.destroy();
        }
        this._timesync = undefined;
        if (this._synchronizedClock) {
            this._synchronizedClock.dispose()
            this._synchronizedClock = undefined
        }
        this.removeAllListeners()
    }
}