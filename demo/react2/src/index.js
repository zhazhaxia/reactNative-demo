import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import { createStore , combineReducers } from 'redux';
import { Provider } from 'react-redux'
import reducers from './reducers'


const store = createStore(combineReducers(reducers))


ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById('root')
)

registerServiceWorker();
