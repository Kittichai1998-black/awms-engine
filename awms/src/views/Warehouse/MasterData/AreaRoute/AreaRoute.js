import React, { Component } from 'react';
import "react-table/react-table.css";
import {TableGen} from '../TableSetup';
import Axios from 'axios';
import {createQueryString} from '../../ComponentCore'

class AreaRoute extends Component{
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
      t:"AreaRoute",
      q:"[{ 'f': 'Status', c:'<', 'v': 2}]",
      f:"ID,Sou_AreaMaster_ID,Sou_AreaMaster_Code,Sou_AreaMaster_Name,Des_AreaMaster_ID,Des_AreaMaster_Code,Des_AreaMaster_Name,Sou_AreaLocationMaster_ID,"+
      "Sou_AreaLocationMaster_Code,Sou_AreaLocationMaster_Name,Des_AreaLocationMaster_ID,Des_AreaLocationMaster_Code,Des_AreaLocationMaster_Name,Priority,Status,Created,Modified",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:0,
      l:100,
      all:"",},
      sortstatus:0,        
     
    };
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.filterList = this.filterList.bind(this)
    this.uneditcolumn = ["WebPageGroup_Code","WebPageGroup_Name","Permission_Code","Permission_Name","Created","Modified"]
  }

  onHandleClickCancel(event){
    this.forceUpdate();
    event.preventDefault();
  }
  componentDidMount(){
    document.title = "Area Route : AWMS";
  }
  componentWillMount(){
    this.filterList();
  }
  
  componentWillUnmount(){
    Axios.isCancel(true);
  }

  filterList(){
    const Areaselect = {queryString:window.apipath + "/api/mst",
      t:"AreaMaster",
      q:"[{ 'f': 'Status', c:'<', 'v': 2}",
      f:"ID,Code",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:0,
      all:"",}

    const AreaLocselect = {queryString:window.apipath + "/api/mst",
      t:"AreaLocationMaster",
      q:"[{ 'f': 'Status', c:'<', 'v': 2}",
      f:"ID,Code,AreaMaster_ID",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:0,
      all:"",}

    Axios.all([Axios.get(createQueryString(Areaselect)),Axios.get(createQueryString(AreaLocselect))]).then(
      (Axios.spread((Arearesult, AreaLocresult) => 
    {
      let ddl = [...this.state.autocomplete]
      let SouAreaList = {}
      let SouAreaLocList = {}
      let DesAreaList = {}
      let DesAreaLocList = {}
      SouAreaList["data"] = Arearesult.data.datas
      SouAreaList["field"] = "Sou_AreaMaster_Code"
      SouAreaList["pair"] = "Sou_AreaMaster_ID"
      SouAreaList["mode"] = "Dropdown"

      SouAreaLocList["data"] = AreaLocresult.data.datas
      SouAreaLocList["field"] = "Sou_AreaLocationMaster_Code"
      SouAreaLocList["pair"] = "Sou_AreaLocationMaster_ID"
      SouAreaLocList["mode"] = "Dropdown"

      DesAreaList["data"] = Arearesult.data.datas
      DesAreaList["field"] = "Des_AreaMaster_Code"
      DesAreaList["pair"] = "Des_AreaMaster_ID"
      DesAreaList["mode"] = "Dropdown"

      DesAreaLocList["data"] = AreaLocresult.data.datas
      DesAreaLocList["field"] = "Des_AreaLocationMaster_Code"
      DesAreaLocList["pair"] = "Des_AreaLocationMaster_ID"
      DesAreaLocList["mode"] = "Dropdown"

      ddl = ddl.concat(SouAreaList).concat(SouAreaLocList).concat(DesAreaList).concat(DesAreaLocList)
      this.setState({autocomplete:ddl})
    })))
  }

  render(){
    const cols = [
      /* {accessor: 'Code', Header: 'Code', editable:true,Filter:"text", fixed: "left"},
      {accessor: 'Name', Header: 'Name', editable:true,Filter:"text", fixed: "left"}, */
      //{accessor: 'Description', Header: 'Description', sortable:false,Filter:"text",editable:true,},
      {accessor: 'Sou_AreaMaster_Code', Header: 'Source Area',updateable:false,Filter:"text", Type:"autocomplete"},
      {accessor: 'Sou_AreaLocationMaster_Code', Header: 'Source Area Location',updateable:false,Filter:"text", Type:"autocomplete"},
      //{accessor: 'Des_AreaMaster_Code', Header: 'Destination Area',updateable:false,Filter:"text", Type:"autocomplete"},
      //{accessor: 'Des_AreaLocationMaster_Code', Header: 'Destination Area Location',updateable:false,Filter:"text", Type:"autocomplete"},
      {accessor: 'Priority', Header: 'Priority', sortable:false,Filter:"text",editable:true,datatype:"int"},
      {accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" ,Filter:"dropdown",Filter:"dropdown"},
      {accessor: 'Created', Header: 'Create', editable:false,filterable:false},
      /* {accessor: 'CreateTime', Header: 'CreateTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false}, */
      {accessor: 'Modified', Header: 'Modify', editable:false,filterable:false},
      //{accessor: 'ModifyTime', Header: 'ModifyTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
      {Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Remove", btntext:"Remove"},
    ]; 
  
    const btnfunc = [{
      btntype:"Barcode",
      func:this.createBarcodeBtn
    }]

    return(
      <div>
      {/*
        column = คอลัมที่ต้องการแสดง
        data = json ข้อมูลสำหรับ select ผ่าน url
        ddlfilter = json dropdown สำหรับทำ dropdown filter
      */}
      <TableGen column={cols} data={this.state.select} dropdownfilter={this.state.statuslist} addbtn={true}
              filterable={true} autocomplete={this.state.autocomplete} accept={true}
              btn={btnfunc} uneditcolumn={this.uneditcolumn}
        table="ams_AreaRoute"/>
      </div>
    )
  }
}

export default AreaRoute;
