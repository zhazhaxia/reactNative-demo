# redux 十分钟入门

> 世间哪有十分钟就入门的好东西。。。不过这篇是本人入门的时候看了许多篇自己总结的结晶，虽然里面有很多文字描述都不对，但是程序还是可以跑起来的。有任何疑问，直接来找我吧。

> 一定要跑下程序，不亲自动手再好的学习方法也教不会你

准备工作

- 安装react构建工具 `npm install create-react-app -g`

- 构建react项目 `create-react-app myProject`

- 启动项目 `cd myProject & npm start`

- 目录结构 

``` 
/public
/src
/node_modules

/src/app.js
/src/index.js
...

```

- redux初体验

在 /src/index.js
```javascript
//引用redux模块
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


```


## redux使用小白解释

- redux是用来处理应用程序“状态”的。

	一个应用程序会有许多状态，这些状态之间的联系，要怎么管理呢？比如一个组件A可以有各种颜色，这些颜色可以被其他组件改变，如果关联这些组件之间的状态呢，这就可以用redux来处理。

- redux采用的模式是“订阅者模式”，即“订阅 ——> 发布”，订阅者订阅一些需求，发布者可以随时分发需求，订阅者接受并处理。
	
	也可以理解为是事件请求，事件监听到事件触发的一个过程。

## redux 使用解释

- 引入redux 模块 `import { createStore } from 'redux'`

- redux 的结构分为三部分

	- 初始状态 INIT_STATE

		每个程序或者组件都会有自己默认的状态，当没有其他额外的改变，组件状态由默认状态指定

	- 状态函数reducers

		reducers是用来处理组件状态的，接受两个参数，state、action。

		state是组件的状态，state不能修改。

		action决定对哪个状态进行处理，必要属性action.type ，指定了对应的状态，组件状态改变请求时，action可以加上其他参数，对状态进行处理。

	- 容器store

		设计完reducers后，就可以创建容器了，通过createStore创建的容器，可以对reducers里面的状态进行处理

		store主要有两个方法，subscribe、dispatch

		subscribe类似事件监听

		dispatch类似用来触发事件，然后subscribe接收。dispatch可以通过action的type，指定哪个组件状态改变。

## redux 入门更进一步

有时候组件多的时候，总不能把每个组件的action.type都写在一个reducers里面，所以此时需要将多个reducers分开，这个时候可以用combineReducers，引入`import { combineReducers } from 'redux'`

- 使用

```javascript
import { createStore, combineReducers } from 'redux'

//初始状态
const INIT_STATE = {
	name : 'milu',
	age : '23'
}
//多个reducer 任务
const reducer1 = (state  = INIT_STATE, action) => {
	switch (action.type) {
		case 'name':
			return Object.assign(state,{name : action.name || "no set name"})
			break;
		default:
			return state
			break;
	}
}
const reducer2 = (state  = INIT_STATE, action) => {
	switch (action.type) {
		case 'age':
			return Object.assign(state,{age : action.age || 23})
			break;
		default:
			return state
			break;
	}
}
//组合多个reducers
const combineReducer = combineReducers({
	reducer1,
	reducer2,
})
//生成容器
const store = createStore(combineReducer)

//可以进行逻辑使用了
```

可以把所有reducers放在一个目录下，统一用一个reducers目录管理，然后用统一导出。

---

以上就是redux的基本使用，下篇介绍react-redux的使用。

传送门[react-redux十分钟入门https://github.com/zhazhaxia/reactNative-demo/edit/master/demo/react2/README.md](https://github.com/zhazhaxia/reactNative-demo/edit/master/demo/react1/README.md)
