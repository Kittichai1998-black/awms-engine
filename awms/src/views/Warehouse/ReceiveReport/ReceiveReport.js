import React, { Component } from 'react';
import "react-table/react-table.css";
import { Button, Row, Col, Input } from 'reactstrap';
import ReactTable from 'react-table';
import queryString from 'query-string'
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

class ReceiveReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data1: [],
      data: [],
      batch: "",
      loading: false,
      Mode: 1,
    }

    this.setTitle = this.setTitle.bind(this)
    this.sumFooterTotal = this.sumFooterTotal.bind(this)
  }
  async componentWillMount() {
    document.title = "Receive Report : AWMS";
    //permission
    let dataGetPer = await GetPermission()
    CheckWebPermission("STK_CARD", dataGetPer, this.props.history);
    //80	STC_view

  }

  dateTimePicker() {
    return <DatePicker style={{ width: "300px" }} defaultDate={moment()} onChange={(e) => { this.setState({ date: e }) }} dateFormat="DD/MM/YYYY" />
  }

  componentDidMount() {
    this.setTitle()
  }



  setTitle() {

    const values = this.props.location.pathname.split('/')
    console.log(values)
    if (values[2].toLowerCase() === 'gr') {
      document.title = "Receive Report : AWMS";
      this.setState({ Mode: 1001 })
      this.setState({ showbutton: "none" })

    }
    else if (values[2].toLowerCase() === 'gi') {
      document.title = "Issue Report : AWMS";
      this.setState({ Mode: 1002 })
      this.setState({ showbutton: "none" })
    }

  }

  onGetDocument() {
    // console.log(this.state.ID)
    // console.log(this.state.PackMasterdata)
    if (this.state.date === undefined) {
      alert("Please select data")   
    } else {
      let formatDate = this.state.date.format("YYYY-MM-DD")
      console.log(formatDate)

        // let namefileDate = formatDate.toString();
        // //let nameFlie = "STC :" + this.state.CodePack + " " + namefileDateTo + " to " + namefileDateFrom
        // this.setState({ name: nameFlie.toString() })

        Axios.get(window.apipath + "/api/report/sp?apikey=FREE03&date=" + formatDate
          + "&doctype=" + this.state.Mode
          + "&spname=STOCK_DAY").then((rowselect1) => {
            if (rowselect1) {
              if (rowselect1.data._result.status !== 0) {
                let countpages = null;
                let counts = rowselect1.data.datas.length;
                countpages = Math.ceil(counts / this.state.defaultPageS);
                rowselect1.data.datas.forEach(x => {
                  this.setState({
                    AreaLocationMaster: x.AreaLocationMaster,
                    Batch: x.Batch,
                    Code: x.Code,
                    Lot: x.Lot,
                    Name: x.Name,
                    SKUCode: x.SKUCode,
                    OrderNo: x.OrderNo,
                    UnitType: x.UnitType,
                    RefID: x.RefID,
                    Quantity: x.Quantity
                  })
                })
                this.setState({
                  data: rowselect1.data.datas, countpages: countpages, loading: false
                })
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


  sumFooterTotal(value) {
    var sumVal = _.sumBy(this.state.data,
      x => _.every(this.state.data, ["UnitType", x.UnitType]) == true ?
        parseFloat(x[value]) : null)
        console.log(sumVal)
    if (sumVal === 0 || sumVal === null || sumVal === undefined)
      return '-'
    else
      return sumVal.toFixed(3)
  }

  render() {
    const cols = [
      {
        Header: 'No.', fixed: "left", filterable: false, sortable: false, className: 'center', minWidth: 45, maxWidth: 45,
        Footer: <span style={{ fontWeight: 'bold' }}>Total</span>,
        id: "row",
        Cell: (row) => {
          return <span style={{ fontWeight: 'bold' }}>{row.index + 1}</span>;
        },
        getProps: (state, rowInfo) => ({
          style: {
            backgroundColor: '#c8ced3'
          }
        })
      },
      { accessor: 'Code', Header: 'Code', editable: false, sortable: false },
      { accessor: 'SKUCode', Header: 'SKU Code', editable: false, sortable: false, },
      { accessor: 'Name', Header: 'SKU Name', editable: false, sortable: false, },
      { accessor: 'Batch', Header: 'Batch', editable: false, sortable: false, },
      { accessor: 'Lot', Header: 'Lot', editable: false, sortable: false, },
      { accessor: 'OrderNo', Header: 'Order No', editable: false, sortable: false, },
      { accessor: 'AreaLocationMaster', Header: 'Location', editable: false, sortable: false },
      { accessor: 'RefID', Header: 'SAP.Doc/DO No.', editable: false, sortable: false },
      {
        accessor: 'Quantity', Header: 'Quantity', editable: false, className: "right",
        getFooterProps: () => ({
          style: {
            backgroundColor: '#c8ced3'
          }
        }),
        Footer:
          (<span style={{ fontWeight: 'bold' }}>{this.sumFooterTotal("Quantity")}</span>)
      },
      { accessor: 'UnitType', Header: 'Unit', editable: false, sortable: false, },
    ];
    return (
      <div>
        <div>
          <Row>
            <Col xs="6">
              <div>
                <label >Date : </label>
                <div style={{ display: "inline-block", width: "300px", marginLeft: '14px' }}>
                  {this.state.pageID ? <span>{this.state.date.format("DD-MM-YYYY")}</span> : this.dateTimePicker()}
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
          defaultPageSize={100000}
          columns={cols}
          data={this.state.data}
          filterable={false}
          multiSort={false}
          className="-highlight"
          showPagination={false}

        />
      </div>
    )
  }
}
export default ReceiveReport;
