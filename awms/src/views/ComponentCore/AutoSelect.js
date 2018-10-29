import React, { Component } from 'react';
import Select from 'react-select';
import _ from 'lodash';

export default class AutoSelect extends Component{
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
