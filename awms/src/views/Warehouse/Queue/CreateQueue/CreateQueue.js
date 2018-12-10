import React, { Component } from 'react';
import "react-table/react-table.css";
import {Input, Card, CardBody, Button, Row, Modal, ModalHeader, ModalBody, ModalFooter, Col} from 'reactstrap';
import moment from 'moment';
import {DocumentEventStatus} from '../../Status'
import {AutoSelect, NumberInput, apicall, createQueryString, DatePicker, ToListTree, Clone } from '../../ComponentCore'
import ReactAutocomplete from 'react-autocomplete'
import arrimg from '../../../../img/arrowhead.svg'

function isInt(value) {
  return !isNaN(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10));
}

class DocumentInput extends React.Component {
  render() {
    return <div style={{"border-radius": "15px", "border": "1px solid gray", "padding": "20px", background:"white"}}> </div>
  }
}
const Axios = new apicall()

class CreateQueue extends Component{
  constructor(props) {
    super(props);
    
    this.state = {
      documents: [],
      data : [],
      docID:"",
      SAPdoc:"",
      docresult:"",
      MMType:"",
      ForCus:"",
      StampDate:"",
      selective:"",
      branch:[],
      auto_doc:[],
      branch:"",
      customer:"",
      warehouse:"",
      Batch:"",
      refID:"",
      ref1:"",
      ref2:"",
      remark:"",    
      inputstatus:true,
      pageID:0,
      addstatus:true,
      adddisplay:"none",
      basedisplay:"none",
      modalstatus:false,
      orderlist:[ {'value' : 0,'label' : 'FIFO'},
                  {'value' : 1,'label' : 'LIFO'}],
      orderfieldlist:[{'value' : 'CreateDate','label' : 'Received Date'},
                      {'value' : 'ProductDate','label' : 'Stamp Date'},
                      {'value' : 'Batch','label' : 'Batch'}],
      selectivelist:[ {'value' : 'null','label' : 'None'},
                      {'value' : 'Ref1','label' : 'Stamp Date'},
                      {'value' : 'Batch','label' : 'Batch'}],
      prioritylist:[{'value' : 0,'label' : 'Low'},
                    {'value' : 1,'label' : 'Normal'},
                    {'value' : 2,'label' : 'High'},
                    {'value' : 3,'label' : 'Critical'}],
    };
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.initialData = this.initialData.bind(this)
    this.DateNow = moment()
    this.addIndex = 0
    this.addData = this.addData.bind(this)
    this.addNewCard = this.addNewCard.bind(this)
    this.viewDetail = this.viewDetail.bind(this)
    this.genBtnDetail = this.genBtnDetail.bind(this)


    this.docselect = {queryString:window.apipath + "/api/viw",
      t:"Document",
      q:"[{ 'f': 'DocumentType_ID', c:'=', 'v': 1002},{ 'f': 'EventStatus', c:'=', 'v': '10'}]",
      f:"ID,Code,DesWarehouse,RefID,Ref2,DesCustomer,DesCustomerName,Batch,Ref1",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:0,
      all:"",}
  }
    
  initialData(){
    Axios.get(createQueryString(this.docselect)).then(branchresult => {
      this.setState({auto_doc : branchresult.data.datas, addstatus:true }, () => {
        const auto_doc = []
        this.state.auto_doc.forEach(row => {
          auto_doc.push({value:row.ID
                        ,SAPdoc:row.RefID
                        ,MMType:row.Ref2
                        ,StampDate:row.ref1
                        ,Batch:row.Batch
                        ,ForCus:row.DesCustomer + ' : ' + row.DesCustomerName
                        ,label:row.Code + ' : ' + row.DesWarehouse 
          })
        })
        this.setState({auto_doc})
      })
    })
  }
    
  componentDidMount(){
    this.initialData()
  }
      
  onHandleClickCancel(event){
    this.forceUpdate();
    event.preventDefault();
  }

  addNewCard(){
    return <div style={{"border-radius": "15px", "border": "1px solid white", "padding": "20px", background:"white", "margin":"5px"}}>
      <Row>
        <Col md="2" style={{textAlign:"right", "vertical-align": "middle"}}><label>Document : </label></Col>
        <Col md="9">
          <span>{this.state.docresult?this.state.docresult:""}</span>
        </Col>
        <Col md="1">
          <div className="clearfix">
            {this.genBtnDetail(this.state.docID)}
          </div>
        </Col>
      </Row>
      <Row>
        <Col md="2" style={{textAlign:"right", "vertical-align": "middle"}}><label>SAP Document : </label></Col>
        <Col md="5">
          <span>{this.state.SAPdoc?this.state.SAPdoc:""}</span>
        </Col>
        <Col md="5"></Col>
      </Row>
      
      <Row>
        <Col md="2" style={{textAlign:"right", "vertical-align": "middle"}}><label>Movement Type : </label></Col>
        <Col md="5">
          <span>{this.state.MMType?this.state.MMType:""}</span>
        </Col>
        <Col md="5"></Col>
      </Row>

      <Row>
        <Col md="2" style={{textAlign:"right", "vertical-align": "middle"}}><label>For Customer : </label></Col>
        <Col md="5">
            <span>{this.state.ForCus?this.state.ForCus:""}</span>
        </Col>
        <Col md="5"></Col>
      </Row>

      <Row>
        <Col md="2" style={{textAlign:"right", "vertical-align": "middle"}}><label>Pick by : </label></Col>
        <Col md="5">
          <div>
            <span>{this.state.ForCus?this.state.ForCus:""}</span>
          </div>
        </Col>
        <Col md="5">
          <div>
            <span>{this.state.ForCus?this.state.ForCus:""}</span>
          </div>
        </Col>
      </Row>

      <Row>
        <Col md="2" style={{textAlign:"right", "vertical-align": "middle"}}><label>Selective : </label></Col>
        <Col md="5">
          <div>
            <span>{this.state.ForCus?this.state.ForCus:""}</span>
          </div>
        </Col>
        <Col md="5">
          <div style={{display:this.state.selective==="null"?"none":"inline"}}>
            <Input onChange={(e) => this.setState({refID:e.target.value})} style={{display:"inline-block"}}
            value={this.state.refID === undefined ? "" : this.state.refID}/>
          </div>
        </Col>
      </Row>

      <Row>
        <Col md="2" style={{textAlign:"right", "vertical-align": "middle"}}><label>Priority : </label></Col>
        <Col md="5">
          <div>
            <span>{this.state.ForCus?this.state.ForCus:""}</span>
          </div>
        </Col>
      </Row>
      <div className="clearfix">
        <Button id="per_button_doc" 
        style={{ background: "#ef5350", borderColor: "#ef5350", width: '130px',display:this.state.showbutton }}
        color="primary" 
        className="float-right" 
        onClick={() => this.addData()}>Remove</Button>
      </div>
    </div>
  }

  addData(){
    const documents = this.state.documents.concat(this.addNewCard());
    //documents.push({ "ID": this.state.docID})
    const auto_doc = this.state.auto_doc; 
    auto_doc.forEach((datarow, index) => {
      if (datarow.value === this.state.docID) {
        auto_doc.splice(index, 1);
      }
    })
    this.setState({ documents });
    this.setState({ auto_doc });
  }

  viewDetail(docID){
    if(docID){
      window.open('/doc/gi/manage?ID=' + docID)
    }
  }

  genBtnDetail(docID){
    if(docID===""){
      return {}
    }else{
      return <Button className="float-right" type="button" color="primary" onClick={() => window.open('/doc/gi/manage?ID=' + docID)}>Detail</Button>
    }
  }

  render(){
    const documents = this.state.documents

    return(
      <div>
        <Row>
          <Col lg="6"> 
            <Card style={documents.length > 0?{"border-radius": "15px", "border": "1px solid #8080804f", background:"#8080804f"}:{"display":"none"}}>
              <span style={{"padding-left":"15px", fontWeight:"bold", fontSize:"1.1em"}}>รายการ Document Issue</span>
              { documents }
            </Card>
          </Col> 

          <Col lg="6"> 
            <div style={{"border-radius": "15px", "border": "1px solid #8080804f", "padding": "20px", background:"white"}}>
              <Row style={{"padding-top":"10px"}}>
                <Col md="2" style={{textAlign:"right", "vertical-align": "middle"}}><label>Document : </label></Col>
                <Col md="9">
                  <div style={{}}>
                    <AutoSelect data={this.state.auto_doc} 
                    result={(e) => this.setState({"docID":e.value,"SAPdoc":e.SAPdoc,"MMType":e.MMType,"ForCus":e.ForCus,"StampDate":e.StampDate,"Batch":e.Batch,"docresult":e.label})}/>
                  </div>
                </Col>
                <Col md="1">
                  <div className="clearfix">
                    <Button className="float-right" onClick={() => this.viewDetail(this.state.docID)} color="primary" >Detail</Button>
                  </div>
                </Col>
              </Row>

              <Row style={{"padding-top":"10px"}}>
                <Col md="2" style={{textAlign:"right", "vertical-align": "middle"}}><label>SAP Document : </label></Col>
                <Col md="5">
                  <span>{this.state.SAPdoc?this.state.SAPdoc:""}</span>
                </Col>
                <Col md="5"></Col>
              </Row>
              
              <Row style={{"padding-top":"10px"}}>
                <Col md="2" style={{textAlign:"right", "vertical-align": "middle"}}><label>Movement Type : </label></Col>
                <Col md="5">
                  <span>{this.state.MMType?this.state.MMType:""}</span>
                </Col>
                <Col md="5"></Col>
              </Row>

              <Row style={{"padding-top":"10px"}}>
                <Col md="2" style={{textAlign:"right", "vertical-align": "middle"}}><label>For Customer : </label></Col>
                <Col md="5">
                    <span>{this.state.ForCus?this.state.ForCus:""}</span>
                </Col>
                <Col md="5"></Col>
              </Row>

              <Row style={{"padding-top":"10px"}}>
                <Col md="2" style={{textAlign:"right", "vertical-align": "middle"}}><label>Pick by : </label></Col>
                <Col md="5">
                  <div style={{}}>
                    <AutoSelect data={this.state.orderlist} 
                    result={(e) => this.setState({"customer":e.value, "customerresult":e.label})}/>
                  </div>
                </Col>
                <Col md="5">
                  <div style={{}}>
                    <AutoSelect data={this.state.orderfieldlist} 
                    result={(e) => this.setState({"customer":e.value, "customerresult":e.label})}/>
                  </div>
                </Col>
              </Row>

              <Row style={{"padding-top":"10px"}}>
                <Col md="2" style={{textAlign:"right", "vertical-align": "middle"}}><label>Selective : </label></Col>
                <Col md="5">
                  <div style={{}}>
                    <AutoSelect data={this.state.selectivelist} 
                    result={(e) => this.setState({"selective":e.value, "docresult":e.label})}/>
                  </div>
                </Col>
                <Col md="5">
                  <div style={{display:this.state.selective==="null" ?"none":"inline"}}>
                    <Input style={{display:"inline-block"}}
                    value={this.state.selective === "Ref1" ? this.state.ref1 : (this.state.selective === "Batch" ? this.state.Batch : "")}/>
                  </div>
                </Col>
              </Row>

              <Row style={{"padding-top":"10px"}}>
                <Col md="2" style={{textAlign:"right", "vertical-align": "middle"}}><label>Priority : </label></Col>
                <Col md="5">
                  <div style={{}}>
                    <AutoSelect data={this.state.prioritylist} 
                    result={(e) => this.setState({"branch":e.value, "branchresult":e.label})}/>
                  </div>
                </Col>
              </Row>
                
              <div className="clearfix">
                <Button id="per_button_doc" 
                style={{ background: "#66bb6a", borderColor: "#66bb6a", width: '130px',display:this.state.showbutton }}
                color="primary" 
                className="float-right" 
                onClick={() => this.addData()}>Add</Button>
              </div>
            </div>
            <Card style={{"border-radius": "15px", "border": "1px solid #8080804f", background:"white"}}>
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
