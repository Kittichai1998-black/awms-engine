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
        this.setState({data:this.props.data, multi:this.props.multi? this.props.multi : false})
    }

    componentWillReceiveProps(nextProps){
        this.setState({data:nextProps.data})
        if(nextProps.child === true){
            this.setState({dataselect:this.state.dataselect})
        }
        
        if(nextProps.data.length > 0 && this.state.dataselect.length === 0){
            if(this.props.selectfirst === false){
            }
            else{
                this.setState({dataselect:nextProps.data[0]})
                this.handleChange(nextProps.data[0])
            }
        }
    }

    componentDidUpdate(nextProps, prevProps){
        if(_.isEqual(this.state.data, prevProps.data) === false && this.state.data !== undefined && prevProps.data !== undefined){
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
