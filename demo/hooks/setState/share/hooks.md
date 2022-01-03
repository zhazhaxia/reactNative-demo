
## 分享课件

### 讲师个人介绍
1 工作经历
2 工作内容
3 工作沉淀
4 擅长方向

### 本次课程内容的大纲
1 hooks的出现
2 代数效应
3 hooks相关的数据结构
4 hooks的执行过程
5 实现一个hooks
6 hooks源码的结构

### hooks的出现
1 V16.8正式出现，用于函数组件中
2 类组件和函数组件差异
3 react团队推荐采用函数组件的编写方式写组件
4 hooks之前的函数组件，纯函数，有局限性
5 hooks 丰富函数组件的能力
6 为什么叫hooks？
  即钩子，如果需要外部功能和副作用，就用钩子把外部代码"钩"进来
7 hooks践行了代数效应

### 什么是代数效应
代数效应是一个处在研究阶段的编程语言特性，这意味着其不像 if、functions、async / await 一样，你可能无法在生产环境真正用上它。
代数效应也是一种设计思想，直接英文字面意思理解就是：代数的效果
这样理解可能比较难懂，我们从一些例子来了解下代数效应。

- 想想我们前端语言发展的一些语言特性
1 以前只能用for/while来处理循环，后面有了forEach/map/forOf等
2 以前写异步要一堆回调，现在有了async/await
3 其他

每次新语言特性出现，简化了我们程序的编写，我们都会说出三个字：tql

- try/catch的例子
1 错误异常的多层冒泡
2 一旦一个地方错误，后续代码没有办法继续执行（当然可以通过一些if/else避免，但是麻烦）
3 如何解决

- 代数效应解决try/catch的痛点
1 try/handle
2 perform 'info'
3 resume with

- 未来的探索
1 async/await完美吗？
  污染调用await的函数

2 跟react hooks的关系

简单总结：代数效应是一种可以构建新的语法糖，并简化函数调用方式的持续设计理念
### 代数效应跟reactHooks有什么关系
1 怎么让纯函数有类似类组件那样的功能？
2 如果没有reactHooks，让一个组件也具有丰富的功能，写起来会很繁琐
3 reactHooks解决繁琐，践行代数效应

### react hooks的源码实现 - 实现一个useState
useState是最常用，也是react内部实现最巧妙的hooks
1 fiber表述了一个组件
2 组件内的hooks采用单向链表构造
3 每次状态的更新采用了循环链表
4 更新后重新渲染组件


### 手写个源码吧
