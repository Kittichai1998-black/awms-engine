import React, { Component } from 'react';
import "react-table/react-table.css";
import {TableGen} from '../TableSetup';
import Axios from 'axios';
import {createQueryString} from '../../ComponentCore'

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
      f:"ID,Code,Name,Description,Warehouse_ID,Warehouse_Code,Warehouse_Name,Warehouse_Description,AreaMasterType_ID,AreaMasterType_Code,AreaMasterType_Name,AreaMasterType_Description,Status,Created,Modified",
      g:"",
      s:"[{'f':'Code','od':'asc'}]",
      sk:0,
      l:100,
      all:"",},
      sortstatus:0,
      selectiondata:[],
      user_role:{queryString:window.apipath + "/api/mst",
      t:"User_Role",
      q:"[{ 'f': 'Status', c:'=', 'v': 1}]",
      f:"Role_ID",
      g:"",
      s:"[{'f':'User_ID','od':'asc'}]",
      sk:0,
      l:100,
      all:"",},
      sortstatus:0,
      selectiondata:[],
      role_permission:{queryString:window.apipath + "/api/mst",
      t:"Role_Permission",
      q:"[{ 'f': 'Status', c:'=', 'v': 1}]",
      f:"Permission_ID",
      g:"",
      s:"[{'f':'Role_ID','od':'asc'}]",
      sk:0,
      l:100,
      all:"",},
      sortstatus:0,
      selectiondata:[],        
      showbutton:"none"
    };
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.filterList = this.filterList.bind(this)
    this.uneditcolumn = ["Warehouse_Code","Warehouse_Name","Warehouse_Description","AreaMasterType_Code","AreaMasterType_Name","AreaMasterType_Description","Created","Modified"]
  }

  onHandleClickCancel(event){
    this.forceUpdate();
    event.preventDefault();
  }

  componentWillMount(){
    this.filterList();
    //console.log(localStorage.User_ID)

    let QueryDoc_role = this.state.user_role
    let QueryDoc_per = this.state.role_permission
    let JSONDoc_role = []
    let JSONDoc_per = []
    JSONDoc_role.push({"f": "User_ID", "c":"=", "v":localStorage.User_ID}) 
      QueryDoc_role.q = JSON.stringify(JSONDoc_role)
      if(localStorage.User_ID === '1'){
        Axios.get(createQueryString(QueryDoc_role)).then((res) => { 
          //console.log(res.data.datas)
          this.setState({role:res.data.datas})
          this.state.role.forEach(row => {
            console.log(row)
            let dataRole = row.Role

          })
        })
        // JSONDoc_per.push({"f": "Role_ID", "c":"=", "v":this.state.data})
        //   QueryDoc_per.q = JSON.stringify(JSONDoc_per)

        // // Axios.get(createQueryString(QueryDoc_per)).then((row) => { 

        // //   console.log("ccc")
        // //   console.log(row)
        // // })
    }
  }

  componentWillUnmount(){
    Axios.isCancel(true);
  }

  filterList(){
    const whselect = {queryString:window.apipath + "/api/mst",
      t:"Warehouse",
      q:"[{ 'f': 'Status', c:'<', 'v': 2}",
      f:"ID,Code",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:0,
      all:"",}

    const areatypeselect = {queryString:window.apipath + "/api/mst",
      t:"AreaMasterType",
      q:"[{ 'f': 'Status', c:'<', 'v': 2}",
      f:"ID,Code",
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
      {accessor: 'Code', Header: 'Code', editable:true,Filter:"text", fixed: "left"},
      {accessor: 'Name', Header: 'Name', editable:true,Filter:"text", fixed: "left"},
      //{accessor: 'Description', Header: 'Description', sortable:false,Filter:"text",editable:true,},
      {accessor: 'Warehouse_Code', Header: 'Warehouse',updateable:false,Filter:"text", Type:"autocomplete"},
      {accessor: 'AreaMasterType_Code', Header: 'AreaMasterType',updateable:false,Filter:"text", Type:"autocomplete"},
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
        table="ams_AreaMaster"/>
      </div>
    )
  }
}

export default Area;
