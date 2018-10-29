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
      statuslist:[{
        'status' : [{'value':'*','label':'All'},{'value':'1','label':'Active'},{'value':'0','label':'Inactive'}],
        'header' : 'Status',
        'field' : 'Status',
        'mode' : 'check',
      }],
      acceptstatus : false,
      select:{queryString:window.apipath + "/api/log",
      t:"StorageObjectEvent",
      q:"[{ 'f': 'RootStorageObject_ID', c:'=', 'v': " + queryString.parse(this.props.location.search).ID+"}]",
      f:"ID,StorageObject_ID,RootStorageObject_ID,ParentStorageObject_ID,StorageObject_ObjectType,StorageObject_Code,StorageObject_Name,StorageObject_EventStatus,StorageObject_Status,Branch_Code,Warehouse_Code,AreaLocationMaster_Code,ActionTime",
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
    this.getAutocompletee = this.getAutocomplete.bind(this);
    this.getSelectionData = this.getSelectionData.bind(this);
    this.initialData = this.initialData.bind(this)
    this.uneditcolumn = ["SKUMasterType_Code","SKUMasterType_Name","UnitType_Code","UnitType_Name","UnitType_Description","Modified","Created"]
  }

  onHandleClickCancel(event){
    this.forceUpdate();
    event.preventDefault();
  }

  componentWillMount(){
    this.getAutocomplete();
  }

  componentWillUnmount(){
    
  }

  componentDidMount(){
    //this.initialData()
  }


  onHandleClickLoad(event){
    api.post(window.apipath + "/api/mst/TransferFileServer/SKUMst",{})
    this.forceUpdate();
  }

  getAutocomplete(){
    const unitselect = {queryString:window.apipath + "/api/mst",
      t:"UnitType",
      q:"[{ 'f': 'Status', c:'<', 'v': 2}]",
      f:"ID,Code",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:0,
      all:"",}

    const packselect = {queryString:window.apipath + "/api/mst",
      t:"SKUMasterType",
      q:"[{ 'f': 'Status', c:'<', 'v': 2}]",
      f:"ID,Code",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:0,
      all:"",}

    Axios.all([Axios.get(createQueryString(packselect)),Axios.get(createQueryString(unitselect))]).then(
      (Axios.spread((packresult, unitresult) => 
    {
      let ddl = this.state.autocomplete
      let packList = {}
      let unitList = {}
      packList["data"] = packresult.data.datas
      packList["field"] = "SKUMasterType_Code"
      packList["pair"] = "SKUMasterType_ID"
      packList["mode"] = "Dropdown"

      unitList["data"] = unitresult.data.datas
      unitList["field"] = "UnitType_Code"
      unitList["pair"] = "UnitType_ID"
      unitList["mode"] = "Dropdown"

      ddl = ddl.concat(packList).concat(unitList)
      this.setState({autocomplete:ddl})
    })))
  }

  getSelectionData(data){
    this.setState({selectiondata:data}, () => console.log(this.state.selectiondata))
  }

  createBarcodeBtn(data){
    return <Button type="button" color="info" 
    onClick={() => this.history.push('/mst/sku/manage/barcode?barcodesize=4&barcode='+data.Code+'&Name='+data.Name)}>Print</Button>
  }

  initialData(){
    let selectQ = []
    const values = queryString.parse(this.props.location.search)

    selectQ.push({queryString:window.apipath + "/api/log",
    t:"StorageObjectEvent",
    //q:"", //[{ 'f': 'Status', c:'<', 'v': 2}]
    f:"ID,StorageObject_ID,RootStorageObject_ID,ParentStorageObject_ID,StorageObject_ObjectType,StorageObject_Code,StorageObject_Name,StorageObject_EventStatus,StorageObject_Status,Branch_Code,Warehouse_Code,AreaLocationMaster_Code,ActionTime",
    g:"",
    s:"[{'f':'ID','od':'asc'}]",
    sk:0,
    l:100,
    all:"",
    q:[{ 'f': 'RootStorageObject_ID', c:'=', 'v': values.ID}]})
    this.setState({select:selectQ, loading:true})


    
    //this.state.select.push({"q":[{ 'f': 'RootStorageObject_ID', c:'=', 'v': values}]})
  }

  render(){
    const cols = [
      {accessor: 'StorageObject_ID', Header: 'Stock Object', Filter:"text"},
      {accessor: 'ParentStorageObject_ID', Header: 'Parent Object', Filter:"text"},
      {accessor: 'RootStorageObject_ID', Header: 'Root Object', Filter:"text"},
      {accessor: 'Branch_Code', Header: 'Branch', Filter:"text"},
      {accessor: 'Warehouse_Code', Header: 'Warehouse',Filter:"text"},
      {accessor: 'AreaLocationMaster_Code', Header: 'Location', Filter:"text"},
      {accessor: 'StorageObject_EventStatus', Header: 'Event Status', Filter:"text"},
      {accessor: 'StorageObject_Status', Header: 'Status', Filter:"text"},
      {accessor: 'ActionTime', Header: 'Action Date', Type:"datetime", dateformat:"datetime",filterable:false},
    ];
    
    const btnfunc = [{
      history:this.props.history,
      btntype:"Barcode",
      func:this.createBarcodeBtn
    }]

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
        <div className="clearfix">
        <Button className="float-right" onClick={this.onHandleClickLoad} color="danger">Load ข้อมูลสินค้า</Button>
          <Button className="float-right" onClick={() => {
            let data1 = {"exportName":"ProductToShop","whereValues":[]}
            api.post(window.apipath + "/api/report/export/fileServer", data1)
          }}>Export Data</Button>
 
        </div>
        <TableGen column={cols} data={this.state.select} dropdownfilter={this.state.statuslist} 
        filterable={true} autocomplete={this.state.autocomplete} getselection={this.getSelectionData} 
        btn={btnfunc} uneditcolumn={this.uneditcolumn}
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
