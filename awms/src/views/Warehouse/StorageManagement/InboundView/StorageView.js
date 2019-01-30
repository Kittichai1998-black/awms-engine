import React, { Component } from 'react';
import "react-table/react-table.css";
import { Input, Badge, Card, CardBody, Button, Row, Col } from 'reactstrap';
import ReactTable from 'react-table'
import { apicall, DatePicker, GenerateDropDownStatus, createQueryString } from '../../ComponentCore'
import moment from 'moment';
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../../ComponentCore/Permission';
import Popup from 'reactjs-popup'
import withFixedColumns from "react-table-hoc-fixed-columns";
import { DocumentEventStatus } from '../../Status'

const ReactTableFixedColumns = withFixedColumns(ReactTable);
const Axios = new apicall()
const imgExclamation1 = <img style={{ width: "15px", height: "inherit" }} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAALxSURBVGhD7VlLbhNBELUAsWDFd8HvAmxA2N02KNKgbiuwYAcGBAcJYcMGSLaABAiOAEGKInEPIBwgBDY4hOCZCQmboWpSWSBXj7tnum1Fmic9xVKmq95r1/Sn3KhRo0Z1ZL3e/rQrO4mSD4ALiRZfgOuxln+R+DnRcjlR4h38nU2vtNvZw8Y+Gj45bE63zoLA+ViJ7yAsc2GsxWqs5FwayTMUbnwYRM3jkPw1cJsT58I8hpIvMCaFDwuYubtQCj85MRXZj1X7DqXxj6x37iCUyxsmsVdCjpdZFB2gtH6QXW8egsAfuIQhCGW1hDkpfTXQzDuLz/rr/5F7pohQqou4upGM8ihbNlUNILGcSEY5wCzc4wLb0IcBZNwVt0iOGwbXLpyA5W2NC2pDXwZAw4/fWhwjWfaA2X/FBrSkNwM5xXOSZYd8h624Sfk0AFq2UtU5TfJGA16eeS6QC30aQMJx5QnJKwYesqB8vnFBXOjfgPxqdQDc1OISF8CVvg0gU9WUJNOM/EjMDHZlCANJV9wnmWZA/b9nBzsyiAEt3pJMM+DB5eGB7gxiQMnPJNMMuj3xARwYyMAayTSj6vq/yxAGUBvJNGPPG9jzJYQvCjvYkWEMiE8k0wwwsMAOdmQQA5bL6OzwQHcGMaDEDMk0I29QcYMdGcJAqluCZJpBh7lVLoALfRuAFWjFupsHD89xQSZJmNTHJG80sN3naz/wQRD/J+1ePkXy7IAdAS7YZOh4pUTgRRo3Dj7gaHp7B+BSvzE1dYRkuSHWrdtsUAv6MjDQ7RskpxzKdie8GFDyKckoD2y0golFNkEBqxrAnF5ai4i8uavkEpcoBHPxvpq7u9j5JsawMin5zNvMc4BvogeJ+kOJqxJWm4GSNylNWGxMd47i2gxmtlgxDsRNCmf9V3T+MIUfH7Ddhx0zMLLCiSsijoGSfJRcvXiSwk0OeMjCphP2bfDMjhcP/B0NRG4jd35TEx/pfzN4qrQ+mNWoUaMAjcY/hH7RYM9nkHQAAAAASUVORK5CYII=" />;
const imgExclamation = <img style={{ width: "20px", height: "auto" }} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAALxSURBVGhD7VlLbhNBELUAsWDFd8HvAmxA2N02KNKgbiuwYAcGBAcJYcMGSLaABAiOAEGKInEPIBwgBDY4hOCZCQmboWpSWSBXj7tnum1Fmic9xVKmq95r1/Sn3KhRo0Z1ZL3e/rQrO4mSD4ALiRZfgOuxln+R+DnRcjlR4h38nU2vtNvZw8Y+Gj45bE63zoLA+ViJ7yAsc2GsxWqs5FwayTMUbnwYRM3jkPw1cJsT58I8hpIvMCaFDwuYubtQCj85MRXZj1X7DqXxj6x37iCUyxsmsVdCjpdZFB2gtH6QXW8egsAfuIQhCGW1hDkpfTXQzDuLz/rr/5F7pohQqou4upGM8ihbNlUNILGcSEY5wCzc4wLb0IcBZNwVt0iOGwbXLpyA5W2NC2pDXwZAw4/fWhwjWfaA2X/FBrSkNwM5xXOSZYd8h624Sfk0AFq2UtU5TfJGA16eeS6QC30aQMJx5QnJKwYesqB8vnFBXOjfgPxqdQDc1OISF8CVvg0gU9WUJNOM/EjMDHZlCANJV9wnmWZA/b9nBzsyiAEt3pJMM+DB5eGB7gxiQMnPJNMMuj3xARwYyMAayTSj6vq/yxAGUBvJNGPPG9jzJYQvCjvYkWEMiE8k0wwwsMAOdmQQA5bL6OzwQHcGMaDEDMk0I29QcYMdGcJAqluCZJpBh7lVLoALfRuAFWjFupsHD89xQSZJmNTHJG80sN3naz/wQRD/J+1ePkXy7IAdAS7YZOh4pUTgRRo3Dj7gaHp7B+BSvzE1dYRkuSHWrdtsUAv6MjDQ7RskpxzKdie8GFDyKckoD2y0golFNkEBqxrAnF5ai4i8uavkEpcoBHPxvpq7u9j5JsawMin5zNvMc4BvogeJ+kOJqxJWm4GSNylNWGxMd47i2gxmtlgxDsRNCmf9V3T+MIUfH7Ddhx0zMLLCiSsijoGSfJRcvXiSwk0OeMjCphP2bfDMjhcP/B0NRG4jd35TEx/pfzN4qrQ+mNWoUaMAjcY/hH7RYM9nkHQAAAAASUVORK5CYII=" />;
const imgClose = <img style={{ width: "28px", height: "auto" }} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAANkSURBVGhD7ZlHyxRBEIYXI4aDYgDDP1Bvpr9hwqMR9ageFBN6ULwaPsNdFEU9iH9DDwZQ9GIGIwaMCPo+sA1lU7PT3Tu7sjAvPLisXdXVOz3V1fV1WrVq1YjGiZViv7gu7osP4lcXPvPdNbFPrBDY/HctFMfFC/Enk2cC2wVi6JolzoifwgsuB3yMCXwORevFW+EF0w/4XCcGpgninPAmh4/iotgilok5YmIXPvPdVnFJMNbzATyN8aJRTRU3hTfhA7FJTBGpYuxm8VB4Pm+IHH89xa+Bw3iSb2Kn4MmUCttd4ruI/TNnI0/ivIidk3WWiqbE9nop4nlOir7ECxs7vSXmi6aFz9sinm+NKBJp7Z2wzp6LQeZtXvbHws75RswU2TorrKOvgkftaVH33xxV2SwWzGXnPi2yxK8cH1K8sJ4Oi9+C7ZYqxmKDraeDws7NS561bTnirQNSpZdtCCCMSV1ECD7YeYsgbb8SYQwcE0miyGKvW+MNIhaP2gYCdYuIgw82+Iq1XdhxT0VSAUhVaQ0/iapDpSogbxE5YxFP4bOw46vewX9ESWyNLoheSgksN/igy8La7BW1op63RtQ2deoVYGnwaJuwdldFrbh4WKPlIkVVgZYGj+LtfFfUituTNcqp071FWHKCR7OFtedgrVWc/yeJHFUtIjd4NFlYH8RWq5FfQLyFeIypqgo+kLuIoi10T1ijkXuJRz6N0rexRtxheyklwNJFXBHWZo+olVdKcKx7ygksdxHTRFEp4RVzG0WsQRdzO4Qd90Qkd/PicprugVdOHxFhTF3wQfEi8BGLX7+4nEbehWa38EQAqcEHhUV4waNDws7NhWaeyBINJuuEax5NWU9NXimXCFo2du5TIlvUQFyorSPeDRq6g5J3qX8tZogi0au0zoC2ChM1LXziO55vlehLPL7Y6SPhZY5S4Quf8TwnRN+qai3yThwQZIxSTRf4GGhrEXEn9hYBpDuO/JxmLAcjeT5OlQHmaqy5G8Sv4W2nwBfBHZbFkK3Y05TiMLf7HZ0GygPGej6AORr75T2tFXF2agKyzWoxFJHWaPf9EF4wObD/6UIXp8p+RLuPI56mkxdcL7A5KrJP2EGIIouLD30banYuHu8F5Qjw+Y7g/xjD3xaSC7NWrVpVqdP5C8HnZiqeZ+ELAAAAAElFTkSuQmCC" />;

class IssuedDoc extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      autocomplete: [],
      statuslist: [{
        'status': GenerateDropDownStatus("DocumentStatus"),
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
        t: "LinkDocument",
        q: '[{ "f": "DocumentType_ID", "c":"=", "v": 1001}]',
        f: "*",
        g: "",
        s: "[{'f':'Code','od':'desc'}]",
        sk: 0,
        l: 100,
        all: "",
      },
      sortstatus: 0,
      open: false,
      errorstr: null,
      selectiondata: [],
      defaultPageS: 100,
      currentPage: 1,
      loading: true,
      datafilter: [{ "id": "DocumentType_ID", "value": 1001 }]
    };
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.getSelectionData = this.getSelectionData.bind(this);
    this.displayButtonByPermission = this.displayButtonByPermission.bind(this);
    this.createSapResModal = this.createSapResModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.paginationButton = this.paginationButton.bind(this)
    this.pageOnHandleClick = this.pageOnHandleClick.bind(this)
    this.onHandleSelection = this.onHandleSelection.bind(this)
    this.customSorting = this.customSorting.bind(this);
  }

  async componentWillMount() {
    document.title = "Search Receive : AWMS";
    //permission
    this.setState({ showbutton: "none" })
    let dataGetPer = await GetPermission()
    CheckWebPermission("GRDoc", dataGetPer, this.props.history);
    this.displayButtonByPermission(dataGetPer)
  }

  //permission 21-TransGRD_view 20-TransGRD_execute
  displayButtonByPermission(dataGetPer) {
    let checkview = true
    if (CheckViewCreatePermission("TransGRD_view", dataGetPer)) {
      checkview = true //แสดงข้อมูล
    }
    if (CheckViewCreatePermission("TransGRD_execute", dataGetPer)) {
      checkview = false //แก้ไข
    }
    if (checkview === true) {
      var PerButtonExport = document.getElementById("per_button_export")
      PerButtonExport.remove()
      var PerButtonDate = document.getElementById("per_button_date")
      PerButtonDate.remove()
    } else if (checkview === false) {
      this.setState({ showbutton: "block" })
    }
  }

  onHandleClickCancel(event) {
    this.forceUpdate();
    event.preventDefault();
  }

  componentDidMount() {
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
  getSelectionData(data) {
    this.setState({ selectiondata: data })
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
          filter.push({ id: name.column.id, value: e.target.value });
          this.setState({ datafilter: filter }, () => { this.onCheckFliter() });

        }
      }
      } />
  }




  workingData(data, status) {
    let postdata = { docIDs: [] }
    if (data.length > 0) {
      data.forEach(rowdata => {
        postdata["docIDs"].push(rowdata.ID)
      })
      if (status === "reject") {
        Axios.post(window.apipath + "/api/wm/received/doc/rejected", postdata).then((res) => {
          this.getData()
          this.setState({ resp: res.data._result.message })
        })
      } else {
        Axios.post(window.apipath + "/api/wm/received/doc/close", postdata).then((res) => {
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
    return (
      <div style={{ paddingTop: '3px', textAlign: 'center', margin: 'auto', minWidth: "300px", maxWidth: "300px" }}>
        <nav>
          <ul className="pagination">
            <li className="page-item"><a className="page-link" style={this.state.currentPage === 1 ? notPageactive : pageactive}
              onClick={() => this.pageOnHandleClick("prev")}>
              Previous</a></li>
            <p style={{ margin: 'auto', minWidth: "60px", paddingRight: "10px", paddingLeft: "10px", verticalAlign: "middle" }}>Page : {this.state.currentPage} of {this.state.countpages === 0 || this.state.countpages === undefined ? '1' : this.state.countpages}</p>
            <li className="page-item"><a className="page-link" style={this.state.currentPage >= this.state.countpages || this.state.countpages === undefined ? notPageactive : pageactive}
              onClick={() => this.pageOnHandleClick("next")}>
              Next</a></li>
          </ul>
        </nav>
      </div>
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
  createCustomFilter(name) {
    return <Input type="text" id={name.column.id} style={{ background: "#FAFAFA" }} placeholder="filter..."
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          let filter = this.state.datafilter
          filter.forEach((x, index) => {
            if (x.id === name.column.id)
              filter.splice(index, 1);
          });
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
        return { "f": x.id, "c": "like", "v": "*" + x.value + "*" }
    })
    let strCondition = JSON.stringify(listFilter);
    let getSelect = this.state.select;
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
            // console.log(newSapRes)
            return <h5><a style={{ textDecorationLine: 'underline', cursor: 'pointer' }}
              onClick={() => this.createSapResModal(newSapRes)} ><Badge color={strStatus}>{strStatus}</Badge>{imgExclamation1}</a></h5>
          } else {
            return <h5><Badge color={strStatus}>{strStatus}</Badge></h5>
          }
        } else {
          return <h5><Badge color={strStatus}>{strStatus}</Badge></h5>
        }
      } else {
        return <h5><Badge color={strStatus}>{strStatus}</Badge></h5>
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
      { accessor: 'Code', Header: 'Doc No.', editable: false, Filter: (e) => this.createCustomFilter(e), fixed: "left", Cell: (e) => <a style={{ color: '#20a8d8', textDecorationLine: 'underline', cursor: 'pointer' }} onClick={() => this.props.history.push('/doc/gr/view?docID=' + e.original.ID)} >{e.original.DocumentType_ID === 1101 ? e.original.CodeDocItem : e.original.Code}</a> },
      { accessor: 'Super', Header: 'AWMS Ref.', editable: false, Filter: (e) => this.createCustomFilter(e) },
      { accessor: 'RefID', Header: 'SAP.Doc No.', editable: false, Filter: (e) => this.createCustomFilter(e), },
      { accessor: 'Ref1', Header: 'SAP.Doc Year', editable: false, Filter: (e) => this.createCustomFilter(e), },
      { accessor: 'Ref2', Header: 'Movement', editable: false, Filter: (e) => this.createCustomFilter(e), },
      { accessor: 'Remark', Header: 'Remark', editable: false, Filter: (e) => this.createCustomFilter(e), },
      { accessor: 'SouBranchName', Header: 'Sou.Branch', editable: false, Filter: (e) => this.createCustomFilter(e), },
      { accessor: 'SouWarehouseName', Header: 'Sou.Warehouse', editable: false, Filter: (e) => this.createCustomFilter(e), },
      { accessor: 'DesBranchName', Header: 'Des.Branch', editable: false, Filter: (e) => this.createCustomFilter(e), },
      { accessor: 'DesWarehouseName', Header: 'Des.Warehouse', editable: false, Filter: (e) => this.createCustomFilter(e), },
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
        <div className="clearfix" style={{ paddingBottom: '3px' }}>
          <Row>

            <Col xs="5"></Col>
            <Col xs="5">
              <div className="float-right" >
                <span className="float-right" style={{ fontWeight: 'bold' }}>Doc.Date : </span>
              </div>
            </Col>

            <DatePicker className="float-right" selected={this.state.date}
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
          </Row>
        </div>




        <ReactTableFixedColumns
          style={{ backgroundColor: 'white', border: '0.5px solid #eceff1', zIndex: 0 }}
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
            <Button id="per_button_reject" style={{ width: '130px', marginLeft: '5px', display: this.state.showbutton }}
              onClick={() => this.workingData(this.state.selectiondata, "reject")} color="danger" className="float-right">Reject</Button>
            <Button id="per_button_close" style={{ width: '130px', display: this.state.showbutton }}
              onClick={() => this.workingData(this.state.selectiondata, "Close")} color="success" className="float-right">Close</Button>
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
