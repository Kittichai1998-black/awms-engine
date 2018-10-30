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

  render(){
    const cols = [
      {accessor: 'StorageObject', Header: 'Stock Object',filterable:false},
      {accessor: 'ParentStorageObject', Header: 'Parent Object',filterable:false},
      {accessor: 'RootStorageObject', Header: 'Root Object',filterable:false},
      {accessor: 'Branch_Code', Header: 'Branch',filterable:false},
      {accessor: 'Warehouse_Code', Header: 'Warehouse',filterable:false},
      {accessor: 'AreaLocationMaster_Code', Header: 'Location',filterable:false},
      {accessor: 'StorageObject_EventStatus', Header: 'Event Status', Type:"EventStatus",filterable:false},
      {accessor: 'Status', Header: 'Status', Type:"Status",filterable:false},
      {accessor: 'ActionTime', Header: 'Action Date', Type:"datetimelog", dateformat:"datetime",filterable:false},
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
        <TableGen column={cols} data={this.state.select} filterable={true} />

      </div>
    )
  }
}

export default History;
