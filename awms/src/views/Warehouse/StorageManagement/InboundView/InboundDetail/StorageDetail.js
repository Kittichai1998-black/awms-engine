import React, { Component } from 'react';
import "react-table/react-table.css";
import { Input, Card, CardBody, Button, Row, Col } from 'reactstrap';
import ReactTable from 'react-table'
//import Axios from 'axios';
import {apicall, DatePicker, createQueryString} from '../../../ComponentCore'
import queryString from 'query-string'
import _ from 'lodash'
import moment from 'moment';
import withFixedColumns from "react-table-hoc-fixed-columns";
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../../../ComponentCore/Permission';

const Axios = new apicall()
const ReactTableFixedColumns = withFixedColumns(ReactTable);

class IssuedDoc extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data : [],
      data2:[]
      
    };
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.displayButtonByPermission = this.displayButtonByPermission.bind(this)
    this.dateTimePicker = this.dateTimePicker.bind(this)
  }
  async componentWillMount() {
    document.title = "Storage Detail : AWMS";
    let dataGetPer = await GetPermission()
    this.displayButtonByPermission(dataGetPer)
  }
  displayButtonByPermission(dataGetPer) {
    // 20 TransGRD_execute
    if (!CheckViewCreatePermission("TransGRD_execute", dataGetPer)) {
      this.props.history.push("/404")
    }
  }
  componentDidMount(){
    const values = queryString.parse(this.props.location.search)
    var ID = values.docID.toString()
    if(values.docID){  
      Axios.get(window.apipath + "/api/wm/received/doc/?docID="+ID+"&getMapSto=true").then(res => {  
        console.log(res)
        if (res.data._result.status === 1) {
          res.data.document.documentItems.forEach(x =>{
            this.setState({
              batch : x.batch,
              lot : x.lot,
              orderNo : x.orderNo,
              quantityDoc : x.quantity,
              unitType_NameDoc : x.unitType_Name
      
            })
          })
    
          this.setState({
            souWarehouseName :res.data.document.souWarehouseName,
            DocumentCode: res.data.document.code,
            Remark: res.data.document.remark,
            souBranchName:res.data.document.souBranchName,
            desWarehouseName :res.data.document.desWarehouseName,
            desBranchName: res.data.document.desBranchName,
            Eventstatus: res.data.document.Eventstatus,
            Super: res.data.document.Super,
            refID : res.data.document.refID,
            ref1 : res.data.document.ref1,
            ref2 : res.data.document.ref2,
            documentDate :  moment(res.data.document.documentDate).format("DD-MM-YYYY")
          })


          var groupPack = _.groupBy(res.data.bstos,"code") 
          var groupdocItemID = _.groupBy(res.data.bstos,"docItemID")       
          let sumArr =[]
          let sumArr1 =[]
          
        for (let res1 in groupdocItemID){     
            let sum = 0
            groupdocItemID[res1].forEach(res2 => {
              sum += res2.packQty
              res2.sumQty1=sum
              res2.batch = this.state.batch
              res2.lot = this.state.lot
              res2.orderNo = this.state.orderNo
              res2.quantityDoc = this.state.quantityDoc
              

            })

          sumArr1.push(groupdocItemID[res1][groupdocItemID[res1].length -1])
        }


          for (let res1 in groupPack){     
              let sum = 0
              groupPack[res1].forEach(res2 => {
                sum += res2.packBaseQty
                res2.sumQty = sum
                sumArr.forEach(response => {
                  if(response.code === res2.code){
                    res2.code = "";
                  }
                })
              })
          sumArr.push(groupPack[res1][groupPack[res1].length -1])
          }

                  
          var sumQTYPack =0    
          var result = res.data.document.documentItems
            this.setState({data2:sumArr}, () => {
              result.forEach(row1 =>{
                sumQTYPack = 0 

                this.state.data2.forEach(row2 =>{
                 
                  if(row1.packMaster_Code === row2.packCode){
                      sumQTYPack += row2.sumQty
                      row1.sumQty = sumQTYPack
                  }
                })
              })
            })

            this.setState({data:sumArr1})
            
        }
        console.log(this.state.data)
        
       })
    }

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
      {
        accessor: 'packCode', Header: 'SKUItem', editable: false, fixed: "left", minWidth: 250, maxWidth: 300,
        resized: false,
        Cell: (e) => <span>{e.original.packCode + ' : ' + e.original.packName}</span>,
      },
      {accessor: 'packUnitCode', Header: 'Unit', editable:false,},
      {accessor: 'lot', Header: 'Lot', editable:false,},
      { accessor: 'orderNo', Header: 'Order No', editable: false, },
      {
        accessor: 'sumQty1', Header: 'Qty', editable: false,
        Cell: (e) => <span className="float-left">{e.original.sumQty1 === undefined ? ('0' + ' / ' + e.original.quantityDoc) : (e.original.sumQty1 + ' / ' +
          (e.original.quantityDoc === null ? '-' : e.original.quantityDoc))}</span>,
      },
      { accessor: 'batch', Header: 'Batch', editable: false, }

    ];
    const colsdetail = [
      {accessor: 'code', Header: 'Base',editable:false,},
      {
        accessor: 'packCode', Header: 'SKUItem', editable: false, fixed: "left", minWidth: 250, maxWidth: 300,
        Cell: (e) => <span>{e.original.packCode + ' : ' + e.original.packName}</span>
      },
      {accessor: 'sumQty', Header: 'Qty',editable:false,},
      {accessor: 'packUnitCode', Header: 'Unit',editable:false,},
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
          <Col xs="6"><div><label>Source Warehouse : </label> {this.state.souWarehouseName}</div></Col>
          <Col xs="6"><div><label>Source Branch : </label> {this.state.souBranchName}</div></Col>
      </Row>
      <Row>
          <Col xs="6"><div><label>Destination Warehouse : </label> {this.state.desWarehouseName}</div></Col>
          <Col xs="6"><div><label>Destination Branch : </label> {this.state.desBranchName}</div></Col>
      </Row>
      <Row>
          <Col xs="6"><div><label>SAP.Doc No : </label> {this.state.refID}</div></Col>
          <Col xs="6"><div><label>SAP.Doc Years : </label> {this.state.ref1}</div></Col>
      </Row>
        <Row>
          <Col xs="6"><div><label>AWMS Res : </label> {this.state.Super}</div></Col>
          <Col xs="6"><div><label>MovementType : </label> {this.state.ref2}</div></Col>
         
        </Row>
        <Row>
          <Col xs="6"><div><label>EventStatus : </label> {this.state.Eventstatus}</div></Col>
          <Col xs="6"><div><label>Remark : </label> {this.state.Remark}</div></Col>
          
        </Row>
        <ReactTableFixedColumns columns={cols} data={this.state.data} NoDataComponent={()=>null} style={{background:"white"}}
          sortable={false} defaultPageSize={1000}  filterable={false} editable={false} minRows={5} showPagination={false}/><br/>

        <ReactTableFixedColumns columns={colsdetail} data={this.state.data2} NoDataComponent={()=>null} style={{background:"white"}}
          sortable={false} defaultPageSize={1000} filterable={false} editable={false} minRows={5} showPagination={false}/>
        <div className="clearfix">
          <Button color="danger" style={{margin:"10px 0"}} className="float-right" onClick={this.onHandleClickCancel}>Back</Button>
        </div>
      </div>
    )
  }
}

export default IssuedDoc;
