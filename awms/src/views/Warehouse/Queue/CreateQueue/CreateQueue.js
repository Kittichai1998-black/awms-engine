import React, { Component } from 'react';
import "react-table/react-table.css";
import { Input, Card, CardBody, Button, Row, Modal, ModalHeader, ModalBody, ModalFooter, Col } from 'reactstrap';
import moment from 'moment';
import { DocumentEventStatus } from '../../Status'
import { AutoSelect, NumberInput, apicall, createQueryString, DatePicker, ToListTree, Clone } from '../../ComponentCore'
import ReactAutocomplete from 'react-autocomplete'
import arrimg from '../../../../img/arrowhead.svg'
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../../ComponentCore/Permission';

const Axios = new apicall()

class CreateQueue extends Component {
  constructor(props) {
    super(props);

    this.state = {
      DocumentData: [],
      auto_doc: [],
      Card: [],
      data: [],
      dataAdd: [],
      docID: null,
      docresult: "",
      SAPdoc: "",
      StampDate: "",
      MMType: "",
      Batch: "",
      ForCus: "",
      PickOrderID: null,
      PickOrderby: "",
      PickbyFieldID: null,
      PickbyField: "",
      SelectiveFieldValue: "",
      SelectiveFieldLabel: "",
      SelectiveValue: "",
      PriorityID: null,
      Priority: "",
      refID: "",
      ref1: "",
      ref2: "",
      remark: "",
      inputstatus: true,
      pageID: 0,
      addstatus: true,
      adddisplay: "none",
      basedisplay: "none",
      modalstatus: false,
      orderlist: [{ 'value': 0, 'label': 'FIFO' },
      { 'value': 1, 'label': 'LIFO' }],
      orderfieldlist: [{ 'value': 'CreateDate', 'label': 'Received Date' },
      { 'value': 'ProductDate', 'label': 'Stamp Date' },
      { 'value': 'Batch', 'label': 'Batch' }],
      selectivelist: [{ 'value': 'null', 'label': 'None' },
      { 'value': 'Ref1', 'label': 'Stamp Date' },
      { 'value': 'Batch', 'label': 'Batch' },
      { 'value': 'OrderNo', 'label': 'Order No' }],
      prioritylist: [{ 'value': 0, 'label': 'Low' },
      { 'value': 1, 'label': 'Normal' },
      { 'value': 2, 'label': 'High' },
      { 'value': 3, 'label': 'Critical' }],
    };
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.initialData = this.initialData.bind(this)
    this.DateNow = moment()
    this.addIndex = 0
    this.addData = this.addData.bind(this)
    this.addNewCard = this.addNewCard.bind(this)
    this.viewDetail = this.viewDetail.bind(this)
    this.genBtnDetail = this.genBtnDetail.bind(this)
    this.genBtnRemoveCard = this.genBtnRemoveCard.bind(this)
    this.createCardsList = this.createCardsList.bind(this)
    this.removeCard = this.removeCard.bind(this)
    this.createAutoDocList = this.createAutoDocList.bind(this)


    this.docselect = {
      queryString: window.apipath + "/api/viw",
      t: "Document",
      q: "[{ 'f': 'DocumentType_ID', c:'=', 'v': 1002},{ 'f': 'EventStatus', c:'=', 'v': '10'}]",
      f: "ID,Code,DesWarehouse,RefID,Ref2,DesCustomer,DesCustomerName,Batch,Ref1",
      g: "",
      s: "[{'f':'ID','od':'asc'}]",
      sk: 0,
      all: "",
    }
  }
  async componentWillMount() {
    document.title = "Create Queue : AWMS";
    //permission
    this.setState({ showbutton: "none" })
    let dataGetPer = await GetPermission()
    CheckWebPermission("CQueue", dataGetPer, this.props.history);
    this.displayButtonByPermission(dataGetPer)
  }
  displayButtonByPermission(dataGetPer) {
    // 63 CreateReceive_view
    if (!CheckViewCreatePermission("CreateQueue_create&modify", dataGetPer)) {
      this.props.history.push("/404")
    }
  }
  initialData() {
    Axios.get(createQueryString(this.docselect)).then(Docresult => {
      this.setState({ DocumentData: Docresult.data.datas, addstatus: true }, () => {
        const DocumentData = []
        this.state.DocumentData.forEach(row => {
          DocumentData.push({
            value: row.ID
            , SAPdoc: row.RefID
            , MMType: row.Ref2
            , StampDate: row.ref1
            , Batch: row.Batch
            , ForCus: row.DesCustomer + ' : ' + row.DesCustomerName
            , label: row.Code + ' : ' + row.DesWarehouse
          })
        })
        this.setState({ DocumentData }, () => this.createAutoDocList())
      })
    })
  }

  componentDidMount() {
    this.initialData()

  }

  onHandleClickCancel(event) {
    this.forceUpdate();
    event.preventDefault();
  }

  addNewCard(datarow) {
    return <div style={{ "border-radius": "15px", "border": "1px solid white", "padding": "20px", background: "white", "margin": "5px" }}>
      <Row>
        <Col md="2" style={{ textAlign: "right", "vertical-align": "middle" }}><label>Document : </label></Col>
        <Col md="9">
          <span>{datarow.docDetail ? datarow.docDetail : ""}</span>
        </Col>
        <Col md="1">
          <div className="clearfix">
            {this.genBtnDetail(datarow.ID)}
          </div>
        </Col>
      </Row>
      <Row>
        <Col md="2" style={{ textAlign: "right", "vertical-align": "middle" }}><label>SAP Document : </label></Col>
        <Col md="5">
          <span>{datarow.RefID ? datarow.RefID : ""}</span>
        </Col>
        <Col md="5"></Col>
      </Row>

      <Row>
        <Col md="2" style={{ textAlign: "right", "vertical-align": "middle" }}><label>Movement Type : </label></Col>
        <Col md="5">
          <span>{datarow.Ref2 ? datarow.Ref2 : ""}</span>
        </Col>
        <Col md="5"></Col>
      </Row>

      <Row>
        <Col md="2" style={{ textAlign: "right", "vertical-align": "middle" }}><label>For Customer : </label></Col>
        <Col md="5">
          <span>{datarow.DesCustomer ? datarow.DesCustomer : ""}</span>
        </Col>
        <Col md="5"></Col>
      </Row>

      <Row>
        <Col md="2" style={{ textAlign: "right", "vertical-align": "middle" }}><label>Pick by : </label></Col>
        <Col md="5">
          <div>
            <span>{datarow.PickOrderby ? datarow.PickOrderby : ""}</span>
          </div>
        </Col>
        <Col md="5">
          <div>
            <span>{datarow.PickbyField ? datarow.PickbyField : ""}</span>
          </div>
        </Col>
      </Row>

      <Row>
        <Col md="2" style={{ textAlign: "right", "vertical-align": "middle" }}><label>Selective : </label></Col>
        <Col md="5">
          <div>
            <span>{datarow.SelectiveFieldLabel ? datarow.SelectiveFieldLabel : ""}</span>
          </div>
        </Col>
        <Col md="5">
          <div>
            <span>{datarow.SelectiveValue ? datarow.SelectiveValue : ""}</span>
          </div>
        </Col>
      </Row>

      <Row>
        <Col md="2" style={{ textAlign: "right", "vertical-align": "middle" }}><label>Priority : </label></Col>
        <Col md="5">
          <div>
            <span>{datarow.Priority ? datarow.Priority : ""}</span>
          </div>
        </Col>
      </Row>
      <div className="clearfix">
        {this.genBtnRemoveCard(datarow.ID)}
      </div>
    </div>
  }

  addData() {
    const dataAdd = this.state.dataAdd;
    if (this.state.docresult === "") {
      alert("กรุณาเลือก Document ที่ต้องการสร้างคิวงาน")
    } else {
      dataAdd.push({
        ID: this.state.docID
        , docDetail: this.state.docresult
        , RefID: this.state.SAPdoc
        , Ref1: this.state.StampDate
        , Ref2: this.state.MMType
        , Batch: this.state.Batch
        , DesCustomer: this.state.ForCus
        , PickOrderID: this.state.PickOrderID
        , PickOrderby: this.state.PickOrderby
        , PickbyFieldID: this.state.PickbyFieldID
        , PickbyField: this.state.PickbyField
        , SelectiveFieldValue: this.state.SelectiveFieldValue
        , SelectiveFieldLabel: this.state.SelectiveFieldLabel
        , SelectiveValue: this.state.SelectiveValue
        , PriorityID: this.state.PriorityID
        , Priority: this.state.Priority
      });
      this.setState({ dataAdd, "docID": "", "SAPdoc": "", "MMType": "", "ForCus": "", "StampDate": "", "Batch": "", "docresult": "" })
      this.createAutoDocList();
      this.createCardsList();
    }
  }
  createAutoDocList() {
    const auto_doc = [...this.state.DocumentData]
    this.state.dataAdd.forEach((datarowadd) => {
      auto_doc.forEach((datarow, index) => {
        if (datarow.value === datarowadd.ID) {
          auto_doc.splice(index, 1);
        }
      })
    })
    this.setState({ auto_doc });
  }

  createCardsList() {
    console.log(this.state.dataAdd)
    const dataAdd = this.state.dataAdd
    let Card = []
    dataAdd.forEach((datarow, index) => {
      Card = Card.concat(this.addNewCard(datarow));
    })
    this.setState({ Card });
  }

  viewDetail(docID) {
    if (docID) {
      window.open('/doc/gi/manage?ID=' + docID)
    }
  }
  removeCard(docID) {
    const dataAdd = this.state.dataAdd
    dataAdd.forEach((datarow, index) => {
      if (datarow.ID === docID) {
        dataAdd.splice(index, 1);
      }
    })
    this.setState({ dataAdd })
    this.createCardsList()
    this.createAutoDocList()
  }

  genBtnDetail(docID) {
    if (docID === "") {
      return {}
    } else {
      return <Button className="float-right" type="button" color="primary" onClick={() => window.open('/doc/gi/manage?ID=' + docID)}>Detail</Button>
    }
  }

  genBtnRemoveCard(docID) {
    if (docID === "") {
      return {}
    } else {
      return <Button id="per_button_doc"
        style={{ background: "#ef5350", borderColor: "#ef5350", width: '130px', display: this.state.showbutton }}
        color="primary"
        className="float-right"
        onClick={() => this.removeCard(docID)}>Remove</Button>
    }
  }

  render() {
    const Cards = this.state.Card

    return (
      <div>
        <Row>
          <Col lg="6">
            <Card style={Cards.length > 0 ? { "border-radius": "15px", "border": "1px solid #8080804f", background: "#8080804f" } : { "display": "none" }}>
              <span style={{ "padding-left": "15px", fontWeight: "bold", fontSize: "1.1em" }}>รายการ Document Issue</span>
              {Cards}
            </Card>
          </Col>

          <Col lg="6">
            <div style={{ "border-radius": "15px", "border": "1px solid #8080804f", "padding": "20px", background: "#FFFFFF" }}>
              <Row style={{ "padding-top": "10px" }}>
                <Col md="2" style={{ textAlign: "right", "vertical-align": "middle" }}><label>Document : </label></Col>
                <Col md="9">
                  <div style={{}}>
                    <AutoSelect selectfirst={false} data={this.state.auto_doc}
                      result={(e) => this.setState({ "docID": e.value, "SAPdoc": e.SAPdoc, "MMType": e.MMType, "ForCus": e.ForCus, "StampDate": e.StampDate, "Batch": e.Batch, "docresult": e.label })} />
                  </div>
                </Col>
                <Col md="1">
                  <div className="clearfix">
                    <Button className="float-right" onClick={() => this.viewDetail(this.state.docID)} color="primary" >Detail</Button>
                  </div>
                </Col>
              </Row>

              <Row style={{ "padding-top": "10px" }}>
                <Col md="2" style={{ textAlign: "right", "vertical-align": "middle" }}><label>SAP Document : </label></Col>
                <Col md="5">
                  <span>{this.state.SAPdoc ? this.state.SAPdoc : ""}</span>
                </Col>
                <Col md="5"></Col>
              </Row>

              <Row style={{ "padding-top": "10px" }}>
                <Col md="2" style={{ textAlign: "right", "vertical-align": "middle" }}><label>Movement Type : </label></Col>
                <Col md="5">
                  <span>{this.state.MMType ? this.state.MMType : ""}</span>
                </Col>
                <Col md="5"></Col>
              </Row>

              <Row style={{ "padding-top": "10px" }}>
                <Col md="2" style={{ textAlign: "right", "vertical-align": "middle" }}><label>For Customer : </label></Col>
                <Col md="5">
                  <span>{this.state.ForCus ? this.state.ForCus : ""}</span>
                </Col>
                <Col md="5"></Col>
              </Row>

              <Row style={{ "padding-top": "10px" }}>
                <Col md="2" style={{ textAlign: "right", "vertical-align": "middle" }}><label>Pick by : </label></Col>
                <Col md="5">
                  <div style={{}}>
                    <AutoSelect selectfirst={false} data={this.state.orderlist}
                      result={(e) => this.setState({ "PickOrderID": e.value, "PickOrderby": e.label })} />
                  </div>
                </Col>
                <Col md="5">
                  <div style={{}}>
                    <AutoSelect selectfirst={false} data={this.state.orderfieldlist}
                      result={(e) => this.setState({ "PickbyFieldID": e.value, "PickbyField": e.label })} />
                  </div>
                </Col>
              </Row>

              <Row style={{ "padding-top": "10px" }}>
                <Col md="2" style={{ textAlign: "right", "vertical-align": "middle" }}><label>Selective : </label></Col>
                <Col md="5">
                  <div style={{}}>
                    <AutoSelect selectfirst={false} data={this.state.selectivelist}
                      result={(e) => this.setState({ "SelectiveFieldValue": e.value, "SelectiveFieldLabel": e.label })} />
                  </div>
                </Col>
                <Col md="5">
                  <div style={{ display: this.state.SelectiveFieldValue === "null" || this.state.SelectiveFieldValue === "" ? "none" : "inline" }}>
                    <Input style={{ display: "inline" }}
                      onChange={(e) => this.setState({ "SelectiveValue": e.target.value })}
                      Value={(this.state.SelectiveFieldValue === "Batch" ? this.state.Batch : "")}
                    />
                  </div>
                </Col>
              </Row>

              <Row style={{ "padding-top": "10px" }}>
                <Col md="2" style={{ textAlign: "right", "vertical-align": "middle" }}><label>Priority : </label></Col>
                <Col md="5">
                  <div style={{}}>
                    <AutoSelect selectfirst={false} data={this.state.prioritylist}
                      result={(e) => this.setState({ "PriorityID": e.value, "Priority": e.label })} />
                  </div>
                </Col>
              </Row>

              <div className="clearfix">
                <Button id="per_button_doc"
                  style={{ background: "#66bb6a", borderColor: "#66bb6a", width: '130px', display: this.state.showbutton }}
                  color="primary"
                  className="float-right"
                  onClick={() => this.addData()}>Add</Button>
              </div>
            </div>
            <Card style={{ "border-radius": "15px", "border": "1px solid #8080804f", background: "white" }}>
              <CardBody>
                <Button onClick={() => this.updateData()} color="primary" style={{ background: "#26c6da", borderColor: "#26c6da", width: '130px', marginLeft: '5px' }} className="float-right">Accept</Button>
                <Button onClick={() => this.onHandleClickCancel()} color="danger" style={{ background: "#ef5350", borderColor: "#ef5350", width: '130px' }} className="float-right">Cancel</Button>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

export default CreateQueue;
