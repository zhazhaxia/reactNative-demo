
const fiber = {
  stateNode:App,
  memoizedState:null
}
let workInProgressHook = null
let isMount = true


function useState(initialState){

  let hook;
  if(isMount){
    hook = {
      memoizeState:initialState,
      next:null,
      queue:{
        pending:null
      }
    }

    if(!fiber.memoizedState){
      fiber.memoizedState = hook
    }else{
      workInProgressHook.next = hook
    }
    workInProgressHook = hook;
  }else{
    hook = workInProgressHook;
    workInProgressHook = workInProgressHook.next
  }

  let baseState = hook.memoizeState;

  if(hook.queue.pending){
    let firstUpdate = hook.queue.pending.next;

    do{
      let action = firstUpdate.action
      baseState = action(baseState)
      firstUpdate = firstUpdate.next
    }while(firstUpdate !== hook.queue.pending.next)
    hook.queue.pending = null
  }

  hook.memoizeState = baseState;

  return [baseState,dispatchAction.bind(null,hook.queue)]
}

function dispatchAction(queue,action){
  let update = {
    action,
    next:null
  }

  if(!queue.pending){
    update.next = update;
  }else{
    update.next = queue.pending.next
    queue.pending.next = update
  }

  queue.pending = update

  schedule()

}

function schedule(){
  workInProgressHook = fiber.memoizedState;
  let app = fiber.stateNode()
  isMount = false;
  return app;
}


function App(){
  const [count,setCount] = useState(0)
  const [count2,setCount2] = useState(0)
  console.log('count:',count);
  console.log('count1:',count2);
  return {
    onclick(){
      setCount(x=>x+1)
      setCount2(x=>x+10)
    }
  }
}

window.app = schedule()