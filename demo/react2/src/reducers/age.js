const age = (state = { age: 23 }, action) =>{
  	switch (action.type) {
	    case 'age':

			// console.log('desc',state)
	      	return { age: action.age }
	    default:
	      	return state
  	}
}
export default age;