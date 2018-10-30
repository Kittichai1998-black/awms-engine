import React, { Component } from 'react';
import "react-table/react-table.css";
import {Card, CardBody, Button } from 'reactstrap';
import {TableGen} from '../../MasterData/TableSetup';
import ExtendTable from '../../MasterData/ExtendTable';
import queryString from 'query-string'
import Axios from 'axios';
import {apicall, createQueryString} from '../../ComponentCore'

const api = new apicall()

class History extends Component{
  constructor(props) {
    super(props);

    this.state = {
      data : [],
      autocomplete:[],
      acceptstatus : false,
      select:{queryString:window.apipath + "/api/log",
      t:"StorageObjectEvent",
      q:queryString.parse(this.props.location.search).TYPEID==="R"?
      "[{ 'f': 'RootStorageObject_ID', c:'=', 'v': " + queryString.parse(this.props.location.search).ID+"}]":
      "[{ 'f': 'StorageObject_ID', c:'=', 'v': " + queryString.parse(this.props.location.search).ID+"}]",
      f:"ID,StorageObject_ID"
      +",concat(RootStorageObject_Code, iif(RootStorageObject_Name is NULL,'',' : '),RootStorageObject_Name) as RootStorageObject"
      +",concat(ParentStorageObject_Code, iif(ParentStorageObject_Name is NULL,'',' : '),ParentStorageObject_Name) as ParentStorageObject"
      +",concat(StorageObject_Code, iif(StorageObject_Name is NULL,'',' : '),StorageObject_Name) as StorageObject"
      +",StorageObject_EventStatus,StorageObject_Status as Status,Branch_Code,Warehouse_Code,AreaLocationMaster_Code,ActionTime",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:0,
      l:100,
      all:"",},
      sortstatus:0,
      selectiondata:[],
    };
    this.onHandleClickLoad = this.onHandleClickLoad.bind(this);
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
  }

  onHandleClickCancel(event){
    this.forceUpdate();
    event.preventDefault();
  }

  componentWillMount(){
  }

  componentWillUnmount(){
    
  }

  onHandleClickLoad(event){
    api.post(window.apipath + "/api/mst/TransferFileServer/SKUMst",{})
    this.forceUpdate();
  }

  render(){
    const cols = [
      {accessor: 'StorageObject', Header: 'Stock Object', Filter:"text"},
      {accessor: 'ParentStorageObject', Header: 'Parent Object', Filter:"text"},
      {accessor: 'RootStorageObject', Header: 'Root Object', Filter:"text"},
      {accessor: 'Branch_Code', Header: 'Branch', Filter:"text"},
      {accessor: 'Warehouse_Code', Header: 'Warehouse',Filter:"text"},
      {accessor: 'AreaLocationMaster_Code', Header: 'Location', Filter:"text"},
      {accessor: 'StorageObject_EventStatus', Header: 'Event Status', Filter:"text", Type:"EventStatus"},
      {accessor: 'Status', Header: 'Status', Filter:"text", Type:"Status"},
      {accessor: 'ActionTime', Header: 'Action Date', Type:"datetime", dateformat:"datetime",filterable:false},
    ];
    

    return(
      <div>
      {/*
        column = คอลัมที่ต้องการแสดง
        data = json ข้อมูลสำหรับ select ผ่าน url
        ddlfilter = json dropdown สำหรับทำ dropdown filter
        addbtn = เปิดปิดปุ่ม Add
        accept = สถานะของในการสั่ง update หรือ insert
        autocomplete = data field ที่ต้องการทำ autocomplete
        filterable = เปิดปิดโหมด filter
        getselection = เก็บค่าที่เลือก
    
      */}
        <TableGen column={cols} data={this.state.select} 
        filterable={true} 
         table="ams_SKUMaster"/>

        {/* <Card>
          <CardBody style={{textAlign:'right'}}>
            <Button style={{ background: "#ef5350", borderColor: "#ef5350", width: '150px' }} onClick={this.onHandleClickLoad} color="danger"className="mr-sm-1">Load ข้อมูลสินค้า</Button>
          </CardBody>
        </Card> */}
      </div>
    )
  }
}

export default History;
