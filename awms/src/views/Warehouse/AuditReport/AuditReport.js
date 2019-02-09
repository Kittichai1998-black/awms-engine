import React, { Component } from 'react';
import "react-table/react-table.css";
import { Button, Row, Col, Input } from 'reactstrap';
import ReactTable from 'react-table';
//import Axios from 'axios';
import { apicall, AutoSelect, DatePicker, createQueryString } from '../ComponentCore';
//import DatePicker from 'react-datepicker';
import moment from 'moment';
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../ComponentCore/Permission';
import ExportFile from '../MasterData/ExportFile';
import _ from 'lodash';
import withFixedColumns from "react-table-hoc-fixed-columns";

const Axios = new apicall()
const ReactTableFixedColumns = withFixedColumns(ReactTable);


class AuditReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data1: [],
      data: [],
      PackMaster: {
        queryString: window.apipath + "/api/mst",
        t: "SKUMaster",
        q: '[{ "f": "Status", "c":"=", "v": 1}]',
        f: "ID,concat(Code,' : ',Name) as PackName , Code",
        g: "",
        s: "[{'f':'Code','od':'asc'}]",
        sk: 0,
        l: 0,
        all: "",
      },
      Document: {
        queryString: window.apipath + "/api/trx",
        t: "Document",
        q: '[{ "f": "DocumentType_ID", "c":"=", "v": 2004}]',
        f: "*",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 0,
        all: "",
      },
      DocAudit:[],
      PackMasterdata: [],
      batch: "",
      defaultPageS: 100,
      currentPage: 1,
      loading: false,
    }
    this.paginationButton = this.paginationButton.bind(this)
    this.pageOnHandleClick = this.pageOnHandleClick.bind(this)
    this.customSorting = this.customSorting.bind(this);
  }
  async componentWillMount() {
    //permission
    let dataGetPer = await GetPermission()
    CheckWebPermission("AudReport", dataGetPer, this.props.history);
    // 52 Audit_view
    document.title = "Audit Report : AWMS";
    Axios.get(createQueryString(this.state.PackMaster)).then((response) => {
      const PackMasterdata = []
      response.data.datas.forEach(row => {
        var PackData = row.PackName
        var PackCode = row.Code
        var ID = row.ID
        PackMasterdata.push({ label: PackData, value: ID, Code: PackCode })
      })
      this.setState({ PackMasterdata })
    })
//=======================================================================================
    Axios.get(createQueryString(this.state.Document)).then((res) => {
      const DocAudit = []
      console.log(res)
      res.data.datas.forEach(row => {
        console.log(row)
        DocAudit.push({ label: row.Code, value: row.ID, Code: row.Code })
      })
      this.setState({ DocAudit })
    })

    

  }

  dateTimePickerFrom() {
    return <DatePicker style={{ width: "300px" }} defaultDate={moment()} onChange={(e) => { this.setState({ dateFrom: e }) }} dateFormat="DD/MM/YYYY" />
  }
  dateTimePickerTo() {
    return <DatePicker style={{ width: "300px" }} defaultDate={moment()} onChange={(e) => { this.setState({ dateTo: e }) }} dateFormat="DD/MM/YYYY" />
  }

  onGetDocument() {
    console.log(this.state.auditID)

    if (this.state.data === []) {
      alert("DATA NOT FOUND")
    } else {

        let auditID = this.state.auditID


        Axios.get(window.apipath + "/api/report/sp?apikey=FREE03&documentID=" + auditID
          + "&spname=STOCK_AUDIT_2").then((rowselect1) => {
            if (rowselect1) {
              // console.log(rowselect1)
              if (rowselect1.data._result.status !== 0) {
                let countpages = null;
                let counts = rowselect1.data.datas.length;
                countpages = Math.ceil(counts / this.state.defaultPageS);
                rowselect1.data.datas.forEach(x => {
                  this.setState({
                    BaseCode: x.BaseCode,
                    PackCode: x.PackCode,
                    PackName: x.PackName,
                    Batch: x.Batch,
                    Lot: x.Lot,
                    OrderNo: x.OrderNo,
                    AuditQty: x.AuditQty,
                    OriginQty: x.OriginQty,
                    TotalQty: x.TotalQty,
                    AuditBy: x.AuditBy,
                    AuditTime: x.AuditTime,
                    UnitCode: x.UnitCode
                  })
                })
                this.setState({
                  data: rowselect1.data.datas, countpages: countpages, loading: false
                }, () => console.log(this.state.data))
              }
            }
          })
    }
  }
  datetimeBody(value) {
    if (value !== null) {
      const date = moment(value);
      return <div>{date.format('DD-MM-YYYY HH:mm:ss')}</div>
    }
  }
  sumFooter(value) {
    var sumVal = _.sumBy(this.state.data,
      x => _.every(this.state.data, ["UnitCode", x.UnitCode]) == true ?
        parseFloat(x[value]) : null)
    if (sumVal === 0 || sumVal === null || sumVal === undefined)
      return '-'
    else
      return sumVal.toFixed(3)
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
        accessor: 'AuditTime', Header: 'Date', editable: false, sortable: true, Cell: (e) =>
          this.datetimeBody(e.value)
      },
      { accessor: 'BaseCode', Header: 'Pallet', editable: false, sortable: true },
      //{ accessor: 'PackCode', Header: 'SKU Code', editable: false, sortable: true },
      { accessor: 'PackCode', Header: 'SKU Code', editable: false, sortable: true, minWidth: 115 },
      { accessor: 'PackName', Header: 'SKU Name', editable: false, sortable: true },
      { accessor: 'Batch', Header: 'Batch', editable: false, sortable: true },
      { accessor: 'Lot', Header: 'Lot', editable: false, sortable: true },
      { accessor: 'OrderNo', Header: 'Order No.', editable: false, sortable: true },
      {
        accessor: 'AuditQty', Header: 'Audit Qty', editable: false, className: "right",
        getFooterProps: () => ({
          style: {
            backgroundColor: '#c8ced3'
          }
        }),
        Footer:
          (<span style={{ fontWeight: 'bold' }}>{this.sumFooter("AuditQty")}</span>)
      },
      {
        accessor: 'OriginQty', Header: 'Origin Qty', editable: false, className: "right",
        getFooterProps: () => ({
          style: {
            backgroundColor: '#c8ced3'
          }
        }),
        Footer:
          (<span style={{ fontWeight: 'bold' }}>{this.sumFooter("OriginQty")}</span>)
      },

      {
        accessor: 'TotalQty', Header: 'Total Qty', editable: false, className: "right", 
        getFooterProps: () => ({
          style: {
            backgroundColor: '#c8ced3'
          }
        }),
        Footer:
          (<span style={{ fontWeight: 'bold' }}>{this.sumFooter("TotalQty")}</span>)
      },    
      { accessor: 'UnitCode', Header: 'Unit', editable: false, sortable: true },
      { accessor: 'AuditBy', Header: 'AuditBy', editable: false, sortable: true },

    ];
    return (
      <div>
        <div>
              <div>
                <label style={{ marginRight: "10px" }} >Document Audit : </label>
                <div style={{ display: "inline-block", width: "300px", marginLeft: '36px' }}>
                  <AutoSelect data={this.state.DocAudit} result={e => this.setState({ auditID: e.value })} />

                </div>
              </div>

          <Row style={{ marginTop: '3px', marginBottom: '3px' }}>
          <Col xs="6"></Col>
            <Col xs="6">
            <div>
                <div className="float-right">
              <ExportFile column={cols} dataxls={this.state.data} filename={"AuditReport"} />
              </div>
              <Button className="float-right" style={{ width: "130px", marginRight: '5px' }} color="primary" id="off" onClick={() => { this.onGetDocument() }}>Select</Button>
              </div>
            </Col>
          </Row>
        </div>
        <ReactTableFixedColumns
          style={{ backgroundColor: 'white', border: '0.5px solid #eceff1', zIndex: 0, marginBottom: "20px" }}
          minRows={5}
          loading={this.state.loading}
          columns={cols}
          data={this.state.data}
          multiSort={false}
          filterable={false}
          className="-highlight"
          defaultPageSize={this.state.defaultPageS}
          PaginationComponent={this.paginationButton}
          onSortedChange={(sorted) => {
            this.setState({ data: [], loading: true });
            this.customSorting(sorted)
          }}
        />
      </div>
    )
  }
}
export default AuditReport;
