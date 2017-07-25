import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import { createStore } from 'redux';

//初始状态
const INIT_STATE = {
	name : 'milu',
	age : '23'
}
//reducer 任务
const reducer = (state  = INIT_STATE, action) => {
	switch (action.type) {
		case 'name':
			return Object.assign(state,{name : action.name || "no set name"})
			break;
		case 'age':
			return Object.assign(state,{age : action.age || 23})
			break;
		default:
			return state
			break;
	}
}
const store = createStore(reducer)
//订阅 （相当于监听事件）
store.subscribe(()=>{
	console.log('当前状态：',store.getState())
})

store.dispatch({type:'name',name:'zhazhaxia'})
setTimeout(()=>{
	store.dispatch({type:'age',age:22})
},3000)

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
