import React, { Component } from 'react';
import {Link}from 'react-router-dom';
import "react-table/react-table.css";
import "./componentstyle.css";
import {Input, Form, FormGroup, Card, CardBody, Button } from 'reactstrap';
import Select from 'react-select';
import Axios from 'axios';
import TableGen from '../Warehouse/MasterData/TableSetup'
import ExtendTable from '../Warehouse/MasterData/ExtendTable'
import _ from 'lodash'

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
        this.setState({dataselect:this.props.defaultValue, data:this.props.data, multi:this.props.multi? this.props.multi : false})
    }

    componentWillReceiveProps(nextProps){
        this.setState({data:nextProps.data})
        if(nextProps.child === true){
            this.setState({dataselect:this.state.dataselect})
        }
    }

    componentDidUpdate(nextProps, prevProps){
        if(!_.isEqual(this.state.data, prevProps.data)){
            this.setState({dataselect:[]})
        }
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

class NumberInput extends Component{
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

const Clone = (obj) => {
    let copy;
  
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
        for (let i = 0, len = obj.length; i < len; i++) {
            copy[i] = Clone(obj[i]);
        }
        return copy;
    }
  
    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (let attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = Clone(obj[attr]);
        }
        return copy;
    }
  
    throw new Error("Unable to copy obj! Its type isn't supported.");
  }

export {AutoSelect, Clone, TableGen, ExtendTable, NumberInput}