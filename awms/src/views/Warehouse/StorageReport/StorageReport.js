import React, { Component } from 'react';
import "react-table/react-table.css";
import ReactTable from 'react-table'
import moment from 'moment';
import { apicall, createQueryString } from '../ComponentCore';
import ExportFile from '../MasterData/ExportFile';
import { Button, Badge, Input, Row, Col ,Card,CardBody} from 'reactstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import _ from "lodash";
import withFixedColumns from "react-table-hoc-fixed-columns";
import { StorageObjectEventStatus } from '../Status'
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../ComponentCore/Permission';

const Axios = new apicall()
const ReactTableFixedColumns = withFixedColumns(ReactTable);

class StoragReport extends Component {

  constructor() {
    super();
    this.state = {
      data: [],
      loading: true,
      defaultPageS: 100,
      currentPage: 1,
      select: {
        queryString: window.apipath + "/api/viw",
        t: "r_StorageObject",
        q: '',
        f: "ID,Pallet,Warehouse,Area,Location,SKU_Code,SKU_Name,Batch,Lot,OrderNo,Qty,Base_Unit,Status,Receive_Time,Wei_PalletPack,Wei_Pack,concat(Wei_PalletPack, ' ','kg') AS WeiPallet,concat(Wei_Pack, ' ','kg') AS WeiPack,Receive_Date,Wei_PackStd,concat(FORMAT(Wei_PackStd, '0.000'), ' ','kg') AS WeiPackStd",
        g: "",
        s: "[{'f':'Pallet','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
      },
      datafilter: [],
      selectiondata: [],
      rowselect:[],
    }
    this.paginationButton = this.paginationButton.bind(this)
    this.pageOnHandleClick = this.pageOnHandleClick.bind(this)
    this.NextLastPage = this.NextLastPage.bind(this)
    this.customSorting = this.customSorting.bind(this);
    this.onHandleSelection = this.onHandleSelection.bind(this)
    this.getSelectionData = this.getSelectionData.bind(this);
    this.holdData = this.holdData.bind(this);

  }
  async componentWillMount() {
    document.title = "Storage Object - AWMS";
    let dataGetPer = await GetPermission()
    CheckWebPermission("Storage", dataGetPer, this.props.history);
  }
  componentDidMount() {
    this.getData();
  }

  getData() {
    Axios.get(createQueryString(this.state.select)).then(res => {
      let countpages = null;
      let counts = res.data.counts;
      countpages = Math.ceil(counts / this.state.defaultPageS);
      this.setState({ data: res.data.datas, countpages: countpages, loading: false })
    })
  }

  DatePickerFilter() {
    let filter = this.state.datafilter.filter(x => {
      return x.type !== "gt" && x.type !== "lt";
    });

    if (this.state.dateFrom && this.state.dateTo) {
      if (this.state.dateFrom)
        filter.push({ id: "Receive_Date", value: moment(this.state.dateFrom).format('YYYY-MM-DD'), type: "gt" });
      if (this.state.dateTo)
        filter.push({ id: "Receive_Date", value: moment(this.state.dateTo).format('YYYY-MM-DD'), type: "lt" });

      this.setState({ datafilter: filter }, () => { this.onCheckFliter(); });
    }
    
  }

  createCustomFilter(name) {
    return <Input autoComplete="off" type="text" id={name.column.id} style={{ background: "#FAFAFA" }} placeholder="filter..."
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


  createStatusField(data) {
    let strStatus = ""
    const results = StorageObjectEventStatus.filter(row => {
      return row.code === data.value
    })
  }

  createDropdownFilter(columns) {
    let list = StorageObjectEventStatus.map((x, idx) => {
    return <option key={idx} value={x.status}>{x.status}</option>
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

  onCheckFliter() {
    this.setState({ loading: true })
    let getFilter = this.state.datafilter;
    let listFilter = getFilter.map((x,index) => {
      if (x.type === "date")
        return { "f": x.id, "c": "=", "v": x.value }
      else if (x.type === "gt") {
        return { "f": x.id, "c": ">=", "v": x.value }
      }
      else if (x.type === "lt") {

        return { "f": x.id, "c": "<=", "v": x.value }
      }
      else
        return { "f": x.id, "c": "like", "v": x.value }
    })
    let strCondition = JSON.stringify(listFilter);
    let getSelect = this.state.select;
    getSelect["sk"] = 0
    this.setState({currentPage:1})
    getSelect.q = strCondition;
    this.setState({ select: getSelect }, () => { this.getData() })
  }

  datetimeBody(value) {
    if (value !== null) {
      const date = moment(value);
      return <div>{date.format('DD-MM-YYYY HH:mm')}</div>
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
            <li className="page-item" style={{display:"flex"}}><Button style={this.state.currentPage === 1 ? {...notPageactiveLast,marginRight:"5px"} : {pageactiveLast,marginRight:"5px"}}  outline color="success" onClick={() => this.NextLastPage("prev")}>{"<<"}</Button>{' '}<a className="page-link" style={this.state.currentPage === 1 ? notPageactive : pageactive}
              onClick={() => this.pageOnHandleClick("prev")}>
              Previous</a></li>
            <p style={{ margin: 'auto', minWidth: "60px", paddingRight: "10px", paddingLeft: "10px", verticalAlign: "middle" }}>Page : {this.state.currentPage} of {this.state.countpages === 0 || this.state.countpages === undefined ? '1' : this.state.countpages}</p>
            <li className="page-item" style={{display:"flex"}}> <a className="page-link" style={this.state.currentPage >= this.state.countpages || this.state.countpages === undefined ? notPageactive : pageactive}
              onClick={() => this.pageOnHandleClick("next")} >
              Next</a><Button style={this.state.currentPage >= this.state.countpages || this.state.countpages === undefined ? {...notPageactiveLast,marginLeft:"5px"} : {...pageactiveLast,marginLeft:"5px"}} outline color="success" onClick={() => this.NextLastPage("next")}>{">>"}</Button>{' '} </li> 
          </ul>
        </nav>
      </div>
    )
  }

  dateTimePickerFrom() {
    return <DatePicker selected={this.state.dateFrom}
      customInput={<Input />}
      onChange={(e) => {
        if (e === null) {
          this.setState({ dateFrom: null })
        }
        else {
          if (e.isValid() && e !== null) {
            this.setState({ dateFrom: e })
          }
        }

      }}
      timeIntervals={1}
      timeFormat="HH:mm"
      timeCaption="Time"
      showTimeSelect={false}
      dateFormat={"DD-MM-YYYY"} />

    //<DatePicker style={{ width: "300px" }} defaultDate={moment()} onChange={(e) => { this.setState({ dateFrom: e }) }} dateFormat="DD/MM/YYYY" selected={this.state.dateFrom} />
  }
  dateTimePickerTo() {
    return <DatePicker selected={this.state.dateTo}
      
      customInput={<Input/>}
      onChange={(e) => {
        if (e === null) {
          this.setState({ dateFrom: null })
        }
        else {
          if (e.isValid() && e !== null) {
            this.setState({ dateTo: e })
          }
        }

      }}
      timeIntervals={1}
      timeFormat="HH:mm"
      timeCaption="Time"
      showTimeSelect={false}
      dateFormat={"DD-MM-YYYY"} />
    //<DatePicker style={{ width: "300px", }} defaultDate={moment()} onChange={(e) => { this.setState({ dateTo: e }) }} dateFormat="DD/MM/YYYY" selected={this.state.dateTo} />
  }




  NextLastPage(position){
    this.setState({ loading: true })
    let queryString = "";
    const select = this.state.select
     if (position === 'next') {   
       select.sk = ((this.state.countpages * 100 ) - 100)
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
            this.setState({currentPage:(this.state.countpages)})
          }
          else {
            this.setState({currentPage:1})
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

  sumFooterQty(value) {
    var sumVal = _.sumBy(this.state.data,
      x => _.every(this.state.data, ["Base_Unit", x.Base_Unit]) === true ?
        parseFloat(x[value]) : null)
    if (sumVal === 0 || sumVal === null || sumVal === undefined)
      return '-'
    else
      return sumVal.toFixed(3)
  }

  sumFooter(value) {
    var sumVal = _.sumBy(this.state.data, x => parseFloat(x[value]))
    if (sumVal === 0 || sumVal === null || sumVal === undefined)
      return '-'
    else
      return sumVal.toFixed(3)
  }

  createSelection(rowdata) {
    return <input
      className="selection"
      type="checkbox"
      name="selection"
      onChange={(e) => this.onHandleSelection(rowdata, e.target.checked)} />
  }

  onHandleSelection(rowdata, value) {
    let rowselect = this.state.rowselect;
    if (value) {
      rowselect.push(rowdata.original)
    }
    else{
      rowselect = rowselect.filter(x => {
        return rowdata.original.ID !== x.ID
      });
    }
    this.setState({ rowselect: rowselect }, () => { this.getSelectionData(this.state.rowselect) })
  }

  getSelectionData(data) {
    this.setState({ selectiondata: data })
  }

  holdData(data, status) {
    let bstosID = []

    if (data.length > 0) {
      data.forEach(rowdata => {
        bstosID.push(rowdata.ID)
      })
      let postdata = { bstosID : bstosID ,type: status}

      if (status === "hold") {
        Axios.post(window.apipath + "/api/wm/VRMapSTO/hold", postdata).then((res) => {
          this.setState({ resp: res.data._result.message })
          this.getData();
        })
      }
      else {
        Axios.post(window.apipath + "/api/wm/VRMapSTO/hold", postdata).then((res) => {
          this.setState({ resp: res.data._result.message })
          this.getData();
        })
      }
    }
  }

  render() {

    let cols = [
      {
        Header: '', sortable: false, filterable: false, sortable: false, className: "text-center", fixed: "left", minWidth: 50,
        Cell: (e) => this.createSelection(e)
      },
      {
        Header: 'No.', fixed: "left", sortable: false, filterable: false, className: 'center', minWidth: 45, maxWidth: 45,
        Footer: <span style={{ fontWeight: 'bold' }}>Total</span>,
        Cell: (e) => {
          let numrow = 0;
          if (this.state.currentPage !== undefined) {
            if (this.state.currentPage > 1) {
              // e.index + 1 + (2*100)  
              numrow = e.index + 1 + ((parseInt(this.state.currentPage) - 1) * parseInt(this.state.defaultPageS));
            } else {
              numrow = e.index + 1;
            }
          }
          return <span style={{ fontWeight: 'bold' }}>{numrow}</span>
        },
        getProps: (state, rowInfo) => ({
          style: {
            backgroundColor: '#c8ced3'
          }
        })
      },
      {
        accessor: 'Status', Header: 'Status', fixed: "left", editable: false, width: 90, Filter: (e) => this.createDropdownFilter(e), minWidth: 120,
        Cell: row => {
          return  <h5><Badge color={row.value}>{row.value}</Badge></h5> 
        }
          
        
      },
      { accessor: 'Pallet', fixed: "left", Header: 'Pallet', Filter: (e) => this.createCustomFilter(e), sortable: true, minWidth: 100 },
      { accessor: 'SKU_Code', fixed: "left", Header: 'SKU Code', Filter: (e) => this.createCustomFilter(e), sortable: true, minWidth: 115 },
      { accessor: 'SKU_Name', Header: 'SKU Name', Filter: (e) => this.createCustomFilter(e), sortable: true, },
      { accessor: 'Warehouse', Header: 'Warehouse', Filter: (e) => this.createCustomFilter(e), sortable: true, },
      { accessor: 'Area', Header: 'Area', Filter: (e) => this.createCustomFilter(e), sortable: true },
      { accessor: 'Location', Header: 'Location', Filter: (e) => this.createCustomFilter(e), sortable: true },

      { accessor: 'Batch', Header: 'Batch', Filter: (e) => this.createCustomFilter(e), sortable: true },
      { accessor: 'Lot', Header: 'Lot', Filter: (e) => this.createCustomFilter(e), sortable: true },
      { accessor: 'OrderNo', Header: 'Order No.', Filter: (e) => this.createCustomFilter(e), sortable: true },

      {
        accessor: 'Qty', Header: 'Base Qty', editable: false, filterable: false, className: "right",
        getFooterProps: () => ({
          style: {
            backgroundColor: '#c8ced3'
          }
        }),
        Footer:
          (<span style={{ fontWeight: 'bold' }}>{this.sumFooterQty("Qty")}</span>)
      },
      { accessor: 'Base_Unit', Header: 'Base Unit', Filter: (e) => this.createCustomFilter(e), sortable: false, },
      {
        accessor: 'Wei_PalletPack', Header: 'Weight Pallet (kg)', filterable: false, sortable: false, className: "right",
        getFooterProps: () => ({
          style: {
            backgroundColor: '#c8ced3'
          }
        }),
        Footer:
          (<span style={{ fontWeight: 'bold' }}>{this.sumFooter("WeiPallet")}</span>)
      },
      {
        accessor: 'Wei_Pack', Header: 'Weight Pack (kg)', filterable: false, sortable: false, className: "right",
        getFooterProps: () => ({
          style: {
            backgroundColor: '#c8ced3'
          }
        }),
        Footer:
          (<span style={{ fontWeight: 'bold' }}>{this.sumFooter("WeiPack")}</span>)
      },
      {
        accessor: 'Wei_PackStd', Header: 'Weight Standard (kg)', filterable: false, sortable: false, className: "right",
        getFooterProps: () => ({
          style: {
            backgroundColor: '#c8ced3'
          }
        }),
        Footer:
          (<span style={{ fontWeight: 'bold' }}>{this.sumFooter("Wei_PackStd")}</span>)
      },
      {
        accessor: 'Receive_Time', Header: 'Received Date', filterable: false, sortable: true, minWidth: 140, maxWidth: 140, Cell: (e) =>
          this.datetimeBody(e.value)
      },
    ];

    return (

      <div>
        <div className="clearfix" style={{ paddingBottom: '3px' }}>
          <Row>
            <Col xs="4.2">
              <span >Received Date From: </span>
              <div style={{ display: "inline-block", width: "300px", marginLeft: '5px' }}>
                {this.dateTimePickerFrom()}
              </div>
            </Col>


            <Col xs="4.2">
              <span >Received Date To: </span>
              <div style={{ display: "inline-block", width: "300px", marginLeft: '5px' }}>
                {this.dateTimePickerTo()}
              </div>      
            </Col>
          </Row>


          <Row style={{ marginTop: '3px', marginBottom: '3px' }}>
            <Col xs="6"></Col>
            <Col xs="6">
              <div>
                <div className="float-right">
               <ExportFile column={cols} dataselect={this.state.select} filename={"StorageReport"} />
                </div>
                <Button color="primary" className="float-right" style={{ width: "130px", marginRight: '5px' }} onClick={() => { this.DatePickerFilter() }}>Select</Button>
              </div>
            </Col>
          </Row>
         
        </div>
        <ReactTableFixedColumns
          style={{ backgroundColor: 'white', border: '0.5px solid #eceff1',maxHeight: '550px' }}
          minRows={5}
          loading={this.state.loading}
          columns={cols}
          data={this.state.data}
          editable={false}
          className="-highlight"
          multiSort={false}
          filterable={true}
          defaultPageSize={this.state.defaultPageS}
          PaginationComponent={this.paginationButton}
          onSortedChange={(sorted) => {
            this.setState({ data: [], loading: true });
            this.customSorting(sorted)
          }}
        />
         <Card>
          <CardBody>
            <Button style={{ width: '130px', marginLeft: '5px', display: this.state.showbutton }}
              onClick={() => this.holdData(this.state.selectiondata, "unhold")} color="danger" className="float-right">UnHold</Button>
            <Button style={{ width: '130px', display: this.state.showbutton }}
              onClick={() => this.holdData(this.state.selectiondata, "hold")} color="success" className="float-right">Hold</Button>
            {this.state.resp}
          </CardBody>
        </Card>
      </div>

    )
  }
}

export default StoragReport;
