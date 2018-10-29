import React, { Component } from 'react';
import {Input } from 'reactstrap';

export default class NumberInput extends Component{
    constructor(){
        super()
        this.state ={
            value:1,
        }
    }
    onKeyPress(event) {
        const keyCode = event.keyCode || event.which;
        const keyValue = String.fromCharCode(keyCode);
        if (/\+|-/.test(keyValue) )
          event.preventDefault();
    }

    render(){
        return(
            <Input onKeyPress={this.onKeyPress.bind(this)} onChange={e => {
                if(e.target.value >= 0){
                    this.props.onChange(e.target.value);
                    this.setState({value:e.target.value})
                }}
            }
            value={this.props.value}
            type="number" 
            step="1"
            style={this.props.style}/>
        )
    }
}
