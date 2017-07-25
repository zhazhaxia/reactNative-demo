import React, { Component } from 'react';

class InputArea extends Component {
	constructor(props){
		super(props)
		console.log('InputArea constructor...')
		this.change = this.change.bind(this)
		this.state = {
			val : 'hello'
		}
	}
	componentDidMount(){
	}
	change(e){
		this.setState({
			val : e.target.value
		})
	}
	render() {
		var val = this.state.val
		return (
		  	<div>
		  		<input value={val} onChange={(e)=>this.change(e)} />
		  	</div>
		);
	}
}

export default InputArea;
