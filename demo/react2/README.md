# react-redux 十分钟入门

上篇介绍了redux的入门使用，本文继续深入对redux的学习

## 大型复杂程序之间的组件通信

问题：上篇介绍了redux的入门，知道如何实现简单的redux通信程序。但是，当程序组件多的时候，如何实现不同组件之间的通信呢？

### 方案一

- 一个程序只有一个redux容器store，可以通过组件属性下发到每个组件。

```
ReactDOM.render(<App Store={store} />, document.getElementById('root'));
```
需要通信的组件，传递一个store进去，每个组件进行subscribe跟dispatch。（想想就觉得麻烦，还是放弃吧）

### 方案而 react-redux

