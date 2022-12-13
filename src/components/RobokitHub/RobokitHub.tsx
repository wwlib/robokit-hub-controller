import React from 'react';
import './RobokitHub.css';
import Model from '../../model/Model';
import CognitiveHubClientController from '../../model/CognitiveHubClientController';

function RobokitHub({ model }: { model: Model }) {

    const [cognitiveHubClient, setCognitiveHubClient] = React.useState<CognitiveHubClientController | undefined>(undefined)
    const [base64PhotoData, setBase64PhotoData] = React.useState<string>('')

    const base64PhotoHandler = (base64PhotoData: string) => {
        setBase64PhotoData(base64PhotoData)
    }

    React.useEffect(() => {
        if (cognitiveHubClient) {
            cognitiveHubClient.connect()
            cognitiveHubClient.on('base64Photo', base64PhotoHandler)
        }
    }, [cognitiveHubClient]);

    const onButtonClick = (action: string) => {
        console.log(`onButtonClick:`, action)
        switch (action) {
            case 'Connect':
                if (cognitiveHubClient) {
                    cognitiveHubClient.off('model', base64PhotoHandler)
                }
                setCognitiveHubClient(model.getCognitiveHubClientController(true))
                break;
            case 'Subscribe':
                if (cognitiveHubClient) {
                    const commandData = {
                        type: 'hubCommand',
                        name: 'subscribe',
                        payload: {
                            connectionType: 'device',
                            accountId: 'robot9'
                        }
                    }
                    cognitiveHubClient.sendCommand(commandData, 'robot9')
                }
                break;
            case 'GetBase64Photo':
                if (cognitiveHubClient) {
                    const commandData = {
                        type: 'command',
                        name: 'getBase64Photo',
                    }
                    cognitiveHubClient.sendCommand(commandData, 'robot9') // TODO: get the targetAccountId from somewhere (form/login)
                }
                break;
        }
    }

    return (
        <div className="RobokitHub">
            <div className="RobokitHub-row">
                <button className={`btn btn-primary App-button`} onClick={() => onButtonClick('Connect')}>
                    Connect
                </button>
                <button className={`btn btn-primary App-button`} onClick={() => onButtonClick('Subscribe')}>
                    Subscribe to robot9
                </button>
                <button className={`btn btn-primary App-button`} onClick={() => onButtonClick('GetBase64Photo')}>
                    Get Base64 Photo
                </button>
            </div>
            <div className="RobokitHub-row">
                <img src={base64PhotoData} alt="base64Photo" />
            </div>
        </div>
    );
}

export default RobokitHub;
