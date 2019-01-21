import React, { Component } from 'react';
import "react-table/react-table.css";
import { TableGen } from '../TableSetup';
import Axios from 'axios';
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../../ComponentCore/Permission';
import { apicall, createQueryString } from '../../ComponentCore'

const api = new apicall()

class Pack extends Component {
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
                t: "PackMaster",
                q: "[{ 'f': 'Status', c:'<', 'v': 2}]",
                f: "ID,SKUMaster_ID,SKU_Code,PackMasterType_ID,PackCode,PackName,UnitType_ID,UnitTypeCode,UnitTypeName,ObjectSize_ID,ObjectSizeCode,ObjectSize_Code,Code,Name,Description,WeightKG,WidthM,LengthM,HeightM,ItemQty,Revision,Status,Created,Modified,LastUpdate",
                g: "",
                s: "[{'f':'Code','od':'asc'}]",
                sk: 0,
                l: 100,
                all: "",
            },
            sortstatus: 0,
            selectiondata: [],

        };
        this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
        this.displayButtonByPermission = this.displayButtonByPermission.bind(this)
        this.filterList = this.filterList.bind(this)
        this.uneditcolumn = ["SKU_Code", "PackCode", "PackName", "UnitTypeCode", "UnitTypeName", "ObjectSizeCode","ObjectSize_Code", "Created", "Modified", "LastUpdate"]
    }

    onHandleClickCancel(event) {
        this.forceUpdate();
        event.preventDefault();
    }

    async componentWillMount() {
        document.title = "SKU Unit - AWMS"
        this.filterList();
        //permission
        let dataGetPer = await GetPermission()
        CheckWebPermission("Pack", dataGetPer, this.props.history);
        this.displayButtonByPermission(dataGetPer)
    }

    //permission
    displayButtonByPermission(dataGetPer) {
        let checkview = true
        if (CheckViewCreatePermission("SKU_view", dataGetPer)) {
            checkview = true //แสดงข้อมูลเฉยๆ
        }
        if (CheckViewCreatePermission("SKU_create&modify", dataGetPer)) {
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
        const SKUSelect = {
            queryString: window.apipath + "/api/mst",
            t: "SKUMaster",
            q: "[{ 'f': 'Status', c:'<', 'v': 2}",
            f: "ID,concat(Code,' : ',Name) as Code",
            g: "",
            s: "[{'f':'ID','od':'asc'}]",
            sk: 0,
            all: "",
        }

        const PackTypeSelect = {
            queryString: window.apipath + "/api/mst",
            t: "PackMasterType",
            q: "[{ 'f': 'Status', c:'<', 'v': 2}",
            f: "ID,Code",
            g: "",
            s: "[{'f':'ID','od':'asc'}]",
            sk: 0,
            all: "",
        }

        const UnitTypeSelect = {
            queryString: window.apipath + "/api/mst",
            t: "UnitType",
            q: "[{ 'f': 'Status', c:'<', 'v': 2}",
            f: "ID,Code",
            g: "",
            s: "[{'f':'ID','od':'asc'}]",
            sk: 0,
            all: "",
        }

        const ObjSizeSelect = {
            queryString: window.apipath + "/api/mst",
            t: "ObjectSize",
            q: "[{ 'f': 'Status', c:'<', 'v': 2},{ 'f': 'ObjectType', c:'=', 'v': 2}",
            f: "ID,Code",
            g: "",
            s: "[{'f':'ID','od':'asc'}]",
            sk: 0,
            all: "",
        }

        Axios.all([api.get(createQueryString(SKUSelect))
            , api.get(createQueryString(PackTypeSelect))
            , api.get(createQueryString(UnitTypeSelect))
            , api.get(createQueryString(ObjSizeSelect))
        ]).then(
            (Axios.spread((SKUResult, PackTypeResult, UnitTypeResult, ObjSizeResult) => {
                let ddl = [...this.state.autocomplete]
                let SKUList = {}
                let PackTypeList = {}
                let UnitTypeList = {}
                let ObjSizeList = {}
                SKUList["data"] = SKUResult.data.datas
                SKUList["field"] = "SKU_Code"
                SKUList["pair"] = "SKUMaster_ID"
                SKUList["mode"] = "Dropdown"

                PackTypeList["data"] = PackTypeResult.data.datas
                PackTypeList["field"] = "PackCode"
                PackTypeList["pair"] = "PackMasterType_ID"
                PackTypeList["mode"] = "Dropdown"

                UnitTypeList["data"] = UnitTypeResult.data.datas
                UnitTypeList["field"] = "UnitTypeCode"
                UnitTypeList["pair"] = "UnitType_ID"
                UnitTypeList["mode"] = "Dropdown"

                ObjSizeList["data"] = ObjSizeResult.data.datas
                ObjSizeList["field"] = "ObjectSizeCode"
                ObjSizeList["pair"] = "ObjectSize_ID"
                ObjSizeList["mode"] = "Dropdown"

                ddl = ddl.concat(SKUList).concat(PackTypeList).concat(UnitTypeList).concat(ObjSizeList)
                this.setState({ autocomplete: ddl })
            })))
    }

    render() {
        const view = this.state.permissionView
        const cols = [
            { Header: 'No.', fixed: "left", Type: 'numrows', filterable: false, className: 'center', minWidth: 45, maxWidth: 45 },
            { accessor: 'Code', Header: 'SKU Code', editable: false, Filter: "text", fixed: "left" },
            //{accessor: 'Name', Header: 'Name', editable:false,Filter:"text", fixed: "left"},
            //{accessor: 'Description', Header: 'Description', sortable:false,Filter:"text",editable:true,},
            { accessor: 'Name', Header: 'SKU Name', updateable: false, Filter: "text", Type: "autocomplete", fixed: "left", minWidth: 230 },
            //{accessor: 'PackCode', Header: 'Pack Type',updateable:false,Filter:"text", Type:"autocomplete"},
            { accessor: 'WeightKG', Header: 'Gross Weight (Kg.)', editable: false, Filter: "text", datatype: "int", className: "right", minWidth: 80 },
            //{accessor: 'WidthM', Header: 'Width', editable:true,Filter:"text"},
            //{accessor: 'LengthM', Header: 'Length', editable:true,Filter:"text"},
            //{accessor: 'HeightM', Header: 'Height', editable:true,Filter:"text"},
            ///{accessor: 'PickSizeQty', Header: 'Pick Size Qty', editable:true,Filter:"text",datatype:"int"},
            { accessor: 'ItemQty', Header: 'Conversion from Base Unit', editable: false, Filter: "text", datatype: "int", className: "right", minWidth: 70 },
            { accessor: 'UnitTypeCode', Header: 'Unit Converter', updateable: false, Filter: "text", Type: "autocomplete", minWidth: 80, className: "left" },
            { accessor: 'ObjectSizeCode', Header: '% Weight Verify', updateable: true, Filter: "text", Type: "autocomplete" },
            //{accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" ,Filter:"dropdown",Filter:"dropdown"},
            { accessor: 'LastUpdate', Header: 'Last Update', filterable: false, minWidth: 180, maxWidth: 180 },
            //{ accessor: 'Created', Header: 'Create', editable: false, filterable: false, minWidth: 180 },
            /* {accessor: 'CreateTime', Header: 'CreateTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false}, */
            //{ accessor: 'Modified', Header: 'Modify', editable: false, filterable: false, minWidth: 180 },
            //{accessor: 'ModifyTime', Header: 'ModifyTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
            { show: false, Header: '', Aggregated: "button", Type: "button", filterable: false, sortable: false, btntype: "Remove", btntext: "Remove" },
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
                <TableGen column={cols} data={this.state.select} dropdownfilter={this.state.statuslist}
                    filterable={true} autocomplete={this.state.autocomplete} accept={view} exportfilebtn={false}
                    btn={btnfunc} uneditcolumn={this.uneditcolumn} expFilename={"Pack"}
                    table="ams_PackMaster" />
            </div>
        )
    }
}

export default Pack;
