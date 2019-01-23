import React, { Component } from 'react';
import "react-table/react-table.css";
import {Input, Card, CardBody, Button, Row, Col, Form,FormGroup,FormText,Label} from 'reactstrap';
import moment from 'moment';
import Select from 'react-select';
import {AutoSelect, apicall, createQueryString} from '../../ComponentCore'
import Popup from 'reactjs-popup'

const Axios = new apicall()
const imgClose = <img style={{ width: "28px", height: "auto" }} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAANkSURBVGhD7ZlHyxRBEIYXI4aDYgDDP1Bvpr9hwqMR9ageFBN6ULwaPsNdFEU9iH9DDwZQ9GIGIwaMCPo+sA1lU7PT3Tu7sjAvPLisXdXVOz3V1fV1WrVq1YjGiZViv7gu7osP4lcXPvPdNbFPrBDY/HctFMfFC/Enk2cC2wVi6JolzoifwgsuB3yMCXwORevFW+EF0w/4XCcGpgninPAmh4/iotgilok5YmIXPvPdVnFJMNbzATyN8aJRTRU3hTfhA7FJTBGpYuxm8VB4Pm+IHH89xa+Bw3iSb2Kn4MmUCttd4ruI/TNnI0/ivIidk3WWiqbE9nop4nlOir7ECxs7vSXmi6aFz9sinm+NKBJp7Z2wzp6LQeZtXvbHws75RswU2TorrKOvgkftaVH33xxV2SwWzGXnPi2yxK8cH1K8sJ4Oi9+C7ZYqxmKDraeDws7NS561bTnirQNSpZdtCCCMSV1ECD7YeYsgbb8SYQwcE0miyGKvW+MNIhaP2gYCdYuIgw82+Iq1XdhxT0VSAUhVaQ0/iapDpSogbxE5YxFP4bOw46vewX9ESWyNLoheSgksN/igy8La7BW1op63RtQ2deoVYGnwaJuwdldFrbh4WKPlIkVVgZYGj+LtfFfUituTNcqp071FWHKCR7OFtedgrVWc/yeJHFUtIjd4NFlYH8RWq5FfQLyFeIypqgo+kLuIoi10T1ijkXuJRz6N0rexRtxheyklwNJFXBHWZo+olVdKcKx7ygksdxHTRFEp4RVzG0WsQRdzO4Qd90Qkd/PicprugVdOHxFhTF3wQfEi8BGLX7+4nEbehWa38EQAqcEHhUV4waNDws7NhWaeyBINJuuEax5NWU9NXimXCFo2du5TIlvUQFyorSPeDRq6g5J3qX8tZogi0au0zoC2ChM1LXziO55vlehLPL7Y6SPhZY5S4Quf8TwnRN+qai3yThwQZIxSTRf4GGhrEXEn9hYBpDuO/JxmLAcjeT5OlQHmaqy5G8Sv4W2nwBfBHZbFkK3Y05TiMLf7HZ0GygPGej6AORr75T2tFXF2agKyzWoxFJHWaPf9EF4wObD/6UIXp8p+RLuPI56mkxdcL7A5KrJP2EGIIouLD30banYuHu8F5Qjw+Y7g/xjD3xaSC7NWrVpVqdP5C8HnZiqeZ+ELAAAAAElFTkSuQmCC" />;

class CreateQueue extends Component{
  constructor(props) {
    super(props);
    
    this.state = {
      orderlist:[ {'value' : 0,'label' : 'FIFO'},
                  {'value' : 1,'label' : 'LIFO'}],
      orderfieldlist:[{'value' : 'CreateDate','label' : 'Received Date'},
                      {'value' : 'Lot','label' : 'Lot'},
                      {'value' : 'Batch','label' : 'Batch'}],
      prioritylist:[{'value' : 0,'label' : 'Low'},
                    {'value' : 1,'label' : 'Normal'},
                    {'value' : 2,'label' : 'High'},
                    {'value' : 3,'label' : 'Critical'}],
      DocumentData:[],
      DocumentItemData:[],
      auto_doc:[],
      dataProcessItems:[],
      dataProcessed:[],
      processCard: [],
      processedCard: [],
      processedDocCard:[],
      itemCard: [],
      itemShowCard: [],
      batchCard:[],
      data : [],
      dataAdd:[],
      docItem:[],
      docID:null,
      docresult:"",
      SAPdoc:"",
      StampDate:"",
      MMType:"",
      Batch:"",
      ForCus:"",
      PickOrderby:"",
      PickbyField:"",
      Priority:"",
      refID:"",
      ref1:"",
      ref2:"",   
      dataProcessSelected:[],
      batchShowCard:[],   
      open: false,                
    };
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.initialData = this.initialData.bind(this)
    this.DateNow = moment()
    this.addData = this.addData.bind(this)
    this.addNewProcessCard = this.addNewProcessCard.bind(this)
    this.viewDetail = this.viewDetail.bind(this)
    this.genBtnDetail = this.genBtnDetail.bind(this)
    this.genBtnRemoveCard = this.genBtnRemoveCard.bind(this)
    this.createCardsList = this.createCardsList.bind(this)
    this.removeCard = this.removeCard.bind(this)
    this.createAutoDocList = this.createAutoDocList.bind(this)
    this.genBtnGetDocItem = this.genBtnGetDocItem.bind(this)
    this.openModal = this.openModal.bind(this)
    this.closeModal = this.closeModal.bind(this)

    this.docselect = {queryString:window.apipath + "/api/viw",
      t:"Document",
      q:"[{ 'f': 'DocumentType_ID', c:'=', 'v': 1002},{ 'f': 'EventStatus', c:'=', 'v': '10'}]",
      f:"ID,Code,DesWarehouse,DesWarehouseName,RefID,Ref2,DesCustomer,DesCustomerName,Batch,Ref1",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:0,
      all:"",}
  }
    
  initialData(){
    Axios.get(createQueryString(this.docselect)).then(Docresult => {
      this.setState({DocumentData : Docresult.data.datas }, () => {
        const DocumentData = []
        this.state.DocumentData.forEach(row => {
          DocumentData.push({value:row.ID
                        ,SAPdoc:(row.RefID?row.RefID + (row.Ref1?' : '+row.Ref1:""):"")
                        ,MMType:row.Ref2
                        ,StampDate:row.Ref1
                        ,Batch:row.Batch
                        ,ForCus:row.DesCustomer + ' : ' + row.DesCustomerName
                        ,label:row.Code + (row.DesWarehouseName?' : ' + row.DesWarehouseName : "")
          })
        })
        this.setState({ DocumentData }, () => this.createAutoDocList())
      })
    })
  }
    
  componentDidMount(){
    this.initialData()
  }
      
  onHandleClickCancel() {
    const processCard = this.state.processCard;
    const dataProcessSelected = this.state.dataProcessSelected

    processCard.forEach((index) => {
      processCard.splice(index, 1);
    });
    dataProcessSelected.forEach((index) => {
      dataProcessSelected.splice(index, 1);
    });
    this.setState({ processCard,dataProcessSelected })
    this.createAutoDocList();
    /* const dataProcessSelected = this.state.dataProcessSelected

    this.setState({dataProcessSelected
      ,"docID":""
      ,"SAPdoc":""
      ,"MMType":""
      ,"ForCus":""
      ,"StampDate":""
      ,"Batch":""
      ,"docresult":""}, () => this.removeItemCard())  

    this.createAutoDocList();

    const dataAdd = this.state.dataAdd
    dataAdd.forEach((index) => {
        dataAdd.splice(index, 1);
    })
    this.setState({ dataAdd })
    this.createCardsList()
    this.createAutoDocList() */
}

  createAutoDocList(){
    const auto_doc = [...this.state.DocumentData]
    this.state.dataProcessSelected.forEach((dataProcess) => {
      auto_doc.forEach((datarow, index) => {
        if (datarow.value === dataProcess.value) {
          auto_doc.splice(index, 1);
        }
      })
    })
    this.setState({ auto_doc });
  }

  genBtnGetDocItem(){
    return <Button className="float-left" type="button" color="primary" onClick={() => this.getDocItemData(this.state.docID)}>Check Document From SAP</Button>
  }

  getDocItemData(doc_id){
    if(doc_id !== ""){
      const DocumentItemData = this.state.DocumentItemData
      DocumentItemData.forEach((index) => {
        DocumentItemData.splice(index, 1);
      });
      const dataProcessItems = this.state.dataProcessItems
      dataProcessItems.forEach((index) =>{
        dataProcessItems.splice(index, 1);
      });
      const itemCard = this.state.itemCard
      itemCard.forEach((index) =>{
        itemCard.splice(index, 1);
      });

      const docItemselect = {queryString:window.apipath + "/api/viw",
        t:"DocumentItem",
        q:"[{ 'f': 'Document_ID', c:'=', 'v': " + doc_id +"},{ 'f': 'EventStatus', c:'=', 'v': '10'}]",
        f:"ID,Code,RefID,Ref2,Batch,Ref1,BaseQuantity,Options,SKUMaster_Name,OrderNo,Lot",
        g:"",
        s:"[{'f':'ID','od':'asc'}]",
        sk:0,
        all:"",}

      Axios.get(createQueryString(docItemselect)).then(Docresult => {
        this.setState({DocumentItemData : Docresult.data.datas }, () => {
          const DocumentItemData = []
          this.state.DocumentItemData.forEach(row => {
            DocumentItemData.push({docID:doc_id
                          ,dociID:row.ID
                          ,itemCode:row.Code
                          ,itemName:row.SKUMaster_Name
                          ,item:row.Options
                          ,batch:row.Batch
                          ,orderNo:row.OrderNo
                          ,lot:row.Lot
                          ,BaseQuantity:row.BaseQuantity
            })
          })
          this.setState({dataProcessItems}, () => this.setState({itemCard}, () => this.setState({ DocumentItemData }, () => this.createItemCardsList(1))))
          
        })
      })
    }
  }

  createItemCardsList(chk){
    const DocumentItemData = this.state.DocumentItemData;
    const dataProcessItems = this.state.dataProcessItems;
    let itemCard = []
    
    DocumentItemData.forEach((datarow) => {
      if(chk===1){
        dataProcessItems.push({docID:datarow.docID
          ,dociID:datarow.dociID
          ,itemCode:datarow.itemCode
          ,itemName:datarow.itemName
          ,item:datarow.item
          ,batch:datarow.batch
          ,pickOrderby:null
          ,pickOrderby_label:null
          ,orderByField:null
          ,orderByField_label:null
          ,lot:datarow.lot
          ,orderNo:datarow.orderNo
          ,priority:0
          ,priority_label:null
          ,qty:datarow.BaseQuantity
          ,batchs:[]
        });
        this.onEditorValueChange(datarow.dociID, 0,"pickOrderby")
        this.onEditorValueChange(datarow.dociID, "CreateDate","orderByField")
        this.onEditorValueChange(datarow.dociID, 1,"priority")
      }
      else{      
      } 
      itemCard = itemCard.concat(this.addNewItemCard(datarow));
    })
    this.setState({ itemCard },() => this.setState({dataProcessItems}));
  }

  genBtnNewBatch(dociID){
    return <Button id="per_button_doc" 
    style={{ background: "#66bb6a", borderColor: "#66bb6a", width: '130px',display:this.state.showbutton }} color="primary" 
    className="float-left"  onClick={() => this.genNewInputText(dociID)}>Add New Batch</Button>
  }

  genNewInputText(dociID){
    const DocumentItemData = this.state.DocumentItemData;
    const dataProcessItems = this.state.dataProcessItems;

    if(dataProcessItems.length>0){
      dataProcessItems.forEach(datarow => {
        if(datarow.dociID===dociID){
          datarow.batchs.push({
            value:null,
            qty:0
          })
        }else{
        }
      });
    }else{
      DocumentItemData.forEach((datarow) => {
        if(datarow.dociID === dociID){
          dataProcessItems.push({docID:datarow.docID,dociID:datarow.dociID,itemCode:datarow.itemCode,itemName:datarow.itemName,item:datarow.item
            ,batch:datarow.batch,pickOrderby:null,pickOrderby_label:null,orderByField:null,orderByField_label:null
            ,lot:datarow.lot,orderNo:datarow.orderNo,priority:0,priority_label:null,qty:datarow.BaseQuantity
            ,batchs:[{value:null,qty:0}]});
        }
      })                 
    }
    this.setState({ dataProcessItems },() => this.createItemCardsList(2),this.createBatchCardsList()) 
  }

  createBatchCardsList(){
    const dataProcessItems = this.state.dataProcessItems;
    let batch = [];

    dataProcessItems.map((item) => {
        batch = batch.concat(item.batchs.map(row => {
          return {"dociID":item.dociID,"batchNo":(item.batchs.length-1),"value":row.value,"qty":row.qty}
        }))
    });
    let batchCard = []
    batch.forEach((datarow) => {
      batchCard = batchCard.concat(this.addNewInputText(datarow));
    })
    this.setState({ batchCard });
  }

  onEditorValueChange(dociID, value, field) {
    const dataProcessItems = [...this.state.dataProcessItems];
    dataProcessItems.forEach(row => {
      if (row.dociID.toString() === (dociID.toString().split(',')[0])){
        if(field==="orderNo"){
          row.orderNo=value
        }else if(field==="lot"){
          row.lot=value
        }else if(field==="pickOrderby"){
          row.pickOrderby_label=this.state.orderlist.find(e => e.value===value).label
          row.pickOrderby=value
        }else if(field==="orderByField"){
          row.orderByField_label=this.state.orderfieldlist.find(e => e.value===value).label
          row.orderByField=value
        }else if(field==="priority"){
          row.priority_label=this.state.prioritylist.find(e => e.value===value).label
          row.priority=value
        }else if(field==="value"){
          row.batchs[dociID.toString().split(',')[1]].value=value
        }else if(field==="qty"){
          row.batchs[dociID.toString().split(',')[1]].qty=value
        }
      }
    });
    this.setState({ dataProcessItems });
  }

  addNewInputText(datarow){
    const styleclose = {cursor: 'pointer', position: 'absolute', display: 'inline', background: '#ffffff', borderRadius: '18px'}
    return <div className={[datarow.dociID,datarow.batchNo]} style={{"border-radius": "15px", "border": "1px solid white",  "padding": "5px",  background:"white", "margin":"5px"}}>
    <Row>
      <Col md="2" style={{textAlign:"right", "vertical-align": "middle"}}><label>Batch :  </label></Col>
      <Col md="4"><div style={{display:"inline"}}><Input onChange={(e) => { this.onEditorValueChange(datarow.dociID+","+datarow.batchNo, e.target.value,"value") }} /></div></Col> 
      <Col md="2" style={{textAlign:"right", "vertical-align": "middle"}}><label>Qty :  </label></Col>
      <Col md="3"><div style={{display:"inline"}}><Input onChange={(e) => { this.onEditorValueChange(datarow.dociID+","+datarow.batchNo,e.target.value,"qty") }} /></div></Col>
      <Col md="1"><a style={styleclose} onClick={this.closeModal}>
                    { imgClose }
                </a>
                </Col>
    </Row>
  </div>
  }

  addNewItemCard(datarow){
    const batchCard = this.state.batchCard
    let batchCards =[]
    if(batchCard.length > 0){
      batchCard.forEach(row => {
        if(row.props.className[0] === datarow.dociID){
          batchCards.push(row)
        }
      });
    }
    return (<div className={datarow.dociID} style={{"border-radius": "15px", "border": "1px solid white", "padding": "20px", background:"white", "margin":"5px"}}>
      <Row>
        <Col><span>{(datarow.itemCode?datarow.itemCode:"") +" : "+ (datarow.itemName?datarow.itemName:"") +" Qty : "+(datarow.BaseQuantity?datarow.BaseQuantity:"")}</span></Col>
      </Row>
      <Row style={{"padding-top":"10px"}}>
        <Col md="2" style={{textAlign:"right", "vertical-align": "middle"}}><label>Pick by : </label></Col>
        <Col md="5">
          <div style={{}}>
            <Select defaultValue={this.state.orderlist.filter(x => x.value===0)}
                    options={this.state.orderlist}
                    onChange={(e) => {this.onEditorValueChange(datarow.dociID, e.value,"pickOrderby")}}>
            </Select>
          </div>
        </Col>
        <Col md="5">
          <div style={{}}>
            <Select defaultValue={this.state.orderfieldlist.filter(x => x.value==="CreateDate")}
                    options={this.state.orderfieldlist}
                    onChange={(e) => {this.onEditorValueChange(datarow.dociID, e.value,"orderByField")}}>
            </Select>
          </div>
        </Col>
      </Row>
      <Row style={{"padding-top":"10px"}}>
        <Col md="2" style={{textAlign:"right", "vertical-align": "middle"}}><label>Order No : </label></Col>
        <Col md="5">
          <div style={{display:"inline"}}>
            <Input Value = {datarow.orderNo?datarow.orderNo:""}
            onChange={(e) => { this.onEditorValueChange(datarow.dociID, e.target.value,"orderNo") }} />
          </div>
        </Col>
      </Row>
      <Row style={{"padding-top":"10px"}}>
        <Col md="2" style={{textAlign:"right", "vertical-align": "middle"}}><label>Lot : </label></Col>
        <Col md="5">
          <div style={{display:"inline"}}>
          <Input Value = {datarow.lot?datarow.lot:""}
          onChange={(e) => { this.onEditorValueChange(datarow.dociID, e.target.value,"lot") }} />
          </div>
        </Col>
      </Row>

      <Row style={{"padding-top":"10px"}}>
        <Col md="2" style={{textAlign:"right", "vertical-align": "middle"}}><label>Priority : </label></Col>
        <Col md="5">
          <div style={{}}>
            <Select defaultValue={this.state.prioritylist.filter(x => x.value===1)}
                    options={this.state.prioritylist}
                    onChange={(e) => {this.onEditorValueChange(datarow.dociID, e.value,"priority")}}>
            </Select>
          </div>
        </Col>
      </Row>

      <Row style={{"padding-top":"10px"}}>
        <Col md="2" style={{textAlign:"right", "vertical-align": "middle"}}><label></label></Col>
        <Col md="5">
          <div className="clearfix">
            {this.genBtnNewBatch(datarow.dociID)}
          </div>
        </Col> 
      </Row>
              
      <Row style={{"padding-top":"10px"}}>
      <Col lg="12"> 
        <Card style={ batchCards.length > 0?{"border-radius": "15px", "border": "1px solid #8080804f", background:"white"}:{"display":"none"}}>
          { batchCards }
        </Card>
      </Col> 
      </Row>
  </div>)
  }

  addNewProcessCard(datarow){
    const itemShowCard = this.state.itemShowCard
    let itemShowCards =[]
    if(itemShowCard.length > 0){
      itemShowCard.forEach(row => {
        if(row.props.className === datarow.value){
          itemShowCards.push(row)
        }
      });
    }
    return <div style={{"border-radius": "15px", "border": "1px solid white", "padding": "20px", background:"white", "margin":"5px"}}>
      <Form>
        <FormGroup row>
          <Col sm={3} style={{textAlign:"right", "vertical-align": "middle"}}><Label>Document : </Label></Col>
          <Col ><span>{datarow.label?datarow.label:""}</span></Col>
          <Col sm={2}>{this.genBtnDetail(datarow.value)}</Col>
        </FormGroup>
        <FormGroup row>
          <Col sm={3} style={{textAlign:"right", "vertical-align": "middle"}}><Label>SAP Document : </Label></Col>
          <Col sm={7}><span>{datarow.SAPdoc?datarow.SAPdoc:""}</span></Col>
        </FormGroup>
        <FormGroup row>
          <Col sm={3} style={{textAlign:"right", "vertical-align": "middle"}}><Label>Movement Type : </Label></Col>
          <Col sm={7}><span>{datarow.MMType?datarow.MMType:""}</span></Col>
        </FormGroup>
        <FormGroup row>
          <Col sm={12}>
            <Card style={itemShowCards.length > 0?{"border-radius": "15px", "border": "1px solid #8080804f", background:"white"}:{"display":"none"}}>
              { itemShowCards }
            </Card> 
          </Col>
        </FormGroup>
      </Form>
    </div>
  }

  addData(){
    let dataProcessSelected = this.state.dataProcessSelected;
    const dataProcessItems = this.state.dataProcessItems;
    let DocumentData = this.state.DocumentData;
    const docID = this.state.docID
    if(this.state.docresult===""){
      alert("Document Item Not Found!")
    }else{
      if(this.state.DocumentItemData.length === 0){
      }else{
        var xxx = this.validateProcessItemsData(dataProcessItems)
        dataProcessSelected.push(DocumentData.find(x => x.value === docID))
          dataProcessSelected.forEach((datarow) => {
            if(datarow.value === docID){
              datarow.items = [] 
              xxx.forEach(itemrow => {
                if(itemrow.docID === docID){
                  datarow.items.push(itemrow)
                }
              })
            }
          });

          this.createItemShowCardsList(docID)
          this.setState({dataProcessSelected
            ,"docID":""
            ,"SAPdoc":""
            ,"MMType":""
            ,"ForCus":""
            ,"StampDate":""
            ,"Batch":""
            ,"docresult":""}, () => this.removeItemCard())  

          this.createAutoDocList();
      }
    }
  }
  validateProcessItemsData(dataProcessItems){
    dataProcessItems.forEach(itemrow =>{
      if(itemrow.batchs.length===0){
        itemrow.batchs.push({"value":null,"qty":itemrow.qty})
      }else{
        if((itemrow.batchs.reduce( function(cnt,o){ return cnt + parseInt(o.qty, 10); }, 0)) > itemrow.qty){
          alert("จำนวนที่ระบุเกินจำนวนขอเบิก")
        }else{
          itemrow.batchs.forEach(batchrow =>{
            if(batchrow.value===null){
              batchrow.value=null
              batchrow.qty=itemrow.qty
            }
            else{
              if(itemrow.qty-batchrow.qty>=0){
                itemrow.qty=itemrow.qty-batchrow.qty
              }else{
                itemrow.batchs.push({"value":null,"qty":itemrow.qty})
              }
            }
          })
          if(itemrow.qty>0){
            itemrow.batchs.push({"value":null,"qty":itemrow.qty})
          }
        }
      }
    });
    return dataProcessItems
  }
 
  createItemShowCardsList(){
    const dataProcessSelected = this.state.dataProcessSelected
    let batchShowCard = []
    dataProcessSelected.forEach((row) => {
      row.items.forEach(itemrow => {
        itemrow.batchs.forEach(batchrow =>{
          batchShowCard = batchShowCard.concat(this.addNewBatchCard(itemrow.dociID,batchrow));
        })
      });
    })
    this.setState({ batchShowCard },()=> this.createBatchShowCardsList());
  }
  createBatchShowCardsList(){
    const dataProcessSelected = this.state.dataProcessSelected
    let itemShowCard = []
    dataProcessSelected.forEach((row) => {
      row.items.forEach(itemrow => {
        itemShowCard = itemShowCard.concat(this.addNewOutputItem(itemrow))
      })
    })
    this.setState({ itemShowCard },()=> this.createCardsList());
  }
  addNewBatchCard(dociID,datarow){
    return <div className={[dociID,datarow.value]} >
      <Form>
        <FormGroup row>
          <Col sm={6}><span>{ datarow.value }</span></Col>
          <Col sm={6}><span>{ "Qty :      " +datarow.qty }</span></Col>
        </FormGroup>
      </Form>
    </div>
  }

  addNewOutputItem(datarow){
    const batchShowCard = this.state.batchShowCard
    let batchShowCards =[]
    if(batchShowCard.length > 0){
      batchShowCard.forEach(row => {
        if(row.props.className[0] === datarow.dociID){
          batchShowCards.push(row)
        }
      });
    }
    return  <div className= { datarow.docID } style={{"border-radius": "15px", "border-bottom": "2px solid rgb(157, 174, 236)",  "padding": "20px",  background:"white", "margin":"5px"}}>
    <Form>
      <FormGroup row>
        <Col sm={12}><span>{(datarow.itemCode?datarow.itemCode:"") + (datarow.itemName?" : "+datarow.itemName:"")}</span></Col>  {/* +" Qty : "+(datarow.qty?datarow.qty:"") */}
      </FormGroup>
      <FormGroup row>
        <Col sm={2} style={{textAlign:"right", "vertical-align": "middle"}}><Label>Pick by : </Label></Col>
        <Col sm={10}><span>{(datarow.orderByField_label?datarow.orderByField_label:"") + (datarow.pickOrderby_label?" ("+datarow.pickOrderby_label+")":"")}</span></Col>
      </FormGroup>
      <FormGroup row>
        <Col sm={2} style={{textAlign:"right", "vertical-align": "middle"}}><Label>Order No : </Label></Col>
        <Col sm={10}><span>{(datarow.orderNo?datarow.orderNo:"")}</span></Col>
      </FormGroup>
      <FormGroup row>
        <Col sm={2} style={{textAlign:"right", "vertical-align": "middle"}}><Label>Lot : </Label></Col>
        <Col sm={10}><span>{(datarow.lot?datarow.lot:"")}</span></Col>
      </FormGroup>
      <FormGroup row>
        <Col sm={2} style={{textAlign:"right", "vertical-align": "middle"}}><Label>Priority : </Label></Col>
        <Col sm={10}><span>{(datarow.priority_label?datarow.priority_label:"")}</span></Col>
      </FormGroup>
      <FormGroup row>
        <Col sm={2} style={{textAlign:"right", "vertical-align": "middle"}}><Label>Batch : </Label></Col>
        <Col sm={10} style={batchShowCards.length > 0?{}:{"display":"none"}}>{ batchShowCards }</Col>
      </FormGroup>
    </Form>
  </div>
  }

  genDocCardConfirm(datarow){
    const processedCard = this.state.processedCard
    let ShowCards =[]
    if(processedCard.length > 0){
      processedCard.forEach(row => {
        if(row.props.className === datarow.docID){
          ShowCards.push(row)
        }
      });
    }
    return  <div className= { datarow.docID } style={{"border-radius": "15px", "padding": "20px",  background:"white", "margin":"5px"}}>
    <Form>
      <FormGroup row>
        <Col sm={12}><span>{(datarow.docCode?"Document : " + datarow.docCode:"") }</span></Col>
      </FormGroup>
      {ShowCards}
    </Form>
  </div>
  }
  genStoRootCardConfirm(datarow){
    return  <div className= { datarow.docID } style={{"border-radius": "15px", "border-bottom": "2px solid rgb(157, 174, 236)",  "padding": "20px",  background:"white", "margin":"5px" }}>
    <Form>
      <FormGroup row>
        <Col sm={2} style={{textAlign:"right", "vertical-align": "middle"}}><Label>Pallet : </Label></Col>
        <Col sm={3}><span>{(datarow.baseCode?datarow.baseCode:"") }</span></Col>
        <Col sm={2} style={{textAlign:"right", "vertical-align": "middle"}}><Label>Item : </Label></Col>
        <Col sm={3}><span>{(datarow.itemCode?datarow.itemCode:"")}</span></Col>
      </FormGroup>
      <FormGroup row>
        <Col sm={2} style={{textAlign:"right", "vertical-align": "middle"}}><Label>Order No : </Label></Col>
        <Col sm={3}><span>{(datarow.orderNo?datarow.orderNo:"") }</span></Col>
        <Col sm={2} style={{textAlign:"right", "vertical-align": "middle"}}><Label>Lot : </Label></Col>
        <Col sm={3}><span>{(datarow.lot?datarow.lot:"")}</span></Col>
      </FormGroup>
      <FormGroup row>
        <Col sm={2} style={{textAlign:"right", "vertical-align": "middle"}}><Label>Batch : </Label></Col>
        <Col sm={3}><span>{(datarow.batch?datarow.batch:"") }</span></Col>
        <Col sm={2} style={{textAlign:"right", "vertical-align": "middle"}}><Label>Qty : </Label></Col>
        <Col sm={3}><span>{(datarow.qty && datarow.stoBaseQty?datarow.qty+"/"+datarow.stoBaseQty:"")}</span></Col>
      </FormGroup>
    </Form>
  </div>
  }

  createStoRootCardConfirmList(){
    const dataProcessed = this.state.dataProcessed
    let processedCard = []
    dataProcessed.forEach((datarow) => {
      processedCard = processedCard.concat(this.genStoRootCardConfirm(datarow));
    })
    this.setState({ processedCard },()=>this.createDocCardConfirmList());
  }

  createDocCardConfirmList(){
    const dataProcessed = this.state.dataProcessed
    let processedDocCard = []
    dataProcessed.forEach((datarow) => {
      if(processedDocCard.length>0){
        processedDocCard.forEach(row => {
          if(row.props.className !== datarow.docID){
            processedDocCard = processedDocCard.concat(this.genDocCardConfirm(datarow));
          }
        });
      }else{
        processedDocCard = processedDocCard.concat(this.genDocCardConfirm(datarow));
      }
    })
    this.setState({ processedDocCard },()=>this.openModal());
  }

  createCardsList(){
    const dataProcessSelected = this.state.dataProcessSelected
    let processCard = []
    dataProcessSelected.forEach((datarow) => {
      processCard = processCard.concat(this.addNewProcessCard(datarow));
    })
    this.setState({ processCard });
  }

  viewDetail(docID){
    if(docID){
      window.open('/doc/gi/manage?ID=' + docID)
    }
  }
  removeCard(docID){
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

  removeItemCard(){
    const batchCard = this.state.batchCard
    let itemCard = this.state.itemCard
    let DocumentItemData = this.state.DocumentItemData
    let dataProcessItems = this.state.dataProcessItems
    if(batchCard.length>0){
      batchCard.forEach((index) => {
        batchCard.splice(index, 1);
      });
    }
    itemCard=[];
    dataProcessItems=[];
    DocumentItemData=[];
     if(itemCard.length>0){
      itemCard.forEach((index) => {
        itemCard.splice(index, 1);
      });
    }
    DocumentItemData.forEach((index) => {
        DocumentItemData.splice(index, 1);
    })
    this.setState({ itemCard } ,() => this.setState({dataProcessItems},()=>this.setState({DocumentItemData},() => this.createItemCardsList())))  
  }

  genBtnDetail(docID){
    if(docID===""){
      return {}
    }else{
      return <Button className="float-right" type="button" color="primary" onClick={() => window.open('/doc/gi/manage?ID=' + docID)}>Detail</Button>
    }
  }

  genBtnRemoveCard(docID){
    if(docID===""){
      return {}
    }else{
      return <Button id="per_button_doc" 
      style={{ background: "#ef5350", borderColor: "#ef5350", width: '130px',display:this.state.showbutton }}
      color="primary" 
      className="float-right" 
      onClick={() => this.removeCard(docID)}>Remove</Button>
    }
  }
  processQ(){
    let doc=[]
    let items=[]
    let dataProcessed =[]
    this.state.dataProcessSelected.forEach(docrow => {
      docrow.items.forEach(itemrow => {
        items.push({
        docItemID:itemrow.dociID
        ,itemCode:itemrow.itemCode
        ,refID:null
        ,pickOrderType:itemrow.pickOrderby
        ,orderBy:itemrow.orderByField
        ,orderNo:itemrow.orderNo
        ,lot:itemrow.lot
        ,priority:itemrow.priority
        ,batchs:itemrow.batchs})
      });
      doc.push({
        docID:docrow.value
        ,items:items
      })
    });
    let postdata = {
      documentsProcess:doc
    } 
    Axios.post(window.apipath + "/api/wm/issued/queue", postdata).then((res) => {
      if (res.data._result.status === 1) {
        dataProcessed = res.data.DocumentProcessed
        this.setState({ dataProcessed }, ()=>this.createStoRootCardConfirmList());
      }
    })
  }
  
  openModal() {
    this.setState({ open: true })
  }

  closeModal() {
    this.setState({ open: false })
    this.setState({ dataUpdate: [] })
  }

  confirmQ(){

  }

  render(){
    const processCard = this.state.processCard
    const itemCards = this.state.itemCard
    const processedDocCard = this.state.processedDocCard
    const styleclose = {cursor: 'pointer', position: 'absolute', display: 'block', right: '-10px', top: '-10px', background: '#ffffff', borderRadius: '18px',
  }
    return(
      <div>
        <Row style={{"marginBottom":"10px"}}>
          <Col lg="6"> 
            <Form style={{"border-radius": "15px", "border": "1px solid #8080804f", "padding": "20px", background:"#FFFFFF"}}>
              <FormGroup row>
                <Col sm={3} style={{textAlign:"right", "vertical-align": "middle"}}><Label>Document : </Label></Col>
                <Col ><AutoSelect selectfirst={false} data={this.state.auto_doc} result={(e) => this.setState({"docID":e.value,"SAPdoc":e.SAPdoc,"MMType":e.MMType,"ForCus":e.ForCus,"StampDate":e.StampDate,"Batch":e.Batch,"docresult":e.label})}/></Col>
                <Col sm={2}><Button className="float-right" onClick={() => this.viewDetail(this.state.docID)} color="primary" >Detail</Button></Col>
              </FormGroup>
              <FormGroup row>
                <Label sm={3}></Label>
                <Col sm={7}><div>{ this.genBtnGetDocItem() }</div></Col>
              </FormGroup>
              <FormGroup row>
                <Col sm={3} style={{textAlign:"right", "vertical-align": "middle"}}><Label>SAP Document :</Label></Col>
                <Col sm={7}><span>{this.state.SAPdoc?this.state.SAPdoc:""}</span></Col>
              </FormGroup>
              <FormGroup row>
                <Col sm={3} style={{textAlign:"right", "vertical-align": "middle"}}><Label>Movement Type : </Label></Col>
                <Col sm={7}><span>{this.state.MMType?this.state.MMType:""}</span></Col>
              </FormGroup>
              <FormGroup row>
                <Col sm={12}>
                  <Card style={itemCards.length > 0?{"border-radius": "15px", "border": "1px solid #8080804f", background:"#8080804f"}:{"display":"none"}}>
                    <span style={{"padding-left":"15px", fontWeight:"bold", fontSize:"1.1em"}}>Items List</span>
                    { itemCards }
                  </Card>
                </Col>
              </FormGroup>
              <FormGroup row >
              <Col sm={12} style={{"float":"right"}}>
                      <Button id="per_button_doc" style={{ background: "#66bb6a", borderColor: "#66bb6a", width: '130px',display:this.state.showbutton }}
                      color="primary" className="float-right"onClick={() => this.addData()}>Add</Button>
              </Col>
              </FormGroup>
            </Form>
          </Col>
          <Col lg="6"> 
            <Card style={processCard.length > 0?{"border-radius": "15px", "border": "1px solid #8080804f", background:"#8080804f"}:{"display":"none"}}>
              <span style={{"padding-left":"15px", fontWeight:"bold", fontSize:"1.1em"}}>Document Issue List</span>
              { processCard }
              <Card style={processCard.length > 0?{"border-radius": "15px", "border": "1px solid #8080804f", background:"white", "margin":"5px"}:{"display":"none"}}>
                <CardBody>
                  <Button onClick={() => this.processQ()} color="primary" style={{ background: "#26c6da", borderColor: "#26c6da", width: '130px', marginLeft: '5px' }} className="float-right">Process</Button>
                  <Button onClick={() => this.onHandleClickCancel()} color="danger" style={{ background: "#ef5350", borderColor: "#ef5350", width: '130px' }} className="float-right">Clear</Button>
                </CardBody>
              </Card>
            </Card>
          </Col> 
        </Row>

        <Popup open={this.state.open} onClose={this.closeModal}>
          <div style={{ border: '2px solid #007bff', borderRadius:'5px'}}>
                <a style={styleclose} onClick={this.closeModal}>
                    { imgClose }
                </a>
                <div id="header" style={{ width: '100%', borderBottom: '1px solid #007bff', fontSize: '18px', padding: '5px', color: '#007bff', fontWeight: 'bold' }}>Processed</div>
                <div style={{ width: '100%', padding: '10px 5px' ,height: '500px', overflow: 'scroll' }}>
                <Card style={processCard.length > 0?{"border-radius": "15px", "border": "1px solid #8080804f", background:"white", "margin":"5px"}:{"display":"none"}}>
                  { processedDocCard }
                </Card>
                <Card style={processCard.length > 0?{"border-radius": "15px", "border": "1px solid #8080804f", background:"white", "margin":"5px"}:{"display":"none"}}>
                  <CardBody>
                    <Button onClick={() => this.confirmQ()} color="primary" style={{ background: "#26c6da", borderColor: "#26c6da", width: '130px', marginLeft: '5px' }} className="float-right">Confirm</Button>
                    <Button onClick={this.closeModal} color="danger" style={{ background: "#ef5350", borderColor: "#ef5350", width: '130px' }} className="float-right">Close</Button>
                  </CardBody>
                </Card>
                </div>
            </div>
        </Popup>
      </div>)
  }
}
export default CreateQueue;
