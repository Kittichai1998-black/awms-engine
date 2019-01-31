import React, { Component } from "react";
import "react-table/react-table.css";
import {Input, Card, CardBody, Button, Row, Col, Form,FormGroup,FormText,Label} from "reactstrap";
import moment from "moment";
import ReactTable from "react-table"
import Select from "react-select";
import {AutoSelect, apicall, createQueryString} from "../../ComponentCore"
import Popup from "reactjs-popup"

const Axios = new apicall()
const imgClose = <img style={{ width: "28px", height: "auto" }} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAANkSURBVGhD7ZlHyxRBEIYXI4aDYgDDP1Bvpr9hwqMR9ageFBN6ULwaPsNdFEU9iH9DDwZQ9GIGIwaMCPo+sA1lU7PT3Tu7sjAvPLisXdXVOz3V1fV1WrVq1YjGiZViv7gu7osP4lcXPvPdNbFPrBDY/HctFMfFC/Enk2cC2wVi6JolzoifwgsuB3yMCXwORevFW+EF0w/4XCcGpgninPAmh4/iotgilok5YmIXPvPdVnFJMNbzATyN8aJRTRU3hTfhA7FJTBGpYuxm8VB4Pm+IHH89xa+Bw3iSb2Kn4MmUCttd4ruI/TNnI0/ivIidk3WWiqbE9nop4nlOir7ECxs7vSXmi6aFz9sinm+NKBJp7Z2wzp6LQeZtXvbHws75RswU2TorrKOvgkftaVH33xxV2SwWzGXnPi2yxK8cH1K8sJ4Oi9+C7ZYqxmKDraeDws7NS561bTnirQNSpZdtCCCMSV1ECD7YeYsgbb8SYQwcE0miyGKvW+MNIhaP2gYCdYuIgw82+Iq1XdhxT0VSAUhVaQ0/iapDpSogbxE5YxFP4bOw46vewX9ESWyNLoheSgksN/igy8La7BW1op63RtQ2deoVYGnwaJuwdldFrbh4WKPlIkVVgZYGj+LtfFfUituTNcqp071FWHKCR7OFtedgrVWc/yeJHFUtIjd4NFlYH8RWq5FfQLyFeIypqgo+kLuIoi10T1ijkXuJRz6N0rexRtxheyklwNJFXBHWZo+olVdKcKx7ygksdxHTRFEp4RVzG0WsQRdzO4Qd90Qkd/PicprugVdOHxFhTF3wQfEi8BGLX7+4nEbehWa38EQAqcEHhUV4waNDws7NhWaeyBINJuuEax5NWU9NXimXCFo2du5TIlvUQFyorSPeDRq6g5J3qX8tZogi0au0zoC2ChM1LXziO55vlehLPL7Y6SPhZY5S4Quf8TwnRN+qai3yThwQZIxSTRf4GGhrEXEn9hYBpDuO/JxmLAcjeT5OlQHmaqy5G8Sv4W2nwBfBHZbFkK3Y05TiMLf7HZ0GygPGej6AORr75T2tFXF2agKyzWoxFJHWaPf9EF4wObD/6UIXp8p+RLuPI56mkxdcL7A5KrJP2EGIIouLD30banYuHu8F5Qjw+Y7g/xjD3xaSC7NWrVpVqdP5C8HnZiqeZ+ELAAAAAElFTkSuQmCC" />;

class CreateQueue extends Component{
  constructor(props) {
    super(props);
    this.initailstate = {
      zoneOutlist:[ {"value" : 2,"label" : "2: Front Gate"},
                  {"value" : 3,"label" : "3 : Rear Gate"}],
      orderlist:[ {"value" : 0,"label" : "FIFO"},
                  {"value" : 1,"label" : "LIFO"}],
      orderfieldlist:[{"value" : "CreateDate","label" : "Received Date"},
                      {"value" : "Lot","label" : "Lot"},
                      {"value" : "Batch","label" : "Batch"},
                      {"value" : "OrderNO","label" : "Order NO"}],
      prioritylist:[{"value" : 0,"label" : "Low"},
                    {"value" : 1,"label" : "Normal"},
                    {"value" : 2,"label" : "High"},
                    {"value" : 3,"label" : "Critical"}],
      DocumentData:[],
      DocumentItemData:[],
      auto_doc:[],
      dataProcessItems:[],
      dataProcessed:[],
      dataGroupProcessed:[],
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
      selectGateZone:2,
      docresult:"",
      SAPdoc:"",
      StampDate:"",
      MMType:"",
      Remark:"",
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
      f:"ID,Code,DesWarehouse,DesWarehouseName,RefID,Ref2,DesCustomer,DesCustomerName,Batch,Ref1,Remark",
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
                        ,SAPdoc:(row.RefID?row.RefID + (row.Ref1?" : "+row.Ref1:""):"")
                        ,MMType:row.Ref2
                        ,StampDate:row.Ref1
                        ,Batch:row.Batch
                        ,ForCus:row.DesCustomer + " : " + row.DesCustomerName
                        ,Remark:row.Remark
                        ,label:row.Code + (row.DesWarehouseName?" : " + row.DesWarehouseName : "")
          })
        })
        this.setState({ DocumentData }, () => this.createAutoDocList())
      })
    })
  }
  componentWillMount(){
    this.setState(this.initailstate)
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
    return <Button className="float-left" type="button" color="primary" onClick={() => this.getDocItemData(this.state.docID,(this.state.MMType!==""||this.state.MMType!==null||this.state.MMType!==undefined)?this.state.MMType:"")}>Check Document From SAP</Button>
  }

  getDocItemData(doc_id,mmType){
    let dataDocItem =[]
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

      //if(mmType !== ""){
      const docItemselect = {queryString:window.apipath + "/api/viw",
        t:"DocumentItem",
        q:"[{ 'f': 'Document_ID', c:'=', 'v': " + doc_id +"},{ 'f': 'EventStatus', c:'=', 'v': '10'}]",
        f:"ID,Code,RefID,Ref2,Batch,Ref1,BaseQuantity,Options,SKUMaster_Name,OrderNo,Lot,BaseUnitType_Code",
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
                            ,baseQuantity:row.BaseQuantity
                            ,baseUnitTypeCode:row.BaseUnitType_Code
              })
            })
            this.setState({dataProcessItems}, () => this.setState({itemCard}, () => this.setState({ DocumentItemData }, () => this.createItemCardsList(1))))
            
          })
        })
      /* }else{
        let postdata = 
        {
          "apiKey":"THIP_TEST",
            "docs":[{
              "docID":doc_id,
              "docType":1002
              }]
        }        
        Axios.post(window.apipath + "/api/wm/issue/doc/check", postdata).then((res) => {
          if (res.data._result.status === 1) {
            dataDocItem = res.data.documentItems
            const DocumentItemData = []
            dataDocItem.forEach(row => {
              DocumentItemData.push({docID:doc_id
                            ,dociID:row.id
                            ,itemCode:row.code
                            ,itemName:row.SKUMaster_Name
                            ,item:row.options
                            ,batch:row.batch
                            ,orderNo:row.orderNo
                            ,lot:row.lot
                            ,BaseQuantity:row.baseQuantity
                            ,baseUnitTypeCode:row.BaseUnitType_Code
              })
            })
            this.setState({dataProcessItems}, () => this.setState({itemCard}, () => this.setState({ DocumentItemData }, () => this.createItemCardsList(1))))
          }
        })
      } */
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
          ,qty:datarow.baseQuantity
          ,batchs:[{value:datarow.batch,qty:datarow.baseQuantity,unit:datarow.baseUnitTypeCode}]
          ,defaultBatch:datarow.batch
          ,baseUnitTypeCode:datarow.baseUnitTypeCode
        });
        this.onEditorValueChange(datarow.dociID, 0,"pickOrderby")
        this.onEditorValueChange(datarow.dociID, "CreateDate","orderByField")
        this.onEditorValueChange(datarow.dociID, 1,"priority")
        if(datarow.batch){
          this.genNewInputText(datarow.dociID,1)
        }
      }
      else{      
      } 
      itemCard = itemCard.concat(this.addNewItemCard(datarow));
    })
    this.setState({ itemCard },() => this.setState({dataProcessItems}));
  }

  genBtnNewBatch(dociID){
    return <Button id="per_button_doc" 
    style={{ background: "#66bb6a", borderColor: "#66bb6a", width: "130px",display:this.state.showbutton }} color="primary" 
    className="float-left"  onClick={() => this.genNewInputText(dociID,2)}>Add New Batch</Button>
  }

  genNewInputText(dociID,chkFirstClick){
    const DocumentItemData = this.state.DocumentItemData;
    const dataProcessItems = this.state.dataProcessItems;
    let checkBatchInput = false;
    let checkDefaultBatch = false;
    if(dataProcessItems.length>0){
      dataProcessItems.forEach(datarow => {
        if(datarow.dociID===dociID){
          //if(datarow.batchs.length>0){
            datarow.batchs.forEach(batchrow =>{
              if((batchrow.value === null && (batchrow.qty?batchrow.qty:0) === 0) ||
              (batchrow.value === null || batchrow.qty === 0)){
                checkBatchInput = false;
              }
              else{
                checkBatchInput = true;
              }
            });
          }
          /* else{
            checkDefaultBatch = true;
            checkBatchInput = true;
          } */
          /* if(checkBatchInput && checkDefaultBatch){
            datarow.batchs.push({
              value:datarow.defaultBatch,
              qty:datarow.defaultBatch?datarow.qty:0,
              unit:datarow.baseUnitTypeCode
            })
          }else  */if(checkBatchInput && chkFirstClick!==1){
            datarow.batchs.push({
              value:null,
              qty:0,
              unit:datarow.baseUnitTypeCode
            })
          }
        /* }else{
        } */
      });
    }else{
      DocumentItemData.forEach((datarow) => {
        if(datarow.dociID === dociID){
          dataProcessItems.push({docID:datarow.docID,dociID:datarow.dociID,itemCode:datarow.itemCode,itemName:datarow.itemName,item:datarow.item
            ,batch:datarow.batch,pickOrderby:null,pickOrderby_label:null,orderByField:null,orderByField_label:null
            ,lot:datarow.lot,orderNo:datarow.orderNo,priority:0,priority_label:null,qty:datarow.baseQuantity
            ,batchs:[{value:datarow.batch,qty:datarow.baseQuantity}]});
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
    batch.forEach((datarow,index) => {
      batchCard = batchCard.concat(this.addNewInputText(index,datarow));
    })
    this.setState({ batchCard });
  }

  onEditorValueChange(dociID, value, field) {
    const dataProcessItems = [...this.state.dataProcessItems];
    dataProcessItems.forEach(row => {
      if (row.dociID.toString() === (dociID.toString().split(",")[0])){
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
          if(dociID.toString().includes(",")){
          row.batchs[dociID.toString().split(",")[1]].value=value
          }else{
            row.batchs[dociID.toString()].value=value
          }
        }else if(field==="qty"){
          row.batchs[dociID.toString().split(",")[1]].qty=value
        }
      }
    });
    this.setState({ dataProcessItems });
  }
  clearBatchInput(dociID,batchNo){
    const DocumentItemData = this.state.DocumentItemData;
    const dataProcessItems = this.state.dataProcessItems;
    let checkBatchInput = false;
    let checkDefaultBatch = false;
    if(dataProcessItems.length>0){
      dataProcessItems.forEach(datarow => {
        if(datarow.dociID===dociID){
          if(datarow.batchs.length>0){
            var array = [...datarow.batchs]; 
            if (batchNo !== -1) {
              array.splice(batchNo, 1);
              datarow.batchs = array;
            }
          }
        }else{
        }
      });
    }else{
                 
    }
    this.setState({ dataProcessItems },() => this.createItemCardsList(2),this.createBatchCardsList()) 
  }

  addNewInputText(index,datarow){
    const styleclose = { cursor: "pointer", position: "absolute", display: "inline", background: "#ffffff", borderRadius: "18px"}
    return <div className={[datarow.dociID,index]} style={{"border-radius": "15px", "border": "1px solid white",  "padding": "5px",  background:"white", "margin":"5px"}}>
    <Row>
      {/* <Col md="1"><a style={styleclose} onClick={() => this.clearBatchInput(datarow.dociID,index)}>{ imgClose }</a></Col> */}
      <Col md="2" style={{textAlign:"right", "vertical-align": "middle"}}><label>Batch :  </label></Col>
      <Col md="4"><div style={{display:"inline"}}><Input defaultValue={datarow.value?datarow.value:""} onChange={(e) => { this.onEditorValueChange(datarow.dociID+","+index, e.target.value,"value") }} /></div></Col> 
      <Col md="2" style={{textAlign:"right", "vertical-align": "middle"}}><label>Qty :  </label></Col>
      <Col md="4"><div style={{display:"inline"}}><Input defaultValue={datarow.qty?datarow.qty:0} onChange={(e) => { this.onEditorValueChange(datarow.dociID+","+index,e.target.value,"qty") }} /></div></Col>
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
        <Col>
        <a style={{ color: '#20a8d8', textDecorationLine: 'underline', cursor: 'pointer' }} onClick={() =>{window.open("/sys/sto/curinv?SKU_Code=" + datarow.itemCode)}} target="_blank" >
        <span>{(datarow.itemCode?datarow.itemCode:"") +(datarow.itemName?" : "+ datarow.itemName:"")}</span>
        </a>
        </Col>
        <Col>
        <span style={{float:"right"}}>{(datarow.baseQuantity?" Qty : "+datarow.baseQuantity:"") + " " + (datarow.baseUnitTypeCode?datarow.baseUnitTypeCode:"")}</span>
        </Col>
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
          <Col ><a style={{ color: '#20a8d8', textDecorationLine: 'underline', cursor: 'pointer'  }} 
          onClick={() =>this.viewDetail(datarow.value)} target="_blank" >{datarow.label}</a></Col>
        </FormGroup>
        <FormGroup row>
          <Col sm={3} style={{textAlign:"right", "vertical-align": "middle"}}><Label>SAP Document : </Label></Col>
          <Col sm={3}><span>{datarow.SAPdoc?datarow.SAPdoc:""}</span></Col>
          <Col sm={3} style={{textAlign:"right", "vertical-align": "middle"}}><Label>Movement Type : </Label></Col>
          <Col sm={3}><span>{datarow.MMType?datarow.MMType:""}</span></Col>
        </FormGroup>
        <FormGroup row>
          <Col sm={3} style={this.state.Remark?{textAlign:"right", "vertical-align": "middle"}:{display:"none"}}><Label>Remark : </Label></Col>
          <Col sm={9} style={this.state.Remark?{display:"inline"}:{display:"none"}}><span>{this.state.Remark?this.state.Remark:""}</span></Col>
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
    let checkQty = true;
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
            ,"Remark":""
            ,"docresult":""}, () => this.removeItemCard())  

          this.createAutoDocList();
        
      }
    }
  }
  validateProcessItemsData(dataProcessItems){
    let checkBatchNull = false;
    dataProcessItems.forEach(itemrow =>{
      if(itemrow.batchs.length===0){
        itemrow.batchs.push({"value":null,"qty":itemrow.qty})
      }else{
        if((itemrow.batchs.reduce( function(cnt,o){ return cnt + parseInt(o.qty, 10); }, 0)) > itemrow.qty){
          alert("จำนวนที่ระบุเกินจำนวนขอเบิก")
          //checkMoreQty =true
        }else{
          itemrow.batchs.forEach(batchrow =>{
            if(batchrow.value===null && itemrow.qty>0){
              batchrow.value=null
              batchrow.qty=itemrow.qty
              checkBatchNull = true
            }
            else{
              if(itemrow.qty-batchrow.qty>=0){
                itemrow.qty=itemrow.qty-batchrow.qty
              }else{
                itemrow.batchs.push({"value":null,"qty":itemrow.qty})
              }
            }
          })
          if(itemrow.qty>0 && checkBatchNull === false){
            itemrow.batchs.push({"value":null,"qty":itemrow.qty})
          }
        }
      }
    });
    /* if(checkMoreQty){
      dataProcessItems.forEach((index) => {
        dataProcessItems.splice(index,1)
      });
    } */
      return dataProcessItems
  }
 
  createItemShowCardsList(){
    const dataProcessSelected = this.state.dataProcessSelected
    let batchShowCard = []
    dataProcessSelected.forEach((row) => {
      row.items.forEach(itemrow => {
        itemrow.batchs.forEach((batchrow,index) =>{
          batchShowCard = batchShowCard.concat(this.addNewBatchCard(itemrow.dociID,batchrow,index));
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

  addNewBatchCard(dociID,datarow,index){
    return <div className={[dociID,index]} >
      <Form>
      <FormGroup row>
        <Col sm={2} style={{textAlign:"right", "vertical-align": "middle"}}><Label>{index==0?"Batch :":""}</Label></Col>
        <Col sm={4}><span>{(datarow.value?datarow.value:"")}</span></Col>
        <Col sm={2} style={{textAlign:"right", "vertical-align": "middle"}}><Label>Qty : </Label></Col>
        <Col sm={4}><span>{((datarow.qty?datarow.qty:"")+(datarow.unit?(" "+datarow.unit):""))}</span></Col>
      </FormGroup>
        {/* <FormGroup row>
          <Col sm={6}><span>{ datarow.value }</span></Col>
          <Col sm={2}><span>{ "Qty : " + datarow.qty}</span></Col>
        </FormGroup> */}
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
        <Col sm={12}><span>{(datarow.itemCode?datarow.itemCode:"") + (datarow.itemName?" : "+datarow.itemName:"")}</span></Col>
      </FormGroup>
      <FormGroup row>
        <Col sm={2} style={{textAlign:"right", "vertical-align": "middle"}}><Label>Pick by : </Label></Col>
        <Col sm={4}><span>{(datarow.orderByField_label?datarow.orderByField_label:"") + (datarow.pickOrderby_label?" ("+datarow.pickOrderby_label+")":"")}</span></Col>
        <Col sm={2} style={{textAlign:"right", "vertical-align": "middle"}}><Label>Order No : </Label></Col>
        <Col sm={4}><span>{(datarow.orderNo?datarow.orderNo:"")}</span></Col>
      </FormGroup>
      <FormGroup row>
        <Col sm={2} style={{textAlign:"right", "vertical-align": "middle"}}><Label>Lot : </Label></Col>
        <Col sm={4}><span>{(datarow.lot?datarow.lot:"")}</span></Col>
        <Col sm={2} style={{textAlign:"right", "vertical-align": "middle"}}><Label>Priority : </Label></Col>
        <Col sm={4}><span>{(datarow.priority_label?datarow.priority_label:"")}</span></Col>
      </FormGroup>
      <FormGroup row>
        {/* <Col sm={2} style={{textAlign:"right", "vertical-align": "middle"}}><Label>Batch : </Label></Col> */}
        <Col sm={12} style={batchShowCards.length > 0?{}:{"display":"none"}}>{ batchShowCards }</Col>
      </FormGroup>
    </Form>
  </div>
  }

  genDocCardConfirm(datarow){
    const processedCard = this.state.processedCard
    let ShowCards =[]
    if(processedCard.length > 0){
      processedCard.forEach(row => {
        if(row.props.className === datarow.type){
          ShowCards.push(row)
        }
      });
    }
    return  <div className= { datarow.type } style={{"border-radius": "15px", "border-bottom": "2px solid rgb(157, 174, 236)",  "padding": "20px",  background:"white", "margin":"5px" }}>
    <Form>
      <FormGroup row>
        <Col sm={2} style={{textAlign:"right", "vertical-align": "middle"}}><Label>Document : </Label></Col>
        <Col sm={4}><span>{(datarow.data[0].document.code?datarow.data[0].document.code:"")}</span></Col>
        <Col sm={2} style={{textAlign:"right", "vertical-align": "middle"}}><Label>Item : </Label></Col>
        <Col sm={4}><span>{(datarow.data[0].itemCode?datarow.data[0].itemCode:"")}</span></Col>
      </FormGroup>
      <FormGroup row>
        <Col sm={2} style={{textAlign:"right", "vertical-align": "middle"}}><Label>SAP Document : </Label></Col>
        <Col sm={4}><span>{(datarow.data[0].document.refID?datarow.data[0].document.refID:"")}</span></Col>
        <Col sm={2} style={{textAlign:"right", "vertical-align": "middle"}}><Label>Qty : </Label></Col>
        <Col sm={4}><span>{(datarow.sumBaseQty?(datarow.sumBaseQty > datarow.sumQty?datarow.sumQty:datarow.sumBaseQty):0) + " / " + (datarow.data[0].documentItem.baseQuantity?datarow.data[0].documentItem.baseQuantity:0)
        + " " + (datarow.data[0].documentItem.baseUnitType_Code?datarow.data[0].documentItem.baseUnitType_Code:"")
        +(" ( " + datarow.data[0].documentItem.quantity + " " + datarow.data[0].documentItem.unitType_Code + " ) ")}</span></Col>
      </FormGroup>
      <FormGroup row>
        { ShowCards }
      </FormGroup>
    </Form>
   </div>
  }
  genStoRootCardConfirm(datarow){

    return <div className= { datarow.type }>
    <ReactTable style={{width:"100%"}} data={datarow.data} editable={false} filterable={false} defaultPageSize={2000}
    editable={false} minRows={1} showPagination={false}//stoPack
    columns={[{ accessor: "baseCode", Header: "Pallet"}
    ,{ Cell:(e)=> <span>{(e.original.stoPack?e.original.stoPack.batch:"")}</span>, Header: "Batch"}
    ,{ accessor: "lot", Header: "Lot"},{ accessor: "orderNo", Header: "Order No"}
    ,{ Cell:(e)=> <span>{ (e.original.stoBaseQty?(e.original.qty?e.original.qty:""):"") + (e.original.stoPack?(e.original.stoPack.qty?" / "+ e.original.stoPack.baseQty:""):"") }</span>
    , Header: "Qty"},{ Cell:(e)=> <span>{e.original.stoPack?(e.original.stoPack.baseUnitCode?e.original.stoPack.baseUnitCode:""):""}</span>, Header: "unit"}]}/>
  </div>
  }

  createStoRootCardConfirmList(){
    const dataProcessed = this.state.dataProcessed
    let processedCard = []
    let dataGroupProcessed =[]
    function groupBy(arr, key) {
      var newArr = [],
          Keys = {},
          newItem, i, j, cur, sumQty = 0, sumBaseQty = 0;
      for (i = 0, j = arr.length; i < j; i++) {
          cur = arr[i];
          if (!(cur[key] in Keys)) {
              Keys[cur[key]] = { type: cur[key], data: [], sumQty: 0, sumBaseQty: 0 };
              sumQty = 0;
              sumBaseQty = 0;
              newArr.push(Keys[cur[key]]);
          }
          sumQty = sumQty+cur["qty"]
          sumBaseQty = sumBaseQty+cur["stoBaseQty"]
          Keys[cur[key]].sumQty = sumQty;
          Keys[cur[key]].sumBaseQty = sumBaseQty;
          Keys[cur[key]].data.push(cur);
      }
      return newArr;
    }

    var yy =groupBy(dataProcessed, 'dociID'); 
    dataGroupProcessed = yy
    yy.forEach((datarow) => {
      processedCard = processedCard.concat(this.genStoRootCardConfirm(datarow));
    })
    this.setState({ dataGroupProcessed }, () => this.setState({ processedCard },()=>this.createDocCardConfirmList()));
  }

  createDocCardConfirmList(){
    const dataProcessed = this.state.dataProcessed
    const dataGroupProcessed = this.state.dataGroupProcessed
    let processedDocCard = []
    dataGroupProcessed.forEach((datarow) => {
     /*  if(processedDocCard.length>0){
        processedDocCard.forEach(row => {
          if(row.props.className !== datarow.docID){
            processedDocCard = processedDocCard.concat(this.genDocCardConfirm(datarow));
          }
        });
      }else{ */
        processedDocCard = processedDocCard.concat(this.genDocCardConfirm(datarow));
      //}
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
      window.open("/doc/gi/manage?ID=" + docID)
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
      return <Button className="float-right" type="button" color="primary" onClick={() => window.open("/doc/gi/manage?ID=" + docID)}>Detail</Button>
    }
  }

  genBtnRemoveCard(docID){
    if(docID===""){
      return {}
    }else{
      return <Button id="per_button_doc" 
      style={{ background: "#ef5350", borderColor: "#ef5350", width: "130px",display:this.state.showbutton }}
      color="primary" 
      className="float-right" 
      onClick={() => this.removeCard(docID)}>Remove</Button>
    }
  }
  processQ(){
    let doc=[]
   
    let dataProcessed =[]
    this.state.dataProcessSelected.forEach(docrow => {
      let items=[]
      docrow.items.forEach(itemrow => {
        if(docrow.value === itemrow.docID){
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
        }
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
        if(dataProcessed.length > 0){
          this.setState({ dataProcessed }, ()=>this.createStoRootCardConfirmList());
        }else{
          alert("ไม่พบสินค้าที่ระบุในคลังสินค้า")
          this.setState(this.initailstate, () => {this.initialData()})
          
        }
      }else if(res.data._result.status === 0){
        dataProcessed = res.data._result.message
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
    let dataConfirm = []
    const dataProcessed = this.state.dataProcessed
    dataProcessed.forEach(row => {
      row.areaID = this.state.selectGateZone;
    });
    let postdata = {
      DocumentProcessed:dataProcessed
    }
     Axios.post(window.apipath + "/api/wm/issued/queue/confirm", postdata).then((res) => {
      if (res.data._result.status === 1) { 
        window.success("สร้างคิวงานเบิกสำเร็จ")
        this.setState(this.initailstate, () => {this.initialData()})
        //dataConfirm = res.data.DocumentProcessed
       }
    }) 
  }
  test(aaa){
    this.setState({"selectGateZone":aaa})
  }

  render(){
    const processCard = this.state.processCard
    const itemCards = this.state.itemCard
    const processedDocCard = this.state.processedDocCard
    const styleclose = {cursor: "pointer", position: "absolute", display: "block", right: "-10px", top: "-10px", background: "#ffffff", borderRadius: "18px",
  }
    return(
      <div>
        <Row style={{"marginBottom":"10px"}}>
          <Col lg="6"> 
            <Form style={{"border-radius": "15px", "border": "1px solid #8080804f", "padding": "20px", background:"#FFFFFF"}}>
              <FormGroup row>
                <Col sm={3} style={{textAlign:"right", "vertical-align": "middle"}}><Label>Document : </Label></Col>
                <Col ><AutoSelect selectfirst={false} data={this.state.auto_doc} result={(e) => this.setState({"docID":e.value,"SAPdoc":e.SAPdoc,"MMType":e.MMType,"ForCus":e.ForCus,"StampDate":e.StampDate,"Batch":e.Batch,"docresult":e.label,"Remark":e.Remark})}/></Col>
                <Col sm={2} style={this.state.docID?{}:{"display":"none"}}> <a style={{ color: '#20a8d8', textDecorationLine: 'underline', cursor: 'pointer'  }} onClick={() =>this.viewDetail(this.state.docID)} target="_blank" >Detail</a></Col>
              </FormGroup>
              <FormGroup row style={this.state.docID?{}:{"display":"none"}}>
                <Label sm={3}></Label>
                <Col sm={7}><div>{ this.genBtnGetDocItem() }</div></Col>
              </FormGroup>
              <FormGroup row>
                <Col sm={3} style={this.state.SAPdoc?{textAlign:"right", "vertical-align": "middle"}:{display:"none"}}><Label>SAP Document :</Label></Col>
                <Col sm={3} style={this.state.SAPdoc?{display:"inline"}:{display:"none"}}><span>{this.state.SAPdoc?this.state.SAPdoc:""}</span></Col>
                <Col sm={3} style={this.state.MMType?{textAlign:"right", "vertical-align": "middle"}:{display:"none"}}><Label>Movement Type : </Label></Col>
                <Col sm={3} style={this.state.MMType?{display:"inline"}:{display:"none"}}><span>{this.state.MMType?this.state.MMType:""}</span></Col>
              </FormGroup>
              <FormGroup row>
                <Col sm={3} style={this.state.Remark?{textAlign:"right", "vertical-align": "middle"}:{display:"none"}}><Label>Remark : </Label></Col>
                <Col sm={9} style={this.state.Remark?{display:"inline"}:{display:"none"}}><span>{this.state.Remark?this.state.Remark:""}</span></Col>
              </FormGroup>
              <FormGroup row>
                <Col sm={12}>
                  <Card style={itemCards.length > 0?{"border-radius": "15px", "border": "1px solid #8080804f", background:"#8080804f"}:{"display":"none"}}>
                    <span style={{"padding-left":"15px", fontWeight:"bold", fontSize:"1.1em"}}>Items List</span>
                    { itemCards }
                  </Card>
                </Col>
              </FormGroup>
              <FormGroup row style={itemCards.length > 0?{}:{"display":"none"}}>
              <Col sm={12} style={{"float":"right"}}>
                      <Button id="per_button_doc" style={{ background: "#66bb6a", borderColor: "#66bb6a", width: "130px",display:this.state.showbutton }}
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
                <CardBody >
                      <Button onClick={() => this.processQ()} color="primary" style={{ background: "#26c6da", borderColor: "#26c6da", width: "130px", marginLeft: "5px" }} className="float-right">Process</Button>
                    
                      <Button onClick={() => this.onHandleClickCancel()} color="danger" style={{ background: "#ef5350", borderColor: "#ef5350", width: "130px" }} className="float-right">Clear</Button>
                      <div style={{width:"300px","margin-right":"5px"}} className="float-left">
                      <Select  defaultValue={this.state.zoneOutlist.filter(x => x.value===2)}
                          options={this.state.zoneOutlist}
                          onChange={(e) => this.test(e.value)}>
                      </Select></div>
                </CardBody>
              </Card>
            </Card>
          </Col> 
        </Row>

        <Popup open={this.state.open} onClose={this.closeModal}>
          <div style={{ border: "2px solid #007bff", borderRadius:"5px"}}>
                <a style={styleclose} onClick={this.closeModal}>
                    { imgClose }
                </a>
                <div id="header" style={{ width: "100%", borderBottom: "1px solid #007bff", fontSize: "18px", padding: "5px", color: "#007bff", fontWeight: "bold" }}>Processed</div>
                <div style={{ width: "100%", padding: "10px 5px" ,height: "500px", overflow: "auto" }}>
                <Card style={processCard.length > 0?{"border-radius": "15px", "border": "1px solid #8080804f", background:"white", "margin":"5px"}:{"display":"none"}}>
                  { processedDocCard }
                </Card>
                <Card style={processCard.length > 0?{"border-radius": "15px", "border": "1px solid #8080804f", background:"white", "margin":"5px"}:{"display":"none"}}>
                  <CardBody>
                    <Button onClick={() => this.confirmQ()} color="primary" style={{ background: "#26c6da", borderColor: "#26c6da", width: "130px", marginLeft: "5px" }} className="float-right">Confirm</Button>
                    <Button onClick={this.closeModal} color="danger" style={{ background: "#ef5350", borderColor: "#ef5350", width: "130px" }} className="float-right">Close</Button>
                  </CardBody>
                </Card>
                </div>
            </div>
        </Popup>
      </div>)
  }
}
export default CreateQueue;
