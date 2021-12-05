
## 深入浅出React Hooks原理

网上已经有很多相关React Hooks源码和原理的介绍，都写的非常优秀简洁。这里笔者再“多此一举”“滥竽充数”写多一篇个人在学习React Hooks源码和原理后的理解，希望这里写的尽量更简洁简单一些，让读者更方便更快速理解React Hooks的原理。如果能够帮助到一些读者理解就更好了。
本篇只介绍useState()，其他的hooks相信在理解useState()，很容易触类旁通。

### 函数式组件

#### 简单引入话题
先看一段函数式组件代码。

```jsx
function Button(props){
  const { name } = props;
  return (
    <Button>{ name }</Button>
  )
}
```
在React Hooks之前，函数式组件只是一个纯组件，没有状态管理的能力，只能由父组件改变自己的状态。虽然功能少，但是函数式组件代码写起来很简洁，也越来越多开发者喜欢。所以，后来React Hooks出现了。React Hooks 让函数式组件也有类似class组件的状态管理生命周期能力。

再看一段使用了React Hooks的一段代码。大家很熟悉的一个组件。
```jsx
function Button(){
  const [count, setCount] = useState(0)
  return (
    <Button onClick={ ()=> setCount(count + 1)}>{ count }</Button>
  )
}
```
使用了React Hooks后，函数式组件的能力也更丰富了。

#### 思考几个问题
不少介绍React Hooks源码文章都会类似问读者几个问题，这里简化一下问题。

- 1 调用了 setCount() ，组件是怎么更新的
- 2 组件更新时，是怎么拿到新的状态的
- 3 多个不同Hooks，不同的状态是怎么区分开来的
- 4 一次性改变多个状态，会多次渲染吗？React Hooks是怎么处理的
- 5 所有的组件都是调用同一个useState()这个Hooks，React是怎么知道这个Hooks是作用在对应的组件上的

#### 用简化的例子来解答

我们知道每个组件都对应一个FiberNode，这里简化Fiber的数据结构，如下。
```js
const fiber = {
  stateNode: Button,
  memoizedState: null
}
```
- stateNode: 对应记录当前的组件对象
- memoizedState: 对应组件所用到的所有的hooks，这是一个链表结构

stateNode应该不用相信解释，就是指对应的组件实例。
memoizedState这里先大概说下结构。上面说到memoizedState是保存hooks的，是一个链表。这里为了简化，代码例子解释
```jsx
function Button(){
  const [count1, setCount2] = useState(0) // hooks1
  const [count2, setCount2] = useState(0) // hooks2
  return (
    <Button 
      onClick={ ()=> {setCount1(count1 + 1);setCount2(count2 + 10)}}
    >
      { count1 } ---> { count2 }
    </Button>
  )
}
```
Button用了两个状态count1,count2。那么对应的memoizedState结构就是`memoizedState -> hooks1 -> hooks2 -> null`。

那么hooks是怎么样的结构？

#### useState() 的实现

useState() 很显然是一个函数，那么我们就来实现这个函数。

```js
let isMount = true;
function useState(initailState){
  let hook;
  if(isMount){
    hook = {
      memoizedState: initialState,
      next: null 
    }
    fiber.memoizedState = hook;
  }
}
```

在这里，useState() 会创建一个hook
memoizedState: 保存的状态
next: 下一个hook，即下一个在这里，useState() 对应的hook
这里肯定有个疑问，isMount是什么？这里为了方便理解，isMount 表示当前组件的首次加载。（react源码不是这么做的，这里用isMount变量只是为了简化理解）
所以这里hook的结构就是 
```js
hook = {
  memoizedState: initialState, // hook状态
  next: null // 下一个hook
}
```
#### 如果将多个hook连接起来

上面说了，hook是一个链接结构，那hook之间怎么连接的。继续看看代码。
```js
let isMount = true;
function useState(initailState){
  let hook;
  if(isMount){
    hook = {
      memoizedState: initialState,
      next: null 
    }
    if(!fiber.memoizedState){
      fiber.memoizedState = hook;
    }else{
      fiber.memoizedState.next = hook
    }
  }
}
```
可以看出，当有两个状态，即两个 useState() 调用的时候，对应的hook结构就是上面说的`memoizedState -> hooks1 -> hooks2 -> null`，即`fiber.memoizedState.next -> hooks1, hooks1.next = hooks2, hooks2.next = null`。
但是问题来了，这里代码只能保持两个hook的联系，这样每个hook没办法按顺序连接起来。如果再多几个hook要怎么按顺序连接呢？这就需要借助一个变量workInProgressHook。
继续看workInProgressHook 是怎么用的。
```js
let isMount = true;
let workInProgressHook = null; 
function useState(initailState){
  let hook;
  if(isMount){
    hook = {
      memoizedState: initialState,
      next: null 
    }
    if(!fiber.memoizedState){
      fiber.memoizedState = hook;
    }else{
      workInProgressHook.next = hook
    }
    workInProgressHook = hook;
  }
}
```
这样用workInProgressHook，就把每个hook用链表连接一起了。所以workInProgressHook的作用是：按hook调用顺序保存最新的hook。用图示理解：

![hook链表结构](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/3/3/170a0d46dd647c0c~tplv-t2oaga2asx-watermark.awebp)

#### 组件更新的逻辑是怎么样的

刚刚讲的是组件首次挂载的情况，那组件更新状态后，重新渲染，hook要怎么保持原来的链表结构获取数据状态呢呢？继续看代码
```js
let isMount = true;
let workInProgressHook = null; 
function useState(initailState){
  let hook;
  if(isMount){
    hook = {
      memoizedState: initialState,
      next: null 
    }
    if(!fiber.memoizedState){
      fiber.memoizedState = hook;
    }else{
      workInProgressHook.next = hook
    }
    workInProgressHook = hook;
  }else{
    hook = workInProgressHook;
    workInProgressHook = workInProgressHook.next;
  }
}
```
所以，只需要更新 workInProgressHook 的指向即可获取对应hook的数据。

#### useState()的返回

我们用useState()的时候，会返回两个变量。以当前例子
```jsx
function Button(){
  const [count1, setCount2] = useState(0) // hooks1
  const [count2, setCount2] = useState(0) // hooks2
}
```
useState()返回了一个当前状态和改版状态的方法。
这里我们姑且定在内部实现里，这个状态变量名为baseState,对应改变状态的方法为dispatchAction。那么对应的useState()更改为
```js
let isMount = true;
let workInProgressHook = null; 
function useState(initailState){
  let hook;
  if(isMount){
    hook = {
      memoizedState: initialState,
      next: null 
    }
    if(!fiber.memoizedState){
      fiber.memoizedState = hook;
    }else{
      workInProgressHook.next = hook
    }
    workInProgressHook = hook;
  }else{
    hook = workInProgressHook;
    workInProgressHook = workInProgressHook.next;
  }

  let baseState = hook.memoizedState
  return [baseState, dispatchAction]
}
```

#### dispatchAction的作用和实现

dispatchAction的作用是改变hook状态，那么dispatchAction是怎么实现的呢？