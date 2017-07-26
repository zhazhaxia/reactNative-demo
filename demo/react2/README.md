# react-redux 十分钟入门

上篇介绍了[redux的入门使用](https://github.com/zhazhaxia/reactNative-demo/blob/master/demo/react1/README.md)，本文继续深入对redux的学习。


（入门redux请走 [redux 十分钟入门https://github.com/zhazhaxia/reactNative-demo/blob/master/demo/react1/README.md](https://github.com/zhazhaxia/reactNative-demo/blob/master/demo/react1/README.md)）

## 大型复杂程序之间的组件通信

问题：上篇介绍了redux的入门，知道如何实现简单的redux通信程序。但是，当程序组件多的时候，如何实现不同组件之间的通信呢？

### 方案一

- 一个程序只有一个redux容器store，可以通过组件属性下发到每个组件。

```
ReactDOM.render(<App Store={store} />, document.getElementById('root'));
```
需要通信的组件，如<App />,传递一个store进去，每个组件进行subscribe跟dispatch。（想想就觉得麻烦，还是放弃吧）

### 方案二

采用EventEmitter,全局Event对象，针对需要状态改变的组件，进行事件监听，状态改变的时候再emit触发。

- 可以用在小型的程序，程序简单化。但是对于大型的程序，推荐采用方案三。

### 方案三 react-redux

个人个感觉react-redux的思路跟方案一类似，外层提供 `<Provider />`组件包裹整个程序，往子组件下发store。react是单向数据通信的，通过react-redux可以实现双向数据绑定。可以理解为react-redux是方案一的抽象实现。

## react-redux基本使用

- 入口的声明。在/src/index.js下

```javascript
//多个reducers，需要combineReducers 组合
import { createStore , combineReducers } from 'redux';
//引入Provider
import { Provider } from 'react-redux'
//引入程序需要的reducers
import reducers from './reducers'

//创建redux容器
const store = createStore(combineReducers(reducers))

//整个程序用<Provider />包裹，并传入容器store,<App />是目标应用
ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById('root')
)

registerServiceWorker();

```
- 入口声明分三步

        - 引入redux、react-redux模块
        - 根据reducers生成容器store
        - 目标程序入口包装<Provider /> 并传入容器store

页面入口程序用<Provider />对整个应用进行声明，这样所有在<App />下的组件就可以相互通信了。下面介绍组件之间如何相互通信。

### 子组件之间的通信

在程序外层<Provider />声明后，在子组件引入 `import {connect} from 'react-redux'`。参考程序 /src/modules/InputArea.js

```javascript
import React, { Component } from 'react';
import { connect } from 'react-redux'

class InputArea extends Component {
	constructor(props){
		super(props)
		this.change = this.change.bind(this);//改些事件中的this为InputArea
	}
	change(e){
		var self = this;

		//触发reducers，改变数据，对应type的reducers会接收到请求
		this.props.dispatch({type:'name',name:e.target.value});
	}
	render() {
		var {name} = this.props;//数据绑定，name变化了，这里会收到通知，自动更新组件数据
		return (
		  	<div>
		  		name:<input value={name.name} onChange={(e)=>this.change(e)} /><br/>
		  	</div>
		);
	}
}
export default connect((state)=>{//需要通信的关联下redux容器
  return {
  	name:state.name
  }
})(InputArea);;

``` 

对于需要通信的组件，通过connect 对象导出到外部，通知redux容器当前组件需要通信，导出后组件可以关联到数据变化，以及具备数据更新的能力（dispatch）。

所有的reducers处理在 /src/reducers目录下，由/src/reducers/index.js统一管理。

- 在这个项目下还提供了两个简单用例，分别在 /src/modules/BtnAdd.js 点击按钮清除数据 和 /src/app.js绑定InputAres的数据 。读者可以运行体验下。

---

## !important 重要：下载项目运行体验才能更好理解，10分钟入门，当然不可能喇！
