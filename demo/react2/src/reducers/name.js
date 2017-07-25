const name = (state = { name: 'milu' }, action) =>{
  	switch (action.type) {
	    case 'name':

			// console.log('desc',state)
	      	return { name: action.name }
	      	break;
	    default:
	      	return state
  	}
}
export default name;