import React, { Component } from 'react';
import "react-table/react-table.css";
import { Input, Card, CardBody, Button, Row,Col, Badge } from 'reactstrap';
import ReactTable from 'react-table'
import moment from 'moment';
import { DocumentEventStatus } from '../../Status'
import queryString from 'query-string'
import { apicall, createQueryString, DatePicker, Clone } from '../../ComponentCore'
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
        l: 25,
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
      storageObjectdata: [],
      autocomplete:[],

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
            data3: rowselect1.data.bstos,
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
              x.code = x.skuMaster_Code === null ? "" : x.skuMaster_Code;
              x.skuName = x.skuMaster_Name === null ? "" : x.skuMaster_Name
            })

            this.forceUpdate();
          })
        }

      })
    }else {
      this.setState({ documentDate: this.DateNow.format('DD-MM-YYYY'), adddisplay: "inline-block" })
    }

    this.renderDocumentStatus();
    /* var today = moment();
    var tomorrow = moment(today).add(1, 'days');
    this.setState({date:tomorrow}) */
  }
  async componentWillMount() {
    document.title = "Audit Document : AWMS";
    let dataGetPer = await GetPermission()
    CheckWebPermission("CAudit", dataGetPer, this.props.history);
    this.displayButtonByPermission(dataGetPer)
  }
  displayButtonByPermission(dataGetPer) {
    // 53	Audit_create&modify 52 Audit_view
    if (!CheckViewCreatePermission("Audit_create&modify", dataGetPer)) {
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
            createOptions += "locationCode=" + row.locationCode;
          }
        }
      }
      listAudit.push({
        "skuCode":null,
        "packCode":null,
        "skuID":row.SKU_ID === undefined ? null : row.SKU_ID,
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
        "remark": this.state.remark,
        "actionTime": this.state.date.format("YYYY/MM/DDThh:mm:ss"),
        "documentDate": this.DateNow.format("YYYY/MM/DD"),
        "docItems": listAudit
    };
    if (listAudit.length > 0) {
      Axios.post(window.apipath + "/api/wm/audit/doc/Create", createAuditData).then((res) => {
        if (res.data._result.status === 1) {
          this.props.history.push('/sys/ad/manage?ID=' + res.data.ID)
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
    if(rowdata.column.datatype === "int") {
      let conv = value === '' ? 0 : value
      data[rowdata.index][field] = (conv === 0 ? null : conv);
    }
      else if (rowdata.column.datatype == "text") {
      data[rowdata.index][field] = value;
      
    }
    else {
      if(value){
        data[rowdata.index][field] = value.Code;
        data[rowdata.index]["SKU"] = value.SKU === undefined ? value : value.SKU;
        data[rowdata.index]["UnitTypeCode"] = value.UnitTypeCode;
        data[rowdata.index]["UnitTypeName"] = value.UnitTypeName;
        data[rowdata.index]["SKU_ID"] = value.ID;
      }
      else{
        data[rowdata.index][field] = "";
        data[rowdata.index]["SKU"] = value.SKU === undefined ? value : value.SKU;
        data[rowdata.index]["UnitTypeCode"] = "";
        data[rowdata.index]["UnitTypeName"] = "";
        data[rowdata.index]["SKU_ID"] = "";
      }
    }
    this.setState({ data });
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
            width: "100%",
            borderRadius: "1px",
            height: "auto",
            //backgroundImage: 'url(' + arrimg + ')',
            //backgroundPosition: "8px 8px",
            //backgroundSize: "10px",
            //backgroundRepeat: "no-repeat",
            //paddingLeft: "25px",
            position: 'relative'
          },
          className: "form-control",
          placeHolder: "Input SKU"

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
          console.log(e.target.value)
          clearTimeout(this.tid);
          let autoQuery = this.state.select2;
          let value = e.target.value === "" ? "" : e.target.value;
          autoQuery.q = '[{ "f": "Status", "c":"=", "v": 1},{ "f": "SKU", "c":"like", "v": "'+ value +'%"}]';
          if(value === "")
            this.setState({autocomplete:[]})
          else{
            this.tid = setTimeout(() => {
              Axios.get(createQueryString(autoQuery)).then((rowselect2) => {
                this.setState({
                  autocomplete: rowselect2.data.datas, autocompleteUpdate: Clone(rowselect2.data.datas),
                }, ()=> {
                  const res = this.state.autocomplete.filter(row => {
                    return row.SKU.toLowerCase().indexOf(value.toLowerCase()) > -1
                  });
                  if (res.length === 1) {
                    if (res[0].SKU === value)
                      this.editData(rowdata, res[0], rowdata.column.id)
                  }
                })
              })
            }, 1200)
          }
          
          this.editData(rowdata, value, rowdata.column.id)
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

  getStatus(value) {
    // console.log(value)
    if (value === 0)
      return <Badge color="AUDITING" style={{ fontSize: '0.825em', fontWeight: '500' }}>AUDITING</Badge>
    else if (value === 1)
      return <Badge color="AUDITED" style={{ fontSize: '0.825em', fontWeight: '500' }}>AUDITED</Badge>
    else
      return null
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
              console.log("---------------------")
              console.log(row.id)
              console.log(e.original.id)
              console.log("---------------------")
              if (row.id === e.original.id) {
                data.splice(index, 1)
              }
            })
            this.setState({data})
          }} color="danger">Remove</Button>
        },
      ];

      let colsview = [{ accessor: 'palletCode', Header: 'Pallet Code', editable: false, },
      { accessor: 'locationCode', Header: 'Location Code', editable: false },
      { accessor: "code", Header: "SKU Code",  width: 200 },
      { accessor: "skuName", Header: "SKU Name",  width: 250 },
      { accessor: 'batch', Header: 'Batch', editable: false, },
      { accessor: "UnitTypeName", Header: "Unit", editable: false,},];

      let coldetail = [
        {
          accessor: "status", Header: "Task", minWidth: 80, className: 'center',
          Cell: (e) => this.getStatus(e.original.status)
        },
        { accessor: "code", Header: "Pallet" },
        {
          accessor: "options", Header: "Item Number", Cell: (e) => <span> {e.original.options === undefined ? null : e.original.options === null ? null : e.original.options.split("=")[1].split("&")[0]}</span>
        },
        { accessor: "packCode", Header: "SKU Code" },
        { accessor: "packName", Header: "SKU Name" },
        //{accessor:"skuMaster_Code",Header:"SKU", Cell: (e) => <span>{e.original.skuMaster_Code + ' : ' + e.original.skuMaster_Name}</span>},
        { accessor: 'batch', Header: 'Batch', editable: false, },
        { accessor: 'lot', Header: 'Lot', editable: false, },
        { accessor: 'orderNo', Header: 'Order No', editable: false, },
        {
          accessor: 'sumQty1', Header: 'Qty', editable: false,
          Cell: (e) => <span className="float-left">{e.original.distoQtyMax === null ? '-' : e.original.distoQtyMax}</span>,
        },
        { accessor: "distoUnitCode", Header: "Unit" },
      ]
    return (
      <div>
        <div className="clearfix">
          <Row>
            <Col xs="6"><label>SAP Document : </label><span style={{ marginLeft: '5px' }}>{this.state.auditNo}</span></Col>
            <Col xs="6"><label>Document Date : </label><span style={{ marginLeft: '5px' }}>{this.state.documentDate}</span></Col>
          </Row>

          <Row>
            <Col xs="6"></Col>
            <Col xs="6"> <label>Action Time : </label>
              <span style={{ display: "inline-block",width: "300px", marginLeft: '10px' }}>
              {this.state.pageID ? this.state.date.format("DD-MM-YYYY HH:mm:ss") : this.dateTimePicker()}
              </span>
            </Col>
          </Row>

          <Row>
            <Col xs="6"> <label >Source Branch : </label>{this.state.pageID ? this.createText("THIP") :
              <span style={{ width: "300px" }}><label>1100 : THIP</label></span>}
            </Col>
            <Col xs="6">
              <label>Source Warehouse : </label>{this.state.pageID ? <span>ASRS</span> :<label>5005 : ASRS</label>}
            </Col>
          </Row>

          {this.state.pageID === 0 ? null : <Row>
            <Col xs="6"><label>SAP.Doc No : </label><span style={{ marginLeft: '5px' }}>{this.state.pageID ? this.createText(this.state.refID) :
              <span style={{ width: "300px", marginLeft: '5px' }}> {this.state.refID}</span>}</span></Col>

            <Col xs="6"><label>SAP.Doc Years : </label><span style={{ marginLeft: '5px' }}>{this.state.pageID ? this.createText(this.state.ref1) :
              <span style={{ width: "300px", marginLeft: '5px' }}> {this.state.ref1}</span>}</span></Col>
          </Row>}
          <Row>
          
            <Col xs="6"><label>Doc Status :</label><span style={{ marginLeft: '5px' }}> {this.renderDocumentStatus()}</span></Col>
            <Col xs="6"><label>Remark : </label>
              {this.state.pageID ? <span> {this.state.remark}</span> :
                <Input onChange={(e) => this.setState({ remark: e.target.value })} style={{ display: "inline-block", width: "300px", marginLeft: '10px' }}
                  value={this.state.remark === undefined ? "" : this.state.remark} />}
            </Col>       
          </Row>

        </div>

        <div className="clearfix" style={{ marginTop: '3px', marginBottom: '3px' }}>
          <Button className="float-right" onClick={() => this.addData()} color="success" disabled={this.state.addstatus} style={{ width: "130px", display: this.state.adddisplay }}>Add</Button>
          {/* <span className="float-right" style={{display:this.state.basedisplay, backgroundColor:"white",padding:"5px", border:"2px solid #555555",borderRadius:"4px"}} >{this.state.code}</span> */}
        </div>

        {this.state.pageID != 0 ? null : <ReactTable columns={cols} data={this.state.data.documentItems === undefined ? this.state.data : this.state.data.documentItems} NoDataComponent={() => null} style={{ background: "white" }}
          sortable={false} defaultPageSize={1000} filterable={false} editable={false} minRows={5} showPagination={false} />}

        {this.state.pageID === 0 ? null : <ReactTable columns={colsview} data={this.state.data2} NoDataComponent={() => null} style={{ background: "white" }}
          sortable={false} defaultPageSize={1000} filterable={false} editable={false} minRows={5} showPagination={false} />}
          
          {this.state.pageID === 0 ? null : <ReactTable columns={coldetail} data={this.state.data3} NoDataComponent={() => null} style={{ background: "white" }}
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
