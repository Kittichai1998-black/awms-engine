import React, { Component } from 'react';
import "react-table/react-table.css";
import { Card, CardBody, Button } from 'reactstrap';
import { TableGen } from '../TableSetup';
import { FilterURL, createQueryString, apicall } from '../../ComponentCore'
import Popup from 'reactjs-popup'
import ReactTable from 'react-table'
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../../ComponentCore/Permission';

const Axios = new apicall()
const imgClose = <img style={{ width: "28px", height: "auto" }} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAANkSURBVGhD7ZlHyxRBEIYXI4aDYgDDP1Bvpr9hwqMR9ageFBN6ULwaPsNdFEU9iH9DDwZQ9GIGIwaMCPo+sA1lU7PT3Tu7sjAvPLisXdXVOz3V1fV1WrVq1YjGiZViv7gu7osP4lcXPvPdNbFPrBDY/HctFMfFC/Enk2cC2wVi6JolzoifwgsuB3yMCXwORevFW+EF0w/4XCcGpgninPAmh4/iotgilok5YmIXPvPdVnFJMNbzATyN8aJRTRU3hTfhA7FJTBGpYuxm8VB4Pm+IHH89xa+Bw3iSb2Kn4MmUCttd4ruI/TNnI0/ivIidk3WWiqbE9nop4nlOir7ECxs7vSXmi6aFz9sinm+NKBJp7Z2wzp6LQeZtXvbHws75RswU2TorrKOvgkftaVH33xxV2SwWzGXnPi2yxK8cH1K8sJ4Oi9+C7ZYqxmKDraeDws7NS561bTnirQNSpZdtCCCMSV1ECD7YeYsgbb8SYQwcE0miyGKvW+MNIhaP2gYCdYuIgw82+Iq1XdhxT0VSAUhVaQ0/iapDpSogbxE5YxFP4bOw46vewX9ESWyNLoheSgksN/igy8La7BW1op63RtQ2deoVYGnwaJuwdldFrbh4WKPlIkVVgZYGj+LtfFfUituTNcqp071FWHKCR7OFtedgrVWc/yeJHFUtIjd4NFlYH8RWq5FfQLyFeIypqgo+kLuIoi10T1ijkXuJRz6N0rexRtxheyklwNJFXBHWZo+olVdKcKx7ygksdxHTRFEp4RVzG0WsQRdzO4Qd90Qkd/PicprugVdOHxFhTF3wQfEi8BGLX7+4nEbehWa38EQAqcEHhUV4waNDws7NhWaeyBINJuuEax5NWU9NXimXCFo2du5TIlvUQFyorSPeDRq6g5J3qX8tZogi0au0zoC2ChM1LXziO55vlehLPL7Y6SPhZY5S4Quf8TwnRN+qai3yThwQZIxSTRf4GGhrEXEn9hYBpDuO/JxmLAcjeT5OlQHmaqy5G8Sv4W2nwBfBHZbFkK3Y05TiMLf7HZ0GygPGej6AORr75T2tFXF2agKyzWoxFJHWaPf9EF4wObD/6UIXp8p+RLuPI56mkxdcL7A5KrJP2EGIIouLD30banYuHu8F5Qjw+Y7g/xjD3xaSC7NWrVpVqdP5C8HnZiqeZ+ELAAAAAElFTkSuQmCC" />;

class Role extends Component {
    constructor(props) {
        super(props);

        this.state = {
            colsMap: [
                { Header: '', Type: "selection", sortable: false, Filter: "select", className: "text-center", minWidth: 50 },
                { accessor: 'Code', Header: 'Code', editable: false, filterable: false, minWidth: 160 },
                { accessor: 'Name', Header: 'Name', editable: false, filterable: false },
                { accessor: 'Description', Header: 'Description', editable: false, filterable: false },
            ],
            data: [],
            autocomplete: [],
            statuslist: [{
                'status': [{ 'value': '*', 'label': 'All' }, { 'value': '1', 'label': 'Active' }, { 'value': '0', 'label': 'Inactive' }],
                'header': 'Status',
                'field': 'Status',
                'mode': 'check',
            }],
            acceptstatus: false,
            select: {},
            selectPermission: {
                queryString: window.apipath + "/api/mst",
                t: "Permission",
                q: "[{ 'f': 'Status', c:'<', 'v': 2}]",
                f: "ID,Code,Name,Description,Status",
                g: "",
                s: "[{'f':'ID','od':'asc'}]",
                sk: 0,
                l: 1000,
                all: "",
            },
            selectMapChild: {
                queryString: window.apipath + "/api/mst",
                t: "role_permission",
                q: "[{ 'f': 'Status', c:'<', 'v': 2}]",
                f: "ID,Role_ID,Permission_ID,Status",
                g: "",
                s: "[{'f':'ID','od':'asc'}]",
                sk: 0,
                l: 1000,
                all: "",
            },
            sortstatus: 0,
            Root_ID: 0,
            open: false,
            selectdata: [],
            selectMapData: [],
            dataUpdate: [],
            rowselect: [],
        };
        this.queryselect = {
            queryString: window.apipath + "/api/viw",
            t: "Role",
            q: '[{ "f": "Status", "c":"<", "v": 2}]',
            f: "ID,Code,Name,Description,Status,Created,Modified",
            g: "",
            s: "[{'f':'ID','od':'asc'}]",
            sk: "",
            l: 100,
            all: "",
        }
        this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
        this.uneditcolumn = ["Created", "Modified"]
        this.createSelection = this.createSelection.bind(this)
        this.onHandleSelection = this.onHandleSelection.bind(this)
        this.getData = this.getData.bind(this)
        this.setRolePermission = this.setRolePermission.bind(this)
        this.openModal = this.openModal.bind(this)
        this.closeModal = this.closeModal.bind(this)
        this.createMapBtn = this.createMapBtn.bind(this)
        this.displayButtonByPermission = this.displayButtonByPermission.bind(this)
        this.updateRolePermission = this.updateRolePermission.bind(this)
    }

    async componentWillMount() {
        //permission
        let dataGetPer = await GetPermission()
        CheckWebPermission("Role", dataGetPer, this.props.history);
        this.displayButtonByPermission(dataGetPer)
        document.title = "Role : AWMS";
        if (this.props.location.search) {
            let url = FilterURL(this.props.location.search, this.queryselect)
            this.setState({ select: url })
        } else {
            this.setState({ select: this.queryselect })
        }
    }
    displayButtonByPermission(dataGetPer) {
        let checkview = true
        if (CheckViewCreatePermission("Administrator", dataGetPer)) {
            checkview = false //แก้ไข
        }

        if (checkview === true) {
            this.setState({ permissionView: false })
        } else if (checkview === false) {
            this.setState({ permissionView: true })
        }
    }
    onHandleClickCancel(event) {
        this.forceUpdate();
        event.preventDefault();
    }

    getData(Root_ID) {
        console.log(Root_ID)
        const selectdata = []
        const selectMapdata = []
        Axios.get(createQueryString(this.state.selectPermission)).then((response) => {
            response.data.datas.forEach(row => {
                selectdata.push({
                    ID: row.ID
                    , Code: row.Code
                    , Name: row.Name
                    , Description: row.Description
                    , Check: false
                    , Role_ID: null  //*
                    , RolePermission_ID: 0
                })
            })
            //console.log(selectdata)
            this.setState({ selectdata })
            Axios.get(createQueryString(this.state.selectMapChild)).then((responset) => {
                responset.data.datas.forEach(row => {
                    selectMapdata.push({
                        ID: row.ID
                        , Role_ID: row.Role_ID
                        , Permission_ID: row.Permission_ID
                        , Status: row.Status
                    })
                })
                //console.log(selectMapdata)
                this.setState({ selectMapdata }, () => this.setRolePermission(Root_ID))
            })
        })
    }

    setRolePermission(data) {
        if (!this.state.open) {
            let selectdata = []
            let selectMapdata = []

            selectdata = this.state.selectdata
            selectMapdata = this.state.selectMapdata
            if (selectMapdata !== undefined) {
                var index = selectMapdata.length - 1
                while (index >= 0) {
                    if (selectMapdata[index].Role_ID !== data) {
                        selectMapdata.splice(index, 1);
                    }
                    index -= 1;
                }
                selectdata.forEach(rowRoot => {
                    selectMapdata.forEach(rowChild => {
                        if (rowRoot.ID === rowChild.Permission_ID) {
                            rowRoot.Role_ID = rowChild.Role_ID
                            rowRoot.RolePermission_ID = rowChild.ID
                            if (rowChild.Status === 1) {
                                rowRoot.Check = true
                            }
                        }
                    })
                })
                this.setState({ Root_ID: data })
                this.setState({ selectdata })
                this.setState({ selectMapdata })
            }
            this.openModal()
        }
    }

    openModal() {
        this.setState({ open: true })
    }

    closeModal() {
        this.setState({ open: false })
        this.setState({ dataUpdate: [] })
    }

    getSelectionData(data) {
        let obj = []
        data.forEach((datarow, index) => {
            obj.push({ "ID": datarow.ID });
        })
        const ObjStr = JSON.stringify(obj)
        this.setState({ barcodeObj: ObjStr })
    }

    createMapBtn(rowdata) {
        if (rowdata.ID <= 0) {
            return null
        } else {
            return <div class="text-center"><Button type="button" color="info" style={{ width: '100px' }}
                onClick={() => this.getData(rowdata.ID)}>Permission</Button></div>
        }
    }

    updateRolePermission() {
        const dataUpdate = this.state.dataUpdate
        if (dataUpdate.length > 0) {
            dataUpdate.forEach((row) => {
                row["ID"] = row["ID"] <= 0 ? null : row["ID"]
            })
            let updjson = {
                "t": "ams_Role_Permission",
                "pk": "ID",
                "datas": dataUpdate,
                "nr": false
            }
            Axios.put(window.apipath + "/api/mst", updjson).then((result) => {
            })
            this.setState({ dataUpdate: [] })
            this.closeModal()
        }
    }

    createSelection(rowdata, type) {
        return <input
            className="selection"
            type={type}
            name="selection"
            defaultChecked={rowdata.original.Check}
            onChange={(e) => this.onHandleSelection(rowdata, e.target.checked, type)} />
    }

    onHandleSelection(rowdata, value, type) {
        if (type === "checkbox") {
            const dataUpdate = this.state.dataUpdate
            if (dataUpdate.length > 0) {
                dataUpdate.forEach((row, index) => {
                    if (row.Permission_ID === rowdata.original.ID) {
                        dataUpdate.splice(index, 1)
                    }
                })
            }
            if (value) {
                if (rowdata.original.Role_ID === null) {
                    dataUpdate.push({
                        ID: 0
                        , Role_ID: this.state.Root_ID
                        , Permission_ID: rowdata.original.ID
                        , Status: 1
                    })
                } else {
                    dataUpdate.push({
                        ID: rowdata.original.RolePermission_ID
                        , Role_ID: this.state.Root_ID
                        , Permission_ID: rowdata.original.ID
                        , Status: 1
                    })
                }
            }
            else {
                if (rowdata.original.Role_ID === null) {
                    dataUpdate.push({
                        ID: 0
                        , Role_ID: this.state.Root_ID
                        , Permission_ID: rowdata.original.ID
                        , Status: 0
                    })
                } else {
                    dataUpdate.push({
                        ID: rowdata.original.RolePermission_ID
                        , Role_ID: this.state.Root_ID
                        , Permission_ID: rowdata.original.ID
                        , Status: 0
                    })
                }
            }
            this.setState({ dataUpdate })
        }
    }

    //permission

    render() {
        const view = this.state.permissionView
        const cols = [
            { Header: 'No.', fixed: "left", Type: 'numrows', filterable: false, className: 'center', minWidth: 40 },
            { accessor: 'Code', Header: 'Code', editable: view, Filter: "text", fixed: "left", minWidth: 160 },
            { accessor: 'Name', Header: 'Name', editable: view, Filter: "text", minWidth: 170 },
            { accessor: 'Description', Header: 'Description', editable: view, sortable: false, Filter: "text" },
            //{accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" ,Filter:"dropdown"},  
            { accessor: 'Created', Header: 'Create', filterable: false },
            { accessor: 'Modified', Header: 'Modify', filterable: false },
            { Show: view, Header: '', Aggregated: "button", Type: "button", filterable: false, sortable: false, btntype: "Map", btntext: "Map" },
            { Show: view, Header: '', Aggregated: "button", Type: "button", filterable: false, sortable: false, btntype: "Remove", btntext: "Remove" },
        ];
        const btnfunc = [{
            btntype: "Map",
            func: this.createMapBtn
        }]

        const col = this.state.colsMap
        col.forEach((row) => {
            if (row.Type === "selection") {
                row.Cell = (e) => this.createSelection(e, "checkbox")
                row.className = "text-center"
            }
        })
        const styleclose = {
            cursor: 'pointer',
            position: 'absolute',
            display: 'block',
            right: '-10px',
            top: '-10px',
            background: '#ffffff',
            borderRadius: '18px',
        }
        return (
            <div>
                {/*
        column = คอลัมที่ต้องการแสดง
        data = json ข้อมูลสำหรับ select ผ่าน url
        ddlfilter = json dropdown สำหรับทำ dropdown filter
      */}
                <TableGen column={cols} data={this.state.select} dropdownfilter={this.state.statuslist}
                    filterable={true} accept={view} btn={btnfunc} exportfilebtn={view} addExportbtn={view}
                    uneditcolumn={this.uneditcolumn} expFilename={"Role"}
                    table="ams_Role_Permission" />

                <Popup open={this.state.open} onClose={this.closeModal}>
                    <div style={{ border: '2px solid #007bff', borderRadius: '5px' }}>
                        <a style={styleclose} onClick={this.closeModal}>
                            {imgClose}
                        </a>
                        <div id="header" style={{ width: '100%', borderBottom: '1px solid #007bff', fontSize: '18px', padding: '5px', color: '#007bff', fontWeight: 'bold' }}>Setting Permission</div>
                        <div style={{ width: '100%', padding: '10px 5px' }}>
                            <div className="clearfix">
                                <ReactTable columns={this.state.colsMap} data={this.state.selectdata} sortable={false} style={{ background: 'white', 'max-height': '400px' }}
                                    getselection={this.getSelectionData} showPagination={false} defaultPageSize={this.state.selectdata.length} />
                            </div>
                            <div className="clearfix">
                                <Button onClick={() => this.updateRolePermission()} color="primary" style={{ width: '130px', marginTop: '5px' }} className="float-right">Save</Button>
                            </div>
                        </div>
                    </div>
                </Popup>
            </div>
        )
    }
}

export default Role;
