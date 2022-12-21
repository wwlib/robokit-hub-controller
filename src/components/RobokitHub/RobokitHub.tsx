import React from 'react';
import './RobokitHub.css';
import Model from '../../model/Model';
import CognitiveHubClientController from '../../model/CognitiveHubClientController';
import { type } from 'os';

function RobokitHub({ model }: { model: Model }) {

    const [cognitiveHubClient, setCognitiveHubClient] = React.useState<CognitiveHubClientController | undefined>(undefined)
    const [base64PhotoData, setBase64PhotoData] = React.useState<string>('')
    const [messages, setMessages] = React.useState<string>('<messages>')
    const [ttsInput, setTTSInput] = React.useState<string>('hello world.')
    const [targetedAccountId, setTargetedAccountId] = React.useState<string>('robot9')
    const [controllerAccountId, SetControllerAccountId] = React.useState<string>('controller1')
    const [controllerPassword, SetcontrollerPassword] = React.useState<string>('controller1')
    const [serviceUrl, getServiceUrl] = React.useState<string>('http://localhost:8082/')
    const [authUrl, getAuthUrl] = React.useState<string>('http://localhost:8082/auth')

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
            case 'ttsInput':
                setTTSInput(nativeEvent.target.value)
                break;
        }
    }

    const onBlurHandler = (event: any) => {
        // this.props.changed(this.state);
    }

    return (
        <div className="RobokitHub">
            <div className="RobokitHub-row">
                <textarea className="RobokitHub-messages" value={messages} readOnly rows={16} />
            </div>
            <div className="RobokitHub-row">
                Service URL:
                <input id='serviceUrl' type='text' className='form-control' placeholder='serviceUrl' value={serviceUrl} onChange={onChangeHandler} onBlur={onBlurHandler} />
                Auth URL:
                <input id='authUrl' type='text' className='form-control' placeholder='authUrl' value={authUrl} onChange={onChangeHandler} onBlur={onBlurHandler} />
            </div>
            <div className="RobokitHub-row">
                Controller AccountId:
                <input id='controllerAccountId' type='text' className='form-control' placeholder='accountId' value={controllerAccountId} onChange={onChangeHandler} onBlur={onBlurHandler} />
                Controller Password:
                <input id='controllerPassword' type='text' className='form-control' placeholder='password' value={controllerPassword} onChange={onChangeHandler} onBlur={onBlurHandler} />
                <button className={`btn btn-primary App-button`} onClick={(event) => onButtonClicked('Connect', event)}>
                    Connect
                </button>
            </div>
            <div className="RobokitHub-row">
                <form className='form' role='form' onSubmit={(event: any) => { onButtonClicked('Subscribe', event) }}>
                    <input id='targetedAccountId' type='text' className='form-control' placeholder='input' value={targetedAccountId} onChange={onChangeHandler} onBlur={onBlurHandler} />
                </form>
                <button className={`btn btn-primary App-button`} onClick={(event) => onButtonClicked('Subscribe', event)}>
                    Subscribe to robot (accountId)
                </button>
            </div>
            <div className="RobokitHub-row">
                <form className='form' role='form' onSubmit={(event: any) => { onButtonClicked('SendTTS', event) }}>
                    <input id='ttsInput' type='text' className='form-control' placeholder='input' value={ttsInput} onChange={onChangeHandler} onBlur={onBlurHandler} />
                </form>
                <button className={`btn btn-primary App-button`} onClick={(event) => onButtonClicked('SendTTS', event)}>
                    SendTTS
                </button>
            </div>
            <div className="RobokitHub-row">
                <button className={`btn btn-primary App-button`} onClick={(event) => onButtonClicked('GetBase64Photo', event)}>
                    Get Base64 Photo
                </button>
            </div>
            <div className="RobokitHub-row">
                <div className="RobokitHub-photo">
                    <img src={base64PhotoData} alt="base64Photo" />
                </div>
            </div>
        </div >
    );
}

export default RobokitHub;
