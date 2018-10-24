import React, { Component } from 'react';
import "react-table/react-table.css";
import {Card, CardBody, Button } from 'reactstrap';
import {apicall, createQueryString} from '../../ComponentCore'
import {TableGen} from '../TableSetup';
import Axios from 'axios';

const api = new apicall()

class ListProduct extends Component{
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
      select:{queryString:window.apipath + "/api/viw",
      t:"SKUMaster",
      q:"[{ 'f': 'Status', c:'<', 'v': 2}]",
      f:"ID,SKUMasterType_ID,concat(SKUMasterType_Code,' : ',SKUMasterType_Name) as SKUMasterType_Code,UnitType_ID,UnitType_Code,UnitType_Name,UnitType_Description,Code,Name,Description,WeightKG,WidthM,LengthM,HeightM,Revision,Status,CreateBy,CreateTime,ModifyBy,ModifyTime",
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
    this.uneditcolumn = ["SKUMasterType_Code","SKUMasterType_Name","UnitType_Code","UnitType_Name","UnitType_Description","ModifyBy","ModifyTime","CreateBy","CreateTime"]
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

  render(){
    const cols = [
      {accessor: 'SKUMasterType_Code', Header: 'SKU Type', Filter:"text"},
      {accessor: 'Code', Header: 'Code', editable:false,Filter:"text",},
      {accessor: 'Name', Header: 'Name', editable:false,Filter:"text",},
      //{accessor: 'Description', Header: 'Description', sortable:false,Filter:"text",editable:false, },
      {accessor: 'Status', Header: 'Status', editable:false, Type:"checkbox" ,Filter:"dropdown"},
      {accessor: 'UnitType_Code', Header: 'Unit Type',updateable:false,Filter:"text", },
      {accessor: 'CreateBy', Header: 'Create By', editable:false,filterable:false},
      {accessor: 'CreateTime', Header: 'Create Time', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
      //{accessor: 'ModifyBy', Header: 'Modify By', editable:false,filterable:false},
      //{accessor: 'ModifyTime', Header: 'Modify Time', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
      /* {Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Remove", btntext:"Remove"}, */
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

export default ListProduct;
