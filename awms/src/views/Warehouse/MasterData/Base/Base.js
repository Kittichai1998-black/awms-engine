import React, { Component } from 'react';
import "react-table/react-table.css";
import {Button } from 'reactstrap';
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
            t:"BaseMaster",
            q:"[{ 'f': 'Status', c:'<', 'v': 2}]",
            f:"ID,Code,Name,Description,BaseMasterType_ID,BaseMasterType_Code,ObjectSize_ID,ObjectSize_Code,Status,Created,Modified",
            g:"",
            s:"[{'f':'Code','od':'asc'}]",
            sk:0,
            l:100,
            all:"",},
            sortstatus:0,
            selectiondata:[]
        };
        this.getSelectionData = this.getSelectionData.bind(this)
        this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
        this.filterList = this.filterList.bind(this)
        this.createBarcodeBtn = this.createBarcodeBtn.bind(this)
        this.displayButtonByPermission = this.displayButtonByPermission.bind(this)
        this.uneditcolumn = ["BaseMasterType_Code","ObjectSize_Code","ObjCode","PackCode","Created","Modified"]
    }

    onHandleClickCancel(event){
        this.forceUpdate();
        event.preventDefault();
    }

    async componentWillMount(){
        this.filterList();
        //permission
        let data =await GetPermission()
        Nodisplay(data,12,this.props.history)
        this.displayButtonByPermission(data)
        //permission
    }
    //permission
    displayButtonByPermission(perID){
        this.setState({perID:perID})
        let check = false
        perID.forEach(row => {
            if(row === 12){
            check = true
            }if(row === 13){
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

    componentWillUnmount(){
    Axios.isCancel(true);
    }

    filterList(){
        const objselect = {queryString:window.apipath + "/api/mst",
            t:"ObjectSize",
            q:"[{ 'f': 'Status', c:'<', 'v': 2},{ 'f': 'ObjectType', c:'=', 'v': 1}",
            f:"ID,concat(Code,' : ',Name) as Code",
            g:"",
            s:"[{'f':'ID','od':'asc'}]",
            sk:0,
            all:"",}

        const basetypeselect = {queryString:window.apipath + "/api/mst",
            t:"BaseMasterType",
            q:"[{ 'f': 'Status', c:'<', 'v': 2}",
            f:"ID,concat(Code,' : ',Name) as Code",
            g:"",
            s:"[{'f':'ID','od':'asc'}]",
            sk:0,
            all:"",}

    Axios.all([Axios.get(createQueryString(objselect)),Axios.get(createQueryString(basetypeselect))]).then(
        (Axios.spread((objresult, basetyperesult) => 
        {
            let ddl = [...this.state.autocomplete]
            let objList = {}
            let basetypelist = {}
            objList["data"] = objresult.data.datas
            objList["field"] = "ObjectSize_Code"
            objList["pair"] = "ObjectSize_ID"
            objList["mode"] = "Dropdown"

            basetypelist["data"] = basetyperesult.data.datas
            basetypelist["field"] = "BaseMasterType_Code"
            basetypelist["pair"] = "BaseMasterType_ID"
            basetypelist["mode"] = "Dropdown"

            ddl = ddl.concat(objList).concat(basetypelist)
            this.setState({autocomplete:ddl})
        })))
    }
    getSelectionData(data){
        let obj = []
        data.forEach((datarow,index) => {
            obj.push({"barcode":datarow.Code,"Name":datarow.Name});
        })
        const ObjStr = JSON.stringify(obj)
        this.setState({barcodeObj:ObjStr}, () => console.log(this.state.barcodeObj))
    }

    createBarcodeBtn(rowdata){
      return <Button type="button" color="primary" style={{ background: "#26c6da", borderColor: "#26c6da", width: '80px' }}
        onClick={() => {
            let barcode=[{"barcode":rowdata["Code"],"Name":rowdata["Name"]}]
            let barcodestr = JSON.stringify(barcode)
            window.open('/mst/base/manage/barcode?barcodesize=1&barcodetype=qr&barcode='+barcodestr, "_blank")
            }}>Print</Button>
      }

    render(){
        const cols = [
            {Header: '', Type:"selection", sortable:false, Filter:"select", className:"text-center", fixed: "left"},
            {accessor: 'Code', Header: 'Code', Type:"autobasecode", editable:false, Filter:"text", fixed: "left"},
            {accessor: 'Name', Header: 'Name', editable:true,Filter:"text", fixed: "left"},
            //{accessor: 'Description', Header: 'Description', editable:true,Filter:"text", sortable:true},
            {accessor: 'BaseMasterType_Code', Header: 'Base Type',updateable:false,Filter:"text", Type:"autocomplete"},
            {accessor: 'ObjectSize_Code', Header: 'Object Size',updateable:false,Filter:"text", Type:"autocomplete"},
            {accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" ,Filter:"dropdown"},
            {accessor: 'Created', Header: 'Create', editable:false,filterable:false},
            /* {accessor: 'CreateTime', Header: 'CreateTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false}, */
            {accessor: 'Modified', Header: 'Modify', editable:false,filterable:false},
            //{accessor: 'ModifyTime', Header: 'ModifyTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
            {show:this.state.permissionView,Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Barcode", btntext:"Barcode"},
            {show:this.state.permissionView,Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Remove", btntext:"Remove"},
          ]; 
        
        const btnfunc = [{
            history:this.props.history,
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
            addbtn = เปิดปิดปุ่ม Add
            accept = สถานะของในการสั่ง update หรือ insert
            autocomplete = data field ที่ต้องการทำ autocomplete
            filterable = เปิดปิดโหมด filter
            getselection = เก็บค่าที่เลือก
        
          */}
            <TableGen column={cols} data={this.state.select} dropdownfilter={this.state.statuslist} addbtn={view}
            filterable={true} autocomplete={this.state.autocomplete} getselection={this.getSelectionData} printbtn={view}
            btn={btnfunc} uneditcolumn={this.uneditcolumn}
              table="ams_BaseMaster" autocode="@@sql_gen_base_code" />

            
          </div>
        )
      }
}
export default Area;
