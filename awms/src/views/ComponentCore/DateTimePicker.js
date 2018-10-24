import React, { Component } from 'react';
import { Input } from 'reactstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';

export default class Datepicker extends Component{
    constructor(){
        super()
        this.state = {
            date:null
        }
        this.onHandleDateChange = this.onHandleDateChange.bind(this)
    }

    onHandleDateChange(date){
        this.setState({date})
        this.props.onChange(date)
    }

    render(){
        return(
            <DatePicker selected={this.state.date}
                customInput={<Input/>}
                onChange={this.onHandleDateChange}
                onChangeRaw={(e) => {
                if (moment(e.target.value).isValid()){
                    this.onHandleDateChange(e.target.value)
                }
            }}
            dateFormat={this.props.dateFormat}/>
        )
    }
}