import React, { Component } from 'react';
import "react-table/react-table.css";
import { Row, Col, Badge, Input, Card, CardBody, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import ReactTable from 'react-table'
import { apicall, createQueryString, GenerateDropDownStatus } from '../../ComponentCore'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../../ComponentCore/Permission';
import Popup from 'reactjs-popup'
import { DocumentEventStatus } from '../../Status'
import moment from 'moment';
import withFixedColumns from "react-table-hoc-fixed-columns";
import ExportFile from '../../MasterData/ExportFile';

const ReactTableFixedColumns = withFixedColumns(ReactTable);
const Axios = new apicall()
const imgExclamation1 = <img style={{ width: "15px", height: "inherit" }} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAALxSURBVGhD7VlLbhNBELUAsWDFd8HvAmxA2N02KNKgbiuwYAcGBAcJYcMGSLaABAiOAEGKInEPIBwgBDY4hOCZCQmboWpSWSBXj7tnum1Fmic9xVKmq95r1/Sn3KhRo0Z1ZL3e/rQrO4mSD4ALiRZfgOuxln+R+DnRcjlR4h38nU2vtNvZw8Y+Gj45bE63zoLA+ViJ7yAsc2GsxWqs5FwayTMUbnwYRM3jkPw1cJsT58I8hpIvMCaFDwuYubtQCj85MRXZj1X7DqXxj6x37iCUyxsmsVdCjpdZFB2gtH6QXW8egsAfuIQhCGW1hDkpfTXQzDuLz/rr/5F7pohQqou4upGM8ihbNlUNILGcSEY5wCzc4wLb0IcBZNwVt0iOGwbXLpyA5W2NC2pDXwZAw4/fWhwjWfaA2X/FBrSkNwM5xXOSZYd8h624Sfk0AFq2UtU5TfJGA16eeS6QC30aQMJx5QnJKwYesqB8vnFBXOjfgPxqdQDc1OISF8CVvg0gU9WUJNOM/EjMDHZlCANJV9wnmWZA/b9nBzsyiAEt3pJMM+DB5eGB7gxiQMnPJNMMuj3xARwYyMAayTSj6vq/yxAGUBvJNGPPG9jzJYQvCjvYkWEMiE8k0wwwsMAOdmQQA5bL6OzwQHcGMaDEDMk0I29QcYMdGcJAqluCZJpBh7lVLoALfRuAFWjFupsHD89xQSZJmNTHJG80sN3naz/wQRD/J+1ePkXy7IAdAS7YZOh4pUTgRRo3Dj7gaHp7B+BSvzE1dYRkuSHWrdtsUAv6MjDQ7RskpxzKdie8GFDyKckoD2y0golFNkEBqxrAnF5ai4i8uavkEpcoBHPxvpq7u9j5JsawMin5zNvMc4BvogeJ+kOJqxJWm4GSNylNWGxMd47i2gxmtlgxDsRNCmf9V3T+MIUfH7Ddhx0zMLLCiSsijoGSfJRcvXiSwk0OeMjCphP2bfDMjhcP/B0NRG4jd35TEx/pfzN4qrQ+mNWoUaMAjcY/hH7RYM9nkHQAAAAASUVORK5CYII=" />;
const imgExclamation = <img style={{ width: "20px", height: "auto" }} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAALxSURBVGhD7VlLbhNBELUAsWDFd8HvAmxA2N02KNKgbiuwYAcGBAcJYcMGSLaABAiOAEGKInEPIBwgBDY4hOCZCQmboWpSWSBXj7tnum1Fmic9xVKmq95r1/Sn3KhRo0Z1ZL3e/rQrO4mSD4ALiRZfgOuxln+R+DnRcjlR4h38nU2vtNvZw8Y+Gj45bE63zoLA+ViJ7yAsc2GsxWqs5FwayTMUbnwYRM3jkPw1cJsT58I8hpIvMCaFDwuYubtQCj85MRXZj1X7DqXxj6x37iCUyxsmsVdCjpdZFB2gtH6QXW8egsAfuIQhCGW1hDkpfTXQzDuLz/rr/5F7pohQqou4upGM8ihbNlUNILGcSEY5wCzc4wLb0IcBZNwVt0iOGwbXLpyA5W2NC2pDXwZAw4/fWhwjWfaA2X/FBrSkNwM5xXOSZYd8h624Sfk0AFq2UtU5TfJGA16eeS6QC30aQMJx5QnJKwYesqB8vnFBXOjfgPxqdQDc1OISF8CVvg0gU9WUJNOM/EjMDHZlCANJV9wnmWZA/b9nBzsyiAEt3pJMM+DB5eGB7gxiQMnPJNMMuj3xARwYyMAayTSj6vq/yxAGUBvJNGPPG9jzJYQvCjvYkWEMiE8k0wwwsMAOdmQQA5bL6OzwQHcGMaDEDMk0I29QcYMdGcJAqluCZJpBh7lVLoALfRuAFWjFupsHD89xQSZJmNTHJG80sN3naz/wQRD/J+1ePkXy7IAdAS7YZOh4pUTgRRo3Dj7gaHp7B+BSvzE1dYRkuSHWrdtsUAv6MjDQ7RskpxzKdie8GFDyKckoD2y0golFNkEBqxrAnF5ai4i8uavkEpcoBHPxvpq7u9j5JsawMin5zNvMc4BvogeJ+kOJqxJWm4GSNylNWGxMd47i2gxmtlgxDsRNCmf9V3T+MIUfH7Ddhx0zMLLCiSsijoGSfJRcvXiSwk0OeMjCphP2bfDMjhcP/B0NRG4jd35TEx/pfzN4qrQ+mNWoUaMAjcY/hH7RYM9nkHQAAAAASUVORK5CYII=" />;
const imgClose = <img style={{ width: "28px", height: "auto" }} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAANkSURBVGhD7ZlHyxRBEIYXI4aDYgDDP1Bvpr9hwqMR9ageFBN6ULwaPsNdFEU9iH9DDwZQ9GIGIwaMCPo+sA1lU7PT3Tu7sjAvPLisXdXVOz3V1fV1WrVq1YjGiZViv7gu7osP4lcXPvPdNbFPrBDY/HctFMfFC/Enk2cC2wVi6JolzoifwgsuB3yMCXwORevFW+EF0w/4XCcGpgninPAmh4/iotgilok5YmIXPvPdVnFJMNbzATyN8aJRTRU3hTfhA7FJTBGpYuxm8VB4Pm+IHH89xa+Bw3iSb2Kn4MmUCttd4ruI/TNnI0/ivIidk3WWiqbE9nop4nlOir7ECxs7vSXmi6aFz9sinm+NKBJp7Z2wzp6LQeZtXvbHws75RswU2TorrKOvgkftaVH33xxV2SwWzGXnPi2yxK8cH1K8sJ4Oi9+C7ZYqxmKDraeDws7NS561bTnirQNSpZdtCCCMSV1ECD7YeYsgbb8SYQwcE0miyGKvW+MNIhaP2gYCdYuIgw82+Iq1XdhxT0VSAUhVaQ0/iapDpSogbxE5YxFP4bOw46vewX9ESWyNLoheSgksN/igy8La7BW1op63RtQ2deoVYGnwaJuwdldFrbh4WKPlIkVVgZYGj+LtfFfUituTNcqp071FWHKCR7OFtedgrVWc/yeJHFUtIjd4NFlYH8RWq5FfQLyFeIypqgo+kLuIoi10T1ijkXuJRz6N0rexRtxheyklwNJFXBHWZo+olVdKcKx7ygksdxHTRFEp4RVzG0WsQRdzO4Qd90Qkd/PicprugVdOHxFhTF3wQfEi8BGLX7+4nEbehWa38EQAqcEHhUV4waNDws7NhWaeyBINJuuEax5NWU9NXimXCFo2du5TIlvUQFyorSPeDRq6g5J3qX8tZogi0au0zoC2ChM1LXziO55vlehLPL7Y6SPhZY5S4Quf8TwnRN+qai3yThwQZIxSTRf4GGhrEXEn9hYBpDuO/JxmLAcjeT5OlQHmaqy5G8Sv4W2nwBfBHZbFkK3Y05TiMLf7HZ0GygPGej6AORr75T2tFXF2agKyzWoxFJHWaPf9EF4wObD/6UIXp8p+RLuPI56mkxdcL7A5KrJP2EGIIouLD30banYuHu8F5Qjw+Y7g/xjD3xaSC7NWrVpVqdP5C8HnZiqeZ+ELAAAAAElFTkSuQmCC" />;

class AuditDoc extends Component {
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
        q: "[{ 'f': 'DocumentType_ID', c:'=', 'v': 2004}]",
        f: "ID,Code,SouBranchName,SouWarehouseName,SouAreaName,DesCustomerName,DesBranchName,DesWarehouseName,DesSupplierName,ForCustomer,Batch,Lot,ActionTime,DocumentDate,EventStatus,RefID,Ref1,Ref2,Remark,Created,ModifyBy,LastUpdate,Options",
        g: "",
        s: "[{'f':'ID','od':'desc'}]",
        sk: 0,
        l: 100,
        all: "",
      },
      open: false,
      errorstr: null,
      sortstatus: 0,
      selectiondata: [],
      defaultPageS: 100,
      currentPage: 1,
      loading: true,
      modalstatus: false,
      datafilter: [{ "id": "DocumentType_ID", "value": 2004 }]
    };
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.getSelectionData = this.getSelectionData.bind(this)
    this.dateTimePicker = this.dateTimePicker.bind(this)
    this.displayButtonByPermission = this.displayButtonByPermission.bind(this)
    this.createSapResModal = this.createSapResModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.paginationButton = this.paginationButton.bind(this)
    this.pageOnHandleClick = this.pageOnHandleClick.bind(this)
    this.NextLastPage = this.NextLastPage.bind(this)
    this.onHandleSelection = this.onHandleSelection.bind(this)
    this.customSorting = this.customSorting.bind(this);
    this.toggle = this.toggle.bind(this);
  }

  async componentWillMount() {
    document.title = "Search Audit : AWMS";
    //permission
    this.setState({ showbutton: "none" })
    let dataGetPer = await GetPermission()
    CheckWebPermission("SAudit", dataGetPer, this.props.history);
    this.displayButtonByPermission(dataGetPer)
  }
  //permission
  // 52	Audit_view	เอกสารตรวจสอบสินค้า
  // 53	Audit_create&modify	เอกสารตรวจสอบสินค้า

  displayButtonByPermission(dataGetPer) {
    let checkview = true
    if (CheckViewCreatePermission("Audit_view", dataGetPer)) {
      checkview = true //แสดงข้อมูล 
    }
    if (CheckViewCreatePermission("Audit_create&modify", dataGetPer)) {
      checkview = false //สร้างเอกสาร
    }
    if (checkview === true) {
      this.setState({ showbutton: "block" })
      var PerButtonDoc = document.getElementById("per_button_doc")
      PerButtonDoc.remove()
    } else if (checkview === false) {
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
    this.getData()
  }
  getData() {
    Axios.get(createQueryString(this.state.select)).then((response) => {
      let countpages = null;
      let counts = response.data.counts;
      countpages = Math.ceil(counts / this.state.defaultPageS);
      this.setState({ data: response.data.datas, countpages: countpages, loading: false })
    })
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
        Axios.post(window.apipath + "/api/wm/issued/doc/working", postdata).then((res) => {
          this.getData()
          this.setState({ resp: res.data._result.message })
        })
      }
      else if (status === "reject") {
        Axios.post(window.apipath + "/api/wm/audit/doc/Reject", postdata).then((res) => {
          this.getData()
          this.setState({ resp: res.data._result.message })
        })
        this.toggle()
      }
      else if (status === "Close") {
        Axios.post(window.apipath + "/api/wm/audit/doc/Closing", postdata).then((res) => {
          this.getData()
          this.setState({ resp: res.data._result.message })
        })
      }
    }
  }

  paginationButton() {
    const notPageactive = {
      pointerEvents: 'none',
      cursor: 'default',
      textDecoration: 'none',
      color: 'black',
      background: '#eceff1',
      minWidth: '90px'
    }
    const pageactive = {
      textDecoration: 'none',
      color: 'black',
      background: '#cfd8dc',
      minWidth: '90px'
    }
    const notPageactiveLast = {
      pointerEvents: 'none',
      cursor: 'default',
      textDecoration: 'none',
    }
    const pageactiveLast = {
      textDecoration: 'none',
    }
    return (
      <div style={{ paddingTop: '3px', textAlign: 'center', margin: 'auto', minWidth: "450px", maxWidth: "450px" }}>
        <nav>
          <ul className="pagination">
            <li className="page-item" style={{ display: "flex" }}><Button style={this.state.currentPage === 1 ? { ...notPageactiveLast, marginRight: "5px" } : { pageactiveLast, marginRight: "5px" }} outline color="success" onClick={() => this.NextLastPage("prev")}>{"<<"}</Button>{' '}<a className="page-link" style={this.state.currentPage === 1 ? notPageactive : pageactive}
              onClick={() => this.pageOnHandleClick("prev")}>
              Previous</a></li>
            <p style={{ margin: 'auto', minWidth: "60px", paddingRight: "10px", paddingLeft: "10px", verticalAlign: "middle" }}>Page : {this.state.currentPage} of {this.state.countpages === 0 || this.state.countpages === undefined ? '1' : this.state.countpages}</p>
            <li className="page-item" style={{ display: "flex" }}> <a className="page-link" style={this.state.currentPage >= this.state.countpages || this.state.countpages === undefined ? notPageactive : pageactive}
              onClick={() => this.pageOnHandleClick("next")} >
              Next</a><Button style={this.state.currentPage >= this.state.countpages || this.state.countpages === undefined ? { ...notPageactiveLast, marginLeft: "5px" } : { ...pageactiveLast, marginLeft: "5px" }} outline color="success" onClick={() => this.NextLastPage("next")}>{">>"}</Button>{' '} </li>
          </ul>
        </nav>
      </div>
    )
  }

  NextLastPage(position) {
    this.setState({ loading: true })
    let queryString = "";
    const select = this.state.select
    if (position === 'next') {
      select.sk = ((this.state.countpages * 100) - 100)
      //  console.log(select)
      queryString = createQueryString(select)
    }
    else {
      select.sk = 0
      //  console.log(select)
      queryString = createQueryString(select)
    }

    Axios.get(queryString).then(
      (res) => {
        if (res.data.datas.length > 0) {
          if (position === 'next') {
            this.setState({ currentPage: (this.state.countpages) })
          }
          else {
            this.setState({ currentPage: 1 })
          }
          this.setState({ data: res.data.datas })
        }
        else {
          select.sk = parseInt(select.sk === "" ? 0 : select.sk, 10) - parseInt(select.l, 10)
        }
        this.setState({ loading: false })
      }
    )
  }
  pageOnHandleClick(position) {
    this.setState({ loading: true })
    const select = this.state.select
    if (position === 'next') {
      select.sk = parseInt(select.sk === "" ? 0 : select.sk, 10) + parseInt(select.l, 10)
      ++this.state.currentPage
    }
    else {
      if (select.sk - select.l >= 0) {
        select.sk = select.sk - select.l
        if (this.state.currentPage !== 1)
          --this.state.currentPage
      }
    }
    this.setState({ select }, () => { this.getData() })
  }
  DatePickerFilter(datetime) {
    this.setState({ date: datetime })
    let filter = this.state.datafilter
    filter.forEach((x, index) => {
      if (x.id === "DocumentDate")
        filter.splice(index, 1);
    });
    if (datetime !== null) {
      filter.push({ id: "DocumentDate", value: moment(datetime).format('YYYY-MM-DD'), type: "date" });
    }
    this.setState({ datafilter: filter }, () => { this.onCheckFliter() });
  }
  createCustomFilter(name) {
    return <Input type="text" id={name.column.id} style={{ background: "#FAFAFA" }} placeholder="filter..."
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          let filter = this.state.datafilter
          filter.forEach((x, index) => {
            if (x.id === name.column.id)
              filter.splice(index, 1);
          });
          if (e.target.value !== "")
            filter.push({ id: name.column.id, value: e.target.value });
          this.setState({ datafilter: filter }, () => { this.onCheckFliter() });

        }
      }
      } />
  }
  onCheckFliter() {
    this.setState({ loading: true })
    let getFilter = this.state.datafilter;
    let listFilter = getFilter.map(x => {
      if (x.type === "date")
        return { "f": x.id, "c": "=", "v": x.value }
      else
        return { "f": x.id, "c": "like", "v": x.value }
    })
    let strCondition = JSON.stringify(listFilter);
    let getSelect = this.state.select;
    getSelect["sk"] = 0
    this.setState({ currentPage: 1 })
    getSelect.q = strCondition;
    this.setState({ select: getSelect }, () => { this.getData() })
  }

  datetimeBody(value, format) {
    if (value !== null) {
      const date = moment(value);
      if (format === "date") {
        return <div>{date.format('DD-MM-YYYY')}</div>
      } else if (format === "datelog") {
        return <div>{date.format('DD-MM-YYYY HH:mm:ss')}</div>
      } else {
        return <div>{date.format('DD-MM-YYYY HH:mm')}</div>
      }
    }
  }
  createStatusField(data) {
    let strStatus = ""
    const results = DocumentEventStatus.filter(row => {
      return row.code === data.value
    })
    if (results.length > 0) {
      strStatus = results[0].status
      if (data.original.Options !== undefined) {
        if (data.original.Options !== null) {
          var arrayRes = JSON.parse('{"' + decodeURI(data.original.Options).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}')
          if (arrayRes.SapRes !== undefined && arrayRes.SapRes.length > 0) {
            var strSapRes = decodeURIComponent(arrayRes["SapRes"])
            var newSapRes = strSapRes.replace(/\+/g, ' ').replace(/\|/g, ' , ');
            // console.log(strStatus)
            if (strStatus === "CLOSING") {
              return <h5><a style={{ textDecorationLine: 'underline', cursor: 'pointer' }}
                onClick={() => this.createSapResModal(newSapRes)} ><Badge color={strStatus} style={{ width: '6.5em' }}>{strStatus}</Badge>{imgExclamation1}</a></h5>
            } else {
              return <h5><Badge color={strStatus} style={{ width: '6.5em' }}>{strStatus}</Badge></h5>
            }
          } else {
            return <h5><Badge color={strStatus} style={{ width: '6.5em' }}>{strStatus}</Badge></h5>
          }
        } else {
          return <h5><Badge color={strStatus} style={{ width: '6.5em' }}>{strStatus}</Badge></h5>
        }
      } else {
        return <h5><Badge color={strStatus} style={{ width: '6.5em' }}>{strStatus}</Badge></h5>
      }
    }
    else {
      return null
    }
  }
  createDropdownFilter(columns) {
    let list = DocumentEventStatus.map((x, idx) => {
      return <option key={idx} value={x.code}>{x.status}</option>
    });
    return <select style={{ background: "#FAFAFA", width: '100%' }} onChange={(e) => {
      let filter = this.state.datafilter
      filter.forEach((x, index) => {
        if (x.id === columns.column.id)
          filter.splice(index, 1);
      });
      if (e.target.value !== "") {
        filter.push({ id: columns.column.id, value: e.target.value });
      }
      this.setState({ datafilter: filter }, () => { this.onCheckFliter() });
    }}><option key="*" value="*">{"ALL"}</option>{list}</select>
  }

  onHandleSelection(rowdata, value) {
    let rowselect = [];
    if (value) {
      rowselect.push(rowdata.original)
    }
    this.setState({ rowselect: rowselect }, () => { this.getSelectionData(this.state.rowselect) })
  }

  createSelection(rowdata) {
    return <input
      className="selection"
      type="radio"
      name="selection"
      onChange={(e) => this.onHandleSelection(rowdata, e.target.checked)} />
  }

  createModal() {
    return <Modal isOpen={this.state.modalstatus}>
      <ModalHeader toggle={this.toggle}> <span>Reject</span></ModalHeader>

      <ModalFooter>
        <Button id="per_button_reject" color="primary" style={{ width: "130px" }} onClick={() => this.workingData(this.state.selectiondata, "reject")} >OK</Button>{' '}
        <Button color="secondary" style={{ width: "130px" }} onClick={this.toggle}>Cancel</Button>

      </ModalFooter>
    </Modal>
  }

  toggle() {
    this.setState({ modalstatus: !this.state.modalstatus });
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
  customSorting(data) {
    const select = this.state.select
    select["s"] = JSON.stringify([{ 'f': data[0].id, 'od': data[0].desc === false ? 'asc' : 'desc' }])
    let queryString = ""
    this.setState({ currentPage: 1 })
    if (this.props.url === undefined || null) {
      queryString = createQueryString(select)
    }
    // else {
    //   queryString = createQueryStringStorage(this.props.url, data[0].id, data[0].desc === false ? 'asc' : 'desc')
    // }
    Axios.get(queryString).then(
      (res) => {
        this.setState({ data: res.data.datas, loading: false })
      })
  }
  render() {
    const cols = [
      {
        Header: '', sortable: false, filterable: false, sortable: false, className: "text-center", fixed: "left", minWidth: 50,
        Cell: (e) => this.createSelection(e)
      },
      {
        accessor: 'EventStatus', Header: 'Doc Status', editable: false, Filter: (e) => this.createDropdownFilter(e), fixed: "left", minWidth: 120,
        Cell: (e) =>
          this.createStatusField(e)
      },
      {
        accessor: 'Code', Header: 'Doc No.', editable: false, Filter: (e) => this.createCustomFilter(e), fixed: "left",
        Cell: (e) => <a style={{ color: '#20a8d8', textDecorationLine: 'underline', cursor: 'pointer' }} target="_blank"
          onClick={() => { window.open('/sys/ad/create?ID=' + e.original.ID) }} >{e.original.Code}</a>
      },
      { accessor: 'RefID', Header: 'SAP.Doc No.', editable: false, Filter: (e) => this.createCustomFilter(e), },
      { accessor: 'Ref1', Header: 'SAP.Doc Year', editable: false, Filter: (e) => this.createCustomFilter(e), },
      { accessor: 'Remark', Header: 'Remark', editable: false, Filter: (e) => this.createCustomFilter(e) },
      { accessor: 'SouBranchName', Header: 'Sou.Branch', editable: false, Filter: (e) => this.createCustomFilter(e), },
      { accessor: 'SouWarehouseName', Header: 'Sou.Warehouse', editable: false, Filter: (e) => this.createCustomFilter(e) },
      {
        accessor: 'DocumentDate', Header: 'Doc.Date', editable: false, filterable: false,
        Cell: (e) =>
          this.datetimeBody(e.value, "date")
      },
      {
        accessor: 'ActionTime', Header: 'Action Time', editable: false, filterable: false, minWidth: 120,
        Cell: (e) =>
          this.datetimeBody(e.value, "datelog")
      },
      { accessor: 'Created', Header: 'Create', editable: false, filterable: false, minWidth: 180, maxWidth: 180 },
    ];

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

        {this.createModal()}

        <div className="clearfix" style={{ paddingBottom: '3px' }}>
          <div className="clearfix" >
            <label style={{ marginRight: "10px" }}>Document Date : </label>

            <div style={{ display: "inline-block", width: "300px" }}>

              <DatePicker selected={this.state.date}
                customInput={<Input />}
                onChange={(e) => {
                  if (e === null) {
                    this.DatePickerFilter(null)
                  }
                  else {
                    if (e.isValid() && e !== null) {
                      this.DatePickerFilter(e)
                    }
                  }

                }}
                timeIntervals={1}
                timeFormat="HH:mm"
                timeCaption="Time"
                showTimeSelect={false}
                dateFormat={"DD-MM-YYYY"} />
            </div>
          </div>

          <Row style={{ marginTop: '3px', marginBottom: '3px' }}>
            <Col xs="6"></Col>
            <Col xs="6">
              <div>
                <div className="float-right">
                  <ExportFile column={cols} dataxls={this.state.data} filename={"SearchAudit"} />

                </div>
                <Button id="per_button_doc" className="float-right" style={{ width: '150px', marginRight: '5px', marginBottom: '3px', display: this.state.showbutton }} color="primary" className="float-right" onClick={() => this.props.history.push('/sys/ad/create')}>Create Document</Button>

              </div>
            </Col>
          </Row>

        </div>

        <ReactTableFixedColumns
          style={{ backgroundColor: 'white', border: '0.5px solid #eceff1', zIndex: 0, maxHeight: '550px' }}
          className="-highlight"
          minRows={5}
          loading={this.state.loading}
          columns={cols}
          data={this.state.data}
          editable={false}
          filterable={true}
          multiSort={false}
          defaultPageSize={this.state.defaultPageS}
          PaginationComponent={this.paginationButton}
          onSortedChange={(sorted) => {
            this.setState({ data: [], loading: true });
            this.customSorting(sorted)
          }}
        />
        <Card>
          <CardBody>
            <Button id="per_button_reject" style={{ width: '130px', marginLeft: '5px', display: this.state.showbutton }} onClick={() => this.toggle()} color="danger" className="float-right">Reject</Button>
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

export default AuditDoc;
