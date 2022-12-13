import React from 'react';
import './App.css';
import Model from './model/Model';
import RobokitHub from './components/RobokitHub/RobokitHub';

function App({model}: {model: Model}) {
  return (
    <div className="App">
      <RobokitHub model={model}/>
    </div>
  );
}

export default App;
