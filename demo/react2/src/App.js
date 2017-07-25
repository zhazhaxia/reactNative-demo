import React, { Component } from 'react';
import './App.css';
import BtnAdd from './modules/BtnAdd'
import InputArea from './modules/InputArea'
import { connect } from 'react-redux'

class App extends Component {
  render() {
    var {name} = this.props
    return (
      <div className="App">
        <p className="App-intro">
          {name.name}
        </p>
        <InputArea />
        <BtnAdd />
      </div>
    );
  }
}

export default  connect((state)=>{
  return {
    name:state.name
  }
})(App);
