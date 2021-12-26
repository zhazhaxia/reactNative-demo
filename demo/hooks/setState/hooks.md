
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
  // TODO
  return [baseState, dispatchAction]
}
```
这段代码还不完善，很明显，每次更细组件，状态都不会变。下面我们就让状态更新起来。

#### dispatchAction的作用和实现

dispatchAction的作用是改变hook状态，那么dispatchAction是怎么实现的呢？

react采用循环链表的结构管理hook对应的状态。这里我们改下hook结构，新增一个变量
```js
hook = {
  memoizedState: initialState,
  next: null ,
  queue: {
    pending: null
  }
}
```
这里新增了一个 queue对象，里面有个属性pengding，pengding保存的就是当前改变的hook的状态。我们定义下这个状态节点
```js
const update = {
    action,
    next: null
  }
```
每一个更新对应了一个update节点，action对应更新状态的方式，可以是一个变量赋值，也可以是一个函数返回值。
next指向下一个要更新的update节点。

那么我们可以开始写dispatchAction这个函数了
注意：这一步往往是比较多读者不好理解的一步，这里先给出基础代码，进行一步步拆解分析。
```js
/**
 * @param {} queue 对应hook待更新的状态队列
 * @param {} action 更新操作，直接传值or函数回调
 */
function dispatchAction(queue, action) {
  // 1 每次更新都对应一个update
  const update = {
    action,
    next: null
  }
  // 2 先说明，queue.pending在react是一个循环链表，至于为什么是循环链表，后面有解释。
  if (queue.pending === null) {
  // 3 当链表为空，则自己指向自己 update1 -> update1
    update.next = update;
  } else {
  // 3 当链表已有值，比如此时有两个update，那么 update2 -> update1 -> update2
  //   如果是三个update，那么 update3 -> update1 -> update2 -> update3
    update.next = queue.pending.next;
    queue.pending.next = update;
  }
  // 4 queue.pending 指向最新的update，即第一个pengding 就是最新那个update
  queue.pending = update;
}
```
- 解释下queue的作用，因为这里用户可以执行多次setState()，比如这里多次执行setCount()，多个状态放到链表，按顺序执行，直到更新完queue。

- 补充下第2步的图例，因为这里queue.pengding是一个循环链表，所以当只有一个的时候，只能自己指向自己，构成一个环。
    ![update](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/3/3/170a091ce075e3de~tplv-t2oaga2asx-watermark.awebp)
- 补充下第3步的图例说明
    ![update](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/3/3/170a091ce075e3de~tplv-t2oaga2asx-watermark.awebp)
- 是不是还有一个疑问，为什么queue.pending对应最新的更新节点？这里后面会解释。

既然状态更新的链表结构生成了，那么怎么样让每次setState的值更新到组件里面呢？

#### 让组件更新状态

我们知道，在setState() 后，组件会重新渲染。意味着这里会重新执行函数组件，比如这里重新执行 Button()，对应着，重新执行useState()。写代码的时候知道，重新执行useState()拿到的状态，就不再是初始传递的那个值，而是新值了，那说明这里更新新值，也是在useState()里面处理的。
下面，我们就看看useState()是怎么拿到新值的。
直接看代码吧，新增部分为TODO部分


```js
function useState(initailState){
  // ... 这里是hook单向链表逻辑，代码同上，为简化理解，先省略

  let baseState = hook.memoizedState
  // TODO
  if(hook.queue.penging){
    let firstUpdate = hook.queue.penging.next
    do{
      const action = firstUpdate.action;
      baseState = action();
      firstUpdate = firstUpdate.next;
    }whild(firstUpdate !== hook.queue.penging.next)

    hook.queue.penging.next = null
  }
  hook.memoizedState = baseState;
  return [baseState, dispatchAction.bind(null,hook.queue)]
}
```

这里我们其实就只是新增了 TODO 部分。根据代码逻辑可以看出，其实就是把queue.penging的状态链表都执行一遍，获取更新的状态后，返回给组件。
整体逻辑为
- 获取初始节点，即第一个update，`firstUpdate = hook.queue.penging.next`
- 更新状态 action()。这里是以action为函数回调类型举例，也可以是直接变量赋值。
- 更新下一个update firstUpdate = firstUpdate.next
- 当链接又指向第一个更新节点后，结束循环 firstUpdate !== hook.queue.penging.next

可以得出一个结论，这里hook的状态更新是根据执行顺序确定的。即假设有三个update，那么更新顺序为 update1 -> update2 -> update3
对应图例为
    ![update](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2020/3/3/170a091ce075e3de~tplv-t2oaga2asx-watermark.awebp)

那么我们还剩下一个问题，在setState()后，怎么调用更新组件的？

#### 组件的更新

在react源码里面，更新状态后，调用 scheduleUpdateOnFiber() 这个调度器更新的。我们现在不讨论 scheduleUpdateOnFiber()怎么实现的，这块会比较复杂，后面可以写文章分析。但是这里我们简化一下调度器的实现，只是为了方便理解hook更新状态后怎么更新组件。

我们这里实现一个函数schedule()，用来渲染和更新组件。

```js
function schedule() {
  workInProgressHook = fiber.memoizedState;
  const app = fiber.stateNode();
  isMount = false;
  return app;
}
```

每次更新状态后，调用 schedule() 重新渲染组件。即dispatchAction 在处理完hook的状态逻辑后，调用schedule()重新渲染。(当然react不是这样的，react采用了更高级的调度器来更新，再次说明，这里是为了简化理解的表达)
```js
function dispatchAction(queue, action) {
  // ... 状态update逻辑，这里省略

  schedule()
}
```
显然，这里有个问题，以上所有代码是同步的，意味着每次setState()都会重新执行render()，这样性能会很差，我们可以简单模拟下调度，在渲染之前加个Promise()或者setTimeout()来模拟，至于怎么写，可以思考下。

#### 最后的总结


