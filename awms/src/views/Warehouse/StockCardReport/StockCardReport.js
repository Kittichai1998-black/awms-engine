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

const Axios = new apicall()


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

    }

  }
  async componentWillMount() {
    document.title = "Stock Card : AWMS";
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
    //permission
    let dataGetPer = await GetPermission()
    CheckWebPermission("STK_CARD", dataGetPer, this.props.history);
    //41	WarehouseCI_execute
  }



  dateTimePickerFrom() {
    return <DatePicker style={{ width: "300px" }} defaultDate={moment()} onChange={(e) => { this.setState({ dateFrom: e }) }} dateFormat="DD/MM/YYYY" />
  }
  dateTimePickerTo() {
    return <DatePicker style={{ width: "300px" }} defaultDate={moment()} onChange={(e) => { this.setState({ dateTo: e }) }} dateFormat="DD/MM/YYYY" />
  }


  onGetDocument() {
    console.log(this.state.ID)
    console.log(this.state.PackMasterdata)
    if (this.state.dateFrom === undefined || this.state.dateTo === undefined || this.state.ID === undefined) {
      alert("Please select data")
    } else if (this.state.data === []) {
      alert("SKU NOT RECIEV")
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
        console.log(this.state.ID)
        console.log(this.state.formatDateFrom)
        console.log(this.state.formatDateTo)

        let skuid = this.state.ID
        let batch = this.state.Batch
        let lot = this.state.Lot
        let orderno = this.state.Orderno

        Axios.get(window.apipath + "/api/report/sp?apikey=WCS_KEY&skuid=" + skuid + "&startDate=" + formatDateFrom + "&endDate=" + formatDateTo + "&batch=" + (batch === undefined ? '' : batch) + "&lot=" + (lot === undefined ? '' : lot) + "&orderno=" + (orderno === undefined ? '' : orderno) + "&spname=STOCK_CARD").then((rowselect1) => {

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
              Unit: x.Unit

            })
          })
          console.log(this.state.MovementType)

          this.setState({


            data: rowselect1.data.datas
            //   Date: rowselect1.data.datas.ActionTime,
            //   Batch: rowselect1.data.datas.Batch,
            //   Credit: rowselect1.data.datas.Credit,
            //   Debit: rowselect1.data.datas.Debit,
            //   Doc_Code: rowselect1.data.datas.Doc_Code,
            //   Doc_Type: rowselect1.data.datas.Doc_Type,
            //   MovementType: rowselect1.data.datas.MovementType,
            //   SKU_Code: rowselect1.data.datas.SKU_Code,
            //   SKU_Name: rowselect1.data.datas.SKU_Name,
            //   Total: rowselect1.data.datas.Total,
            //dd
          })

          console.log(this.state.data)
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

  render() {
    const cols = [
      {
        accessor: 'ActionTime', Header: 'Date', editable: false, Cell: (e) =>
          this.datetimeBody(e.value)
      },

      { accessor: 'Doc_Code', Header: 'Doc No', editable: false },
      { accessor: 'MovementType', Header: 'Description', editable: false },
      { accessor: 'Batch', Header: 'Batch', editable: false },
      { accessor: 'Debit', Header: 'Debit', editable: false, Footer:
        (<span><label>Sum :</label>{" "}{_.sumBy(this.state.data, 
        x => _.every(this.state.data, ["Unit",x.Base_Unit]) == true ?
        parseFloat(x.Debit) : null)}</span>) 
      },
      { accessor: 'Credit', Header: 'Credit', editable: false, Footer:
      (<span><label>Sum :</label>{" "}{_.sumBy(this.state.data, 
      x => _.every(this.state.data, ["Unit",x.Base_Unit]) == true ?
      parseFloat(x.Credit) : null)}</span>)  },
      { accessor: 'Total', Header: 'Balance', editable: false, Footer:
      (<span><label>Sum :</label>{" "}{_.sumBy(this.state.data, 
      x => _.every(this.state.data, ["Unit",x.Base_Unit]) == true ?
      parseFloat(x.Total) : null)}</span>)  },
      { accessor: 'Unit', Header: 'Unit', editable: false },
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

          <Row>
            <Col sm="12" style={{ marginTop: '3px', marginBottom: '3px' }}>
              <ExportFile column={cols} dataxls={this.state.data} filename={"StockCard"} style={{ width: "130px", marginLeft: '5px' }} className="float-right" />
              <Button className="float-right" style={{ width: "130px", marginRight: '5px' }} color="primary" id="off" onClick={() => { this.onGetDocument() }}>Select</Button>
            </Col>
          </Row>

        </div>
        <ReactTable pageSize="10000"  sortable={false} style={{ background: "white", marginBottom: "50px" }}
          filterable={false} showPagination={false} minRows={5} columns={cols} data={this.state.data} />
      </div>
    )
  }
}
export default StockCardReport;
