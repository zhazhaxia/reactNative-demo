
let fiber = {
  stateNode: App,
  memoizedState:null
}
let isMount = true;
let workInProgressHook = null;

let timer = null

function useState(initialState){
  let hooks;

  if(isMount){
    hooks = {
      memoizedState: initialState,
      next: null,
      queue:{
        pending: null
      }
    }
    if(!fiber.memoizedState){
      fiber.memoizedState = hooks
    }else{
      workInProgressHook.next = hooks
    }
    workInProgressHook = hooks
  }else{
    hooks = workInProgressHook
    workInProgressHook = workInProgressHook.next;
  }

  // todo
  let baseState = hooks.memoizedState
  if(hooks.queue.pending){
    let firstUpdate = hooks.queue.pending.next

    do{
      let action = firstUpdate.action
      baseState = typeof action === 'function'?action(baseState):action
      firstUpdate = firstUpdate.next
    }while(firstUpdate!==hooks.queue.pending.next)
    hooks.queue.pending = null;
  }
  hooks.memoizedState = baseState

  return [baseState, dispatchAction.bind(null,hooks.queue)]
}


function dispatchAction(queue,action){
  let update = {
    action,
    next:null
  }

  if(!queue.pending){
    // u0 -> u0
    update.next = update;
  }else{
    // u0->u1->u2->u0
    // u3 u3->u0->u1->u2->u3
    update.next = queue.pending.next;
    queue.pending.next = update
  }
  queue.pending = update;

    schedule()
}

function schedule(){
  workInProgressHook = fiber.memoizedState
  let app = fiber.stateNode()
  isMount = false

  return app;
}

function App(){
  const [count,setCount] = useState(1)
  console.log("count:",count)
  function onfocus(){
    setCount(count+10)
  }
  return {
    onclick(){
      setCount(x=>x+1)

    },
    onfocus(){
      console.log("count:",count)
    }
  }
}

window.app = schedule();