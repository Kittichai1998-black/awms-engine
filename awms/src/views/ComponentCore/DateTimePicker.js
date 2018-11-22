import React, { Component } from 'react';
import { Input } from 'reactstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';

export default class Datepicker extends Component{
    constructor(props){
        super(props)
        this.state = {
            date:null,
        }
        this.onHandleDateChange = this.onHandleDateChange.bind(this)
    }

  componentDidMount() {
      this.setState({ date: moment() })
      this.onHandleDateChange(moment(moment(), this.props.dateFormat))
    }

    onHandleDateChange(date){
        this.setState({date})
        this.props.onChange(date)
    }

    render(){
        return(
            <DatePicker selected={this.state.date}
                customInput={<Input/>}
                onChange={(e) => {
                    if(e.isValid() && e !== null){
                        this.onHandleDateChange(e)
                    }
                }}
                onChangeRaw={(e) => {
                if (moment(e.target.value).isValid()){
                    this.onHandleDateChange(moment(e.target.value, this.props.dateFormat))
                }
            }}
            timeIntervals={1}
            timeFormat="HH:mm"
            timeCaption="Time"
            showTimeSelect={this.props.timeselect}
            dateFormat={this.props.dateFormat}/>
        )
    }
}
