import React, { Component } from 'react';
import "react-table/react-table.css";
import { Card, CardBody, Button } from 'reactstrap';
import { TableGen } from '../MasterData/TableSetup';
import { apicall, DatePicker, GenerateDropDownStatus } from '../ComponentCore'
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../ComponentCore/Permission';
import Popup from 'reactjs-popup'

const axois = new apicall()
const imgExclamation = <img style={{ width: "20px", height: "auto" }} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAALxSURBVGhD7VlLbhNBELUAsWDFd8HvAmxA2N02KNKgbiuwYAcGBAcJYcMGSLaABAiOAEGKInEPIBwgBDY4hOCZCQmboWpSWSBXj7tnum1Fmic9xVKmq95r1/Sn3KhRo0Z1ZL3e/rQrO4mSD4ALiRZfgOuxln+R+DnRcjlR4h38nU2vtNvZw8Y+Gj45bE63zoLA+ViJ7yAsc2GsxWqs5FwayTMUbnwYRM3jkPw1cJsT58I8hpIvMCaFDwuYubtQCj85MRXZj1X7DqXxj6x37iCUyxsmsVdCjpdZFB2gtH6QXW8egsAfuIQhCGW1hDkpfTXQzDuLz/rr/5F7pohQqou4upGM8ihbNlUNILGcSEY5wCzc4wLb0IcBZNwVt0iOGwbXLpyA5W2NC2pDXwZAw4/fWhwjWfaA2X/FBrSkNwM5xXOSZYd8h624Sfk0AFq2UtU5TfJGA16eeS6QC30aQMJx5QnJKwYesqB8vnFBXOjfgPxqdQDc1OISF8CVvg0gU9WUJNOM/EjMDHZlCANJV9wnmWZA/b9nBzsyiAEt3pJMM+DB5eGB7gxiQMnPJNMMuj3xARwYyMAayTSj6vq/yxAGUBvJNGPPG9jzJYQvCjvYkWEMiE8k0wwwsMAOdmQQA5bL6OzwQHcGMaDEDMk0I29QcYMdGcJAqluCZJpBh7lVLoALfRuAFWjFupsHD89xQSZJmNTHJG80sN3naz/wQRD/J+1ePkXy7IAdAS7YZOh4pUTgRRo3Dj7gaHp7B+BSvzE1dYRkuSHWrdtsUAv6MjDQ7RskpxzKdie8GFDyKckoD2y0golFNkEBqxrAnF5ai4i8uavkEpcoBHPxvpq7u9j5JsawMin5zNvMc4BvogeJ+kOJqxJWm4GSNylNWGxMd47i2gxmtlgxDsRNCmf9V3T+MIUfH7Ddhx0zMLLCiSsijoGSfJRcvXiSwk0OeMjCphP2bfDMjhcP/B0NRG4jd35TEx/pfzN4qrQ+mNWoUaMAjcY/hH7RYM9nkHQAAAAASUVORK5CYII=" />;
const imgClose = <img style={{ width: "28px", height: "auto" }} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAANkSURBVGhD7ZlHyxRBEIYXI4aDYgDDP1Bvpr9hwqMR9ageFBN6ULwaPsNdFEU9iH9DDwZQ9GIGIwaMCPo+sA1lU7PT3Tu7sjAvPLisXdXVOz3V1fV1WrVq1YjGiZViv7gu7osP4lcXPvPdNbFPrBDY/HctFMfFC/Enk2cC2wVi6JolzoifwgsuB3yMCXwORevFW+EF0w/4XCcGpgninPAmh4/iotgilok5YmIXPvPdVnFJMNbzATyN8aJRTRU3hTfhA7FJTBGpYuxm8VB4Pm+IHH89xa+Bw3iSb2Kn4MmUCttd4ruI/TNnI0/ivIidk3WWiqbE9nop4nlOir7ECxs7vSXmi6aFz9sinm+NKBJp7Z2wzp6LQeZtXvbHws75RswU2TorrKOvgkftaVH33xxV2SwWzGXnPi2yxK8cH1K8sJ4Oi9+C7ZYqxmKDraeDws7NS561bTnirQNSpZdtCCCMSV1ECD7YeYsgbb8SYQwcE0miyGKvW+MNIhaP2gYCdYuIgw82+Iq1XdhxT0VSAUhVaQ0/iapDpSogbxE5YxFP4bOw46vewX9ESWyNLoheSgksN/igy8La7BW1op63RtQ2deoVYGnwaJuwdldFrbh4WKPlIkVVgZYGj+LtfFfUituTNcqp071FWHKCR7OFtedgrVWc/yeJHFUtIjd4NFlYH8RWq5FfQLyFeIypqgo+kLuIoi10T1ijkXuJRz6N0rexRtxheyklwNJFXBHWZo+olVdKcKx7ygksdxHTRFEp4RVzG0WsQRdzO4Qd90Qkd/PicprugVdOHxFhTF3wQfEi8BGLX7+4nEbehWa38EQAqcEHhUV4waNDws7NhWaeyBINJuuEax5NWU9NXimXCFo2du5TIlvUQFyorSPeDRq6g5J3qX8tZogi0au0zoC2ChM1LXziO55vlehLPL7Y6SPhZY5S4Quf8TwnRN+qai3yThwQZIxSTRf4GGhrEXEn9hYBpDuO/JxmLAcjeT5OlQHmaqy5G8Sv4W2nwBfBHZbFkK3Y05TiMLf7HZ0GygPGej6AORr75T2tFXF2agKyzWoxFJHWaPf9EF4wObD/6UIXp8p+RLuPI56mkxdcL7A5KrJP2EGIIouLD30banYuHu8F5Qjw+Y7g/xjD3xaSC7NWrVpVqdP5C8HnZiqeZ+ELAAAAAElFTkSuQmCC" />;
class IssuedDoc extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      autocomplete: [],
      statuslist: [{
        'status': GenerateDropDownStatus("Status"),
        'header': 'Status',
        'field': 'Status',
        'mode': 'check',
      }, {
        'status': GenerateDropDownStatus("DocumentEventStatus"),
        'header': 'EventStatus',
        'field': 'EventStatus',
        'mode': 'check',
      }],
      acceptstatus: false,
      select: {
        queryString: window.apipath + "/api/viw",
        t: "Document",
        q: "[{ 'f': 'DocumentType_ID', c:'=', 'v': 1002}]",
        f: "ID,Code,SouBranchName,SouWarehouseName,SouAreaName,DesCustomerName,DesBranchName,DesWarehouseName,DesSupplierName,ForCustomer,Batch,Lot,ActionTime,DocumentDate,EventStatus,RefID,Ref1,Ref2,Remark,Created,ModifyBy,LastUpdate,Options",
        g: "",
        s: "[{'f':'ID','od':'desc'}]",
        sk: 0,
        l: 20,
        all: "",
      },
      sortstatus: 0,
      open: false,
      errorstr: null,
      selectiondata: []
    };
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.getSelectionData = this.getSelectionData.bind(this)
    this.dateTimePicker = this.dateTimePicker.bind(this)
    this.displayButtonByPermission = this.displayButtonByPermission.bind(this)
    this.createSapResModal = this.createSapResModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
  }

  async componentWillMount() {
    document.title = "Search Issue : AWMS";
    //permission
    this.setState({ showbutton: "none" })
    let dataGetPer = await GetPermission()
    CheckWebPermission("GID", dataGetPer, this.props.history);
    this.displayButtonByPermission(dataGetPer)
  }
  //permission
  // 26	TransGID_view
  // 27	TransGID_create&modify
  // 28	TransGID_execute

  displayButtonByPermission(dataGetPer) {
    let check = 0
    if (CheckViewCreatePermission("TransGID_view", dataGetPer)) {
      check = 0 //แสดงข้อมูล26
    }
    if (CheckViewCreatePermission("TransGID_create&modify", dataGetPer)) {
      check = 1 //แก้ไข27
    }
    if (CheckViewCreatePermission("TransGID_execute", dataGetPer)) {
      //แก้ไข28
      if (CheckViewCreatePermission("Administrator", dataGetPer)) {
        check = 3
      } else {
        check = 2
      }
    }
    if (check === 0) {
      var PerButtonWorking = document.getElementById("per_button_working")
      PerButtonWorking.remove()
      var PerButtonReject = document.getElementById("per_button_reject")
      PerButtonReject.remove()
      var PerButtonExport = document.getElementById("per_button_export")
      PerButtonExport.remove()
      var PerButtonDate = document.getElementById("per_button_date")
      PerButtonDate.remove()

    } else if (check === 1) {
      this.setState({ showbutton: "block" })
      var PerButtonExport = document.getElementById("per_button_export")
      PerButtonExport.remove()
      var PerButtonDate = document.getElementById("per_button_date")
      PerButtonDate.remove()
    } else if (check === 2) {
      this.setState({ showbutton: "block" })
      var PerButtonWorking = document.getElementById("per_button_working")
      PerButtonWorking.remove()
      var PerButtonReject = document.getElementById("per_button_reject")
      PerButtonReject.remove()
      var PerButtonDoc = document.getElementById("per_button_doc")
      PerButtonDoc.remove()
    } else if (check === 3) {
      this.setState({ showbutton: "block" })
    }
  }
  //permission

  onHandleClickCancel(event) {
    this.forceUpdate();
    event.preventDefault();
  }

  componentDidMount() {
    GenerateDropDownStatus("Status")
  }

  dateTimePicker() {
    return <DatePicker onChange={(e) => { this.setState({ date: e }) }} dateFormat="DD-MM-YYYY" />
  }

  getSelectionData(data) {
    this.setState({ selectiondata: data })
  }

  componentWillUnmount() {
    this.state = {}
  }

  workingData(data, status) {
    let postdata = { docIDs: [], auto: 1 }
    if (data.length > 0) {
      data.forEach(rowdata => {
        postdata["docIDs"].push(rowdata.ID)
      })
      if (status === "accept") {
        axois.post(window.apipath + "/api/wm/issued/doc/working", postdata).then((res) => { this.setState({ resp: res.data._result.message }) })
      }
      if (status === "reject") {
        axois.post(window.apipath + "/api/wm/issued/doc/rejected", postdata).then((res) => { this.setState({ resp: res.data._result.message }) })
      }
      if (status === "Close") {
        axois.post(window.apipath + "/api/wm/issued/doc/Closing", postdata).then((res) => { this.setState({ resp: res.data._result.message }) })
      }
    }
  }

  onClickToDesc(data) {
    return <Button type="button" color="primary" style={{ background: "#26c6da", borderColor: "#26c6da" }}
      onClick={() => this.history.push('/doc/gi/manage?ID=' + data.ID)}>Detail</Button>
  }
  openModal() {
    this.setState({ open: true })
  }

  closeModal() {
    this.setState({ open: false, errorstr: null })
  }
  createSapResModal(data) {
    this.setState({ errorstr: data }, () => this.openModal())
  }

  render() {
    const cols = [
      { Header: '', Type: "selectrow", sortable: false, filterable: false, className: "text-center", fixed: "left", minWidth: 50 },
      { accessor: 'EventStatus', Header: 'Doc Status', editable: false, Filter: "dropdown", Type: "DocumentEvent", fixed: "left", minWidth: 120 },
      { accessor: 'Code', Header: 'Doc No.', editable: false, Filter: "text", fixed: "left", Cell: (e) => <a style={{ color: '#20a8d8', textDecorationLine: 'underline', cursor: 'pointer' }} onClick={() => this.props.history.push('/doc/gi/manage?ID=' + e.original.ID)} >{e.original.Code}</a> },
      { accessor: 'RefID', Header: 'SAP.Doc No.', editable: false, Filter: "text", },
      { accessor: 'Ref1', Header: 'SAP.Doc Year', editable: false, Filter: "text", },
      { accessor: 'Ref2', Header: 'Movement', editable: false, Filter: "text", },
      { accessor: 'Remark', Header: 'Remark', editable: false, Filter: "text" },
      { accessor: 'SouBranchName', Header: 'Sou.Branch', editable: false, Filter: "text", },
      { accessor: 'SouWarehouseName', Header: 'Sou.Warehouse', editable: false, Filter: "text", },
      { accessor: 'DesBranchName', Header: 'Des.Branch', editable: false, Filter: "text", },
      { accessor: 'DesWarehouseName', Header: 'Des.Warehouse', editable: false, Filter: "text", },
      { accessor: 'DesSupplierName', Header: 'Des.Supplier', editable: false, Filter: "text" },
      { accessor: 'DesCustomerName', Header: 'Des.Customer', editable: false, Filter: "text" },
      //{accessor: 'SouBranchName', Header: 'Branch',editable:false, Filter:"text"},
      //{accessor: 'SouAreaName', Header: 'Area', editable:false, Filter:"text",},
      // {accessor: 'ForCustomer', Header: 'For Customer', editable:false, Filter:"text",},
      // { accessor: 'Batch', Header: 'Batch', editable: false, Filter: "text", },
      // {accessor: 'Lot', Header: 'Lot', editable:false, Filter:"text",},
      // { accessor: 'LastUpdate', Header: 'Last Update', editable: false, filterable: false, minWidth: 180, maxWidth: 180 },
      { accessor: 'DocumentDate', Header: 'Doc.Date', editable: false, Type: "datetime", dateformat: "date", filterable: false },
      { accessor: 'ActionTime', Header: 'Action Time', editable: false, Type: "datetime", dateformat: "datetime", filterable: false, minWidth: 120 },
      { accessor: 'Created', Header: 'Create', editable: false, filterable: false, minWidth: 180, maxWidth: 180 },
      //{accessor: 'Modified', Header: 'ModifyBy', editable:false, filterable:false},
      //{ Header: '', Aggregated: "button", Type: "button", filterable: false, sortable: false, btntype: "Link" },
    ];

    const btnfunc = [{
      history: this.props.history,
      btntype: "Link",
      func: this.onClickToDesc
    }]
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
    
      */}
        <div className="clearfix">

          <Button id="per_button_doc" style={{ width: '130px', marginLeft: '5px', display: this.state.showbutton }} color="primary" className="float-right" onClick={() => this.props.history.push('/doc/gi/manage')}>Create Document</Button>

          {/* <Button id="per_button_export" style={{ background: "#26c6da", borderColor: "#26c6da", width: '130px', marginLeft: '5px', display: this.state.showbutton }} color="primary" className="float-right" onClick={() => {
            let data1 = { "exportName": "DocumentIssuedToShop", "whereValues": [this.state.date.format('YYYY-MM-DD')] }
            let data2 = { "exportName": "DocumentIssuedToCD", "whereValues": [this.state.date.format('YYYY-MM-DD')] }
            axois.post(window.apipath + "/api/report/export/fileServer", data1).then(res => {
              if (res.data._result.status === 1) {
                let resultPath = res.data.fileExport
                axois.post(window.apipath + "/api/report/export/fileServer", data2).then(res2 => {
                  window.success(resultPath + "<br/>" + res2.data.fileExport)
                })
              }
            })
          }}>Export Data</Button> */}
          {/* <div id="per_button_date" className="float-right" style={{ display: this.state.showbutton }}>{this.dateTimePicker()}</div> */}
        </div>
        <TableGen column={cols} data={this.state.select} addbtn={true} filterable={true}
          dropdownfilter={this.state.statuslist} getselection={this.getSelectionData} addbtn={false}
          btn={btnfunc} defaultCondition={[{ 'f': 'DocumentType_ID', c: '=', 'v': 1002 }, { 'f': 'EventStatus', c: '!=', 'v': 32 }]}
          accept={false} createErrorSap={this.createSapResModal} />
        <Card>
          <CardBody>
            <Button id="per_button_reject" style={{ width: '130px', marginLeft: '5px', display: this.state.showbutton }} onClick={() => this.workingData(this.state.selectiondata, "reject")} color="danger" className="float-right">Reject</Button>
            <Button id="per_button_working" style={{ width: '130px', marginLeft: '5px', display: this.state.showbutton }} onClick={() => this.workingData(this.state.selectiondata, "accept")} color="warning" className="float-right">Working</Button>
            <Button id="per_button_working" style={{ width: '130px', display: this.state.showbutton }} onClick={() => this.workingData(this.state.selectiondata, "Close")} color="success" className="float-right">Close</Button>
            {this.state.resp}
          </CardBody>
        </Card>
        <Popup open={this.state.open} onClose={this.closeModal} closeOnDocumentClick >
          <div style={{ border: '2px solid red', borderRadius: '5px' }}>
            <a style={styleclose} onClick={this.closeModal}>
              {imgClose}
            </a>
            <div id="header" style={{ width: '100%', borderBottom: '1px solid red', fontSize: '18px', padding: '5px', color: 'red', fontWeight: 'bold' }}>{imgExclamation} Error Message from SAP</div>
            <div style={{ width: '100%', padding: '10px 5px' }}>
              {this.state.errorstr !== null ? this.state.errorstr.split(',').map((item, key) => {
                return <span key={key}>{item}<br /></span>
              }) : null}
            </div>
          </div>
        </Popup>
      </div>
    )
  }
}

export default IssuedDoc;
