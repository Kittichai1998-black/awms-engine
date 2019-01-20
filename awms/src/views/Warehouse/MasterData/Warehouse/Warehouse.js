import React, { Component } from 'react';
import "react-table/react-table.css";
import { TableGen } from '../TableSetup';
import Axios from 'axios';
import { apicall, createQueryString } from '../../ComponentCore'
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../../ComponentCore/Permission';
const api = new apicall()

class Warehouse extends Component {
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
                t: "WarehouseMaster",
                q: "[{ 'f': 'Status', c:'!=', 'v': 2}]",
                f: "ID,Code,Name,Description,Branch_ID,Branch_Code,Status,Created,Modified,LastUpdate",
                g: "",
                s: "[{'f':'ID','od':'asc'}]",
                sk: "",
                l: 100,
                all: "",
            },
            sortstatus: 0,
            selectiondata: [],
        };
        this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
        this.filterList = this.filterList.bind(this)
        this.displayButtonByPermission = this.displayButtonByPermission.bind(this)
        this.uneditcolumn = ["Branch_Code", "Created", "Modified", "LastUpdate"]
    }
    componentDidMount() {
        document.title = "Warehouse - AWMS"
    }
    onHandleClickCancel(event) {
        this.forceUpdate();
        event.preventDefault();
    }

    async componentWillMount() {
        this.filterList();
        //permission
        let dataGetPer = await GetPermission()
        CheckWebPermission("Warehouse", dataGetPer, this.props.history);
        this.displayButtonByPermission(dataGetPer)
    }
    //permission
    displayButtonByPermission(dataGetPer) {
        let checkview = true
        if (CheckViewCreatePermission("Warehouse_view", dataGetPer)) {
            checkview = true //แสดงข้อมูลเฉยๆ
        }
        if (CheckViewCreatePermission("Warehouse_create&modify", dataGetPer)) {
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
        const whselect = {
            queryString: window.apipath + "/api/mst",
            t: "Branch",
            q: "[{ 'f': 'Status', c:'<', 'v': 2}",
            f: "ID,concat(Code,' : ',Name) as Code",
            g: "",
            s: "[{'f':'ID','od':'asc'}]",
            sk: 0,
            all: "",
        }

        Axios.all([api.get(createQueryString(whselect))]).then(
            (Axios.spread((whresult) => {
                let ddl = [...this.state.autocomplete]
                let whList = {}
                whList["data"] = whresult.data.datas
                whList["field"] = "Branch_Code"
                whList["pair"] = "Branch_ID"
                whList["mode"] = "Dropdown"

                ddl = ddl.concat(whList)
                this.setState({ autocomplete: ddl })
            })))
    }

    render() {
        const view = this.state.permissionView
        const cols = [
            { Header: 'No.', fixed: "left", Type: 'numrows', filterable: false, className: 'center', minWidth: 40, maxWidth: 40 },
            //{ accessor: 'Code', Header: 'Code', editable: view, Filter: "text", fixed: "left", minWidth: 90, maxWidth: 120},
            { accessor: 'Name', Header: 'Name', editable: view, Filter: "text", minWidth: 120 },
            //{accessor: 'Description', Header: 'Description',editable:true, sortable:false,Filter:"text",},
            { accessor: 'Branch_Code', Header: 'Branch', updateable: view, Filter: "text", Type: "autocomplete", minWidth: 120},
            //{accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" ,Filter:"dropdown",Filter:"dropdown",},
            { accessor: 'LastUpdate', Header: 'Last Update', filterable: false, minWidth: 180, maxWidth: 180 },
            //   { accessor: 'Created', Header: 'Create', editable: false, filterable: false, minWidth: 170 },
            /* {accessor: 'CreateTime', Header: 'CreateTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false}, */
            // { accessor: 'Modified', Header: 'Modify', editable: false, filterable: false, minWidth: 170 },
            //{accessor: 'ModifyTime', Header: 'ModifyTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
            { show: view, Header: '', Aggregated: "button", Type: "button", filterable: false, sortable: false, btntype: "Remove", btntext: "Remove" },
        ];

        const btnfunc = [{
            btntype: "Barcode",
            func: this.createBarcodeBtn
        }]
        return (
            <div>
                {/*
                    column = คอลัมที่ต้องการแสดง
                    data = json ข้อมูลสำหรับ select ผ่าน url
                    ddlfilter = json dropdown สำหรับทำ dropdown filter
                */}
                <TableGen column={cols} data={this.state.select} dropdownfilter={this.state.statuslist} addExportbtn={view} expFilename={"Warehouse"} exportfilebtn={view}
                    filterable={true} autocomplete={this.state.autocomplete} accept={view} btn={btnfunc} uneditcolumn={this.uneditcolumn}
                    table="ams_Warehouse" />

            </div>
        )
    }
}

export default Warehouse;
