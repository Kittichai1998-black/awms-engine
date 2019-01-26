import React, { Component } from 'react';
import "react-table/react-table.css";
import { Card, Button, CardBody } from 'reactstrap';
import { TableGen } from '../TableSetup';
import Popup from 'reactjs-popup'
import { FilterURL, apicall, createQueryString } from '../../ComponentCore'
import ReactTable from 'react-table'
import { timingSafeEqual } from 'crypto';
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../../ComponentCore/Permission';

const Axios = new apicall()
const imgClose = <img style={{ width: "28px", height: "auto" }} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAANkSURBVGhD7ZlHyxRBEIYXI4aDYgDDP1Bvpr9hwqMR9ageFBN6ULwaPsNdFEU9iH9DDwZQ9GIGIwaMCPo+sA1lU7PT3Tu7sjAvPLisXdXVOz3V1fV1WrVq1YjGiZViv7gu7osP4lcXPvPdNbFPrBDY/HctFMfFC/Enk2cC2wVi6JolzoifwgsuB3yMCXwORevFW+EF0w/4XCcGpgninPAmh4/iotgilok5YmIXPvPdVnFJMNbzATyN8aJRTRU3hTfhA7FJTBGpYuxm8VB4Pm+IHH89xa+Bw3iSb2Kn4MmUCttd4ruI/TNnI0/ivIidk3WWiqbE9nop4nlOir7ECxs7vSXmi6aFz9sinm+NKBJp7Z2wzp6LQeZtXvbHws75RswU2TorrKOvgkftaVH33xxV2SwWzGXnPi2yxK8cH1K8sJ4Oi9+C7ZYqxmKDraeDws7NS561bTnirQNSpZdtCCCMSV1ECD7YeYsgbb8SYQwcE0miyGKvW+MNIhaP2gYCdYuIgw82+Iq1XdhxT0VSAUhVaQ0/iapDpSogbxE5YxFP4bOw46vewX9ESWyNLoheSgksN/igy8La7BW1op63RtQ2deoVYGnwaJuwdldFrbh4WKPlIkVVgZYGj+LtfFfUituTNcqp071FWHKCR7OFtedgrVWc/yeJHFUtIjd4NFlYH8RWq5FfQLyFeIypqgo+kLuIoi10T1ijkXuJRz6N0rexRtxheyklwNJFXBHWZo+olVdKcKx7ygksdxHTRFEp4RVzG0WsQRdzO4Qd90Qkd/PicprugVdOHxFhTF3wQfEi8BGLX7+4nEbehWa38EQAqcEHhUV4waNDws7NhWaeyBINJuuEax5NWU9NXimXCFo2du5TIlvUQFyorSPeDRq6g5J3qX8tZogi0au0zoC2ChM1LXziO55vlehLPL7Y6SPhZY5S4Quf8TwnRN+qai3yThwQZIxSTRf4GGhrEXEn9hYBpDuO/JxmLAcjeT5OlQHmaqy5G8Sv4W2nwBfBHZbFkK3Y05TiMLf7HZ0GygPGej6AORr75T2tFXF2agKyzWoxFJHWaPf9EF4wObD/6UIXp8p+RLuPI56mkxdcL7A5KrJP2EGIIouLD30banYuHu8F5Qjw+Y7g/xjD3xaSC7NWrVpVqdP5C8HnZiqeZ+ELAAAAAElFTkSuQmCC" />;

class User extends Component {
    constructor(props) {
        super(props);

        this.state = {
            colsRole: [
                { Header: '', Type: "selection", sortable: false, Filter: "select", className: "text-center", minWidth: 50 },
                { accessor: 'Code', Header: 'Role', editable: false, filterable: false, minWidth: 140 },
                { accessor: 'Name', Header: 'Name', editable: false, filterable: false, minWidth: 140 },
                //{ accessor: 'Description', Header: 'Description', editable: false, filterable: false },
            ],
            data: [],
            statuslist: [{
                'status': [{ 'value': '*', 'label': 'All' }, { 'value': '1', 'label': 'Active' }, { 'value': '0', 'label': 'Inactive' }],
                'header': 'Status',
                'field': 'Status',
                'mode': 'check',
            }],
            acceptstatus: false,
            select: {},
            selectRole: {
                queryString: window.apipath + "/api/mst",
                t: "Role",
                q: "[{ 'f': 'Status', c:'<', 'v': 2}]",
                f: "ID,Code,Name,Description,Status",
                g: "",
                s: "[{'f':'Code','od':'asc'}]",
                sk: 0,
                l: 100,
                all: "",
            },
            selectUserRole: {
                queryString: window.apipath + "/api/mst",
                t: "User_Role",
                q: "[{ 'f': 'Status', c:'<', 'v': 2}]",
                f: "ID,User_ID,Role_ID,Status",
                g: "",
                s: "[{'f':'ID','od':'asc'}]",
                sk: 0,
                l: 100,
                all: "",
            },
            sortstatus: 0,
            User_id: 0,
            open: false,
            selectiondata: [],
            selectroledata: [],
            dataUpdate: [],
            rowselect: [],
            checkclick_add: false
        };
        this.queryselect = {
            queryString: window.apipath + "/api/viw",
            t: "User",
            q: '[{ "f": "Status", "c":"<", "v": 2}]',
            f: "ID,Code,Name,Password,SaltPassword,EmailAddress,LineID,FacebookID,TelOffice,TelMobile,Status,Created,Modified,LastUpdate",
            g: "",
            s: "[{'f':'Code','od':'asc'}]",
            sk: 0,
            l: 100,
            all: "",
        };
        this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
        this.uneditcolumn = ["Created", "Modified", "LastUpdate"]
        this.createSelection = this.createSelection.bind(this)
        this.onHandleSelection = this.onHandleSelection.bind(this)
        this.getData = this.getData.bind(this)
        this.setUserRole = this.setUserRole.bind(this)
        this.displayButtonByPermission = this.displayButtonByPermission.bind(this)
        this.createRoleBtn = this.createRoleBtn.bind(this)
        this.closeModal = this.closeModal.bind(this)
        this.updateRole = this.updateRole.bind(this)

    }

    async componentWillMount() {
        document.title = "User Account - AWMS"
        //permission
        let dataGetPer = await GetPermission()
        CheckWebPermission("User", dataGetPer, this.props.history);
        this.displayButtonByPermission(dataGetPer)
        if (this.props.location.search) {
            let url = FilterURL(this.props.location.search, this.queryselect)
            this.setState({ select: url })
        } else {
            this.setState({ select: this.queryselect })
        }
    }
    //permission
    displayButtonByPermission(dataGetPer) {
        let checkview = true
        if (CheckViewCreatePermission("User_view", dataGetPer)) {
            checkview = true //แสดงข้อมูลเฉยๆ
        }
        if (CheckViewCreatePermission("User_create&modify", dataGetPer)) {
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

    getData(user_id) {
        console.log(user_id)
        const selectroledata = []
        const selectuserroledata = []
        Axios.get(createQueryString(this.state.selectRole)).then((response) => {
            response.data.datas.forEach(row => {
                selectroledata.push({ ID: row.ID, Code: row.Code, Name: row.Name, Description: row.Description, Check: false, User_ID: null, user_role_id: 0 })
            })
            this.setState({ selectroledata })
            Axios.get(createQueryString(this.state.selectUserRole)).then((responset) => {
                responset.data.datas.forEach(row => {
                    selectuserroledata.push({ ID: row.ID, User_ID: row.User_ID, Role_ID: row.Role_ID, Status: row.Status })
                })
                this.setState({ selectuserroledata }, () => this.setUserRole(user_id))
            })
        })
    }

    setUserRole(data) {
        if (!this.state.open) {
            let selectroledata = []
            let selectuserroledata = []

            selectroledata = this.state.selectroledata
            selectuserroledata = this.state.selectuserroledata
            if (selectuserroledata !== undefined) {
                var index = selectuserroledata.length - 1
                while (index >= 0) {
                    if (selectuserroledata[index].User_ID !== data) {
                        selectuserroledata.splice(index, 1);
                    }
                    index -= 1;
                }
                selectroledata.forEach(rowRole => {
                    selectuserroledata.forEach(rowRoleUser => {
                        if (rowRole.ID === rowRoleUser.Role_ID) {
                            rowRole.User_ID = rowRoleUser.User_ID
                            rowRole.user_role_id = rowRoleUser.ID
                            if (rowRoleUser.Status === 1) {
                                rowRole.Check = true
                            }
                        }
                    })

                })
                this.setState({ User_id: data })
                this.setState({ selectroledata })
                this.setState({ selectuserroledata })
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

    createRoleBtn(rowdata) {
        if (rowdata.ID <= 0) {
            return null
        } else {
            return <div className="text-center"><Button type="button" color="info" style={{ width: '80px' }}
                onClick={() => this.getData(rowdata.ID)}>Role</Button></div>
        }
    }

    updateRole() {
        const dataUpdate = this.state.dataUpdate
        if (dataUpdate.length > 0) {
            dataUpdate.forEach((row) => {
                row["ID"] = row["ID"] <= 0 ? null : row["ID"]
            })
            let updjson = {
                "t": "ams_User_Role",
                "pk": "ID",
                "datas": dataUpdate,
                "nr": false
            }
            Axios.put(window.apipath + "/api/mst", updjson).then((result) => {
            })
            this.setState({ dataUpdate: [] })
            this.closeModal()
        } else {
            alert("ข้อมูลไม่มีการแก้ไขใหม่");
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
                    if (row.Role_ID === rowdata.original.ID) {
                        dataUpdate.splice(index, 1)
                    }
                })
            }
            if (value) {
                if (rowdata.original.User_ID === null) {
                    dataUpdate.push({ ID: 0, User_ID: this.state.User_id, Role_ID: rowdata.original.ID, Status: 1 })
                } else {
                    dataUpdate.push({ ID: rowdata.original.user_role_id, User_ID: this.state.User_id, Role_ID: rowdata.original.ID, Status: 1 })
                }
            }
            else {
                if (rowdata.original.User_ID === null) {
                    dataUpdate.push({ ID: 0, User_ID: this.state.User_id, Role_ID: rowdata.original.ID, Status: 0 })
                } else {
                    dataUpdate.push({ ID: rowdata.original.user_role_id, User_ID: this.state.User_id, Role_ID: rowdata.original.ID, Status: 0 })
                }
            }
            this.setState({ dataUpdate })
        }
    }

    render() {
        const view = this.state.permissionView

        const cols = [
            { Header: 'No.', fixed: "left", Type: 'numrows', filterable: false, className: 'center', minWidth: 40, maxWidth: 40 },
            { accessor: 'Code', Header: 'Username', editable: view, filterable: true, Filter: "text", insertable: true, fixed: "left", minWidth: 100 },
            { show: view, accessor: 'Password', Header: 'Password', editable: view, filterable: false, Type: "password", minWidth: 120 },
            { accessor: 'Name', Header: 'Name', editable: view, Filter: "text", minWidth: 160, maxWidth: 200 },
            { accessor: 'EmailAddress', Header: 'Email Address', editable: view, Filter: "text", minWidth: 170, maxWidth: 200 },
            //{ accessor: 'LineID', Header: 'Line ID', editable: true, minWidth: 90},
            //{ accessor: 'FacebookID', Header: 'Facebook ID', editable: true, minWidth:90},
            //{ accessor: 'TelOffice', Header: 'Office Tel.', editable: true, minWidth: 90},
            { accessor: 'TelMobile', Header: 'Mobile', Filter: 'text', editable: view, minWidth: 120 },
            //{accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" ,Filter:"dropdown"},
            { accessor: 'LastUpdate', Header: 'Last Update', filterable: false, minWidth: 180, maxWidth: 180 },
            // { accessor: 'Created', Header: 'Create', editable: false, filterable: false, minWidth: 170 },
            // { accessor: 'Modified', Header: 'Modify', editable: false, filterable: false, minWidth: 170 },
            { show: view, Header: '', Aggregated: "button", Type: "button", filterable: false, sortable: false, btntype: "Role", btntext: "Role" },
            { show: view, Header: '', Aggregated: "button", Type: "button", filterable: false, sortable: false, btntype: "Remove", btntext: "Remove" },
        ];

        const btnfunc = [{
            btntype: "Role",
            func: this.createRoleBtn

        }]

        const col = this.state.colsRole
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
            addbtn = เปิดปิดปุ่ม Add
            accept = สถานะของในการสั่ง update หรือ insert
            autocomplete = data field ที่ต้องการทำ autocomplete
            filterable = เปิดปิดโหมด filter
            getselection = เก็บค่าที่เลือก
          */}
                <TableGen column={cols} data={this.state.select} dropdownfilter={this.state.statuslist} expFilename={"UserAccount"} checkClickAdd={this.onCheckClickAdd}
                    filterable={true} btn={btnfunc} uneditcolumn={this.uneditcolumn} accept={view} addExportbtn={view} exportfilebtn={view}
                    table="ams_User" />
                <Popup open={this.state.open} onClose={this.closeModal}>
                    <div style={{ border: '2px solid #007bff', borderRadius: '5px' }}>
                        <a style={styleclose} onClick={this.closeModal}>
                            {imgClose}
                        </a>
                        <div id="header" style={{ width: '100%', borderBottom: '1px solid #007bff', fontSize: '18px', padding: '5px', color: '#007bff', fontWeight: 'bold' }}>Setting Role</div>
                        <div style={{ width: '100%', padding: '10px 5px' }}>
                            <div className="clearfix">
                                <ReactTable columns={this.state.colsRole} minRows={3} data={this.state.selectroledata} sortable={false} style={{ background: 'white' }}
                                    getselection={this.getSelectionData} showPagination={false} />
                            </div>
                            <div className="clearfix">
                                <Button onClick={() => this.updateRole()} color="primary" style={{ width: '130px', marginTop: '5px' }} className="float-right">Save</Button>
                            </div>
                        </div>
                    </div>
                </Popup>
            </div>
        )
    }
}

export default User;
