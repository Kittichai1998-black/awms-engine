import React, { Component } from 'react';
import "react-table/react-table.css";
import { Input, Card, CardBody, Button, Row, Col } from 'reactstrap';
import ReactTable from 'react-table'
//import Axios from 'axios';
import { apicall, DatePicker, createQueryString } from '../../../ComponentCore'
import queryString from 'query-string'
import _ from 'lodash'
import { DocumentEventStatus } from '../../../Status'
import moment from 'moment';
import withFixedColumns from "react-table-hoc-fixed-columns";
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../../../ComponentCore/Permission';

const Axios = new apicall()
const ReactTableFixedColumns = withFixedColumns(ReactTable);

class IssuedDoc extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      data2: [],

    };
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.displayButtonByPermission = this.displayButtonByPermission.bind(this)
    this.dateTimePicker = this.dateTimePicker.bind(this)
  }
  async componentWillMount() {
    document.title = "Receive Document : AWMS";
    let dataGetPer = await GetPermission()
    this.displayButtonByPermission(dataGetPer)
  }
  displayButtonByPermission(dataGetPer) {
    // 20 TransGRD_execute
    if (!CheckViewCreatePermission("TransGRD_execute", dataGetPer)) {
      this.props.history.push("/404")
    }
  }
  componentDidMount() {
    const values = queryString.parse(this.props.location.search)
    var ID = values.docID.toString()
    if (values.docID) {
      Axios.get(window.apipath + "/api/wm/received/doc/?docID=" + ID + "&getMapSto=true").then(res => {
        if (res.data._result.status === 1) {
          if (res.data.bstos.length === 0) {
            this.setState({ check: undefined })
          }

          res.data.document.documentItems.forEach(x=>{
            var sumQty = 0;
            res.data.bstos.filter(y=>y.docItemID==x.id).forEach(y=>{sumQty+=y.distoQty});
            x.sumQty2 = sumQty;

          });

          res.data.document.documentItems.forEach(x => {

            this.setState({
              batch: x.batch,
              lot: x.lot,
              orderNo: x.orderNo,
              quantityDoc: x.quantity,
              unitType_NameDoc: x.unitType_Name

            })
          })

          this.setState({
            souWarehouseName: res.data.document.souWarehouseName,
            DocumentCode: res.data.document.code,
            Remark: res.data.document.remark,
            souBranchName: res.data.document.souBranchName,
            desWarehouseName: res.data.document.desWarehouseName,
            desBranchName: res.data.document.desBranchName,
            Eventstatus: res.data.document.eventStatus,
            Super: res.data.document.Super,
            refID: res.data.document.refID,
            ref1: res.data.document.ref1,
            ref2: res.data.document.ref2,
            documentDate: moment(res.data.document.documentDate).format("DD-MM-YYYY")
          })



          var groupPack = _.groupBy(res.data.bstos, "code")
          var groupdocItemID = _.groupBy(res.data.document.documentItems, "id")

          let sumArr = []
          let sumArr1 = []

          for (let res1 in groupdocItemID) {
            let sum = 0
            groupdocItemID[res1].forEach(res2 => {
              sum += res2.quantity
              res2.sumQty1 = sum
              // res2.batch = this.state.batch
              // res2.lot = this.state.lot
              // res2.orderNo = this.state.orderNo
              res2.quantityDoc = this.state.quantityDoc


            })

            sumArr1.push(groupdocItemID[res1][groupdocItemID[res1].length - 1])
          }

          for (let res1 in groupPack) {
            let sum = 0
            groupPack[res1].forEach(res2 => {
              // res2.batch = this.state.batch
              // res2.lot = this.state.lot
              // res2.orderNo = this.state.orderNo
              sum += res2.distoQty
              res2.sumQty = sum

              sumArr.forEach(response => {
                if (response.code === res2.code) {
                  res2.code = "";
                }
              })
            })
            sumArr.push(groupPack[res1][groupPack[res1].length - 1])
          }


          var sumQTYPack = 0
          var result = res.data.document.documentItems
          this.setState({ data2: sumArr }, () => {
            result.forEach(row1 => {
              sumQTYPack = 0
              this.state.data2.forEach(row2 => {
                if (row1.packMaster_Code === row2.packCode) {
                  sumQTYPack += row2.sumQty
                  row1.sumQty = sumQTYPack
                }
              })
            })
          })

          this.setState({ data: sumArr1 })

        }

      })
    }

  }

  OnhandleClickGetSAPRes(){
    const values = queryString.parse(this.props.location.search)
    var ID = values.docID.toString()

    Axios.get(window.apipath + "/api/wm/received/doc/SAPRes?docID=" + ID).then(res => {
      var json = res.data.datas[0].description
      let exwindow = window.open("data:application/json," + encodeURIComponent(json))
      exwindow.document.write("<iframe width='100%' height='100%' src='data:application/json, " + encodeURIComponent(json)+ "' frameborder='0' style='border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;' allowfullscreen></iframe>")
    });
  }

  renderDocumentStatus() {
    const res = DocumentEventStatus.filter(row => {
      return row.code === this.state.Eventstatus
    })
    return res.map(row => row.status)
  }

  onHandleClickCancel(event) {
    this.props.history.push("/doc/gr/list")
  }

  dateTimePicker() {
    return <DatePicker onChange={(e) => { this.setState({ date: e }) }} dateFormat="DD/MM/YYYY" />
  }

  getSelectionData(data) {
    this.setState({ selectiondata: data })
  }

  render() {
    const cols = [
      { accessor: 'packMaster_Code', Header: 'SKUCode', editable: false, },
      { accessor: 'packMaster_Name', Header: 'SKUName', editable: false, },

      { accessor: 'batch', Header: 'Batch', editable: false, },
      { accessor: 'lot', Header: 'Lot', editable: false, },
      { accessor: 'orderNo', Header: 'Order No', editable: false, },
      // {
      //   accessor: 'sumQty1', Header: 'Qty', editable: false,
      //   Cell: (e) => <span className="float-left">{e.original.sumQty === undefined ? ('0' + ' / ' + e.original.sumQty1) : (e.original.sumQty + ' / ' +
      //     (e.original.sumQty1 === 0 ? '-' : e.original.sumQty1))}</span>,
      // },
      {
        accessor: 'sumQty2', Header: 'Qty', editable: false,
        Cell: (e) => <span className="float-left">{e.original.sumQty2 === undefined ? ('0' + ' / ' + e.original.sumQty1) : (e.original.sumQty2 + ' / ' +
          (e.original.sumQty1 === 0 ? '-' : e.original.sumQty1))}</span>,
      },
      // { accessor: 'sumQty2', Header: 'Qty', editable: false, },
      { accessor: 'unitType_Code', Header: 'Unit', editable: false, },

    ];
    const colsdetail = [
      { accessor: 'code', Header: 'Pallet', editable: false, },
      { accessor: 'packCode', Header: 'SKUCode', editable: false, },
      { accessor: 'packName', Header: 'SKUName', editable: false, },
      { accessor: 'batch', Header: 'Batch', editable: false, },
      { accessor: 'lot', Header: 'Lot', editable: false, },
      { accessor: 'orderNo', Header: 'Order No', editable: false, },
      { accessor: 'sumQty', Header: 'Qty', editable: false, },
      { accessor: 'packUnitCode', Header: 'Unit', editable: false, },
    ];

    return (
      <div>
        {/*
        column = คอลัมที่ต้องการแสดง
        data = json ข้อมูลสำหรับ select ผ่าน url
        ddlfilter = json dropdown สำหรับทำ dropdown filter
        addbtn = เปิดปิดปุ่ม Add
        accept = สถานะของในการสั่ง update หรือ insert 
    
      */}
        <Row>
          <Col xs="6"><div><label>Document No : </label> {this.state.DocumentCode}</div></Col>
          <Col xs="6"><div><label>Document Date : </label> {this.state.documentDate}</div></Col>
        </Row>
        <Row>
          <Col xs="6"><div><label>Source Branch : </label> {this.state.souBranchName}</div></Col>
          <Col xs="6"><div><label>Source Warehouse : </label> {this.state.souWarehouseName}</div></Col>

        </Row>
        <Row>
          <Col xs="6"><div><label>Destination Branch : </label> {this.state.desBranchName}</div></Col>
          <Col xs="6"><div><label>Destination Warehouse : </label> {this.state.desWarehouseName}</div></Col>
        </Row>
        <Row>
          <Col xs="6"><div><label>SAP.Doc No : </label> {this.state.refID}</div></Col>
          <Col xs="6"><div><label>SAP.Doc Years : </label> {this.state.ref1}</div></Col>
        </Row>
        <Row>
          <Col xs="6"><div><label>AWMS Reference No. : </label> {this.state.Super}</div></Col>
          <Col xs="6"><div><label>Movement Type : </label> {this.state.ref2}</div></Col>

        </Row>
        <Row>
          <Col xs="6"><div><label>Doc Status : </label> {this.renderDocumentStatus()}</div></Col>
          <Col xs="6"><div><label>Remark : </label> {this.state.Remark}</div></Col>

        </Row>
        <div className="float-right"><Button color="primary" onClick={() => {this.OnhandleClickGetSAPRes()}}>SAP Log</Button></div>
        <div className="clearfix"></div>
        <ReactTableFixedColumns columns={cols} data={this.state.data} NoDataComponent={() => null} style={{ background: "white" }}
          sortable={false} defaultPageSize={1000} filterable={false} editable={false} minRows={5} showPagination={false} /><br />

        <ReactTableFixedColumns columns={colsdetail} data={this.state.data2} NoDataComponent={() => null} style={{ background: "white" }}
          sortable={false} defaultPageSize={1000} filterable={false} editable={false} minRows={5} showPagination={false} />
        <Card>
          <CardBody>
            <Button color="secondary" style={{ width: "130px" }} className="float-left" onClick={this.onHandleClickCancel}>Back</Button>
          </CardBody>
        </Card>
      </div>
    )
  }
}

export default IssuedDoc;
