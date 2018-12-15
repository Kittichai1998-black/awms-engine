import React, { Component } from 'react';
import "react-table/react-table.css";
import {TableGen} from '../TableSetup';
import Axios from 'axios';
import {createQueryString} from '../../ComponentCore'
import {GetPermission,Nodisplay} from '../../../ComponentCore/Permission';

class Area extends Component{
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
      t:"AreaMaster",
      q:"[{ 'f': 'Status', c:'<', 'v': 2}]",
      f:"ID,Code,Name,Description,Warehouse_ID,Warehouse_Code,AreaMasterType_ID,AreaMasterType_Code,Status,Created,Modified",
      g:"",
      s:"[{'f':'Code','od':'asc'}]",
      sk:0,
      l:100,
      all:"",},
      sortstatus:0,
      selectiondata:[]    
     
    };
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.filterList = this.filterList.bind(this)
    this.displayButtonByPermission = this.displayButtonByPermission.bind(this)
    this.uneditcolumn = ["Warehouse_Code","AreaMasterType_Code","Created","Modified"]
  }
  async componentWillMount(){
    this.filterList()
    //permission
    let data = await GetPermission()
    Nodisplay(data,8,this.props.history)
    this.displayButtonByPermission(data)
    //permission
  }
  //permission
  displayButtonByPermission(perID){
    this.setState({perID:perID})
    let check = false
   
    perID.forEach(row => {
        
        if(row === 8){
          check = true
        }if(row === 9){
          check = false
        }
      })
        if(check === true){  
          this.setState({permissionView:false})
        }else if(check === false){
          this.setState({permissionView:true})
        }
  }
  //permission

  onHandleClickCancel(event){
    this.forceUpdate();
    event.preventDefault();
  }

  componentWillUnmount(){
    Axios.isCancel(true);
  }

  filterList(){
    const whselect = {queryString:window.apipath + "/api/mst",
      t:"Warehouse",
      q:"[{ 'f': 'Status', c:'<', 'v': 2}",
      f:"ID,concat(Code,' : ',Name) as Code",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:0,
      all:"",}

    const areatypeselect = {queryString:window.apipath + "/api/mst",
      t:"AreaMasterType",
      q:"[{ 'f': 'Status', c:'<', 'v': 2}",
      f:"ID,concat(Code,' : ',Name) as Code",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:0,
      all:"",}

    Axios.all([Axios.get(createQueryString(whselect)),Axios.get(createQueryString(areatypeselect))]).then(
      (Axios.spread((whresult, areatyperesult) => 
    {
      let ddl = [...this.state.autocomplete]
      let whList = {}
      let areatypelist = {}
      whList["data"] = whresult.data.datas
      whList["field"] = "Warehouse_Code"
      whList["pair"] = "Warehouse_ID"
      whList["mode"] = "Dropdown"

      areatypelist["data"] = areatyperesult.data.datas
      areatypelist["field"] = "AreaMasterType_Code"
      areatypelist["pair"] = "AreaMasterType_ID"
      areatypelist["mode"] = "Dropdown"

      ddl = ddl.concat(whList).concat(areatypelist)
      this.setState({autocomplete:ddl})
    })))
  }

  render(){
    const cols = [
      { accessor: 'Code', Header: 'Code', editable: true, Filter: "text", fixed: "left", minWidth: 80, maxWidth: 90 },
      { accessor: 'Name', Header: 'Name', editable: true, Filter: "text", fixed: "left", minWidth: 160},
      //{accessor: 'Description', Header: 'Description', sortable:false,Filter:"text",editable:true,},
      { accessor: 'Warehouse_Code', Header: 'Warehouse', updateable: false, Filter: "text", Type: "autocomplete", minWidth: 100},
      { accessor: 'AreaMasterType_Code', Header: 'AreaMasterType', updateable: false, Filter: "text", Type: "autocomplete", minWidth: 100},
      //{accessor: 'Status', Header: 'Status',Type:"checkbox" ,Filter:"dropdown",Filter:"dropdown"},
      {accessor: 'Created', Header: 'Create',filterable:false},
      /* {accessor: 'CreateTime', Header: 'CreateTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false}, */
      {accessor: 'Modified', Header: 'Modify', editable:false,filterable:false},
      //{accessor: 'ModifyTime', Header: 'ModifyTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
      {show:this.state.permissionView, Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Remove", btntext:"Remove"},
    ]; 
    const btnfunc = [{
      btntype:"Barcode",
      func:this.createBarcodeBtn
    }]
    const view  = this.state.permissionView
    return(
      <div>
      {/*
        column = คอลัมที่ต้องการแสดง
        data = json ข้อมูลสำหรับ select ผ่าน url
        ddlfilter = json dropdown สำหรับทำ dropdown filter
      */}
        <TableGen column={cols} data={this.state.select} dropdownfilter={this.state.statuslist} exportbtn={view} expFilename={"Area"}
              filterable={true} autocomplete={this.state.autocomplete} accept={view} 
              btn={btnfunc} uneditcolumn={this.uneditcolumn}
        table="ams_AreaMaster"/>
      </div>
    )
  }
}
//permissionEdit={this.state.permissionEdit}
export default Area;
