let isMount = true; // 是否首次加载
let workInProgressHook = null; // 当前运行的hook

// 组件fiber的状态节点，这里全局
const fiber = {
  stateNode: App,
  memoizedState: null
}

function useState(initialState) {
  let hook;

  if (isMount) {//首次加载组件， 新建对应状态hook
    hook = {
      memoizedState: initialState,// 状态
      next: null, // 下一个hook
      queue: { // 一个state的更新循环链表
        pending: null
      }
    }
    // 这里是更新链表的过程：新增节点
    if (!fiber.memoizedState) { // fiber.hook1 -> hook2 -> hook3 ->.....
      fiber.memoizedState = hook;
    } else {
      workInProgressHook.next = hook; // 让上一个hook指向当前的hook，更新workInProgressHook
    }
    /**
     *  fiber.hook1 -> hook2 -> hook3 ->.....
     *                            ↑
     *                     workInProgressHook
     */
    workInProgressHook = hook; // workInProgressHook 记录链表最后一个 节点
  } else { // 组件已mount
    hook = workInProgressHook;
    workInProgressHook = workInProgressHook.next;
  }

  let baseState = hook.memoizedState;

  if (hook.queue.pending) {
    let firstUpdate = hook.queue.pending.next;

    do {
      const action = firstUpdate.action;
      baseState = action(baseState);
      firstUpdate = firstUpdate.next;
    } while (firstUpdate !== hook.queue.pending.next)

    hook.queue.pending = null;
  }
  //更新当前hook的state
  hook.memoizedState = baseState;
  return [baseState, dispatchAction.bind(null, hook.queue)]
}
/**
 * 
 * @param {Object} queue 
 * @param {Function|String|Object|Number|...} action 要更新的状态
 */
let timer = null
function dispatchAction(queue, action) {
  // 待更新状态的链表节点
  const update = {
    action,
    next: null
  }

  if (queue.pending === null) {
    // 只有一个的时候 update1 -> update1
    update.next = update;
  } else {
  /**
   * 两个：update2 -> update1 -> update2  ,  queue.pending = update2
   * 三个：update3 -> update1 -> update2 -> update3
   * 假设有3个update，queue.pending对应最新那个update
   *                    ↓ ←   ←  ←   ←   ←  ← ↑
   * queue.pending = update3 -> update1 -> update2
   *                    ↑      
   *                queue.penging
   */
    update.next = queue.pending.next;
    queue.pending.next = update;
  }
  queue.pending = update;
  console.log("queue:",queue.pending)
  if(timer)return;
  timer = setTimeout(()=>{
    timer = null
    schedule();
  },100)
}

function schedule() {
  workInProgressHook = fiber.memoizedState;
  const app = fiber.stateNode();
  isMount = false;
  return app;
}

function App() {
  const [num, updateNum] = useState(0);
  const [num22, updateNum22] = useState(0);

  console.log('isMount?', isMount);
  console.log('num:', num)
  console.log('num22:', num22)


  return {
    onClick() {
      updateNum(num => num + 1)
      updateNum(num => num + 2)
      updateNum(num => num + 3)
      // updateNum22(num => num + 10)
    },
    onFocus() {
      updateNum22(num => num + 10)
    }
  }
}

window.app = schedule();