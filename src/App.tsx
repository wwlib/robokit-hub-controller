import React from 'react';
import './App.css';
import Model from './model/Model';
import RobokitHubController from './components/RobokitHubController/RobokitHubController';

function App({model}: {model: Model}) {
  return (
    <div className="App">
      <RobokitHubController model={model}/>
    </div>
  );
}

export default App;
