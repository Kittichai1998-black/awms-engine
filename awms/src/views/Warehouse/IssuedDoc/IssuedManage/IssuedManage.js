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
      addstatus: true,
      adddisplay: "none",
      basedisplay: "none",
      modalstatus: false,
      storageObjectdata: []

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





          console.log(rowselect1)


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
          console.log(groupPack)
          var groupdocItem = rowselect1.data.document.documentItems
          console.log(groupPack)
          let sumArr = []
          let sumArr1 = []

          //for (let res1 in groupPack) {
          //  let gpf = groupPack[res1][0];
          //  let di = groupdocItem.filter(x => {
          //    return x.id = gpf.docItemID;
          //  })
          //  di.sumQty1 = gpf.distoQty
          //  di.batch = gpf.batch
          //  di.options = gpf.options
          //  di.quantityDoc = gpf.quantity
          //  di.lot = gpf.lot
          //  di.orderNo = gpf.orderNo

          //  sumArr1.push(di);
          //}

          groupdocItem.forEach(x => {
            let pg = rowselect1.data.bstos.filter(y => { return y.docItemID === x.id });
            console.log(pg)
            if (pg.length > 0) {
              x.sumQty1 = pg[0].distoBaseQty
              //x.batch = pg[0].batch
              //x.options = pg[0].options
              //x.lot = pg[0].lot
              //x.orderNo = pg[0].orderNo
              x.distoUnitCode = pg[0].distoUnitCode
            }
            else {
              x.distoBaseUnitCode = x.distoBaseUnitCode

            }
            x.batchsp = x.batch
            x.options = x.options
            x.baseQuantity = x.baseQuantity
            x.distoBaseUnitCode = x.distoBaseUnitCode
            x.status = x.status
            sumArr1.push(x);
          })



          this.setState({ data3: sumArr1 });

          console.log(sumArr1)

          console.log(this.state.batch)

          for (let res1 in groupPack) {
            let sum = 0
            groupPack[res1].forEach(res2 => {
              res2.sumQty1 = res2.distoBaseQty
              sumArr1.forEach(x => {
                if (x.id === res2.docItemID) {
                  //res2.quantity = x.quantity
                  res2.options = x.options
                  res2.baseQuantity = x.baseQuantity

                }
              })
              sumArr.forEach(response => {
                if (response.code === res2.code) {
                  res2.code = "";
                }
              })

            })
            sumArr.push(groupPack[res1][groupPack[res1].length - 1])
          }


          var sumQTYPack = 0
          var result = rowselect1.data.document.documentItems




          this.setState({ data2: sumArr }, () => {

            result.forEach(row1 => {
              sumQTYPack = 0
              row1.batch = this.state.batch

              this.state.data2.forEach(row2 => {

                if (row1.packMaster_Code === row2.packCode) {
                  sumQTYPack += row2.sumQty
                  row1.sumQty = sumQTYPack

                }
              })
            })
          })

          this.setState({ data3: sumArr1 })

          //**************************************8
        }

      })
    } else {
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

    Axios.get(createQueryString(this.branchselect)).then(branchresult => {
      this.setState(
        { auto_branch: branchresult.data.datas[0].Code + ' : ' + branchresult.data.datas[0].Name, addstatus: false, values: branchresult.data.datas[0].ID })



      //  this.setState({ auto_branch: branchresult.data.datas, addstatus: false }, () => {
      //    const auto_branch = []    
      //    this.state.auto_branch.forEach(row => {
      //      auto_branch.push({ value: row.ID, label: row.Code + ' : ' + row.Name })
      // })
      //    this.setState({ auto_branch })
      //  })
    })
    Axios.get(createQueryString(this.supplierselect)).then(supplierresult => {
      this.setState({ auto_supplier: supplierresult.data.datas, addstatus: false }, () => {
        const auto_supplier = []
        this.state.auto_supplier.forEach(row => {
          auto_supplier.push({ value: row.ID, label: row.Code + ' : ' + row.Name })
        })
        this.setState({ auto_supplier })
        console.log(this.state.auto_supplier)
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
        console.log(this.state.auto_movementType)
        this.state.auto_movementType.forEach(row => {
          auto_movementType.push({ value: row.ID, label: row.Code + ' : ' + row.Name, code: row.Code })
        })
        this.setState({ auto_movementType })
      })
    })

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
      console.log(row.id)
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
      console.log(res)
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
    if (value !== "") {
      if (rowdata.column.datatype === "int") {
        let conv = value === '' ? 0 : value
        const type = isInt(conv)
        //if(type){
        //  data[rowdata.index][field] = (conv === 0 ? null : conv);
        //}
        //else{
        //  alert("??")
        //}
        data[rowdata.index][field] = (conv === 0 ? null : conv);
      }
      else if (rowdata.column.datatype === "text") {
        data[rowdata.index][field] = value;

      }
      else {
        data[rowdata.index][field] = value.Code;
        data[rowdata.index]["SKU"] = value.SKU === undefined ? value : value.SKU;
        data[rowdata.index]["UnitType"] = value.UnitType;
        data[rowdata.index]["Lot"] = value.lot;
        data[rowdata.index]["Orderno"] = value.orderno;
        data[rowdata.index]["Batch"] = value.batch;
        data[rowdata.index]["id"] = value.id;
      }
      this.setState({ data });


      let res = this.state.autocompleteUpdate
      this.state.data.forEach(datarow => {
        res = res.filter(row => {
          return datarow[field] !== row.Code
        })
      })
      this.setState({ autocomplete: res })
    }
    else if (rowdata.column.datatype !== "int") {
      data[rowdata.index][field] = "";
      data[rowdata.index]["SKU"] = "";
      data[rowdata.index]["UnitType"] = "";
      data[rowdata.index]["Lot"] = "";
      data[rowdata.index]["Orderno"] = "";
      data[rowdata.index]["Batch"] = "";
      data[rowdata.index]["id"] = "";
    }
    else if (rowdata.column.datatype === "int") {
      data[rowdata.index][field] = "";
    }
    this.setState({ data });

    console.log(this.state.data)

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
        //position: 'fixed',
        //maxHeight:'50px',
        //min:'20px',
        overflow: 'auto',
        maxHeight: '200px', // TODO: don't cheat, let it flow to the bottom
        zIndex: '998',
      }

      return <ReactAutocomplete
        inputProps={{
          style: {
            width: "100%", borderRadius: "1px", backgroundImage: 'url(' + arrimg + ')',
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
          <div key={item.Code} style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
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
              this.editData(rowdata, res[0], rowdata.column.id)
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
    console.log(value)
    if (value === 0)
      return <Badge color="PENDING" style={{ fontSize: '0.825em', fontWeight: '500' }}>PENDING</Badge>
    else if (value === 1)
      return <Badge color="PICK" style={{ fontSize: '0.825em', fontWeight: '500' }}>PICK</Badge>
    else
      return null
  }

  render() {

    console.log(this.state.data3)

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
      {
        accessor: 'sumQty1', Header: 'Qty', editable: false,
        Cell: (e) => <span className="float-left">{e.original.sumQty1 === undefined ? ('0' + ' / ' + e.original.baseQuantity) : (e.original.sumQty1 + ' / ' +
          (e.original.baseQuantity === null ? '-' : e.original.baseQuantity))}</span>,
      },
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
        accessor: 'sumQty1', Header: 'Qty', editable: false,
        Cell: (e) => <span className="float-left">{e.original.sumQty1 === undefined ? ('0' + ' / ' + e.original.baseQuantity) : (e.original.sumQty1 + ' / ' +
          (e.original.baseQuantity === null ? '-' : e.original.baseQuantity))}</span>,
      },
      { accessor: "distoUnitCode", Header: "Unit" },


    ]


    let col = [

      { accessor: "PackItem", Header: "SKU", editable: true, Cell: (e) => this.createAutoComplete(e), width: 550 },
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
      }
    ]

    return (
      <div>
        {this.createModal()}
        <div className="clearfix">
          <Row>
            <Col xs="6"><div className="d-block" >Issued No : <span style={{ marginLeft: '5px' }}>{this.state.issuedNo}</span></div></Col>
            <Col xs="6"><div>Document Date : <span style={{ marginLeft: '5px' }}>{this.state.documentDate}</span></div></Col>
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
              <div className="">
                <label>Destination Branch : </label>{this.state.pageID ? this.createText(this.state.desBranchName) :
                  <div style={{ width: "300px", display: "inline-block", marginLeft: '5px' }}>
                    <div style={{ marginLeft: '5px', display: "inline-block" }}>{this.state.auto_branch}</div> </div>}</div>
            </Col>
            <Col xs="6"><div className=""><label >Destination Warehouse : </label>{this.state.pageID ? this.createText(this.state.desWarehouseName) :
              <div style={{ width: "300px", display: "inline-block", marginLeft: '5px' }}>
                <AutoSelect data={this.state.auto_warehouse} result={(e) => this.setState({ "warehouse": e.value, "warehouseresult": e.label })} />
              </div>}</div></Col>
          </Row>


          {this.state.pageID === 0 ? null : <Row>
            <Col xs="6">
              <div className=""><label > Destination Supplier : </label>{this.createText(this.state.desSupplierName)}</div>
            </Col>
            <Col xs="6">
              <div className=""><label > Destination Customer : </label>{this.createText(this.state.desCustomerName)}</div>
            </Col>
          </Row>}


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
          <Col xs="6"><div>Doc Status :<span style={{ marginLeft: '5px' }}> {this.renderDocumentStatus()}</span></div></Col>
          <Col xs="6"><div className=""><label>Remark : </label>
            {this.state.pageID ? <span> {this.state.remark}</span> :
              <Input onChange={(e) => this.setState({ remark: e.target.value })} style={{ display: "inline-block", width: "300px", marginLeft: '100px' }}
                value={this.state.remark === undefined ? "" : this.state.remark} />}
          </div></Col>
        </Row>



        <div className="clearfix" style={{ marginTop: '3px', marginBottom: '3px' }}>
          <Button className="float-right" onClick={() => this.addData()} color="success" disabled={this.state.addstatus} style={{ width: "130px", display: this.state.adddisplay }}>Add</Button>
          {/* <span className="float-right" style={{display:this.state.basedisplay, backgroundColor:"white",padding:"5px", border:"2px solid #555555",borderRadius:"4px"}} >{this.state.code}</span> */}
        </div>


        {this.state.pageID != 0 ? null : <ReactTable columns={col} data={this.state.data.documentItems === undefined ? this.state.data : this.state.data.documentItems} NoDataComponent={() => null} style={{ background: "white" }}
          sortable={false} defaultPageSize={1000} filterable={false} editable={false} minRows={5} showPagination={false} />}

        {console.log(this.state.data2)}
        {this.state.pageID === 0 ? null : <ReactTable columns={cols} data={this.state.data3} NoDataComponent={() => null} style={{ background: "white" }}
          sortable={false} defaultPageSize={1000} filterable={false} editable={false} minRows={5} showPagination={false} />}

        {this.state.pageID === 0 ? null : <ReactTable columns={cossdetail} data={this.state.data2} NoDataComponent={() => null} style={{ background: "white" }}
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
