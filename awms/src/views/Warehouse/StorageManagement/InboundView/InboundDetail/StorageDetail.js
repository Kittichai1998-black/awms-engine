import React, { Component } from 'react';
import "react-table/react-table.css";
import { Button } from 'reactstrap';
import ReactTable from 'react-table'
//import Axios from 'axios';
import {apicall, DatePicker, createQueryString} from '../../../ComponentCore'
import moment from 'moment';
import queryString from 'query-string'

const Axios = new apicall()

class IssuedDoc extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data : [],
    };
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.dateTimePicker = this.dateTimePicker.bind(this)
  }

  componentDidMount(){
    const values = queryString.parse(this.props.location.search)
    console.log(values)
    if(values.docID){
      Axios.get(window.apipath + "/api/wm/received/doc?docID=" + values.docID).then(res => {
        if (res.data._result.status === 1) {
          this.setState({
            data: res.data.document.documentItems,
            DocumentCode: res.data.document.code,
            Remark: res.data.document.remark
          })
        }
      })
    }
  }
  
  onHandleClickCancel(event) {
    this.props.history.push("/doc/gr/list")
  }

  dateTimePicker() {
    return <DatePicker onChange={(e) => { this.setState({ date: e }) }} dateFormat="DD/MM/YYYY" />
  }

  getSelectionData(data) {
    this.setState({ selectiondata: data })
  }

  render() {
    const cols = [
      {accessor: 'packMaster_Code', Header: 'Code', editable:false,},
      {accessor: 'packMaster_Name', Header: 'Name',editable:false,},
      {accessor: 'quantity', Header: 'Quantity',editable:false,},
      {accessor: 'unitType_Name', Header: 'UnitType', editable:false,},
    ];

    return (
      <div>
        {/*
        column = คอลัมที่ต้องการแสดง
        data = json ข้อมูลสำหรับ select ผ่าน url
        ddlfilter = json dropdown สำหรับทำ dropdown filter
        addbtn = เปิดปิดปุ่ม Add
        accept = สถานะของในการสั่ง update หรือ insert 
    
      */}
        <div><label>Document Code : </label>{this.state.DocumentCode}</div>
        <div><label>Remark : </label>{this.state.Remark}</div>
        <ReactTable columns={cols} data={this.state.data} NoDataComponent={()=>null} style={{background:"white"}}
        sortable={false} filterable={false} editable={false} minRows={5} showPagination={false}/>
        <div className="clearfix">
          <Button color="danger" style={{margin:"10px 0"}} className="float-right" onClick={this.onHandleClickCancel}>Back</Button>
        </div>
      </div>
    )
  }
}

export default IssuedDoc;
