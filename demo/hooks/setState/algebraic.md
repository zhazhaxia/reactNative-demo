### 代数效应的简单理解

​	之前了解`React Hooks`原理的时候，看到一个概念：`代数效应`。然后尝试了解“代数效应”到底是什么。看了一圈，依然没有特别彻底的理解。不过，还是尝试写下自己对“代数效应”的理解。

![Pic from Using algebraic effects in Ruby for Dependency Injection - DEV Community](https://kg.qq.com/gtimg/music/common/upload/image/R40BQUSMXPX5NEBA1PNRMU.jpg)

## 代数效应的字面意思

先看看“代数效应”的英文：`algebraic effects`。先拆拆开来理解。

- `algebraic `：代数的
- `effect`：效果，影响

#### 代数和效应的字面意思

​	中文翻译为“代数效应”，但是个人觉得这样翻译可能比较难理解，我在理解的时候，是把这个概念等价于“表达式带来的效果”。

​	为什么这么说呢？

- 代数：如果简单理解，其实就是研究数学表达式的学科。真实的代数解释不是这样的，概念也比较广，但是为了自己方便理解，先这样解释。

  > 代数里面每个数值运算，采用不同的运算符，会有不同的结果。比如` 1+1=2`，`1-1=0` . 这里用了加（+）号和减（-）号两种运算符。那如果再复杂一点点，`1+（1-1）=1`，这里我加了括号，改变了计算的优先级，上过小学数学都知道，括号的优先级高一些。可以看出，不同的运算符，会改变计算的结果。

- 效应：即某种计算后的效果。

#### 代数效应的初级理解

> 好的，一个不是很恰当的总结来了，假设“代数效应”用在数学代数计算里面，那就是：我设计了一种运算符，可以改变数值计算的结果或者优先级，然后产生一种跟以往没有的新的效果，那这种设计行为和运算结果，就是代数效应。比如：我设计了一个运算符号`#`号，对应的运算结果是`1#1=3`. 对应意思就是，使用了`#`运算符，会让后面的数字，重复相加两次，这个表达式相当于 `1+1+1=3`. 当然了，这个表达式不存在的。只是为了举例理解。

​	终于，要开始讲JavaScript函数式编程里面的代数效应了。如果你看不懂上面的也没关系，毕竟有部分是个人臆造的。

## 代数效应的程序举例

> ​	首先明确下，代数效应是针对函数式编程的。

#### async/await的烦恼

好的开始讲，先看一段代码。

```javascript
async function addNum(num1,num2){
    return num1 + num2;
}
async function getNum(){
    const count = await addNum(2,3)
    return count;
}
async function main(){
    const result = await getNum();
    console.log(result)
}
main();
```

​	我们知道使用`async/await `语法糖可以在我们的异步代码里面减少很多回调的写法，让代码看起来更清晰。但是问题来了，使用了 `await`语法糖的函数，也必须使用`async `把函数变成异步的。这样就变成另外一种嵌套了，`async/await`的异步嵌套。有时候这种代码也很烦的。

​	那有没有办法可以做到，我可以异步调用一个函数，同时又不会改变我同步函数的逻辑呢？这个时候代数效应来了。

#### try/catch的引入

​	我们再看一段代码。

```javascript
function addNum(num1,num2){
    if(typeof num1 !== 'number'){
        throw new Error('dataType_error');
    }
    return num1 + num2;
}
function getNum(){
    const count1 =  addNum('',3)
    const count2 =  addNum(4,5)
    console.log(count1,count2)
}
try {
    getNum();
}catch (err){
    console.error('uncaught typeerror:',err)
}
```

​	一段很常见的web错误处理的代码。从这里代码可以看到，`addNum`中 `throw`了一个error，这个error穿过了`getNum`，最终冒泡到`catch`。在我们t`ry/catch`包裹同步代码中，错误异常是一步步冒泡上来的。

​	这样处理有什么问题吗？答案是：没有！

​	那这跟前面说的代数效应有啥关系？答案是：有！

​	`假设`在很久很久以前的前端，js是没有`try/catch`，后面为了方便程序员捕获错误，所以`w3c草案`就新增了新的语法糖` try/catch`，方便程序员在业务逻辑中处理一些异常，以便更好的提高我们代码质量。在这里 `try/catch `就是我们说的新的运算表达式，而`catch`的调用，就是我们前面说的表达式 想要达到的效果。

​	那这就是代数效应吗？不完全，但是可以作为代数效应的理解。

#### try/catch的问题

​	我们继续深入一下。

​	这里我们发现有个问题，`try/catch` 遇到异常，在对应代码块就停止了，直接走到`catch`。那有没有办法，即使走到`catch`，也可以让发生异常代码的后面的正常程序执行呢？

​	答案是：以当前的做法，不大行。

​	但是用“代数效应”的话，就可以。怎么做呢？

#### 新的语法糖

​	我们假定，在`ES2026`出了一个新的语法糖，支持我们上面的需求（异常后依然可以继续执行后续正常代码）。先看看下面这段代码是怎么做的。

```javascript
function addNum(num1,num2){
    if(typeof num1 !== 'number'){
       num1 = perform 'dataType_error';
    }
    return num1 + num2;
}
function getNum(){
    const count1 =  addNum('',3)
    const count2 =  addNum(4,5)
    console.log(count1,count2)
}
try {
    getNum();
}handle (effect){
    if(effect === 'dataType_error'){
        resume with 0
    }
}
```

> 注意：这里` perform`，`try/handle`，`resume with` 是不存在的，是虚构的一个语法糖，你可以理解为是一种新创造的表达式。（perform理解为运行抛出，resume理解为恢复）

​	好的，这里我们创造了`perform`，`try/handle`，`resume with`，这几个表达式。那这几个表达式的作用是什么呢？

​	对比之前`throw`语句，`throw`抛出一个异常，在`catch`捕获。`perform`也是抛出一个信息，让`handle`接收。但是这里跟`throw`不一样的是，`throw`后，程序不会回到原来异常的位置继续执行了。但是`perform`抛出信息后，可以在`handle`接收，并通过`resume with `返回一个新的信息给`perform`。这样使得`perform`后续的代码可以继续执行。

​	总结来说，在当前示例中，`perform`这个运算符让程序带来了一个新的`效果（效应）`，告诉代码，当类型错误的时候，要怎么处理。

​	以上就是代数效应的一些初步的思想。

#### 新表达式的疑问

​	那有人会问，以上`perform`部分的逻辑我直接`if/else`判断不也是可以？当然可以，这里的例子只是说明：

> 当我们代码想要完成一些当前函数式编程不大方便处理的逻辑时，是否有更优雅的语法糖可以满足我们的需求，来解决我们的烦恼。就比如当我们觉得`Promise`异步回调多层嵌套麻烦时，出现了`async/await`帮我们解决回调问题。

#### 更进一步的举例对比

上面的例子稍微再拓展一下，如果我们`perform`对应的`handle`处理是一个异步的话，那应该怎么办？先看看代码。

```javascript
function addNum(num1,num2){
    if(typeof num1 !== 'number'){
       num1 = perform 'dataType_error';
    }
    return num1 + num2;
}
function getNum(){
    const count1 =  addNum('',3)
    const count2 =  addNum(4,5)
    console.log(count1,count2)
}
try {
    getNum();
}handle (effect){
    if(effect === 'dataType_error'){//这里是一个异步
        setTimeout(()=>{
        	resume with 0
        },1000)
    }
}
```

如果没有`perform/handle`，那么我们原来的代码可能会改成`if/else`逻辑，但是这里处理的是一个异步。代码就可能变成以下这样：

```javascript
async function addNum(num1,num2){
    if(typeof num1 !== 'number'){
       num1 = await perform（'dataType_error');
    }
    return num1 + num2;
}
async function getNum(){
    const count1 =  await addNum('',3)
    const count2 =  await addNum(4,5)
    console.log(count1,count2)
}
async function perform(effect){
    if(effect === 'dataType_error'){
        return new Promise(resolve=>{
            setTimeout(()=>{
                return 0
            },1000)
        })
    }
}
getNum();
```

有没有发现，`async/await`是有传染性的，如果一个地方用了`await`，那么对应调用的函数也得加上`async`，但是很多时候这并不是我们所需要的。

#### 代数效应理解小结

​	写到这里，对于代数效应就讲的差不多了，这里可能会问，是不是所有新的表达式都是代数效应？个人觉得当看不懂别人说的代数效应是什么的时候，就可以这么理解。另外需要重申，代数效应不是必须要了解的，如果你只是好奇，就可以继续深入，因为这个概念，确实很难具体化。然后，JavaScript并不支持代数效应的实现。

## React Hooks在代数效应的实践思考

​	那代数效应跟`React  Hooks`有什么关系？

​	在没有hooks之前，我们的函数式组件功能是单一的，比如：

```jsx
function Counter(props){
    const { num } = props
    return <p>{num}</p>
}
```

​	想要再丰富这个函数组件，让函数组件，有类似class组件的能力，改怎么做？

​	于是聪明的开发者设计了hooks，让函数式组件功能更丰富了。

```javascript
function Counter(){
    const [num,setNum] = useState(0)
    return <p onClick={()=>setNum(num=>num+1)}>{num}</p>
}
```

​	这是一个简单的使用了hooks的例子。想一下，	`useState`怎么知道自己作用在哪一个组件下的？使用了`useState`后，是怎么改变了组件的状态的？

​	React Hooks其实可以理解为就是代数效应的最佳实践了，虽然hooks并没有创造新的语法糖，但是这种实现方式，其实就是在践行代数效应。因为`useState`让我们的函数组件，实现了一个新的效果。

​	关于`useState`具体怎么实现的，后续一篇文章会讲解。

## 写在最后

​	最后，关于代数效应，本篇只是作为笔者粗略的不恰当的理解的记录，并非代数效应的本质解释，如果想更深入的了解代数效应，可以参考更多网络文献。

## 参考文献：

https://github.com/ocamllabs/ocaml-effects-tutorial

https://overreacted.io/zh-hans/algebraic-effects-for-the-rest-of-us/