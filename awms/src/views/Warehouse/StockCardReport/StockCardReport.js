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

class StockCardReport extends Component {
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
    document.title = "Stock Card : AWMS";
    //permission
    let dataGetPer = await GetPermission()
    CheckWebPermission("STK_CARD", dataGetPer, this.props.history);
    //41	WarehouseCI_execute
    Axios.get(createQueryString(this.state.PackMaster)).then((response) => {
      const PackMasterdata = []
      response.data.datas.forEach(row => {
        var PackData = row.PackName
        var PackCode = row.PackCode
        var ID = row.ID
        PackMasterdata.push({ label: PackData, value: ID })
      })
      this.setState({ PackMasterdata })
    })
  }

  dateTimePickerFrom() {
    return <DatePicker style={{ width: "300px" }} defaultDate={moment()} onChange={(e) => { this.setState({ dateFrom: e }) }} dateFormat="DD/MM/YYYY" />
  }
  dateTimePickerTo() {
    return <DatePicker style={{ width: "300px" }} defaultDate={moment()} onChange={(e) => { this.setState({ dateTo: e }) }} dateFormat="DD/MM/YYYY" />
  }


  onGetDocument() {
    // console.log(this.state.ID)
    // console.log(this.state.PackMasterdata)
    if (this.state.dateFrom === undefined || this.state.dateTo === undefined || this.state.ID === undefined) {
      alert("Please select data")
    } else if (this.state.data === []) {
      alert("SKU NOT RECIEVE")
    } else {
      let formatDateFrom = this.state.dateFrom.format("YYYY-MM-DD")
      let formatDateTo = this.state.dateTo.format("YYYY-MM-DD")

      if (formatDateFrom > formatDateTo) {
        alert("Choose the wrong information")
      } else {
        let namefileDateFrom = formatDateFrom.toString();
        let namefileDateTo = formatDateTo.toString();
        let nameFlie = "STC :" + this.state.CodePack + " " + namefileDateTo + " to " + namefileDateFrom
        this.setState({ name: nameFlie.toString() })
        // console.log(this.state.ID)
        // console.log(this.state.formatDateFrom)
        // console.log(this.state.formatDateTo)

        let skuid = this.state.ID
        let batch = this.state.Batch
        let lot = this.state.Lot
        let orderno = this.state.Orderno

        Axios.get(window.apipath + "/api/report/sp?apikey=WCS_KEY&skuid=" + skuid
          + "&startDate=" + formatDateFrom
          + "&endDate=" + formatDateTo
          + "&batch=" + (batch === undefined ? '' : batch)
          + "&lot=" + (lot === undefined ? '' : lot)
          + "&orderno=" + (orderno === undefined ? '' : orderno)
          + "&spname=STOCK_CARD").then((rowselect1) => {
            if (rowselect1) {
              if (rowselect1.data._result.status !== 0) {
                let countpages = null;
                let counts = rowselect1.data.datas.length;
                countpages = Math.ceil(counts / this.state.defaultPageS);
                rowselect1.data.datas.forEach(x => {
                  this.setState({
                    Date: x.ActionTime,
                    Credit: x.Credit,
                    Debit: x.Debit,
                    Doc_Code: x.Doc_Code,
                    Doc_Type: x.Doc_Type,
                    MovementType: x.MovementType,
                    SKU_Code: x.SKU_Code,
                    SKU_Name: x.SKU_Name,
                    Total: x.Total,
                    Unit: x.Unit,
                    RefID: x.RefID,
                    Ref2: x.Ref2
                  }, () => console.log(this.state.MovementType))
                })
                this.setState({
                  data: rowselect1.data.datas, countpages: countpages, loading: false
                }, () => console.log(this.state.data))
              }
            }
          })
      }
    }
  }
  datetimeBody(value) {
    if (value !== null) {
      const date = moment(value);
      return <div>{date.format('DD-MM-YYYY')}</div>
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

  sumFooterTotal(value) {
    var sumVal = _.sumBy(this.state.data,
      x => _.every(this.state.data, ["Base_Unit", x.Base_Unit]) == true ?
        parseFloat(x[value]) : null)
    if (sumVal === 0 || sumVal === null || sumVal === undefined)
      return '-'
    else
      return sumVal
  }

  render() {
    const cols = [
      {
        Header: 'No.', fixed: "left", filterable: false, sortable: false, className: 'center', minWidth: 45, maxWidth: 45,
        Footer: <span style={{ fontWeight: 'bold' }}>Total</span>,
        Cell: (e) => {
          let numrow = 0;
          if (this.state.currentPage !== undefined) {
            if (this.state.currentPage > 1) {
              // e.index + 1 + (2*100)  
              numrow = e.index + 1 + (parseInt(this.state.currentPage) * parseInt(this.state.defaultPageS));
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
        accessor: 'ActionTime', Header: 'Date', editable: false, sortable: true, Cell: (e) =>
          this.datetimeBody(e.value)
      },
      { accessor: 'Doc_Code', Header: 'Doc No.', editable: false, sortable: true },
      { accessor: 'MovementType', Header: 'Description', editable: false, sortable: true },
      { accessor: 'Batch', Header: 'Batch', editable: false, sortable: true, },
      { accessor: 'MovementType', Header: 'Description', editable: false, sortable: true },
      { accessor: 'Ref2', Header: 'MovementType', editable: false, sortable: true },
      { accessor: 'RefID', Header: 'Ref.DO No.', editable: false, sortable: true },
      {
        accessor: 'Debit', Header: 'Debit', editable: false, className: "right",
        getFooterProps: () => ({
          style: {
            backgroundColor: '#c8ced3'
          }
        }),
        Footer:
          (<span style={{ fontWeight: 'bold' }}>{this.sumFooterTotal("Debit")}</span>)
      },

      {
        accessor: 'Credit', Header: 'Credit', editable: false, className: "right",
        getFooterProps: () => ({
          style: {
            backgroundColor: '#c8ced3'
          }
        }),
        Footer:
          (<span style={{ fontWeight: 'bold' }}>{this.sumFooterTotal("Credit")}</span>)
      },

      {
        accessor: 'Total', Header: 'Total', editable: false, className: "right",
        getFooterProps: () => ({
          style: {
            backgroundColor: '#c8ced3'
          }
        }),
        Footer:
          (<span style={{ fontWeight: 'bold' }}>{this.sumFooterTotal("Total")}</span>)
      },
      // {
      //   accessor: 'Debit', Header: 'Debit', editable: false, sortable: true, Footer:
      //     (<span><label>Sum :</label>{" "}{_.sumBy(this.state.data,
      //       x => _.every(this.state.data, ["Unit", x.Base_Unit]) == true ?
      //         parseFloat(x.Debit) : null)}</span>)
      // },
      // {
      //   accessor: 'Credit', Header: 'Credit', editable: false, sortable: true, Footer:
      //     (<span><label>Sum :</label>{" "}{_.sumBy(this.state.data,
      //       x => _.every(this.state.data, ["Unit", x.Base_Unit]) == true ?
      //         parseFloat(x.Credit) : null)}</span>)
      // },
      // {
      //   accessor: 'Total', Header: 'Balance', editable: false, sortable: true, Footer:
      //     (<span><label>Sum :</label>{" "}{_.sumBy(this.state.data,
      //       x => _.every(this.state.data, ["Unit", x.Base_Unit]) == true ?
      //         parseFloat(x.Total) : null)}</span>)
      // },
      { accessor: 'Unit', Header: 'Unit', editable: false, sortable: true },
    ];
    return (
      <div>
        <div>
          <Row>
            <Col xs="6">
              <div>
                <label style={{ marginRight: "10px" }} >SKU : </label>
                <div style={{ display: "inline-block", width: "300px", marginLeft: '36px' }}>
                  <AutoSelect data={this.state.PackMasterdata} result={e => this.setState({ ID: e.value })} />

                </div>
              </div>
            </Col>
            <Col xs="6">
              <div className=""><label>Batch : </label>
                <Input onChange={(e) => this.setState({ Batch: e.target.value })} style={{ display: "inline-block", width: "300px", marginLeft: '28px' }}
                  value={this.state.Batch} />
              </div>
            </Col>

          </Row>
          <Row>
            <Col xs="6">
              <div className=""><label>Lot : </label>
                <Input onChange={(e) => this.setState({ Lot: e.target.value })} style={{ display: "inline-block", width: "300px", marginLeft: '50px' }}
                  value={this.state.Lot} />
              </div>
            </Col>
            <Col xs="6">
              <div className=""><label>Order No : </label>
                <Input onChange={(e) => this.setState({ Orderno: e.target.value })} style={{ display: "inline-block", width: "300px", marginLeft: '5px' }}
                  value={this.state.Orderno} />
              </div>
            </Col>
          </Row>
          <Row>
            <Col xs="6">
              <div >
                <label>Date From : </label>
                <div style={{ display: "inline-block", width: "300px", marginLeft: '5px' }}>
                  {this.state.pageID ? <span>{this.state.dateFrom.format("DD-MM-YYYY")}</span> : this.dateTimePickerFrom()}
                </div></div>
            </Col>

            <Col xs="6">
              <div>
                <label >Date To : </label>
                <div style={{ display: "inline-block", width: "300px", marginLeft: '14px' }}>
                  {this.state.pageID ? <span>{this.state.dateTo.format("DD-MM-YYYY")}</span> : this.dateTimePickerTo()}
                </div>
              </div>
            </Col>
          </Row>

          <Row style={{ marginTop: '3px', marginBottom: '3px' }}>
            <Col xs="6"></Col>
            <Col xs="6">
              <div>
                <div className="float-right">
                  <ExportFile column={cols} dataxls={this.state.data} filename={"StockCard"} />
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
          filterable={false}
          multiSort={false}
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
export default StockCardReport;
