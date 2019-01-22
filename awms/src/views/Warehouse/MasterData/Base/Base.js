import React, { Component } from 'react';
import "react-table/react-table.css";
import { Button } from 'reactstrap';
import { TableGen } from '../TableSetup';
import Axios from 'axios';
import { apicall, createQueryString } from '../../ComponentCore'
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../../ComponentCore/Permission';
const api = new apicall()

class Area extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: [],
            autocomplete: [],
            statuslist: [{
                'status': [{ 'value': '*', 'label': 'All' }, { 'value': '1', 'label': 'Active' }, { 'value': '0', 'label': 'Inactive' }],
                'header': 'Status',
                'field': 'Status',
                'mode': 'check',
            }],
            acceptstatus: false,
            select: {
                queryString: window.apipath + "/api/viw",
                t: "BaseMaster",
                q: "[{ 'f': 'Status', c:'<', 'v': 2}]",
                f: "ID,Code,Name,Description,BaseMasterType_ID,BaseMasterType_Code,ObjectSize_ID,ObjectSize_Code,UnitType_ID,UnitType_Code,WeightKG,Status,Created,Modified,LastUpdate",
                g: "",
                s: "[{'f':'Code','od':'asc'}]",
                sk: 0,
                l: 100,
                all: "",
            },
            sortstatus: 0,
            selectiondata: []
        };
        this.getSelectionData = this.getSelectionData.bind(this)
        this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
        this.filterList = this.filterList.bind(this)
        this.createBarcodeBtn = this.createBarcodeBtn.bind(this)
        this.displayButtonByPermission = this.displayButtonByPermission.bind(this)
        this.uneditcolumn = ["BaseMasterType_Code", "ObjectSize_Code", "UnitType_Code", "Created", "Modified", "LastUpdate"]
    }

    onHandleClickCancel(event) {
        this.forceUpdate();
        event.preventDefault();
    }
    componentDidMount() {
        document.title = "Pallet Master - AWMS"
    }
    async componentWillMount() {
        this.filterList();
        //permission
        let dataGetPer = await GetPermission()
        CheckWebPermission("Pallet", dataGetPer, this.props.history);
        this.displayButtonByPermission(dataGetPer)
    }
    displayButtonByPermission(dataGetPer) {
        let checkview = true
        if (CheckViewCreatePermission("Base_view", dataGetPer)) {
            checkview = true //แสดงข้อมูลเฉยๆ
        }
        if (CheckViewCreatePermission("Base_create&modify", dataGetPer)) {
            checkview = false //แก้ไข
        }
        if (checkview === true) {
            this.setState({ permissionView: false })
        } else if (checkview === false) {
            this.setState({ permissionView: true })
        }
    }
    componentWillUnmount() {
        Axios.isCancel(true);
    }

    filterList() {
        const objselect = {
            queryString: window.apipath + "/api/mst",
            t: "ObjectSize",
            q: "[{ 'f': 'Status', c:'<', 'v': 2},{ 'f': 'ObjectType', c:'=', 'v': 1}",
            f: "ID,concat(Code,' : ',Name) as Code",
            g: "",
            s: "[{'f':'ID','od':'asc'}]",
            sk: 0,
            all: "",
        }
        const basetypeselect = {
            queryString: window.apipath + "/api/viw",
            t: "BaseMasterType",
            q: "[{ 'f': 'Status', c:'<', 'v': 2},{ 'f': 'ObjectType', c:'=', 'v': 1}",
            f: "ID,concat(Code,' : ',Name) as Code",
            g: "",
            s: "[{'f':'ID','od':'asc'}]",
            sk: 0,
            all: "",
        }
        const unitselect = {
            queryString: window.apipath + "/api/mst",
            t: "UnitType",
            q: "[{ 'f': 'Status', c:'<', 'v': 2},{ 'f': 'ObjectType', c:'=', 'v': 1}]",
            f: "ID,concat(Code,' : ',Name) as Code",
            g: "",
            s: "[{'f':'ID','od':'asc'}]",
            sk: 0,
            all: "",
        }
        Axios.all([api.get(createQueryString(objselect)),
        api.get(createQueryString(basetypeselect)),
        api.get(createQueryString(unitselect))]).then(
            (Axios.spread((objresult, basetyperesult, unitresult) => {
                let ddl = [...this.state.autocomplete]
                let objList = {}
                let unitList = {}
                let basetypelist = {}
                objList["data"] = objresult.data.datas
                objList["field"] = "ObjectSize_Code"
                objList["pair"] = "ObjectSize_ID"
                objList["mode"] = "Dropdown"

                basetypelist["data"] = basetyperesult.data.datas
                basetypelist["field"] = "BaseMasterType_Code"
                basetypelist["pair"] = "BaseMasterType_ID"
                basetypelist["mode"] = "Dropdown"

                unitList["data"] = unitresult.data.datas
                unitList["field"] = "UnitType_Code"
                unitList["pair"] = "UnitType_ID"
                unitList["mode"] = "Dropdown"
                ddl = ddl.concat(objList).concat(basetypelist).concat(unitList)
                this.setState({ autocomplete: ddl })
            })))
    }
    getSelectionData(data) {
        let obj = []
        data.forEach((datarow, index) => {
            obj.push({ "barcode": datarow.Code, "Name": datarow.Name });
        })
        const ObjStr = JSON.stringify(obj)
        this.setState({ barcodeObj: ObjStr }, () => console.log(this.state.barcodeObj))
    }

    createBarcodeBtn(rowdata) {
        return <Button type="button" color="info" style={{ width: '80px' }}
            onClick={() => {
                let barcode = [{ "barcode": rowdata["Code"], "Name": rowdata["Name"] }]
                let barcodestr = JSON.stringify(barcode)
                window.open('/mst/base/manage/barcode?barcodesize=1&barcodetype=qr&barcode=' + barcodestr, "_blank")
            }}>Print</Button>
    }

    render() {
        const view = this.state.permissionView
        const cols = [
            { Header: 'No.', fixed: "left", Type: 'numrows', filterable: false, className: 'center', minWidth: 45, maxWidth: 45 },
            //{ Header: '', Type: "selection", sortable: false, Filter: "select", className: "text-center", fixed: "left", minWidth: 50, maxWidth: 50},
            { accessor: 'Code', Header: 'Pallet Code', Type: "autobasecode", editable: false, Filter: "text", fixed: "left", minWidth: 100 },
            { accessor: 'Name', Header: 'Pallet Name', editable: view, Filter: "text", fixed: "left", minWidth: 100 },
            //{accessor: 'Description', Header: 'Description', editable:true,Filter:"text", sortable:true},
            { accessor: 'BaseMasterType_Code', Header: 'Type', updateable: view, Filter: "text", Type: "autocomplete", minWidth: 150 },
            { accessor: 'WeightKG', Header: 'Weight (Kg.)', editable: view, Filter: "text", datatype: "int", minWidth: 90, className: "center" },
            { accessor: 'ObjectSize_Code', Header: 'Size', updateable: view, Filter: "text", Type: "autocomplete", minWidth: 250 },
            { accessor: 'UnitType_Code', Header: 'Unit', updateable: view, Filter: "text", Type: "autocomplete", minWidth: 140 },
            //{accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" ,Filter:"dropdown"},
            { accessor: 'LastUpdate', Header: 'Last Update', filterable: false, minWidth: 180, maxWidth: 180 },
            // { accessor: 'Created', Header: 'Create', editable: false, filterable: false, minWidth: 170 },
            /* {accessor: 'CreateTime', Header: 'CreateTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false}, */
            // { accessor: 'Modified', Header: 'Modify', editable: false, filterable: false, minWidth: 170 },
            //{accessor: 'ModifyTime', Header: 'ModifyTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
            //{show:this.state.permissionView,Header: '', Aggregated:"button",Type:"button", filterable:false, sortable:false, btntype:"Barcode", btntext:"Barcode"},
            { show: view, Header: '', Aggregated: "button", Type: "button", filterable: false, sortable: false, btntype: "Remove", btntext: "Remove" },
        ];

        const btnfunc = [{
            history: this.props.history,
            btntype: "Barcode",
            func: this.createBarcodeBtn
        }]
        return (
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
                <TableGen column={cols} data={this.state.select} dropdownfilter={this.state.statuslist} addExportbtn={view} expFilename={"Pallet"}
                    filterable={true} autocomplete={this.state.autocomplete} getselection={this.getSelectionData} accept={view} exportfilebtn={view}
                    btn={btnfunc} uneditcolumn={this.uneditcolumn}
                    table="ams_BaseMaster" autocode="@@sql_gen_base_code" />


            </div>
        )
    }
}
export default Area;
