import React from 'react';
import './RobokitHubController.css';
import Model from '../../model/Model';
import CognitiveHubClientController from '../../model/CognitiveHubClientController';
import { CognitiveHubControllerOptions } from '../../model/AppSettings'

function RobokitHubController({ model }: { model: Model }) {

    const [cognitiveHubClient, setCognitiveHubClient] = React.useState<CognitiveHubClientController | undefined>(undefined)
    const [base64PhotoData, setBase64PhotoData] = React.useState<string>('')
    const [messages, setMessages] = React.useState<string>('<messages>')
    const [ttsInput, setTTSInput] = React.useState<string>('hello world.')

    const settings = model.settings.CognitiveHubControllerOptions
    const [serviceUrl, setServiceUrl] = React.useState<string>(settings.serviceUrl)
    const [authUrl, setAuthUrl] = React.useState<string>(settings.authUrl)
    const [controllerAccountId, setControllerAccountId] = React.useState<string>(settings.controllerAccountId)
    const [controllerPassword, setcontrollerPassword] = React.useState<string>(settings.controllerPassword)
    const [targetedAccountId, setTargetedAccountId] = React.useState<string>(settings.targetedAccountId)

    const base64PhotoHandler = (base64PhotoData: string) => {
        setBase64PhotoData(base64PhotoData)
    }

    const statusMessageHandler = (args: any) => {
        console.log('statusMessageHandler:', args)
        if (typeof args === 'string') {
            setMessages(messages + '\n' + args)
        } else if (Array.isArray(args)) {
            let result: string = ''
            args.forEach((arg: any) => {
                if (typeof arg === 'string') {
                    result += arg + '\n'
                } else if (typeof arg === 'object') {
                    result += JSON.stringify(arg, null, 2) + '\n'
                }
            })
            setMessages(messages + '\n' + result)
        }
    }

    React.useEffect(() => {
        if (cognitiveHubClient) {
            cognitiveHubClient.connect()
            cognitiveHubClient.on('base64Photo', base64PhotoHandler)
            cognitiveHubClient.on('statusMessage', statusMessageHandler)
        }
    }, [cognitiveHubClient]);

    const onButtonClicked = (action: string, event: any) => {
        event.preventDefault();
        console.log(`onButtonClicked:`, action)
        switch (action) {
            case 'Connect':
                if (cognitiveHubClient) {
                    cognitiveHubClient.off('model', base64PhotoHandler)
                }
                setCognitiveHubClient(model.getCognitiveHubClientController(serviceUrl, authUrl, controllerAccountId, controllerPassword, true))
                break;
            case 'Subscribe':
                if (cognitiveHubClient) {
                    const commandData = {
                        type: 'hubCommand',
                        name: 'subscribe',
                        payload: {
                            connectionType: 'device',
                            accountId: targetedAccountId
                        }
                    }
                    cognitiveHubClient.sendCommand(commandData, targetedAccountId)
                }
                break;
            case 'GetBase64Photo':
                if (cognitiveHubClient) {
                    const commandData = {
                        type: 'command',
                        name: 'getBase64Photo',
                    }
                    cognitiveHubClient.sendCommand(commandData, targetedAccountId) // TODO: get the targetAccountId from somewhere (form/login)
                }
                break;
            case 'SendTTS':
                if (cognitiveHubClient) {
                    const commandData = {
                        type: 'hubCommand',
                        name: 'tts',
                        payload: {
                            inputText: ttsInput
                        }
                    }
                    cognitiveHubClient.sendCommand(commandData, targetedAccountId) // TODO: get the targetAccountId from somewhere (form/login)
                }
                break;
        }
    }

    const onChangeHandler = (event: any) => {
        const nativeEvent: any = event.nativeEvent;
        let updateObj: any = undefined;
        switch (nativeEvent.target.id) {
            case 'serviceUrl':
                setServiceUrl(nativeEvent.target.value)
                break;
            case 'authUrl':
                setAuthUrl(nativeEvent.target.value)
                break;
                <input id='controllerAccountId' type='text' className='form-control' placeholder='accountId' value={controllerAccountId} onChange={onChangeHandler} onBlur={onBlurHandler} />
            case 'controllerAccountId':
                setControllerAccountId(nativeEvent.target.value)
                break;
            case 'controllerPassword':
                setcontrollerPassword(nativeEvent.target.value)
                break;
            case 'targetedAccountId':
                setTargetedAccountId(nativeEvent.target.value)
                break;
            case 'ttsInput':
                setTTSInput(nativeEvent.target.value)
                break;
        }
    }

    const onBlurHandler = (event: any) => {
        // this.props.changed(this.state);
        const settings: CognitiveHubControllerOptions = {
            serviceUrl: serviceUrl,
            authUrl: authUrl,
            controllerAccountId: controllerAccountId,
            controllerPassword: controllerPassword,
            targetedAccountId: targetedAccountId,
        }
        model.setAppSettings({ CognitiveHubControllerOptions: settings })
    }

    return (
        <div className="RobokitHubController">

            <div className="RobokitHubController-row">
                <textarea className="RobokitHubController-messages" value={messages} readOnly rows={16} />
            </div>
            <div className="RobokitHubController-row">
                Service URL:
                <input id='serviceUrl' type='text' className='form-control' placeholder='serviceUrl' value={serviceUrl} onChange={onChangeHandler} onBlur={onBlurHandler} />
                Auth URL:
                <input id='authUrl' type='text' className='form-control' placeholder='authUrl' value={authUrl} onChange={onChangeHandler} onBlur={onBlurHandler} />
            </div>
            <div className="RobokitHubController-row">
                Controller AccountId:
                <input id='controllerAccountId' type='text' className='form-control' placeholder='accountId' value={controllerAccountId} onChange={onChangeHandler} onBlur={onBlurHandler} />
                Controller Password:
                <input id='controllerPassword' type='text' className='form-control' placeholder='password' value={controllerPassword} onChange={onChangeHandler} onBlur={onBlurHandler} />
                <button className={`btn btn-primary App-button`} onClick={(event) => onButtonClicked('Connect', event)}>
                    Connect
                </button>
            </div>
            <div className="RobokitHubController-row">
                <form className='form' role='form' onSubmit={(event: any) => { onButtonClicked('Subscribe', event) }}>
                    <input id='targetedAccountId' type='text' className='form-control' placeholder='input' value={targetedAccountId} onChange={onChangeHandler} onBlur={onBlurHandler} />
                </form>
                <button className={`btn btn-primary App-button`} onClick={(event) => onButtonClicked('Subscribe', event)}>
                    Subscribe to robot (accountId)
                </button>
            </div>
            <div className="RobokitHubController-row">
                <form className='form' role='form' onSubmit={(event: any) => { onButtonClicked('SendTTS', event) }}>
                    <input id='ttsInput' type='text' className='form-control' placeholder='input' value={ttsInput} onChange={onChangeHandler} onBlur={onBlurHandler} />
                </form>
                <button className={`btn btn-primary App-button`} onClick={(event) => onButtonClicked('SendTTS', event)}>
                    SendTTS
                </button>
            </div>
            <div className="RobokitHubController-row">
                <button className={`btn btn-primary App-button`} onClick={(event) => onButtonClicked('GetBase64Photo', event)}>
                    Get Base64 Photo
                </button>
            </div>
            <div className="RobokitHubController-row">
                <div className="RobokitHubController-photo">
                    <img src={base64PhotoData} alt="base64Photo" />
                </div>
            </div>
        </div >
    );
}

export default RobokitHubController;
