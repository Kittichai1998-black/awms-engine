import React, { Component } from 'react';
import "react-table/react-table.css";
import {Card, Button, CardBody} from 'reactstrap';
import {TableGen} from '../TableSetup';
import Popup from 'reactjs-popup'
import {apicall, createQueryString} from '../../ComponentCore'
import ReactTable from 'react-table'
import { timingSafeEqual } from 'crypto';
import {GetPermission,Nodisplay} from '../../../ComponentCore/Permission';

const Axios = new apicall()

class User extends Component{
    constructor(props) {
        super(props);

        this.state={
            colsRole:[
                {Header: '', Type:"selection", sortable:false, Filter:"select", className:"text-center"},
                {accessor: 'Code', Header: 'Code', editable:false, filterable:false},
                {accessor: 'Name', Header: 'Name', editable:false, filterable:false},
                {accessor: 'Description', Header: 'Description', editable:false, filterable:false},
            ],
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
                all:"",
            },
            selectRole:{queryString:window.apipath + "/api/mst",
                t:"Role",
                q:"[{ 'f': 'Status', c:'<', 'v': 2}]",
                f:"ID,Code,Name,Description,Status",
                g:"",
                s:"[{'f':'Code','od':'asc'}]",
                sk:0,
                l:100,
                all:"",
            },
            selectUserRole:{queryString:window.apipath + "/api/mst",
                t:"User_Role",
                q:"[{ 'f': 'Status', c:'<', 'v': 2}]",
                f:"ID,User_ID,Role_ID,Status",
                g:"",
                s:"[{'f':'ID','od':'asc'}]",
                sk:0,
                l:100,
                all:"",
            },
            sortstatus:0,
            User_id:0,
            selectiondata:[],
            open: false,
            selectiondata:[],
            selectroledata:[],
            dataUpdate : [],
            rowselect:[],
        };

        this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
        this.uneditcolumn = ["Created","Modified"]
        this.createSelection = this.createSelection.bind(this)
        this.onHandleSelection = this.onHandleSelection.bind(this)
        this.getData = this.getData.bind(this)
        this.setUserRole = this.setUserRole.bind(this)
        this.displayButtonByPermission = this.displayButtonByPermission.bind(this)
    }
    async componentWillMount(){
        //permission
        let data = await GetPermission()
        Nodisplay(data,14,this.props.history)
        this.displayButtonByPermission(data)
        //permission
      }
      //permission
    displayButtonByPermission(perID){
        this.setState({perID:perID})
        let check = false
        perID.forEach(row => {
            if(row === 14){
            check = true
            }if(row === 15){
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

    componentDidMount(){
        //this.getData()
    }

    getData(user_id){
        const selectroledata = []
        const selectuserroledata = []
        Axios.get(createQueryString(this.state.selectRole)).then((response) => {
            response.data.datas.forEach(row => {
                selectroledata.push({ID:row.ID,Code:row.Code,Name:row.Name,Description:row.Description,Check:false,User_ID:null,user_role_id:0})
            })
            this.setState({selectroledata})
            Axios.get(createQueryString(this.state.selectUserRole)).then((responset) => {
                responset.data.datas.forEach(row => {
                    selectuserroledata.push({ID:row.ID,User_ID:row.User_ID,Role_ID:row.Role_ID,Status:row.Status})
                })
                this.setState({selectuserroledata},() => this.setUserRole(user_id))
            })
        })
        
    }
       
    setUserRole(data){
        if(!this.state.open){
            let selectroledata = []
            let selectuserroledata = []

            selectroledata = this.state.selectroledata
            selectuserroledata = this.state.selectuserroledata
            if(selectuserroledata !== undefined){
                var index = selectuserroledata.length-1
                while ( index>= 0) {
                    if (selectuserroledata[index].User_ID !== data) {
                        selectuserroledata.splice(index, 1);
                    }              
                    index -= 1;
                }
                selectroledata.forEach(rowRole =>{
                    selectuserroledata.forEach(rowRoleUser => {
                        if(rowRole.ID===rowRoleUser.Role_ID){
                            rowRole.User_ID = rowRoleUser.User_ID
                            rowRole.user_role_id = rowRoleUser.ID
                            if(rowRoleUser.Status === 1){
                                rowRole.Check = true
                            }
                        }
                    })
                    
                })
                this.setState({User_id:data})
                this.setState({selectroledata})
                this.setState({selectuserroledata})
                //console.log(this.state.selectroledata)
                //console.log(this.state.selectuserroledata)
            }
            this.openModal()
        }
    }

    openModal(){
        this.setState({ open: true })
        //this.setUserRole(user_id)
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
        this.setState({barcodeObj:ObjStr}, () => console.log(this.state.barcodeObj))
    }

    createRoleBtn(rowdata){
        return <Button type="button" color="primary" style={{ background: "#26c6da", borderColor: "#26c6da", width: '80px' }}
          onClick={() => this.getData(rowdata.ID)}>Role</Button>
        }
    
    updateRole(){
        const dataUpdate = this.state.dataUpdate
        if(dataUpdate.length > 0){
            dataUpdate.forEach((row) => {
                row["ID"] = row["ID"] <= 0 ? null : row["ID"]
            })
            let updjson = {
                "_token": sessionStorage.getItem("Token"),
                "_apikey": null,
                "t": "ams_User_Role",
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
                    if(row.Role_ID === rowdata.original.ID){
                        dataUpdate.splice(index,1)
                    }
                })
            }
            if(value){
                if(rowdata.original.User_ID === null){
                    dataUpdate.push({ID:0,User_ID:this.state.User_id,Role_ID:rowdata.original.ID,Status:1})
                }else{
                    dataUpdate.push({ID:rowdata.original.user_role_id,User_ID:this.state.User_id,Role_ID:rowdata.original.ID,Status:1})
                }
            }
            else{
                if(rowdata.original.User_ID === null){
                    dataUpdate.push({ID:0,User_ID:this.state.User_id,Role_ID:rowdata.original.ID,Status:0})
                }else{
                    dataUpdate.push({ID:rowdata.original.user_role_id,User_ID:this.state.User_id,Role_ID:rowdata.original.ID,Status:0})
                }
            }
            this.setState({dataUpdate})
        }
        console.log(this.state.dataUpdate)
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
            {accessor: 'Modified', Header: 'Modify', editable:false,filterable:false},
            {show:this.state.permissionView,Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Remove", btntext:"Remove"},
            {Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Role", btntext:"Role"},
            {Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Remove", btntext:"Remove"},
          ]; 

        const btnfunc = [{
            btntype:"Role",
            func:this.createRoleBtn
       
          }]

        const col = this.state.colsRole
        col.forEach((row) => {
            if(row.Type === "selection"){
                row.Cell = (e) => this.createSelection(e,"checkbox")
                row.className="text-center"
              }
        })

        const view  = this.state.permissionView
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
            <TableGen column={cols} data={this.state.select} dropdownfilter={this.state.statuslist} addbtn={view}
                      filterable={true} accept={view} btn={btnfunc} uneditcolumn={this.uneditcolumn}
                      table="ams_User"/>
            <Popup open={this.state.open} onClose={this.closeModal}>
                <div>
                    <ReactTable columns={this.state.colsRole} minRows={3} data={this.state.selectroledata} sortable={false} style={{background:'white'}} 
                    getselection={this.getSelectionData} showPagination={false}/>
                    <Card>
                        <CardBody>
                            <Button onClick={() => this.updateRole()} color="danger" style={{ background: "#26c6da", borderColor: "#26c6da ", width: '130px' }} className="float-left">Save</Button>
                        </CardBody>
                    </Card>
                </div>
            </Popup>
            </div>
        ) 
    }
}

export default User;