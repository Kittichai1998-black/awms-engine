import React, { Component } from 'react';
import "react-table/react-table.css";
import { Button } from 'reactstrap';
import ReactTable from 'react-table'
//import Axios from 'axios';
import {apicall, DatePicker, createQueryString} from '../../../ComponentCore'
import moment from 'moment';
import queryString from 'query-string'
import _ from 'lodash'

const Axios = new apicall()

class IssuedDoc extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data : [],
      data2:[]
      
    };
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.dateTimePicker = this.dateTimePicker.bind(this)
  }

  componentDidMount(){
    document.title = "Storage Detail : AWMS";
    const values = queryString.parse(this.props.location.search)
    var ID = values.docID.toString()
    if(values.docID){
      console.log(ID)   
      Axios.get(window.apipath + "/api/wm/received/doc/?docID="+ID+"&getMapSto=true").then(res => {  
      console.log(res)
        if (res.data._result.status === 1) {
          this.setState({
            DocumentCode: res.data.document.code,
            Remark: res.data.document.remark
          })
          var groupPack = _.groupBy(res.data.bstos,"code")        
          let sumArr =[]
          
          for (let res1 in groupPack){     
              let sum = 0
              groupPack[res1].forEach(res2 => {
                sum += res2.packBaseQty
                res2.sumQty = sum
                sumArr.forEach(response => {
                  if(response.code === res2.code){
                    res2.code = "";
                  }
                })
              })
          sumArr.push(groupPack[res1][groupPack[res1].length -1])
          }
          var sumQTYPack =0    
          var result = res.data.document.documentItems
            this.setState({data2:sumArr}, () => {
              result.forEach(row1 =>{
                this.state.data2.forEach(row2 =>{
                  if(row1.packMaster_Code === row2.packCode){
 
                    sumQTYPack += row2.sumQty
                    row1.sumQty = sumQTYPack
                  }
                })
              })
            })
            this.setState({data:result})
            
        }
        
          
          console.log(this.state.data)
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
      {accessor: 'packMaster_Code', Header: 'PackItem', editable:false, Cell: (e) => <span>{e.original.packMaster_Code + ' : ' + e.original.packMaster_Name}</span>,},
      {accessor: 'sumQty', Header: 'Quantity',editable:false,Cell: (e) => <span>{e.original.sumQty === undefined ? '0'+ ' / ' + e.original.quantity : e.original.sumQty +' / '+ (e.original.quantity === null?'-':e.original.quantity === null)}</span>,},
      {accessor: 'unitType_Name', Header: 'UnitType', editable:false,},
    ];
    const colsdetail = [
      {accessor: 'code', Header: 'Base',editable:false,},
      {accessor: 'packCode', Header: 'PackItem',editable:false,Cell: (e) => <span>{e.original.packCode + ' : ' + e.original.packName}</span>},
      {accessor: 'sumQty', Header: 'Quantity',editable:false,},
      {accessor: 'packUnitCode', Header: 'UnitType',editable:false,},
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
          sortable={false} filterable={false} editable={false} minRows={5} showPagination={false}/><br/>

        <ReactTable columns={colsdetail} data={this.state.data2} NoDataComponent={()=>null} style={{background:"white"}}
          sortable={false} defaultPageSize={1000} filterable={false} editable={false} minRows={5} showPagination={false}/>
        <div className="clearfix">
          <Button color="danger" style={{margin:"10px 0"}} className="float-right" onClick={this.onHandleClickCancel}>Back</Button>
        </div>
      </div>
    )
  }
}

export default IssuedDoc;
