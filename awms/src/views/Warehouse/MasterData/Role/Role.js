import React, { Component } from 'react';
import "react-table/react-table.css";
import { Card, CardBody, Button } from 'reactstrap';
import {TableGen} from '../TableSetup';
import {createQueryString, apicall} from '../../ComponentCore'
import Popup from 'reactjs-popup'
import ReactTable from 'react-table'

const Axios = new apicall()

class Role extends Component{
  constructor(props) {
    super(props);

    this.state = {
      colsMap:[
        {Header: '', Type:"selection", sortable:false, Filter:"select", className:"text-center"},
        {accessor: 'Code', Header: 'Code', editable:false, filterable:false},
        {accessor: 'Name', Header: 'Name', editable:false, filterable:false},
      ],
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
        t:"Role",
        q:"[{ 'f': 'Status', c:'<', 'v': 2}]",
        f:"ID,Code,Name,Description,Status,Created,Modified",
        g:"",
        s:"[{'f':'ID','od':'asc'}]",
        sk:"",
        l:100,
        all:"",},
      selectMapChild:{queryString:window.apipath + "/api/mst",
        t:"role_permission",
        q:"[{ 'f': 'Status', c:'<', 'v': 2}]",
        f:"ID,Role_ID,Permission_ID,Status",
        g:"",
        s:"[{'f':'ID','od':'asc'}]",
        sk:0,
        l:100,
        all:"",
      },
      sortstatus:0,
      Root_ID:0,
      open: false,
      selectdata:[],
      selectMapData:[],
      dataUpdate:[],
      rowselect:[],
    };
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.uneditcolumn = ["Created","Modified"]
    this.createSelection = this.createSelection.bind(this)
    this.onHandleSelection = this.onHandleSelection.bind(this)
    this.getData = this.getData.bind(this)
    this.setRolePermission = this.setRolePermission.bind(this)
    this.openModal = this.openModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.createMapBtn = this.createMapBtn.bind(this)
    this.updateRolePermission = this.updateRolePermission.bind(this)
  }

  onHandleClickCancel(event){
    this.forceUpdate();
    event.preventDefault();
  }

  getData(Root_ID){
    const selectdata = []
    const selectMapdata = []
    Axios.get(createQueryString(this.state.select)).then((response) => {
        response.data.datas.forEach(row => {
            selectdata.push({
                ID:row.ID
                ,Code:row.Code
                ,Name:row.Name
                ,Description:row.Description
                ,Check:false
                ,Permission_ID:null
                ,RolePermission_ID:0})
        })
        this.setState({selectdata})
        Axios.get(createQueryString(this.state.selectMapChild)).then((responset) => {
            responset.data.datas.forEach(row => {
                selectMapdata.push({
                    ID:row.ID
                    ,Role_ID:row.Role_ID
                    ,Permission_ID:row.Permission_ID
                    ,Status:row.Status})
            })
            this.setState({selectMapdata},() => this.setRolePermission(Root_ID))
        })
    })
  }

  setRolePermission(data){
    if(!this.state.open){
        let selectdata = []
        let selectMapdata = []

        selectdata = this.state.selectdata
        selectMapdata = this.state.selectMapdata
        if(selectMapdata !== undefined){
            var index = selectMapdata.length-1
            while ( index>= 0) {
                if (selectMapdata[index].Role_ID !== data) {
                    selectMapdata.splice(index, 1);
                }              
                index -= 1;
            }
            selectdata.forEach(rowRoot =>{
                selectMapdata.forEach(rowChild => {
                    if(rowRoot.ID===rowChild.Permission_ID){
                        rowRoot.Role_ID = rowChild.Role_ID
                        rowRoot.RolePermission_ID = rowChild.ID
                        if(rowChild.Status === 1){
                            rowRoot.Check = true
                        }
                    }
                })
            })
            this.setState({Root_ID:data})
            this.setState({selectdata})
            this.setState({selectMapdata})
        }
        this.openModal()
    }
  }

  openModal(){
    this.setState({ open: true })
  }

  closeModal() {
    this.setState({ open: false })
    this.setState({dataUpdate:[]})
  }

  getSelectionData(data){
    let obj = []
    data.forEach((datarow,index) => {
        obj.push({"ID":datarow.ID});
    })
    const ObjStr = JSON.stringify(obj)
    this.setState({barcodeObj:ObjStr})
  }

  createMapBtn(rowdata){
    return <div class="text-center"><Button type="button" color="primary" style={{ background: "#26c6da", borderColor: "#26c6da", width: '100px' }}
      onClick={() => this.getData(rowdata.ID)}>Permission</Button></div>
  }

  updateRolePermission(){
    const dataUpdate = this.state.dataUpdate
    if(dataUpdate.length > 0){
      dataUpdate.forEach((row) => {
          row["ID"] = row["ID"] <= 0 ? null : row["ID"]
      })
      let updjson = {
          "_token": sessionStorage.getItem("Token"),
          "_apikey": null,
          "t": "ams_Role_Permission",
          "pk": "ID",
          "datas": dataUpdate,
          "nr": false
      }
      Axios.put(window.apipath + "/api/mst", updjson).then((result) =>{
      })
      this.setState({dataUpdate:[]})
      this.closeModal()
    }
  }

  createSelection(rowdata,type){
    return <input
    className="selection"
    type={type}
    name="selection"
    defaultChecked = {rowdata.original.Check}
    onChange={(e)=> this.onHandleSelection(rowdata, e.target.checked, type)}/>
  }

  onHandleSelection(rowdata, value, type){
    if(type === "checkbox"){
        const dataUpdate = this.state.dataUpdate
        if(dataUpdate.length > 0){
            dataUpdate.forEach((row,index) => {
                if(row.Permission_ID === rowdata.original.ID){
                    dataUpdate.splice(index,1)
                }
            })
        }
        if(value){
            if(rowdata.original.Role_ID === null){
                dataUpdate.push({
                    ID:0
                    ,Role_ID:this.state.Root_ID
                    ,Permission_ID:rowdata.original.ID
                    ,Status:1})
            }else{
                dataUpdate.push({
                    ID:rowdata.original.RolePermission_ID
                    ,Role_ID:this.state.Root_ID
                    ,Permission_ID:rowdata.original.ID
                    ,Status:1})
            }
        }
        else{
            if(rowdata.original.Role_ID === null){
                dataUpdate.push({
                    ID:0
                    ,Role_ID:this.state.Root_ID
                    ,Permission_ID:rowdata.original.ID
                    ,Status:0})
            }else{
                dataUpdate.push({
                    ID:rowdata.original.RolePermission_ID
                    ,Role_ID:this.state.Root_ID
                    ,Permission_ID:rowdata.original.ID
                    ,Status:0})
            }
        }
        this.setState({dataUpdate})
    }
  }

  //permission

  render(){
    const cols = [
      {accessor: 'Code', Header: 'Code', editable:true,Filter:"text", fixed:"left"},
      {accessor: 'Name', Header: 'Name', editable:true,Filter:"text", fixed:"left"},
      {accessor: 'Description', Header: 'Description',editable:true, sortable:false,Filter:"text",},
      //{accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" ,Filter:"dropdown"},  
      {accessor: 'Created', Header: 'Create',filterable:false},
      {accessor: 'Modified', Header: 'Modify',filterable:false},
      {Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Map", btntext:"Map"},
      {Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Remove", btntext:"Remove"},

     
    ];
    const btnfunc = [{
      btntype:"Map",
      func:this.createMapBtn
    }]

    const col = this.state.colsMap
        col.forEach((row) => {
            if(row.Type === "selection"){
                row.Cell = (e) => this.createSelection(e,"checkbox")
                row.className="text-center"
            }
        })

    return(
      <div>
      {/*
        column = คอลัมที่ต้องการแสดง
        data = json ข้อมูลสำหรับ select ผ่าน url
        ddlfilter = json dropdown สำหรับทำ dropdown filter
      */}
      <TableGen column={cols} data={this.state.select} dropdownfilter={this.state.statuslist} addbtn={true}
              filterable={true}  accept={true} btn={btnfunc}
              uneditcolumn={this.uneditcolumn}
        table="ams_Role_Permission"/>

        <Popup open={this.state.open} onClose={this.closeModal}>
          <div>
              <ReactTable columns={this.state.colsMap} minRows={3} data={this.state.selectdata} sortable={false} style={{background:'white', 'max-height': '400px'}} 
              getselection={this.getSelectionData} showPagination={false}/>
              <Card>
                  <CardBody>
                      <Button onClick={() => this.updateRolePermission()} color="danger" style={{ background: "#26c6da", borderColor: "#26c6da ", width: '130px' }} className="float-left">Save</Button>
                  </CardBody>
              </Card>
          </div>
        </Popup>
      </div>
    )
  }
}

export default Role;
