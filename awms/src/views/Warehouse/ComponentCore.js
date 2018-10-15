import React, { Component } from 'react';
import {Link}from 'react-router-dom';
import "react-table/react-table.css";
import "./componentstyle.css";
import {Input } from 'reactstrap';
import Select from 'react-select';
import Axios from 'axios';
import _ from 'lodash'

 class apicall{
    get(url){
        return Axios.get(url).then((res) => {
            if(res.data._result.status === 0){
                alert(res.data._result.message)
            }
            return res
        });
    }

    post(url, data){
        return Axios.post(url, data).then((res) => {
            if(res.data._result.status === 0){
                alert(res.data._result.message)
            }
            return res
        });
    }

    put(url, data){
        return Axios.put(url, data).then((res) => {
            if(res.data._result.status === 0){
                alert(res.data._result.message)
            }
            return res
        });
    }

    delete(url, data){
        return Axios.delete(url, data).then((res) => {
            if(res.data._result.status === 0){
                alert(res.data._result.message)
            }
            return res
        });
    }
}

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

const createQueryString = (select) => {
    let queryS = select.queryString + (select.t === "" ? "?" : "?t=" + select.t)
    + (select.q === "" ? "" : "&q=" + select.q)
    + (select.f === "" ? "" : "&f=" + select.f)
    + (select.g === "" ? "" : "&g=" + select.g)
    + (select.s === "" ? "" : "&s=" + select.s)
    + (select.sk === "" ? "" : "&sk=" + select.sk)
    + (select.l === 0 ? "" : "&l=" + select.l)
    + (select.all === "" ? "" : "&all=" + select.all)
    return queryS
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

export {AutoSelect, Clone, NumberInput, apicall, createQueryString}