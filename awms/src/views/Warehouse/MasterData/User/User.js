import React, { Component } from 'react';
import "react-table/react-table.css";
import {Card, Button, CardBody} from 'reactstrap';
import {TableGen} from '../TableSetup';
import Popup from 'reactjs-popup'
import {apicall, createQueryString} from '../../ComponentCore'
import ReactTable from 'react-table'

const Axios = new apicall()

class User extends Component{
    constructor(props) {
        super(props);

        this.state={
            data:[],
            statuslist:[{
                'status' : [{'value':'*','label':'All'},{'value':'1','label':'Active'},{'value':'0','label':'Inactive'}],
                'header' : 'Status',
                'field' : 'Status',
                'mode' : 'check',
            }],
            acceptstatus : false,
            select:{queryString:window.apipath + "/api/viw",
            t:"User",
            q:"[{ 'f': 'Status', c:'<', 'v': 2}]",
            f:"ID,Code,Name,Password,SoftPassword,EmailAddress,LineID,FacebookID,TelOffice,TelMobile,Status,Created,Modified",
            g:"",
            s:"[{'f':'Code','od':'asc'}]",
            sk:0,
            l:100,
            all:"",},
            selectRole:{queryString:window.apipath + "/api/mst",
            t:"Role",
            q:"[{ 'f': 'Status', c:'<', 'v': 2}]",
            f:"ID,Code,Name,Description,Status",
            g:"",
            s:"[{'f':'Code','od':'asc'}]",
            sk:0,
            l:100,
            all:"",},
            selectUserRole:{queryString:window.apipath + "/api/mst",
            t:"User_Role",
            q:"[{ 'f': 'Status', c:'<', 'v': 2}]",
            f:"ID,User_ID,Role_ID,Status",
            g:"",
            s:"[{'f':'ID','od':'asc'}]",
            sk:0,
            l:100,
            all:"",},
            sortstatus:0,
            selectiondata:[],
            open: false,
            selectiondata:[],
            selectroledata:[]
        };
        this.openModal = this.openModal.bind(this)
        this.closeModal = this.closeModal.bind(this)
        this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
        this.createRoleBtn = this.createRoleBtn.bind(this)
        this.getSelectionData = this.getSelectionData.bind(this)
        this.uneditcolumn = ["Created","Modified"]
        this.createSelection = this.createSelection.bind(this)
        this.onHandleSelection = this.onHandleSelection.bind(this)
        this.test = this.test.bind(this)
        this.test2 = this.test2.bind(this)
    }

    onHandleClickCancel(event){
        this.forceUpdate();
        event.preventDefault();
    }

    componentDidMount(){
        
        //this.test()
    }
    test2(){
        //this.setState({selectroledata:[]},() => console.log(this.state.selectuserroledata))
    }
       
    test(){
        if(this.state.open){
            const selectroledata = []
            const selectuserroledata = []
            Axios.get(createQueryString(this.state.selectRole)).then((response) => {
                response.data.datas.forEach(row => {
                    selectroledata.push({ID:row.ID,Code:row.Code,Name:row.Name,Description:row.Description,User_ID:""})
                })
                this.setState({selectroledata})
            })
            Axios.get(createQueryString(this.state.selectUserRole)).then((responset) => {
                responset.data.datas.forEach(row => {
                    selectuserroledata.push({User_ID:row.User_ID,Role_ID:row.Role_ID})
                })
                this.setState({selectuserroledata},() => this.test2())
            })
        }
    }

    componentWillUnmount(){
    }

    openModal (){
        this.setState({ open: true })
        this.test()
      }

    closeModal () {
        this.setState({ open: false })
    }

    getSelectionData(data){
        let obj = []
        data.forEach((datarow,index) => {
            obj.push({"ID":datarow.ID});
        })
        const ObjStr = JSON.stringify(obj)
        this.setState({barcodeObj:ObjStr}, () => console.log(this.state.barcodeObj))
    }

    createRoleBtn(rowdata){
        return <Button type="button" color="primary" style={{ background: "#26c6da", borderColor: "#26c6da", width: '80px' }}
          onClick={this.openModal}>Role</Button>
        }
    
    updateRole(){
        return this.closeModal
    }

    createSelection(rowdata,type){
        return <input
        className="selection"
        type={type}
        name="selection"
        defaultChecked = {true}
        onChange={(e)=> this.onHandleSelection(rowdata, e.target.checked, type)}/>
    }

    onHandleSelection(rowdata, value, type){
        if(type === "checkbox"){
            let rowselect = this.state.rowselect;
            if(value){
            rowselect.push(rowdata.original)
            }
            else{
            rowselect.forEach((row,index) => {
                if(row.ID === rowdata.original.ID){
                rowselect.splice(index,1)
                }
            })
            }
            this.setState({rowselect}, () => {this.props.getselection(this.state.rowselect)})
        }
        else{
            let rowselect = [];
            if(value){
            rowselect.push(rowdata.original)
            }
            this.setState({rowselect:rowselect}, () => {this.props.getselection(this.state.rowselect)})
        }
    }

    render(){
        const cols = [
            {accessor: 'Code', Header: 'Username', editable:true, filterable:true, Filter:"text", insertable:true, fixed: "left"},
            {accessor: 'Password', Header: 'Password', editable:true, filterable:false, Type:"password" },
            {accessor: 'Name', Header: 'Name', editable:true},
            {accessor: 'EmailAddress', Header: 'Email Address', editable:true},
            {accessor: 'LineID', Header: 'Line ID', editable:true},
            {accessor: 'FacebookID', Header: 'Facebook ID', editable:true},
            {accessor: 'TelOffice', Header: 'Office Tel.', editable:true},
            {accessor: 'TelMobile', Header: 'Mobile', editable:true},
            {accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" ,Filter:"dropdown"},
            {accessor: 'Created', Header: 'Create', editable:false,filterable:false},
            /* {accessor: 'CreateTime', Header: 'CreateTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false}, */
            {accessor: 'Modified', Header: 'Modify', editable:false,filterable:false},
            //{accessor: 'ModifyTime', Header: 'ModifyTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
            /* {Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Barcode", btntext:"Barcode"}, */
            {Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Remove", btntext:"Remove"},
          ]; 

          const colsRole = [
            {Header: '', Type:"selection", sortable:false, Filter:"select", className:"text-center"},
            {accessor: 'Code', Header: 'Code', editable:false, filterable:false},
            {accessor: 'Name', Header: 'Name', editable:false, filterable:false},
            {accessor: 'Description', Header: 'Description', editable:false, filterable:false},
          ]; 

        const btnfunc = [{
            btntype:"Barcode",
            func:this.createRoleBtn
       
          }]

          const col = colsRole
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
            addbtn = เปิดปิดปุ่ม Add
            accept = สถานะของในการสั่ง update หรือ insert
            autocomplete = data field ที่ต้องการทำ autocomplete
            filterable = เปิดปิดโหมด filter
            getselection = เก็บค่าที่เลือก
          */}
            <TableGen column={cols} data={this.state.select} dropdownfilter={this.state.statuslist} addbtn={true}
                      filterable={true} accept={true} btn={btnfunc} uneditcolumn={this.uneditcolumn}
                      table="ams_User"/>
            <Popup open={this.state.open} onClose={this.closeModal}>
                <div>
                    <ReactTable columns={colsRole} minRows={5} data={this.state.selectroledata} sortable={false} style={{background:'white'}} getselection={this.getSelectionData}
                        showPagination={false}/>
                   {/*  <TableGen column={colsRole} data={this.state.selectRole} paginationBtn={false} getselection={this.getSelectionData}
                            filterable={true} /> */}
                    <Card>
                        <CardBody>
                            <Button onClick={this.updateRole()} color="danger" style={{ background: "#26c6da", borderColor: "#26c6da ", width: '130px' }} className="float-left">Save</Button>
                        </CardBody>
                    </Card>
                </div>
            </Popup>          
            </div>
        ) 
    }
}

export default User;