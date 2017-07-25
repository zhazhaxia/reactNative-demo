import React, { Component } from 'react';
import { connect } from 'react-redux'

class InputArea extends Component {
	constructor(props){
		super(props)
		console.log('InputArea constructor...')
		this.change = this.change.bind(this)
		this.state = {
			name : 'hello',
		}
	}
	componentDidMount(){
	}
	change(e){
		var self = this
		this.props.dispatch({type:'name',name:e.target.value})
	}
	render() {
		var {name} = this.props
		return (
		  	<div>
		  		name:<input value={name.name} onChange={(e)=>this.change(e)} /><br/>
		  	</div>
		);
	}
}

export default connect((state)=>{
  return {
  	name:state.name
  }
})(InputArea);;
