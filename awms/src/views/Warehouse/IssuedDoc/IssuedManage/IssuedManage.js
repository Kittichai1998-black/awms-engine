import React, { Component } from 'react';
import "react-table/react-table.css";
import { Badge, Input, Card, CardBody, Button, Row, Modal, ModalHeader, ModalBody, ModalFooter, Col } from 'reactstrap';
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
import { array } from 'prop-types';

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
      branch: [],
      auto_branch: [],
      auto_warehouse: [],
      auto_customer: [],
      auto_supplier: [],
      auto_movementType: [],
      branch: "",
      customer: "",
      warehouse: "",
      Batch: null,
      refID: null,
      ref1: null,
      ref2: null,
      remark: null,
      documentStatus: 10,
      issuedNo: "-",
      select2: {
        queryString: window.apipath + "/api/viw",
        t: "PackMaster",
        q: '[{ "f": "Status", "c":"=", "v": 1},{ "f": "ItemQty", "c":"=", "v": 1}]',
        f: "id, Code, Name, concat(SKUCode, ' : ', SKUName) AS SKU, UnitTypeName AS UnitType",
        g: "",
        s: "[{'f':'Code','od':'asc'}]",
        sk: 0,
        l: 20,
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
      addstatus: true,
      adddisplay: "none",
      basedisplay: "none",
      modalstatus: false,
      storageObjectdata: [],
      autocomplete:[]

    };
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.getSelectionData = this.getSelectionData.bind(this)
    this.initialData = this.initialData.bind(this)
    this.genWarehouseData = this.genWarehouseData.bind(this)
    this.DateNow = moment()
    this.addIndex = 0
    //this.autoSelectData = this.autoSelectData.bind(this)
    this.toggle = this.toggle.bind(this)
    this.displayButtonByPermission = this.displayButtonByPermission.bind(this)
    this.tid = "";
    this.branchselect = {
      queryString: window.apipath + "/api/mst",
      t: "Branch",
      q: '[{ "f": "Status", "c":"=", "v": 1}]',
      f: "ID,Code, Name",
      g: "",
      s: "[{'f':'ID','od':'asc'}]",
      sk: 0,
      all: "",
    }

    this.warehouseselect = {
      queryString: window.apipath + "/api/mst",
      t: "Warehouse",
      q: "",
      f: "ID,Code, Name",
      g: "",
      s: "[{'f':'Code','od':'asc'}]",
      sk: 0,
      all: "",
    }

    this.customerselect = {
      queryString: window.apipath + "/api/mst",
      t: "Customer",
      q: '[{ "f": "Status", "c":"=", "v": 1}]',
      f: "ID,Code, Name",
      g: "",
      s: "[{'f':'ID','od':'asc'}]",
      sk: 0,
      all: "",
    }
    this.movementTypeselect = {
      queryString: window.apipath + "/api/ers",
      t: "SAPMovementType",
      q: '[{ "f": "Status", "c":"=", "v": 1}]',
      f: "ID,Code, Name",
      g: "",
      s: "[{'f':'ID','od':'asc'}]",
      sk: 0,
      all: "",
    }

    this.supplierselect = {
      queryString: window.apipath + "/api/viw",
      t: "SupplierMaster",
      q: '[{ "f": "Status", "c":"=", "v": 1}]',
      f: "id,Code,Name",
      g: "",
      s: "[{'f':'Code','od':'asc'}]",
      sk: 0,
      l: 0,
      all: "",

    }
  }

  initialData() {
    const values = queryString.parse(this.props.location.search)
    if (values.ID !== undefined) {
      this.setState({
        pageID: values.ID,
        addstatus: true,
      })
      Axios.get(window.apipath + "/api/wm/issued/doc/?docID=" + values.ID + "&getMapSto=true").then((rowselect1) => {
        if (rowselect1.data._result.status === 1) {
          //this.setState({ data: [] })
          rowselect1.data.document.documentItems.forEach(x => {
            var sumQty = 0;
            rowselect1.data.bstos.filter(y => y.docItemID == x.id).forEach(y => { sumQty += y.distoQty});
            x.sumQty2 = sumQty;

          });

          let data5 = [];
          rowselect1.data.bstos.forEach(bsto => {
            let docItems = rowselect1.data.document.documentItems.filter(y => y.id === bsto.docItemID)
            let d5 = data5.filter(x=>x.id==bsto.id);
            if (d5.length > 0) {
              d5[0].options = docItems[0].options
              d5[0].distoQty+=bsto.distoQty;
              if(d5[0].distoQtyMax<bsto.distoQtyMax)
                d5[0].distoQtyMax = bsto.distoQtyMax
            }
            else {
              bsto.options = docItems[0].options
              data5.push(JSON.parse(JSON.stringify(bsto)));
            }
          });
          data5.forEach(x=>{
            x.displayQty = x.distoQty + '/' +x.distoQtyMax
          });
          this.setState({data5:data5});

          this.setState({
            //data: rowselect1.data.document,
            remark: rowselect1.data.document.remark,
            documentStatus: rowselect1.data.document.eventStatus,
            documentDate: moment(rowselect1.data.document.documentDate).format("DD-MM-YYYY"),
            date: moment(rowselect1.data.document.actionTime),
            addstatus: true,
            issuedNo: rowselect1.data.document.code,
            Batch: rowselect1.data.document.batch,
            refID: rowselect1.data.document.refID,
            ref1: rowselect1.data.document.ref1,
            ref2: rowselect1.data.document.ref2,
            desBranchName: rowselect1.data.document.desBranchName,
            desSupplierName: rowselect1.data.document.desSupplierName,
            desWarehouseName: rowselect1.data.document.desWarehouseName,
            desCustomerName: rowselect1.data.document.desCustomerName
          })

          var groupPack = _.groupBy(rowselect1.data.bstos, "code")
          var groupdocItem = rowselect1.data.document.documentItems
          let sumArr = []
          let sumArr1 = []

          

          groupdocItem.forEach(x => {
            let pg = rowselect1.data.bstos.filter(y => { return y.docItemID === x.id });
            if (pg.length > 0) {
              x.sumQty1 = pg[0].distoQty
              x.distoQtyMax = pg[0].distoQtyMax
            }
            else {
              x.unitType_Name = x.unitType_Name

            }
            
            x.batchsp = x.batch
            x.lot = x.lot
            x.orderNo = x.orderNo
            x.options = x.options
            x.quantity = x.quantity
            x.unitType_Name = x.unitType_Name
            x.status = x.status
            sumArr1.push(x);
          })



          this.setState({ data3: sumArr1 });

        }

      })
    } else {
      this.setState({ documentDate: this.DateNow.format('DD-MM-YYYY'), adddisplay: "inline-block" })
    }

    this.renderDocumentStatus();
    Axios.get(createQueryString(this.branchselect)).then(branchresult => {
      this.setState(
        { auto_branch: branchresult.data.datas[0].Code + ' : ' + branchresult.data.datas[0].Name, addstatus: false, values: branchresult.data.datas[0].ID })


    })
    Axios.get(createQueryString(this.supplierselect)).then(supplierresult => {
      this.setState({ auto_supplier: supplierresult.data.datas, addstatus: false }, () => {
        const auto_supplier = []
        this.state.auto_supplier.forEach(row => {
          auto_supplier.push({ value: row.ID, label: row.Code + ' : ' + row.Name })
        })
        this.setState({ auto_supplier })
      })
    })

    Axios.get(createQueryString(this.customerselect)).then(customerresult => {
      this.setState({ auto_customer: customerresult.data.datas, addstatus: false }, () => {
        const auto_customer = []
        this.state.auto_customer.forEach(row => {
          auto_customer.push({ value: row.ID, label: row.Code + ' : ' + row.Name })
        })
        this.setState({ auto_customer })
      })
    })

    Axios.get(createQueryString(this.movementTypeselect)).then(movementTyperesult => {
      this.setState({ auto_movementType: movementTyperesult.data.datas, addstatus: false }, () => {
        const auto_movementType = []
        // console.log(this.state.auto_movementType)
        this.state.auto_movementType.forEach(row => {
          auto_movementType.push({ value: row.ID, label: row.Code + ' : ' + row.Name, code: row.Code })
        })
        this.setState({ auto_movementType })
      })
    })

  }
  async componentWillMount() {
    document.title = "Issue Document : AWMS";
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
      this.genWarehouseData();
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
    let acceptdata = []
   
    this.state.data.forEach(row => {
      let qty = row.PackQty === "" ? 0 : row.PackQty;
      if (row.id > 0 && qty > 0)
        acceptdata.push({
          packID: row.id
          , quantity: row.PackQty
          , refID: this.state.refID
          , ref1: this.state.ref1
          , ref2: this.state.ref2
          , batch: row.Batch
          , lot: row.Lot
          , orderno: row.Orderno
        })
      // console.log(row.id)
      if (row.id == undefined ) {
        alert("ไม่พบรายการ SKU ที่ต้องการ")
      }
      if (row.id > 0 && qty <= 0) {
        alert("กรุณาใส่จำนวนสินค้า")
      }

      if (row.id <= 0 && qty > 0) {
        alert("กรุณาเลือก Pack Item")
      }

      if (row.id <= 0 && qty <= 0) {
        alert("ยังไม่มีรายการ PackItem")
      }
    })
    let postdata = {
      forCustomerID: null
      , batch: this.state.Batch
      , lot: this.state.Lot
      , orderno: this.state.Orderno
      , souBranchID: 1
      , desBranchID: this.state.branch
      , souWarehouseID: 1
      , desWarehouseID: this.state.warehouse
      , souAreaMasterID: null
      , desCustomerID: null
      , desSupplierID: null
      , refID: this.state.refID
      , ref1: this.state.ref1
      , ref2: this.state.movementTypeCode
      , actionTime: this.state.date.format("YYYY/MM/DDTHH:mm:ss")
      , documentDate: this.DateNow.format("YYYY/MM/DD")
      , remark: this.state.remark
      , issueItems: acceptdata
    }
    if (acceptdata.length > 0) {
      console.log(postdata)
      Axios.post(window.apipath + "/api/wm/issued/doc", postdata).then((res) => {
        if (res.data._result.status === 1) {
          this.props.history.push('/doc/gi/manage?ID=' + res.data.ID)
          window.location.reload()
        }
      })
    }



  }

  dateTimePicker() {
    return <DatePicker timeselect={true} onChange={(e) => { this.setState({ date: e }, () => console.log(this.state.date.format("YYYY/MM/DDTHH:mm:ss"))) }} dateFormat="DD-MM-YYYY HH:mm" />
  }

  renderDocumentStatus() {
    const res = DocumentEventStatus.filter(row => {
      return row.code === this.state.documentStatus
    })
    return res.map(row => row.status)
  }
  genWarehouseData() {

    const warehouse = this.warehouseselect
    warehouse.q = '[{ "f": "Status", "c":"=", "v": 1},{ "f": "Code", "c":"!=", "v": "5005"},{ "f": "Branch_ID", "c":"=", "v": 1}]'
    // console.log(warehouse)
    Axios.get(createQueryString(warehouse)).then((res) => {
      const auto_warehouse = []
      // console.log(res)
      res.data.datas.forEach(row => {

        auto_warehouse.push({ value: row.ID, label: row.Code + ' : ' + row.Name })
      })
      this.setState({ auto_warehouse })
    })

  }

  inputCell(field, rowdata) {
    /* return  <Input type="text" value={rowdata.value === null ? "" : rowdata.value} 
    onChange={(e) => {this.editData(rowdata, e.target.value, "PackQty")}} />; */
    return <Input value={rowdata.value}
      onChange={(e) => { this.editData(rowdata, e.target.value, field) }} />
  }

  addData() {
    const data = this.state.data
    data.push({ id: this.addIndex, PackItem: "", PackQty: 1, SKU: "", UnitType: "", ID: "", Batch: "", Lot: "", Orderno: "" })
    this.addIndex -= 1
    this.setState({ data })
  }

  editData(rowdata, value, field) {
    const data = this.state.data;
    if (rowdata.column.datatype === "int") {
      let conv = value === '' ? 0 : value
      data[rowdata.index][field] = (conv === 0 ? null : conv);
    }
    else if (rowdata.column.datatype === "text") {
      data[rowdata.index][field] = value;
    }
    else {
      data[rowdata.index][field] = value.Code;
      data[rowdata.index]["SKU"] = value.SKU === undefined ? value : value.SKU;
      data[rowdata.index]["UnitType"] = value.UnitType;
      data[rowdata.index]["id"] = value.id;
    }
    this.setState({ data });

    // console.log(this.state.data)

  }


  createText(data) {
    return <span>{data}</span>
  }


  toggle() {
    this.setState({ modalstatus: !this.state.modalstatus });
  }

  createModal() {
    return <Modal isOpen={this.state.modalstatus}>
      <ModalHeader toggle={this.toggle}> <span>Name : Pallet, Box</span></ModalHeader>
      <ModalBody>
        <div>
          <AutoSelect data={this.state.storageObjectdata} result={e => this.setState({ codebase: e.label })} />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" id="off" onClick={() => { this.onClickSelect(this.state.codebase); this.toggle() }}>OK</Button>
      </ModalFooter>
    </Modal>
  }

  onClickSelect(code) {
    this.setState({ code, remark: code, basedisplay: "block" })
    if (code === undefined) {
      return null
    } else {
      Axios.get(window.apipath + "/api/trx/mapsto?type=1&code=" + code + "&isToChild=true").then((res) => {
        var resultToListTree = ToListTree(res.data.mapsto, "mapstos")
        this.onClickGroup(resultToListTree)
      })
    }
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
        maxHeight:'20%',
        min:'20px',
        overflow: 'auto',
        maxHeight: '200px', // TODO: don't cheat, let it flow to the bottom
        zIndex: '998',
      }

      return <ReactAutocomplete
        inputProps={{
          style: {
            width: "100%",
            borderRadius: "1px",
            height:"auto",
            //backgroundImage: 'url(' + arrimg + ')',
            //backgroundPosition: "8px 8px",
            //backgroundSize: "10px",
            //backgroundRepeat: "no-repeat",
            //paddingLeft: "25px",
            position: 'relative'
          },
          className: "form-control",
          placeHolder: "Input Pack"
        }}
        wrapperStyle={{ width: "100%" }}
        menuStyle={style}
        getItemValue={(item) => item.SKU}
        items={this.state.autocomplete}
        shouldItemRender={(item, value) => item.SKU.toLowerCase().indexOf(value.toLowerCase()) > -1}
        renderItem={(item, isHighlighted) =>
          <div key={item.Code} style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
            {item.SKU}
          </div>
        }
        value={rowdata.original.SKU}
        onChange={(e) => {
          
          clearTimeout(this.tid);
          let autoQuery = this.state.select2;
          let value = e.target.value === "" ? "" : e.target.value;
          autoQuery.q = '[{ "f": "Status", "c":"=", "v": 1},{ "f": "ItemQty", "c":"=", "v": 1},{ "f": "SKU_Code", "c":"like", "v": "'+ value +'%"}]';
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
            }, 1500)
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

  onClickGroup(data) {
    var arrType = data.filter((res) => {
      return res.type === 2
    })
    var groupArray = require('group-array');
    const groupItem = groupArray(arrType, 'code');
    var arrdata = []
    for (var datarow in groupItem) {
      groupItem[datarow][0].id = groupItem[datarow][0].mstID
      groupItem[datarow][0].PackItem = groupItem[datarow][0].code
      groupItem[datarow][0].PackQty = groupItem[datarow].length
      arrdata.forEach((row2, index) => {
        if (row2.code === groupItem[datarow][0].code) {
          arrdata.splice(index, 1)
        }
      });
      let getUnit = this.state.autocomplete.filter(rowauto => {
        return rowauto.Code === groupItem[datarow][0].code
      })
      groupItem[datarow][0].UnitType = getUnit[0].UnitType
      groupItem[datarow][0].SKU = getUnit[0].SKU
      arrdata.push(groupItem[datarow][0])


    }
    this.setState({ data: arrdata }, () => console.log(this.state.data))

  }

  getStatus(value) {
    // console.log(value)
    if (value === 0)
      return <Badge color="PICKING" style={{ fontSize: '0.825em', fontWeight: '500' }}>PICKING</Badge>
    else if (value === 1)
      return <Badge color="PICKED" style={{ fontSize: '0.825em', fontWeight: '500' }}>PICKED</Badge>
    else
      return null
  }

  render() {

    // console.log(this.state.data3)

    const style = { width: "200px", textAlign: "right", paddingRight: "10px" }

    let cossdetail = [
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
      /*{
        accessor: 'sumQty1', Header: 'Qty', editable: false,
        Cell: (e) => <span className="float-left">{e.original.sumQty1 === undefined ? ('0' + ' / ' + e.original.distoQtyMax) : (e.original.sumQty1 + ' / ' +
          (e.original.distoQtyMax === null ? '-' : e.original.distoQtyMax))}</span>,
      },*/
      { accessor: 'displayQty', Header: 'Qty', editable: false, },
      { accessor: "distoUnitCode", Header: "Unit" },
    ]


    let cols = [
      {
        accessor: "options", Header: "Item Number", Cell: (e) => <span> {e.original.options === undefined ? null : e.original.options === null ? null : e.original.options.split("=")[1].split("&")[0]}</span>
      },
      { accessor: "packMaster_Code", Header: "SKU Code" },
      { accessor: "packMaster_Name", Header: "SKU Name" },

      //{accessor:"skuMaster_Code",Header:"SKU", Cell: (e) => <span>{e.original.skuMaster_Code + ' : ' + e.original.skuMaster_Name}</span>},  
      { accessor: 'batchsp', Header: 'Batch', editable: false, },
      { accessor: 'lot', Header: 'Lot', editable: false, },
      { accessor: 'orderNo', Header: 'Order No', editable: false, },
      {
        accessor: 'sumQty2', Header: 'Qty', editable: false,
        Cell: (e) => <span className="float-left">{e.original.sumQty2 === undefined ? ('0' + ' / ' + e.original.quantity) : (e.original.sumQty2 + ' / ' +
          (e.original.quantity === null ? '-' : e.original.quantity))}</span>,
      },
      { accessor: "unitType_Name", Header: "Unit" },


    ]


    let col = [

      { accessor: "PackItem", Header: "SKU", editable: true, Cell: (e) => this.createAutoComplete(e), width: 400 },
      //{accessor:"SKU",Header:"SKU",},
      { accessor: "Batch", Header: "Batch", editable: true, Cell: e => this.inputCell("Batch", e), datatype: "text" },
      { accessor: "Lot", Header: "Lot", editable: true, Cell: e => this.inputCell("Lot", e), datatype: "text" },
      { accessor: "OrderNo", Header: "Order No", editable: true, Cell: e => this.inputCell("Orderno", e), datatype: "text" },
      { accessor: "PackQty", Header: "Qty", editable: true, Cell: e => this.inputCell("PackQty", e), datatype: "int" },
      { accessor: "UnitType", Header: "Unit", },


      {
        Cell: (e) => <Button onClick={() => {
          const data = this.state.data;
          data.forEach((row, index) => {
            if (row.id === e.original.id) {
              data.splice(index, 1)
            }
          })
          this.setState({data})
        }} color="danger">Remove</Button>
      }
    ]

    return (
      <div>
        {this.createModal()}
        <div className="clearfix">
          <Row>
            <Col xs="6"><div className="d-block" ><label>Issued No : </label><span style={{ marginLeft: '5px' }}>{this.state.issuedNo}</span></div></Col>
            <Col xs="6"><div><label>Document Date : <label></label></label><span style={{ marginLeft: '5px' }}>{this.state.documentDate}</span></div></Col>
          </Row>

          <Row>
            <Col xs="6">
              <div className=""><label>Movement Type :</label>{this.state.pageID ? this.createText(this.state.ref2) :
                <div style={{ width: "300px", display: "inline-block", marginLeft: '5px' }}><AutoSelect data={this.state.auto_movementType}
                  result={(e) => this.setState({ "movementType": e.value, "movementTyperesult": e.label, "movementTypeCode": e.code })} />
                </div>}</div>
            </Col>
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


          <Row>
            <Col xs="6">
              
                <label>Destination Branch : </label>{this.state.pageID ? this.createText(this.state.desBranchName) :
                 
                    <div style={{ marginLeft: '5px', display: "inline-block" }}>{this.state.auto_branch}</div> }
            </Col>
            <Col xs="6"><label >Destination Warehouse : </label>{this.state.pageID ? this.createText(this.state.desWarehouseName) :

              <div style={{ width: "300px", display: "inline-block"}}>   <AutoSelect data={this.state.auto_warehouse} result={(e) => this.setState({ "warehouse": e.value, "warehouseresult": e.label })} /></div>
              }</Col>
          </Row>


          {this.state.pageID === 0 ? null : <Row>
            <Col xs="6">
              <div className=""><label >Destination Supplier : </label>{this.createText(this.state.desSupplierName)}</div>
            </Col>
            <Col xs="6">
              <div className=""><label >Destination Customer : </label>{this.createText(this.state.desCustomerName)}</div>
            </Col>
          </Row>}


          {this.state.pageID === 0 ? null : <Row>
            <Col xs="6"><label>SAP.Doc No : </label><span style={{ marginLeft: '5px' }}>{this.state.pageID ? this.createText(this.state.refID) :
              <span> {this.state.refID}</span>
              }</span></Col>

            <Col xs="6"><label>SAP.Doc Years : </label><span style={{ marginLeft: '5px' }}>{this.state.pageID ? this.createText(this.state.ref1) :
              <span> {this.state.ref1}</span>
              }</span></Col>
          </Row>}



        </div>


        <Row>
          <Col xs="6"><label>Doc Status :</label><span style={{ marginLeft: '5px' }}> {this.renderDocumentStatus()}</span></Col>
          <Col xs="6"><label>Remark : </label>
            {this.state.pageID ? <span> {this.state.remark}</span> :
              <Input onChange={(e) => this.setState({ remark: e.target.value })} style={{ display: "inline-block", width: "300px", marginLeft: '100px' }}
                value={this.state.remark === undefined ? "" : this.state.remark} />}
          </Col>
        </Row>



        <div className="clearfix" style={{ marginTop: '3px', marginBottom: '3px' }}>
          <Button className="float-right" onClick={() => this.addData()} color="success" disabled={this.state.addstatus} style={{ width: "130px", display: this.state.adddisplay }}>Add</Button>
          {/* <span className="float-right" style={{display:this.state.basedisplay, backgroundColor:"white",padding:"5px", border:"2px solid #555555",borderRadius:"4px"}} >{this.state.code}</span> */}
        </div>


        {this.state.pageID != 0 ? null : <ReactTable columns={col} data={this.state.data.documentItems === undefined ? this.state.data : this.state.data.documentItems} NoDataComponent={() => null} style={{ background: "white" }}
          sortable={false} defaultPageSize={1000} filterable={false} editable={false} minRows={5} showPagination={false} />}

        {/* {console.log(this.state.data2)} */}
        {this.state.pageID === 0 ? null : <ReactTable columns={cols} data={this.state.data3} NoDataComponent={() => null} style={{ background: "white" }}
          sortable={false} defaultPageSize={1000} filterable={false} editable={false} minRows={5} showPagination={false} />}

        {this.state.pageID === 0 ? null : <ReactTable columns={cossdetail} data={this.state.data5} NoDataComponent={() => null} style={{ background: "white" }}
          sortable={false} defaultPageSize={1000} filterable={false} editable={false} minRows={5} showPagination={false} />}


        <Card>
          <CardBody>
            <Button onClick={() => this.createDocument()} style={{ width: "130px", marginRight: '5px', display: this.state.adddisplay }} color="primary" className="float-right">Create</Button>
            <Button style={{ width: "130px" }} type="button" color="secondary" onClick={() => this.props.history.push('/doc/gi/list')} className="float-left">Back</Button>
            {this.state.resultstatus}
          </CardBody>
        </Card>

      </div>
    )
  }
}

export default IssuedManage;
