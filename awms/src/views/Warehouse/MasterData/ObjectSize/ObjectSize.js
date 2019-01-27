import React, { Component } from 'react';
import "react-table/react-table.css";
import { Card, Button, CardBody, Input } from 'reactstrap';
import { TableGen } from '../TableSetup';
import Axios from 'axios';
import Popup from 'reactjs-popup'
import { apicall, createQueryString } from '../../ComponentCore'
import ReactTable from 'react-table'
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../../ComponentCore/Permission';
const api = new apicall()
const imgClose = <img style={{ width: "28px", height: "auto" }} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAANkSURBVGhD7ZlHyxRBEIYXI4aDYgDDP1Bvpr9hwqMR9ageFBN6ULwaPsNdFEU9iH9DDwZQ9GIGIwaMCPo+sA1lU7PT3Tu7sjAvPLisXdXVOz3V1fV1WrVq1YjGiZViv7gu7osP4lcXPvPdNbFPrBDY/HctFMfFC/Enk2cC2wVi6JolzoifwgsuB3yMCXwORevFW+EF0w/4XCcGpgninPAmh4/iotgilok5YmIXPvPdVnFJMNbzATyN8aJRTRU3hTfhA7FJTBGpYuxm8VB4Pm+IHH89xa+Bw3iSb2Kn4MmUCttd4ruI/TNnI0/ivIidk3WWiqbE9nop4nlOir7ECxs7vSXmi6aFz9sinm+NKBJp7Z2wzp6LQeZtXvbHws75RswU2TorrKOvgkftaVH33xxV2SwWzGXnPi2yxK8cH1K8sJ4Oi9+C7ZYqxmKDraeDws7NS561bTnirQNSpZdtCCCMSV1ECD7YeYsgbb8SYQwcE0miyGKvW+MNIhaP2gYCdYuIgw82+Iq1XdhxT0VSAUhVaQ0/iapDpSogbxE5YxFP4bOw46vewX9ESWyNLoheSgksN/igy8La7BW1op63RtQ2deoVYGnwaJuwdldFrbh4WKPlIkVVgZYGj+LtfFfUituTNcqp071FWHKCR7OFtedgrVWc/yeJHFUtIjd4NFlYH8RWq5FfQLyFeIypqgo+kLuIoi10T1ijkXuJRz6N0rexRtxheyklwNJFXBHWZo+olVdKcKx7ygksdxHTRFEp4RVzG0WsQRdzO4Qd90Qkd/PicprugVdOHxFhTF3wQfEi8BGLX7+4nEbehWa38EQAqcEHhUV4waNDws7NhWaeyBINJuuEax5NWU9NXimXCFo2du5TIlvUQFyorSPeDRq6g5J3qX8tZogi0au0zoC2ChM1LXziO55vlehLPL7Y6SPhZY5S4Quf8TwnRN+qai3yThwQZIxSTRf4GGhrEXEn9hYBpDuO/JxmLAcjeT5OlQHmaqy5G8Sv4W2nwBfBHZbFkK3Y05TiMLf7HZ0GygPGej6AORr75T2tFXF2agKyzWoxFJHWaPf9EF4wObD/6UIXp8p+RLuPI56mkxdcL7A5KrJP2EGIIouLD30banYuHu8F5Qjw+Y7g/xjD3xaSC7NWrVpVqdP5C8HnZiqeZ+ELAAAAAElFTkSuQmCC" />;

function isInt(value) {
    return !isNaN(value) &&
        parseInt(Number(value)) == value &&
        !isNaN(parseInt(value, 10));
}

class ObjectSize extends Component {
    constructor(props) {
        super(props);

        this.state = {
            colsMap: [
                { Header: '', Type: "selection", sortable: false, Filter: "select", className: "text-center", minWidth: 50 },
                { accessor: 'Code', Header: 'Code', editable: false, filterable: false, minWidth: 60 },
                { accessor: 'Name', Header: 'Name', editable: false, filterable: false, minWidth: 180 },
                { accessor: 'Description', Header: 'Description', editable: false, filterable: false },
                { accessor: 'MinQuantity', Header: 'Minimun Quantity', editable: true, Filter: "text", datatype: "int" },
                { accessor: 'MaxQuantity', Header: 'Maximun Quantity', editable: true, Filter: "text", datatype: "int" },
            ],
            data: [],
            autocomplete: [],
            objectPalletdata: [],
            statuslist: [{
                'status': [{ 'value': '*', 'label': 'All' }, { 'value': '1', 'label': 'Active' }, { 'value': '0', 'label': 'Inactive' }],
                'header': 'Status',
                'field': 'Status',
                'mode': 'check',
            }],

            acceptstatus: false,
            select: {
                queryString: window.apipath + "/api/viw",
                t: "ObjectSizeMaster",
                q: '[{ "f": "Status", "c":"<", "v": 2},{ "f": "ObjectType", "c":"=", "v": 2}]',
                f: "ID,Code,Name,Description,ObjectType,MinWeigthKG,MaxWeigthKG,PercentWeightAccept,Status,Created,Modified,LastUpdate",
                g: "",
                s: "[{'f':'Code','od':'asc'}]",
                sk: 0,
                l: 100,
                all: ""
            },
            selectObjectPallet: {
                queryString: window.apipath + "/api/mst",
                t: "ObjectSize",
                q: "[{ 'f': 'Status', c:'<', 'v': 2},{ 'f': 'ObjectType', c:'=', 'v': 1}]",
                f: "ID",
                g: "",
                s: "[{'f':'Code','od':'asc'}]",
                sk: 0,
                l: 100,
                all: "",
            },
            selectMapChild: {
                queryString: window.apipath + "/api/mst",
                t: "ObjectSizeMap",
                q: "[{ 'f': 'Status', c:'<', 'v': 2}]",
                f: "ID,OuterObjectSize_ID,InnerObjectSize_ID,MinQuantity,MaxQuantity,Status",
                g: "",
                s: "[{'f':'ID','od':'asc'}]",
                sk: 0,
                l: 100,
                all: "",
            },
            sortstatus: 0,
            Root_ID: 0,
            open: false,
            selectdata: [],
            selectMapData: [],
            dataUpdate: [],
            rowselect: [],
            enumfield: ["ObjectType"]
        };
        this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
        this.filterList = this.filterList.bind(this)
        this.uneditcolumn = ["Created", "Modified", "LastUpdate"]
        this.createSelection = this.createSelection.bind(this)
        this.onHandleSelection = this.onHandleSelection.bind(this)
        this.getData = this.getData.bind(this)
        this.setObjectSizeMap = this.setObjectSizeMap.bind(this)
        this.addObjectSizeMapp = this.addObjectSizeMapp.bind(this)
        this.getObjectSizePallet = this.getObjectSizePallet.bind(this)
        this.openModal = this.openModal.bind(this)
        this.closeModal = this.closeModal.bind(this)
        this.createMapBtn = this.createMapBtn.bind(this)
        this.inputTextEditor = this.inputTextEditor.bind(this)
        this.displayButtonByPermission = this.displayButtonByPermission.bind(this)
    }

    componentWillUnmount() {
        Axios.isCancel(true);
    }

    onHandleClickCancel(event) {
        this.forceUpdate();
        event.preventDefault();
    }

    async componentWillMount() {
        //permission
        let dataGetPer = await GetPermission()
        CheckWebPermission("ObjectSize", dataGetPer, this.props.history);
        this.displayButtonByPermission(dataGetPer)
        document.title = "Weight Validate : AWMS";
        this.filterList()
        this.getObjectSizePallet()
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
    filterList() {
        const objTypeSelect = { queryString: window.apipath + "/api/enum/StorageObjectType" }
        const objType = []
        Axios.all([Axios.get(createQueryString(objTypeSelect) + "&_token=" + localStorage.getItem("Token"))]).then(
            (Axios.spread((result) => {
                result.data.forEach(row => {
                    objType.push({ ID: row.value, Code: row.name })
                })

                let ddl = [...this.state.autocomplete]
                let objTypeList = {}
                objTypeList["data"] = objType
                objTypeList["field"] = "ObjectType"
                objTypeList["pair"] = "ObjectType"
                objTypeList["mode"] = "Dropdown"
                ddl = ddl.concat(objTypeList)
                this.setState({ autocomplete: ddl })
            })))

    }

    getData(Root_ID) {
        const selectdata = []
        const selectMapdata = []
        Axios.get(createQueryString(this.state.select) + "&_token=" + localStorage.getItem("Token")).then((response) => {
            response.data.datas.forEach(row => {
                selectdata.push({
                    ID: row.ID
                    , Code: row.Code
                    , Name: row.Name
                    , Description: row.Description
                    , Check: false
                    , ObjSize_ID: null
                    , ObjSizeMap_ID: 0
                })
            })
            this.setState({ selectdata })
            Axios.get(createQueryString(this.state.selectMapChild) + "&_token=" + localStorage.getItem("Token")).then((responset) => {
                responset.data.datas.forEach(row => {
                    selectMapdata.push({
                        ID: row.ID
                        , OuterObjectSize_ID: row.OuterObjectSize_ID
                        , InnerObjectSize_ID: row.InnerObjectSize_ID
                        , MinQuantity: row.MinQuantity
                        , MaxQuantity: row.MaxQuantity
                        , Status: row.Status
                    })
                })
                this.setState({ selectMapdata }, () => this.setObjectSizeMap(Root_ID))
            })
        })
    }

    setObjectSizeMap(data) {
        if (!this.state.open) {
            let selectdata = []
            let selectMapdata = []

            selectdata = this.state.selectdata
            selectMapdata = this.state.selectMapdata
            if (selectMapdata !== undefined) {
                var index = selectMapdata.length - 1
                while (index >= 0) {
                    if (selectMapdata[index].OuterObjectSize_ID !== data) {
                        selectMapdata.splice(index, 1);
                    }
                    index -= 1;
                }
                selectdata.forEach(rowRoot => {
                    selectMapdata.forEach(rowChild => {
                        if (rowRoot.ID === rowChild.InnerObjectSize_ID) {
                            rowRoot.ObjSize_ID = rowChild.InnerObjectSize_ID
                            rowRoot.ObjSizeMap_ID = rowChild.ID
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
            return <Button type="button" color="info" style={{ width: '80px' }}
                onClick={() => this.getData(rowdata.ID)}>Map Size</Button>
        }
    }

    updateObjSizeMap() {
        const dataUpdate = this.state.dataUpdate
        if (dataUpdate.length > 0) {
            dataUpdate.forEach((row) => {
                row["ID"] = row["ID"] <= 0 ? null : row["ID"]
            })
            let updjson = {
                "t": "ams_ObjectSizeMap",
                "pk": "ID",
                "datas": dataUpdate,
                "nr": false
            }
            api.put(window.apipath + "/api/mst", updjson).then((result) => {
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
                    if (row.InnerObjectSize_ID === rowdata.original.ID) {
                        dataUpdate.splice(index, 1)
                    }
                })
            }
            if (value) {
                if (rowdata.original.ObjSize_ID === null) {
                    dataUpdate.push({
                        ID: 0
                        , OuterObjectSize_ID: this.state.Root_ID
                        , InnerObjectSize_ID: rowdata.original.ID
                        , Status: 1
                    })
                } else {
                    dataUpdate.push({
                        ID: rowdata.original.ObjSizeMap_ID
                        , OuterObjectSize_ID: this.state.Root_ID
                        , InnerObjectSize_ID: rowdata.original.ID
                        , Status: 1
                    })
                }
            }
            else {
                if (rowdata.original.ObjSize_ID === null) {
                    dataUpdate.push({
                        ID: 0
                        , OuterObjectSize_ID: this.state.Root_ID
                        , InnerObjectSize_ID: rowdata.original.ID
                        , Status: 0
                    })
                } else {
                    dataUpdate.push({
                        ID: rowdata.original.ObjSizeMap_ID
                        , OuterObjectSize_ID: this.state.Root_ID
                        , InnerObjectSize_ID: rowdata.original.ID
                        , Status: 0
                    })
                }
            }
            this.setState({ dataUpdate })
        }
    }

    onEditorValueChange(rowdata, value, field) {
        const data = [...this.state.selectdata];
        if (rowdata.column.datatype === "int") {
            let conv = value === '' ? 0 : value
            const type = isInt(conv)
            if (type) {
                data[rowdata.index][field] = (conv === 0 ? null : conv);
            }
            else {
                alert("เฉพาะตัวเลขเท่านั้น")
            }
        }
        else {
            data[rowdata.index][field] = value;
        }
        this.setState({ data });
        const dataUpdate = [...this.state.dataUpdate];
        dataUpdate.forEach((datarow, index) => {
            if (datarow.InnerObjectSize_ID === data[rowdata.index]["ID"]) {
                dataUpdate[index][field] = value
            }
        })
        this.setState({ dataUpdate });
    }

    inputTextEditor(rowdata) {
        return <Input type="text" value={rowdata.value === null ? "" : rowdata.value}
            onChange={(e) => { this.onEditorValueChange(rowdata, e.target.value, rowdata.column.id) }} />;
    }

    addObjectSizeMapp(data) {
        console.log(data)
        this.getObjectSizePallet()
    }

    getObjectSizePallet() {
        api.get(createQueryString(this.state.selectObjectPallet)).then((res) => {
            let data = [...this.state.objectPalletdata]
            res.data.datas.forEach(row => {
                data.push({ ID: row.ID })
            })
            //console.log(data)
            this.setState({ objectPalletdata: data })
        })
    }
    render() {
        const view = this.state.permissionView
        const cols = [
            { Header: 'No.', fixed: "left", Type: 'numrows', filterable: false, className: 'center', minWidth: 40, maxWidth: 40 },
            { accessor: 'Code', Header: 'Code', editable: view, Filter: "text", fixed: "left", minWidth: 80, maxWidth: 90, Type: "autoMapPackSize" },
            { accessor: 'Name', Header: 'Name', editable: view, Filter: "text", fixed: "left", minWidth: 180 },
            //{accessor: 'Description', Header: 'Description', sortable:false,Filter:"text",editable:true,},
            // { accessor: 'ObjectType', Header: 'Object Type', updateable: view, Filter: "text", Type: "autocomplete", minWidth: 110 },
            { accessor: 'PercentWeightAccept', Header: 'Accepted Weight (%)', editable: view, Filter: "text", datatype: "int", minWidth: 100, className: 'right' },
            // { accessor: 'MinWeigthKG', Header: 'Minimun Weigth(Kg.)', editable: view, Filter: "text", datatype: "int" },
            // { accessor: 'MaxWeigthKG', Header: 'Maximun Weigth(Kg.)', editable: view, Filter: "text", datatype: "int" },
            //{accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" ,Filter:"dropdown",Filter:"dropdown"},
            { accessor: 'LastUpdate', Header: 'Last Update', editable: false, filterable: false, minWidth: 180, maxWidth: 180 },
            // { accessor: 'Created', Header: 'Create', editable: false, filterable: false },
            // { accessor: 'Modified', Header: 'Modify', editable: false, filterable: false },
            // { Show: view, Header: '', Aggregated: "button", Type: "button", filterable: false, sortable: false, btntype: "Map", btntext: "Map" },
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
            if (row.editable && row.insertable) {
                row.Cell = (e) => {
                    if (e.original.ID < 1)
                        return this.inputTextEditor(e)
                    else
                        return <span>{e.value}</span>
                }
            }
            else if (row.editable && (row.body === undefined || !row.body)) {
                row.Cell = (e) => (this.inputTextEditor(e))
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
                <TableGen column={cols} data={this.state.select} dropdownfilter={this.state.statuslist} expFilename={"WeightValidate"}
                    btn={btnfunc} filterable={true} accept={view} uneditcolumn={this.uneditcolumn} exportfilebtn={view} addExportbtn={view}
                    table="ams_ObjectSize" defaultCondition={[{ 'f': 'Status', c: '<', 'v': 2 }, { 'f': 'ObjectType', c: '=', 'v': 2 }]}
                    objectSizeMapPallet={this.state.objectPalletdata} searchURL={this.props.location.search} />
                {/* autocomplete={this.state.autocomplete}  enumfield={this.state.enumfield}*/}
                <Popup open={this.state.open} onClose={this.closeModal}>
                    <div style={{ border: '2px solid #007bff', borderRadius: '5px' }}>
                        <a style={styleclose} onClick={this.closeModal}>
                            {imgClose}
                        </a>
                        <div id="header" style={{ width: '100%', borderBottom: '1px solid #007bff', fontSize: '18px', padding: '5px', color: '#007bff', fontWeight: 'bold' }}>Map Size</div>
                        <div style={{ width: '100%', padding: '10px 5px' }}>
                            <div className="clearfix">
                                <ReactTable columns={this.state.colsMap} minRows={3} data={this.state.selectdata} sortable={false} style={{ background: 'white', 'max-height': '400px' }}
                                    getselection={this.getSelectionData} showPagination={false} />
                            </div>
                            <div className="clearfix">
                                <Button onClick={() => this.updateObjSizeMap()} color="primary" style={{ width: '130px', marginTop: '5px' }} className="float-right">Save</Button>
                            </div>
                        </div>
                    </div>
                </Popup>
            </div>
        )
    }
}
export default ObjectSize;
