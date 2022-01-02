
// 知道hooks原理后要怎么实现一个hook
const fiber = {
  stateNode:App,
  memoizedState:null
}
let isMount = true;
let workInProgressHook = null

function useState(initialState){
  let hook;

  if(isMount){
    hook = {
      memoizedState: initialState,
      next: null,
      queue:{
        penging:null
      }
    }

    if(!fiber.memoizedState){
      fiber.memoizedState = hook
    }else{
      workInProgressHook.next = hook
    }
    workInProgressHook = hook
  }else{
    hook = workInProgressHook
    workInProgressHook = workInProgressHook.next
  }

  let baseState = hook.memoizedState
  if(hook.queue.penging){
    let firstUpdate = hook.queue.penging.next

    do {
      const action = firstUpdate.action
      baseState = action(baseState)
      firstUpdate = firstUpdate.next
    } while (firstUpdate!==hook.queue.penging.next);
    hook.queue.penging = null
  }
  hook.memoizedState = baseState

  return [baseState, dispatchAction.bind(null,hook.queue)]
}

function dispatchAction(queue,action){
  let update = {
    action,
    next:null
  }


  if(queue.penging === null){
    // u0 -> u0
    update.next = update
  }else{
    // u1->u0->u1
    // u2->u0->u1->u2
    // u3?  u3->u0->u1->u2->u3
    // update.next要指向谁？ queue.penging.next又要指向谁？
    update.next = queue.penging.next
    queue.penging.next = update
  }
  queue.penging = update;

  schedule()
}

function schedule(){
  workInProgressHook = fiber.memoizedState
  const app = fiber.stateNode()
  isMount = false
  return app
}




function App(){
  const [ count, setCount ] = useState(0)

  // useEffect(()=>{},[])
  // useMemo(()=>{},[])
  // useCallback(()=>{},[])

  console.log('count:',count)
  return {
    onclick(){
      setCount(x=>x+1)
    }
  }
}

window.app = schedule()