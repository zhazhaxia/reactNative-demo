import React, { Component } from 'react';
import './App.css';
import BtnAdd from './modules/BtnAdd'
import InputArea from './modules/InputArea'

class App extends Component {
  render() {
    return (
      <div className="App">
        <p className="App-intro">
          hello react test demo!
        </p>
        <InputArea />
        <BtnAdd />
      </div>
    );
  }
}

export default App;
