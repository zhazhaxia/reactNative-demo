import React, { Component } from 'react';
import {connect} from 'react-redux'
class BtnAdd extends Component {
	constructor(props){
		super(props)
		console.log('constructor...')
		this.click = this.click.bind(this)
	}
	componentDidMount(){
		console.log('did mount...')
	}
	click(){
		this.props.dispatch({type:'name',name:""})
	}
	render() {
		return (
		  	<div>
		  		<button onClick={this.click}>clear</button>
		  	</div>
		);
	}
}

export default connect((state)=>{
	return {
  		name:state.name
	}
})(BtnAdd)
