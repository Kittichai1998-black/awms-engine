import React, { Component } from 'react';
import "react-table/react-table.css";
import { Input, Card, CardBody, Button, Row,Col } from 'reactstrap';
import ReactTable from 'react-table'
import moment from 'moment';
import { DocumentEventStatus } from '../../Status'
import queryString from 'query-string'
import { AutoSelect, NumberInput, apicall, createQueryString, DatePicker, ToListTree, Clone } from '../../ComponentCore'
import Downshift from 'downshift'
import ReactAutocomplete from 'react-autocomplete'
import arrimg from '../../../../img/arrowhead.svg'
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../../ComponentCore/Permission';
import _ from 'lodash'

function isInt(value) {
  return !isNaN(value) &&
    parseInt(Number(value)) == value &&
    !isNaN(parseInt(value, 10));
}

const Axios = new apicall()

class IssuedManage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      Batch: null,
      refID: null,
      ref1: null,
      ref2: null,
      remark: null,
      documentStatus: 10,
      auditNo: "-",
      select2: {
        queryString: window.apipath + "/api/viw",
        t: "SKUMaster",
        q: '[{ "f": "Status", "c":"=", "v": 1}]',
        f: "ID, Code, Name, concat(Code, ' : ', Name) AS SKU, UnitTypeName, UnitTypeCode",
        g: "",
        s: "[{'f':'Code','od':'asc'}]",
        sk: 0,
        l: 0,
        all: "",
      },
      StorageObject: {
        queryString: window.apipath + "/api/trx",
        t: "StorageObject",
        q: "[{ 'f': 'Status', c:'=', 'v': 1},{ 'f': 'ObjectType', c:'=', 'v': 1},{ 'f': 'EventStatus', c:'in', 'v': '11,12'}]",
        f: "Code",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: "",
        l: "",
        all: "",
      },
      inputstatus: true,
      pageID: 0,
      addstatus: false ,
      adddisplay: "none",
      basedisplay: "none",
      storageObjectdata: []

    };
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.getSelectionData = this.getSelectionData.bind(this)
    this.initialData = this.initialData.bind(this)
    this.DateNow = moment()
    this.addIndex = 0
    //this.autoSelectData = this.autoSelectData.bind(this)
    
    this.displayButtonByPermission = this.displayButtonByPermission.bind(this)
  }

  initialData() {
    const values = queryString.parse(this.props.location.search)
    if (values.ID !== undefined) {
      this.setState({
        pageID: values.ID,
        addstatus: true,
      })
      Axios.get(window.apipath + "/api/wm/audit/doc/?docID=" + values.ID + "&getMapSto=true").then((rowselect1) => {
        if (rowselect1.data._result.status === 0) {
          this.setState({ data: [] })
        }
        else {
          this.setState({
            data: rowselect1.data.document,
            data2: rowselect1.data.document.documentItems,
            remark: rowselect1.data.document.remark,
            documentStatus: rowselect1.data.document.eventStatus,
            documentDate: moment(rowselect1.data.document.documentDate).format("DD-MM-YYYY"),
            date: moment(rowselect1.data.document.actionTime),
            addstatus: true,
            auditNo: rowselect1.data.document.code,
            Batch: rowselect1.data.document.batch,
            refID: rowselect1.data.document.refID,
            ref1: rowselect1.data.document.ref1,
            ref2: rowselect1.data.document.ref2,
            desBranchName: rowselect1.data.document.desBranchName
          }, () => {
            this.state.data2.forEach(x=>{
              var qryStr = queryString.parse(x.options)
              x.palletCode = qryStr.palletCode === "undefined" ? null : qryStr.palletCode;
              x.locationCode = qryStr.locationCode === "undefined" ? null : qryStr.locationCode;
              x.code = x.skuMaster_Code + " : " + x.skuMaster_Name;
            })

            this.forceUpdate();
          })
        }

      })
    }else {
      this.setState({ documentDate: this.DateNow.format('DD-MM-YYYY') })
      Axios.get(createQueryString(this.state.select2)).then((rowselect2) => {
        this.setState({
          autocomplete: rowselect2.data.datas, autocompleteUpdate: Clone(rowselect2.data.datas),
          adddisplay: "inline-block"
        })
      })
    }

    this.renderDocumentStatus();
    /* var today = moment();
    var tomorrow = moment(today).add(1, 'days');
    this.setState({date:tomorrow}) */
  }
  async componentWillMount() {
    document.title = "Goods Issue Manage : AWMS";
    let dataGetPer = await GetPermission()
    this.displayButtonByPermission(dataGetPer)
  }
  displayButtonByPermission(dataGetPer) {
    // 27	TransGID_create&modify
    if (!CheckViewCreatePermission("TransGID_create&modify", dataGetPer)) {
      this.props.history.push("/404")
    }
  }
  componentDidMount() {
    this.initialData()
    Axios.get(createQueryString(this.state.StorageObject)).then((response) => {
      const storageObjectdata = []
      response.data.datas.forEach(row => {
        storageObjectdata.push({ label: row.Code })
      })
      this.setState({ storageObjectdata })
    })
  }


  onHandleClickCancel(event) {
    this.forceUpdate();
    event.preventDefault();
  }

  getSelectionData(data) {
    this.setState({ selectiondata: data })
  }

  createDocument() {
    let listAudit = [];
    this.state.data.forEach(row => {
      var createOptions = "";
      if(row.palletCode !== undefined){
        if(row.palletCode !== "")
        createOptions += "palletCode=" + row.palletCode;
      }
      if(row.locationCode !== undefined){
        if(createOptions !== ""){
          if(row.locationCode !== ""){
            createOptions += "&locationCode=" + row.locationCode;
          }
        }
        else if (createOptions === ""){
          if(row.locationCode !== ""){
            createOptions += "&locationCode=" + row.locationCode;
          }
        }
      }
      listAudit.push({
        "skuCode":null,
        "packCode":null,
        "skuID":row.id === undefined ? null : row.id,
        "quantity":null,
        "unitType":row.UnitTypeCode === undefined ? null : row.UnitTypeCode,
        "expireDate":null,
        "productionDate":null,
        "orderNo":null,
        "batch":row.batch === undefined ? null : row.batch,
        "lot":null,
        "ref1":null,
        "ref2":null,
        "refID":null,
        "options":createOptions
      })
    })
    let createAuditData = 
    {
        "refID": null,
        "forCustomerID": null,
        "batch": null,
        "lot": null,
        "souBranchID": 1,
        "souWarehouseID": 1,
        "souAreaMasterID": null,
        "desCustomerID": null,
        "desSupplierID": null,
        "actionTime": this.state.date,
        "documentDate": this.DateNow.format("YYYY/MM/DD"),
        "docItems": listAudit
    };
    if (listAudit.length > 0) {
      Axios.post(window.apipath + "/api/wm/audit/doc/Create", createAuditData).then((res) => {
        if (res.data._result.status === 1) {
          this.props.history.push('/sys/ad/create?ID=' + res.data.ID)
          window.location.reload()
        }
      })
    }
  }

  dateTimePicker() {
    return <DatePicker timeselect={true} onChange={(e) => { this.setState({ date: e }) }} dateFormat="DD-MM-YYYY HH:mm" />
  }

  renderDocumentStatus() {
    const res = DocumentEventStatus.filter(row => {
      return row.code === this.state.documentStatus
    })
    return res.map(row => row.status)
  }

  inputCell(field, rowdata) {
    /* return  <Input type="text" value={rowdata.value === null ? "" : rowdata.value} 
    onChange={(e) => {this.editData(rowdata, e.target.value, "PackQty")}} />; */
    return <Input value={rowdata.value}
      onChange={(e) => { this.editData(rowdata, e.target.value, field) }} />
  }

  addData() {
    const data = this.state.data
    data.push({ id: this.addIndex, PackItem: "", PackQty: 1, SKU: "", UnitTypeName: "", ID: "" })
    this.addIndex -= 1
    this.setState({ data })
  }

  editData(rowdata, value, field) {
    const data = this.state.data;
    if (value !== "") {
      if (rowdata.column.datatype === "int") {
        let conv = value === '' ? 0 : value
        data[rowdata.index][field] = (conv === 0 ? null : conv);
      }
      else if(rowdata.column.datatype == "text"){
        data[rowdata.index][field] = value;
      }
      else {
        data[rowdata.index][field] = value.Code;
        data[rowdata.index]["SKU"] = value.SKU === undefined ? value : value.SKU;
        data[rowdata.index]["UnitTypeCode"] = value.UnitTypeCode;
        data[rowdata.index]["UnitTypeName"] = value.UnitTypeName;
        data[rowdata.index]["id"] = value.ID;
      }
      this.setState({ data });

    }
    else if (rowdata.column.datatype !== "int") {
      data[rowdata.index][field] = "";
      data[rowdata.index]["SKU"] = "";
      data[rowdata.index]["UnitTypeCode"] = "";
      data[rowdata.index]["UnitTypeName"] = "";
      data[rowdata.index]["id"] = "";
    }
    else if (rowdata.column.datatype === "int") {
      data[rowdata.index][field] = "";
    }
    this.setState({ data }, () => console.log(this.state.data));
  }

  createText(data) {
    return <span>{data}</span>
  }

  createAutoComplete(rowdata) {
    if (!this.state.readonly) {
      const style = {
        borderRadius: '3px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '2px 0',
          fontSize: '90%',
          position: 'fixed',
          overflow: 'auto',
          maxHeight: '20%', // TODO: don't cheat, let it flow to the bottom
          zIndex: '998',
      }

      return <ReactAutocomplete
        inputProps={{
          style: {
            width: "100%", borderRadius: "1px", 
            backgroundImage: 'url(' + arrimg + ')',
            backgroundPosition: "8px 8px",
            backgroundSize: "10px",
            backgroundRepeat: "no-repeat",
            paddingLeft: "25px",
            position: 'relative'
          }
        }}
        wrapperStyle={{ width: "100%" }}
        menuStyle={style}
        getItemValue={(item) => item.SKU}
        items={this.state.autocomplete}
        shouldItemRender={(item, value) => item.SKU.toLowerCase().indexOf(value.toLowerCase()) > -1}
        renderItem={(item, isHighlighted) =>
          <div key={item.id} style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
            {item.SKU}
          </div>
        }
        value={rowdata.original.SKU}
        onChange={(e) => {
          const res = this.state.autocomplete.filter(row => {
            return row.SKU.toLowerCase().indexOf(e.target.value.toLowerCase()) > -1
          });
          if (res.length === 1) {
            if (res[0].SKU === e.target.value)
              this.editData(rowdata, res[0].SKU, rowdata.column.id)
            else
              this.editData(rowdata, e.target.value, rowdata.column.id)
          }
          else {
            this.editData(rowdata, e.target.value, rowdata.column.id)
          }
        }}
        onSelect={(val, row) => {
          this.editData(rowdata, row, rowdata.column.id)
        }}
      />
    }
    else {
      return <span>{rowdata.value}</span>
    }
  }

  render() {

    const style = { width: "200px", textAlign: "right", paddingRight: "10px" }

     let cols = [
        { accessor: 'palletCode', Header: 'Pallet Code', editable: false, Cell: e => this.inputCell("palletCode", e), datatype:"text" },
       { accessor: 'locationCode', Header: 'Location Code', editable: false, Cell: e => this.inputCell("locationCode", e), datatype:"text" },
       { accessor: "code", Header: "SKU Item",Cell: (e) => this.createAutoComplete(e),  width: 550 },
       //{accessor:"skuMaster_Code",Header:"SKU", Cell: (e) => <span>{e.original.skuMaster_Code + ' : ' + e.original.skuMaster_Name}</span>},
       { accessor: 'batch', Header: 'Batch', editable: false, Cell: e => this.inputCell("batch", e), datatype:"text" },
       { accessor: "UnitTypeName", Header: "Unit"},
       {
        Cell: (e) => <Button onClick={() => {
          const data = this.state.data;
          data.forEach((row, index) => {
            if (row.id === e.original.id) {
              data.splice(index, 1)
            }
          })
          this.setState({ data }, () => {
            let res = this.state.autocompleteUpdate
            this.state.data.forEach((datarow, index) => {
              res = res.filter(row => {
                return datarow.Code !== row.Code
              })
            })
            this.setState({ autocomplete: res })
          })
        }} color="danger">Remove</Button>
      },
      ];

      let colsview = [{ accessor: 'palletCode', Header: 'Pallet Code', editable: false, },
      { accessor: 'locationCode', Header: 'Location Code', editable: false },
      { accessor: "code", Header: "SKU Item",  width: 550 },
      { accessor: 'batch', Header: 'Batch', editable: false, },
      { accessor: "UnitTypeName", Header: "Unit", editable: false,},]
    return (
      <div>
        <div className="clearfix">
          <Row>
            <Col xs="6"><div className="d-block" >SAP Document : <span style={{ marginLeft: '5px' }}>{this.state.auditNo}</span></div></Col>
            <Col xs="6"><div>Document Date : <span style={{ marginLeft: '5px' }}>{this.state.documentDate}</span></div></Col>
          </Row>

          <Row>
            <Col xs="6"> <div className="d-block"><label>Action Time : </label><div style={{ display: "inline-block", width: "300px", marginLeft: '10px' }}>{this.state.pageID ? <span>{this.state.date.format("DD-MM-YYYY HH:mm:ss")}</span> : this.dateTimePicker()}</div>
            </div></Col>
          </Row>

          <Row>
            <Col xs="6"> <div className=""><label >Source Branch : </label>{this.state.pageID ? this.createText("THIP") :
              <div style={{ width: "300px", display: "inline-block" }}><label>1100 : THIP</label></div>}</div>
            </Col>
            <Col xs="6">
              <div className=""><label>Source Warehouse : </label>{this.state.pageID ? this.createText("ASRS") :
                <div style={{ width: "300px", display: "inline-block" }}><label>5005 : ASRS</label></div>}</div>
            </Col>
          </Row>

          {this.state.pageID === 0 ? null : <Row>
            <Col xs="6"><div>SAP.Doc No : <span style={{ marginLeft: '5px' }}>{this.state.pageID ? this.createText(this.state.refID) :
              <div style={{ width: "300px", display: "inline-block", marginLeft: '5px' }}><span> {this.state.refID}</span>
              </div>}</span></div></Col>

            <Col xs="6"><div>SAP.Doc Years : <span style={{ marginLeft: '5px' }}>{this.state.pageID ? this.createText(this.state.ref1) :
              <div style={{ width: "300px", display: "inline-block", marginLeft: '5px' }}><span> {this.state.ref1}</span>
              </div>}</span></div></Col>
          </Row>}

        </div>

        <Row>
          <Col xs="6"><div className=""><label>Remark : </label>
            {this.state.pageID ? <span> {this.state.remark}</span> :
              <Input onChange={(e) => this.setState({ remark: e.target.value })} style={{ display: "inline-block", width: "300px", marginLeft: '10px' }}
                value={this.state.remark === undefined ? "" : this.state.remark} />}
          </div>
          </Col>       
        </Row>

        <div className="clearfix" style={{ marginTop: '3px', marginBottom: '3px' }}>
          <Button className="float-right" onClick={() => this.addData()} color="success" disabled={this.state.addstatus} style={{ width: "130px", display: this.state.adddisplay }}>Add</Button>
          {/* <span className="float-right" style={{display:this.state.basedisplay, backgroundColor:"white",padding:"5px", border:"2px solid #555555",borderRadius:"4px"}} >{this.state.code}</span> */}
        </div>

        {this.state.pageID != 0 ? null : <ReactTable columns={cols} data={this.state.data.documentItems === undefined ? this.state.data : this.state.data.documentItems} NoDataComponent={() => null} style={{ background: "white" }}
          sortable={false} defaultPageSize={1000} filterable={false} editable={false} minRows={5} showPagination={false} />}

        {this.state.pageID === 0 ? null : <ReactTable columns={colsview} data={this.state.data2} NoDataComponent={() => null} style={{ background: "white" }}
          sortable={false} defaultPageSize={1000} filterable={false} editable={false} minRows={5} showPagination={false} />}
 
        <Card>
          <CardBody>
            <Button onClick={() => this.createDocument()} style={{ width: "130px", marginRight: '5px', display: this.state.adddisplay }} color="primary" className="float-right">Create</Button>
            <Button style={{ width: "130px" }} type="button" color="secondary" onClick={() => this.props.history.push('/sys/ad/search')} className="float-left">Back</Button>
            {this.state.resultstatus}
          </CardBody>
        </Card>
      </div>
    )
  }
}

export default IssuedManage;
