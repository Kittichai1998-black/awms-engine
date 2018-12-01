import React, { Component } from 'react';
import "react-table/react-table.css";
import {Input, Card,Col, CardBody, Button, Row, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';
import ReactTable from 'react-table'
import moment from 'moment';
import {DocumentEventStatus} from '../../../Status'
import queryString from 'query-string'
import {AutoSelect, NumberInput, apicall, createQueryString, DatePicker, ToListTree, Clone } from '../../../ComponentCore'
import Downshift from 'downshift'
import ReactAutocomplete from 'react-autocomplete'
import arrimg from '../../../../../img/arrowhead.svg'

function isInt(value) {
  return !isNaN(value) && 
         parseInt(Number(value)) == value && 
         !isNaN(parseInt(value, 10));
}

const Axios = new apicall()

class ReceiveManage extends Component{
  constructor(props) {
    super(props);

    this.state = {
      data : [],
      branch:[],
      auto_branch:[],
      auto_warehouse:[],
      auto_customer:[],
      branch:"",
      customer:"",
      warehouse:"",
      documentStatus:10,
      issuedNo:"-",
      select2:{queryString:window.apipath + "/api/viw",
      t:"PackMaster",
      q:'[{ "f": "Status", "c":"=", "v": 1}]',
      f:"id, Code, Name, concat(SKUCode, ' : ', SKUName) AS SKU, UnitTypeName AS UnitType",
      g:"",
      s:"[{'f':'Code','od':'asc'}]",
      sk:0,
      l:0,
      all:"",},
      StorageObject:{queryString:window.apipath + "/api/trx",
      t:"StorageObject",
      q:"[{ 'f': 'Status', c:'=', 'v': 1},{ 'f': 'ObjectType', c:'=', 'v': 1},{ 'f': 'EventStatus', c:'in', 'v': '11,12'}]",
      f:"Code",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:"",
      l:"",
      all:"",},   
      inputstatus:true,
      pageID:0,
      addstatus:true,
      adddisplay:"none",
      basedisplay:"none",
      modalstatus:false,
      storageObjectdata:[],
      auto_Desbranch:[],
      auto_Deswarehouse:[]
      
  
    };
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.getSelectionData = this.getSelectionData.bind(this)
    this.initialData = this.initialData.bind(this)
    this.genWarehouseData = this.genWarehouseData.bind(this)
    this.DateNow = moment()
    this.addIndex = 0
    this.createAutoComplete = this.createAutoComplete.bind(this)
    this.Addbutton = this.Addbutton.bind(this)

    this.branchselect = {queryString:window.apipath + "/api/mst",
      t:"Branch",
      q:'[{ "f": "Status", "c":"=", "v": 1}]',
      f:"ID,Code, Name",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:0,
      all:"",}

    this.warehouseselect = {queryString:window.apipath + "/api/mst",
    t:"Warehouse",
    q:"",
    f:"ID,Code, Name",
    g:"",
    s:"[{'f':'ID','od':'asc'}]",
    sk:0,
    all:"",}
  }
  componentDidMount(){  

    this.initialData()    

       }
  initialData(){
    const values = queryString.parse(this.props.location.search)
    this.setState({check:values.ID})
    if(values.ID !== undefined){
      this.setState({pageID:values.ID,addstatus:true,})
        Axios.get(window.apipath + "/api/wm/received/doc?docID=" + values.ID).then((rowselect1) => {
        if(rowselect1.data._result.status === 0){
          this.setState({data:[]})
        }
        else{
          this.setState({data:[rowselect1.data.document]})
          this.state.data.forEach(row => {
            this.setState({souBranchName:row.souBranchName,desBranchName:row.desBranchName,
            souWareName:row.souWarehouseName,desWareName:row.desWarehouseName,batchName:row.batch,
            lotName:row.lot,remarkName:row.remark,ref1Name:row.ref1,ref2Name:row.ref2,codeDoc:row.code,
            documentDate:moment(row.documentDate).format("DD-MM-YYYY"),documentItems:row.documentItems
          })            
          })   
        }
      })
    }else{

    Axios.get(createQueryString(this.state.select2)).then((rowselect2) => {
      this.setState({autocomplete:rowselect2.data.datas, autocompleteUpdate:Clone(rowselect2.data.datas),
        adddisplay:"inline-block"})
    })
  }
    Axios.get(createQueryString(this.branchselect)).then(branchresult => {
      this.setState({auto_branch : branchresult.data.datas, addstatus:false }, () => {
        const auto_branch = []
        this.state.auto_branch.forEach(row => {
          auto_branch.push({value:row.ID, label:row.Code + ' : ' + row.Name,code:row.Code })
        })
        this.setState({auto_branch,auto_Desbranch:Clone(auto_branch)})
 
      })
    })
  }

  genWarehouseData(data){ 
    if(data){
      const warehouse = this.warehouseselect
      warehouse.q = '[{ "f": "Status", "c":"=", "v": 1},{ "f": "Branch_ID", "c":"=", "v": '+ this.state.branch +'}]'
      Axios.get(createQueryString(warehouse)).then((res) => {
        const auto_warehouse = []
        res.data.datas.forEach(row => {
          auto_warehouse.push({value:row.ID, label:row.Code + ' : ' + row.Name,Warecode:row.Code })
        })
        this.setState({auto_warehouse})
      })
    }
  }

  genDesWarehouseData(data){
    if(data){
      const warehouse = this.warehouseselect
      warehouse.q = '[{ "f": "Status", "c":"=", "v": 1},{ "f": "Branch_ID", "c":"=", "v": '+ this.state.Desbranch +'}]'
      Axios.get(createQueryString(warehouse)).then((res) => {
        const auto_Deswarehouse = []
        res.data.datas.forEach(row => {
          auto_Deswarehouse.push({value:row.ID, label:row.Code + ' : ' + row.Name,DesWarecode:row.Code  })
        })
        this.setState({auto_Deswarehouse})
      })
    }
  }

  onHandleClickCancel(event){
    this.forceUpdate();
    event.preventDefault();
  }

  getSelectionData(data){
    this.setState({selectiondata:data})
  }

  createDocument(){
    let acceptdata = []
    this.state.data.forEach(row => {  
      let qty = row.PackQty === "" ? 0 : row.PackQty;
      if (row.id > 0 && qty > 0){
      acceptdata.push({
        skuCode: null,
        packItemQty:null,
        packCode:row.PackItem,
        quantity: row.PackQty,
        expireDate:null,
        productionDate:null,
        ref1:null,
        ref2:null,
        ref3:null,
        options:null
      })
      let postdata = {
        refID:null, forCustomerCode:null, batch:this.state.batch, lot:this.state.lot,
        souSupplierCode:null,souCustomerCode:null,
        souBranchCode:this.state.branchCode,souWarehouseCode:this.state.WareCode,souAreaMasterCode:null,
        desBranchCode:this.state.DesbranchCode,desWarehouseCode:this.state.DesWareCode,desAreaMasterCode:null,
        actionTime:null,documentDate:this.DateNow.format("YYYY/MM/DD"),
        remark:this.state.remark,ref1:this.state.ref1,ref2:this.state.ref2,
        receiveItems:acceptdata
      }
      if (acceptdata.length > 0) {
        Axios.post(window.apipath + "/api/wm/received/doc", postdata).then((res) => {
          if (res.data._result.status === 1) {
            this.props.history.push('/doc/gr/manage?ID=' + res.data.ID)
            window.location.reload()
          }
        })
      }
    }else{
      alert("Quantity is null")
    }
    }) 
    }

  inputCell(field, rowdata){
    return <NumberInput value={rowdata.value} 
    onChange={(e) => {this.editData(rowdata, e, "PackQty")}}/>
  }
  
  addData(){
    const data = this.state.data
    data.push({id:this.addIndex,PackItem:"",PackQty:1,UnitType:""})
    this.addIndex -= 1
    this.setState({data})
  }

  editData(rowdata, value, field){
    const data = this.state.data;
    if(value !== ""){
      if(rowdata.column.datatype === "int"){
        let conv = value === '' ? 0 : value
        data[rowdata.index][field] = (conv === 0 ? null : conv);
      }
      else{
        data[rowdata.index][field] = value.Code;
        data[rowdata.index]["SKU"] = value.SKU === undefined ? value : value.SKU;
        data[rowdata.index]["UnitType"] = value.UnitType;
        data[rowdata.index]["id"] = value.id;
      }
      this.setState({ data });

      
    let res = this.state.autocompleteUpdate
    this.state.data.forEach(datarow => {
      res = res.filter(row => {
        return datarow[field] !== row.Code
      })
    })
    this.setState({autocomplete:res})
    }
    else if (rowdata.column.datatype !== "int"){
      data[rowdata.index][field] = "";
      data[rowdata.index]["SKU"] = "";
      data[rowdata.index]["UnitType"] = "";
      data[rowdata.index]["id"] = "";
    }
    else if (rowdata.column.datatype === "int") {
      data[rowdata.index][field] = "";
    }
    this.setState({ data });
  }

  createText(data){
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
        maxHeight: '50%', // TODO: don't cheat, let it flow to the bottom
        zIndex: '998',
      }

      return <ReactAutocomplete
        inputProps={{
          style: {
            width: "100%", borderRadius: "1px", backgroundImage: 'url(' + arrimg + ')',
            backgroundPosition: "8px 8px",
            backgroundSize: "10px",
            backgroundRepeat: "no-repeat",
            paddingLeft: "25px"
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

  Addbutton(){
    return <Button className="float-right" onClick={() => this.addData()} color="primary" disabled={this.state.addstatus}>Add</Button>
  }


  render(){
    
    const style={width:"100px", textAlign:"right", paddingRight:"10px"}
    let cols
    if(this.state.pageID){
      cols = [ 
        {accessor:"packMaster_Code",Header:"Pack Item", Cell: (e) => <span>{e.original.packMaster_Code + ' : ' + e.original.packMaster_Name}</span>, width:550},
        //{accessor:"skuMaster_Code",Header:"SKU", Cell: (e) => <span>{e.original.skuMaster_Code + ' : ' + e.original.skuMaster_Name}</span>},
        {accessor:"quantity",Header:"PackQty", Cell: (e) => <span>{e.original.quantity}</span>},
        {accessor:"unitType_Name",Header:"UnitType", Cell: (e) => <span>{e.original.unitType_Name}</span>}       
      ]
    }
    else{
      cols = [
        {accessor:"PackItem",Header:"Pack Item", editable:true, Cell: (e) => this.createAutoComplete(e), width:550}, 
        //{accessor:"SKU",Header:"SKU",},
        {accessor:"PackQty",Header:"PackQty", editable:true, Cell: e => this.inputCell("qty", e), datatype:"int"},
        {accessor:"UnitType",Header:"UnitType",},
        {Cell:(e) => <Button onClick={()=>{
          const data = this.state.data;
          data.forEach((row, index)=>{
            if(row.id === e.original.id){
              data.splice(index, 1)
            }
          })
          this.setState({data}, () => {
            let res = this.state.autocompleteUpdate
            this.state.data.forEach((datarow,index) => {
              res = res.filter(row => {
                return datarow.Code !== row.Code
              })
            })
            this.setState({autocomplete:res})
          })
        }} color="danger">Remove</Button>}

      ]
    }
    
    
    return(
      <div>
        <div className="clearfix">
          <div className="float-right"> 
    <div><label style={{width:"100px", textAlign:"right", paddingRight:"10px"}}>Receive No :</label>{this.state.pageID ?<span>{this.state.codeDoc}</span>:<span>(Auto Generate)</span>}</div>        
          <div><label>Document Date : </label>{this.state.pageID ?<span> {this.state.documentDate}</span>:<span> {this.DateNow.format("YYYY/MM/DD")}</span>}</div>  
          </div>
      </div>
        <div className="clearfix">
          <Row>
            <div className="col-6">
                <div className=""><label style={{width:"150px", display:"inline-block"}}>SourceBranch: </label>{this.state.pageID ? this.createText(this.state.souBranchName) : 
                  <div style={{width:"355px", display:"inline-block"}}><AutoSelect data={this.state.auto_branch} result={(e) => this.setState({"branch":e.value, "branchresult":e.label,"branchCode":e.code}, () => {this.genWarehouseData(this.state.branch)})}/></div>}</div>     
                <div className=""><label style={{width:"150px", display:"inline-block"}}>DestinationBranch: </label>{this.state.pageID ? this.createText(this.state.desBranchName) : 
                  <div style={{width:"355px", display:"inline-block"}}><AutoSelect data={this.state.auto_Desbranch} result={(e) => this.setState({"Desbranch":e.value, "Desbranchresult":e.label,"DesbranchCode":e.code}, () => {this.genDesWarehouseData(this.state.Desbranch)})}/></div>}</div>          
            </div>
            <div className="col-6">    
                <div className=""><label style={{width:"170px", display:"inline-block"}}>SourceWarehouse: </label>{this.state.pageID ? this.createText(this.state.souWareName) : 
                  <div style={{width:"355px", display:"inline-block"}}><AutoSelect data={this.state.auto_warehouse} result={(e) => this.setState({"warehouse":e.value, "warehouseresult":e.label,"WareCode":e.Warecode})}/></div>}</div>      
                <div className=""><label style={{width:"170px", display:"inline-block"}}>DestinationWarehouse: </label>{this.state.pageID ? this.createText(this.state.desWareName) : 
                  <div style={{width:"355px", display:"inline-block"}}><AutoSelect data={this.state.auto_Deswarehouse} result={(e) => this.setState({"Deswarehouse":e.value, "Deswarehouseresult":e.label,"DesWareCode":e.DesWarecode})}/></div>}</div>          
            </div>
          </Row>   
          <Row>
              <Col xs="6">                 
                <label style={{width:"150px", display:"inline-block"}}>Batch: </label>{this.state.pageID ? this.createText(this.state.batchName) :<Input onChange={(e) => this.setState({batch:e.target.value})} style={{display:"inline-block", width:"355px"}} />}<br></br>
              </Col>
              <Col xs="6">
              <Row>
                <Col xs="6">
                  <label style={{width:"110px", display:"inline-block"}}>MaterialDocNo.: </label>{this.state.pageID ? this.createText(this.state.ref1Name) :<Input onChange={(e) => this.setState({ref1:e.target.value})} style={{display:"inline-block", width:"130px"}} />}
                </Col>
                <Col xs="6">
                  <label style={{width:"115px", display:"inline-block"}}>MaterialDocYears: </label>{this.state.pageID ? this.createText(this.state.ref2Name) :<Input onChange={(e) => this.setState({ref2:e.target.value})} style={{display:"inline-block", width:"130px"}} />}<br/>
                </Col>
              </Row>  
              </Col>
          </Row>
            <Row>
              <Col>
                <label style={{width:"150px", display:"inline-block"}}>Remark: </label>{this.state.pageID ? this.createText(this.state.batchName) :<Input onChange={(e) => this.setState({remark:e.target.value})} style={{display:"inline-block", width:"935px"}} />}               
              </Col>
            </Row>
            <Row>
              <Col>
                {this.state.pageID ?null:this.Addbutton()}               
              </Col>
            </Row> 
       </div>
        <ReactTable NoDataComponent={() => null} columns={cols} minRows={10} data={this.state.check === undefined ? this.state.data : this.state.documentItems} sortable={false} style={{background:'white'}}
            showPagination={false}/>
            
        <Card>
          <CardBody style={{textAlign:'right'}}>
            <Button onClick={() => this.createDocument()} style={{display:this.state.adddisplay}} color="primary"className="mr-sm-1">Create</Button>
            <Button style={{color:"#FFF"}} type="button" color="danger" onClick={() => this.props.history.push('/doc/gr/list')}>Close</Button>
            {this.state.resultstatus}
          </CardBody>
        </Card>

      </div>
    )
  }
}

export default ReceiveManage;
