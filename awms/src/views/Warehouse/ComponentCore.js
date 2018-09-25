import React, { Component } from 'react';
import {Link}from 'react-router-dom';
import "react-table/react-table.css";
import {Input, Form, FormGroup, Card, CardBody, Button } from 'reactstrap';
import Select from 'react-select';
import Axios from 'axios';

class AutoSelect extends Component{
    constructor(){
        super()
        this.state ={
            dataselect:[],
            data:[],
            multi:false,
        }
        this.handleChange = this.handleChange.bind(this)
    }

    componentDidMount(){
        this.setState({dataselect:this.props.defaultValue})
        this.setState({data:this.props.data})
        this.setState({multi:this.props.multi? this.props.multi : false})
    }

    componentWillReceiveProps(nextProps){
        this.setState({data:nextProps.data})
    }

    handleChange(dataselect){
        this.setState({dataselect:dataselect},() =>{
        if(this.props.result)
            this.props.result(this.state.dataselect)
        })
    }

    render(){
        return(
            <Select
                value={this.state.dataselect}
                onChange={(e) => this.handleChange(e)}
                options={this.state.data}
                isMulti={this.state.multi}
            />
        )
    }
}

const Clone = (obj) => {
    var copy;
  
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;
  
    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }
  
    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = Clone(obj[i]);
        }
        return copy;
    }
  
    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = Clone(obj[attr]);
        }
        return copy;
    }
  
    throw new Error("Unable to copy obj! Its type isn't supported.");
  }
  
export {AutoSelect, Clone}