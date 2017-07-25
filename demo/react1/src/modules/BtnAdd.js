import React, { Component } from 'react';

class BtnAdd extends Component {
	constructor(props){
		super(props)
		console.log('constructor...')
	}
	componentDidMount(){
		console.log('did mount...')
	}
	render() {
		return (
		  	<div>
		  		<button>click me!!!</button>
		  	</div>
		);
	}
}

export default BtnAdd;
