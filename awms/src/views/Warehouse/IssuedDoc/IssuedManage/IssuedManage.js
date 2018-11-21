import React, { Component } from 'react';
import "react-table/react-table.css";
import {Input, Card, CardBody, Button, Row, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';
import ReactTable from 'react-table'
import moment from 'moment';
import {DocumentEventStatus} from '../../Status'
import queryString from 'query-string'
import {AutoSelect, NumberInput, apicall, createQueryString, DatePicker, ToListTree, Clone } from '../../ComponentCore'
import Downshift from 'downshift'

function isInt(value) {
  return !isNaN(value) && 
         parseInt(Number(value)) == value && 
         !isNaN(parseInt(value, 10));
}

const Axios = new apicall()

class IssuedManage extends Component{
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
      storageObjectdata:[]
  
    };
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.getSelectionData = this.getSelectionData.bind(this)
    this.initialData = this.initialData.bind(this)
    this.genWarehouseData = this.genWarehouseData.bind(this)
    this.DateNow = moment()
    this.addIndex = 0
    //this.autoSelectData = this.autoSelectData.bind(this)
    this.toggle = this.toggle.bind(this)

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

    this.customerselect = {queryString:window.apipath + "/api/mst",
       t:"Customer",
       q:'[{ "f": "Status", "c":"=", "v": 1}]',
       f:"ID,Code, Name",
       g:"",
       s:"[{'f':'ID','od':'asc'}]",
       sk:0,
       all:"",}
  }

  initialData(){
    const values = queryString.parse(this.props.location.search)
    if(values.ID !== undefined){
      this.setState({pageID:values.ID,
        addstatus:true,})
        Axios.get(window.apipath + "/api/wm/issued/doc/?docID=" + values.ID).then((rowselect1) => {
        if(rowselect1.data._result.status === 0){
          this.setState({data:[]})
        }
        else{
          this.setState({data:rowselect1.data.document, remark:rowselect1.data.document.remark,
          documentStatus:rowselect1.data.document.eventStatus,
          documentDate:moment(rowselect1.data.document.documentDate).format("DD-MM-YYYY"),
          date:moment(rowselect1.data.document.actionTime),
          addstatus:true,
          issuedNo:rowselect1.data.document.code})
        }
      })
    }
    else{
      this.setState({documentDate:this.DateNow.format('DD-MM-YYYY')})
      Axios.get(createQueryString(this.state.select2)).then((rowselect2) => {
        this.setState({autocomplete:rowselect2.data.datas, autocompleteUpdate:Clone(rowselect2.data.datas),
          adddisplay:"inline-block"})
      })
    }

    this.renderDocumentStatus();
    //var today = moment();
    //var tomorrow = moment(today).add(1, 'days');
    //this.setState({date:tomorrow})

    Axios.get(createQueryString(this.branchselect)).then(branchresult => {
      this.setState({auto_branch : branchresult.data.datas, addstatus:false }, () => {
        const auto_branch = []
        this.state.auto_branch.forEach(row => {
          auto_branch.push({value:row.ID, label:row.Code + ' : ' + row.Name })
        })
        this.setState({auto_branch})
      })
    })
    
    Axios.get(createQueryString(this.customerselect)).then(customerresult => {
      this.setState({auto_customer : customerresult.data.datas,addstatus:false}, () => {
        const auto_customer = []
        this.state.auto_customer.forEach(row => {
          auto_customer.push({value:row.ID, label:row.Code + ' : ' + row.Name })
        })
        this.setState({auto_customer})
      })
    })

  }

  componentDidMount(){
   this.initialData()
      Axios.get(createQueryString(this.state.StorageObject)).then((response) => {
        const storageObjectdata = []
        response.data.datas.forEach(row => {
          storageObjectdata.push({label:row.Code})
        })
          this.setState({storageObjectdata})
        })
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
      if (row.id > 0) 
      acceptdata.push({
        packID: row.id,
        packQty: row.PackQty,
      })
    })
    let postdata = {
      refID:'', forCustomerID:null, batch:null, lot:null,
      souBranchID:this.state.branch,souWarehouseID:this.state.warehouse,souAreaMasterID:null,
      desCustomerID:this.state.customer,desSupplierID:null,
      actionTime:this.state.date.format("YYYY/MM/DDTHH:mm:ss"),documentDate:this.DateNow.format("YYYY/MM/DD"),
      remark:this.state.remark,issueItems:acceptdata
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

  dateTimePicker(){
    return <DatePicker timeselect={true} onChange={(e) => { this.setState({ date: e }, () => console.log(this.state.date.format("YYYY/MM/DDTHH:mm:ss"))) }} dateFormat="DD-MM-YYYY HH:mm"/>
  }

  renderDocumentStatus(){
    const res = DocumentEventStatus.filter(row => {
      return row.code === this.state.documentStatus
    })
    return res.map(row => row.status)
  }
  genWarehouseData(data){
    if(data){
      const warehouse = this.warehouseselect
      warehouse.q = '[{ "f": "Status", "c":"=", "v": 1},{ "f": "Branch_ID", "c":"=", "v": '+ this.state.branch +'}]'
      Axios.get(createQueryString(warehouse)).then((res) => {
        const auto_warehouse = []
        res.data.datas.forEach(row => {
          auto_warehouse.push({value:row.ID, label:row.Code + ' : ' + row.Name })
        })
        this.setState({auto_warehouse})
      })
    }
  }

  inputCell(field, rowdata){
    /* return  <Input type="text" value={rowdata.value === null ? "" : rowdata.value} 
    onChange={(e) => {this.editData(rowdata, e.target.value, "PackQty")}} />; */
    return <NumberInput value={rowdata.value}
    onChange={(e) => {this.editData(rowdata, e, "PackQty")}}/>
  }
  
  addData(){
    const data = this.state.data
    data.push({id:this.addIndex,PackItem:"",PackQty:1,SKU:"",UnitType:"", ID:""})
    this.addIndex -= 1
    this.setState({data})
  }

  editData(rowdata, value, field){
    const data = this.state.data;
    if(value !== ""){
      if(rowdata.column.datatype === "int"){
        let conv = value === '' ? 0 : value
        const type = isInt(conv)
        if(type){
          data[rowdata.index][field] = (conv === 0 ? null : conv);
        }
        else{
          alert("??")
        }
      }
      else{
        data[rowdata.index][field] = value.Code;
        data[rowdata.index]["SKU"] = value.SKU;
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
  }

  createText(data){
    return <span>{data}</span>
  }
  
  createAutoComplete(rowdata){
    if(!this.state.readonly){

      return <div style={{display: 'flex',flexDirection: 'column',}}>
      <Downshift
      initialInputValue = {rowdata.value === "" || rowdata.value === undefined || rowdata.original.code === undefined ? "" : rowdata.original.code + " : " + rowdata.original.name}
      onChange={selection => {
        rowdata.value = selection.id
        this.editData(rowdata, selection, rowdata.column.id)
      }}
      itemToString={item => {
        return item !== null ? item.Code + " : " + item.Name : rowdata.original.code !== undefined ? rowdata.original.code + " : " + rowdata.original.name : "";
      }}
    >
      {({
        getInputProps,
        getItemProps,
        getMenuProps,
        isOpen,
        openMenu,
        inputValue,
        highlightedIndex,
        selectedItem,
      }) => (
        <div style={{width: '500px'}}>
          <div style={{position: 'relative'}}>
                  <Input
                    {...getInputProps({
                      isOpen,
                      onFocus:()=>openMenu(),
                    })}
                  />
                </div>
                <div style={{position: 'absolute', zIndex:'1000', height:"100px", overflow:'auto'}}>
                  <div {...getMenuProps({isOpen})} style={{position: 'relative', overflowX:"none"}}>
                    {isOpen
                      ? this.state.autocomplete
                        .filter(item => !inputValue || item.Code.includes(inputValue))
                        .map((item, index) => (
                          <div style={{background:'white', width:'500px'}}
                            key={item.id}
                            {...getItemProps({
                              item,
                              index,
                              style: {
                                backgroundColor:highlightedIndex === index ? 'lightgray' : 'white',
                                fontWeight: selectedItem === item ? 'bold' : 'normal',
                                width:'500px',
                              }
                            })}
                          >
                            {item ? item.Code + " : " + item.Name : ''}
                          </div>
                        ))
                      : null}
                  </div>
                </div>
        </div>
      )}
    </Downshift></div>
    }
    else{
      return <span>{rowdata.value}</span>
    }
  }

  toggle() {
    this.setState({modalstatus:!this.state.modalstatus});
  }

  createModal(){
    return <Modal isOpen={this.state.modalstatus}>
             <ModalHeader toggle={this.toggle}> <span>Name : Pallet, Box</span></ModalHeader>
             <ModalBody>
               <div>   
                 <AutoSelect data={this.state.storageObjectdata} result={e=>this.setState({codebase:e.label})}/>
               </div>
             </ModalBody>
             <ModalFooter>
               <Button color="primary" id="off" onClick={() => {this.onClickSelect(this.state.codebase); this.toggle()}}>OK</Button>
            </ModalFooter>
          </Modal>
}

  onClickSelect(code){
    this.setState({code})
    this.setState({remark:code})
    this.setState({basedisplay:"block"})
    if(code===undefined){
      return null
    }else{
     Axios.get(window.apipath + "/api/trx/mapsto?type=1&code="+code+"&isToChild=true").then((res) => {
     var resultToListTree = ToListTree(res.data.mapsto,"mapstos")
       this.onClickGroup(resultToListTree)
      })
    }
  }

 onClickGroup(data){
  var arrType = data.filter((res)=>{
    return res.type === 2  
  })
  var groupArray = require('group-array');
   const groupItem = groupArray(arrType, 'code');
  var arrdata =[]
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
     arrdata.push(groupItem[datarow][0])

   
  }
   this.setState({data:arrdata})
   
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
        {this.createModal()}
        <div className="clearfix">
          <div className="float-right">
            <div>Document Date : <span>{this.state.documentDate}</span></div>
            <div>Event Status : {this.renderDocumentStatus()}</div>
          </div>
          <div className="d-block"><label style={style}>Issued No : </label><span>{this.state.issuedNo}</span></div>
          <div className="d-block"><label style={style}>Action Time : </label><div style={{display:"inline-block"}}>{this.state.pageID ? <span>{this.state.date.format("DD-MM-YYYY HH:mm:ss")}</span> : this.dateTimePicker()}</div></div>
        </div>
        <div className="clearfix">
          <Row>
            <div className="col-6">
              <div className=""><label style={style}>Branch : </label>{this.state.pageID ? this.createText(this.state.data.souBranchName) : 
                <div style={{width:"300px", display:"inline-block"}}><AutoSelect data={this.state.auto_branch} result={(e) => this.setState({"branch":e.value, "branchresult":e.label}, () => {this.genWarehouseData(this.state.branch)})}/></div>}</div>
              <div className=""><label style={style}>Customer : </label>{this.state.pageID ? this.createText(this.state.data.desCustomerName) : 
                <div style={{width:"300px", display:"inline-block"}}><AutoSelect data={this.state.auto_customer} result={(e) => this.setState({"customer":e.value, "customerresult":e.label})}/></div>}</div>
            </div>
            <div className="col-6">
              <div className=""><label style={style}>Warehouse : </label>{this.state.pageID ? this.createText(this.state.data.souWarehouseName) : 
                <div style={{width:"300px", display:"inline-block"}}><AutoSelect data={this.state.auto_warehouse} result={(e) => this.setState({"warehouse":e.value, "warehouseresult":e.label})}/></div>}</div>
              <div className=""><label style={style}>Remark : </label>
              {this.state.pageID ? <span> {this.state.remark}</span> :
              <Input onChange={(e) => this.setState({remark:e.target.value})} style={{display:"inline-block", width:"300px"}}
              
              value={this.state.remark === undefined ? "" : this.state.remark}/>}
              </div>
            </div>
          </Row>
        </div>
        <div className="clearfix">
        
        <Button className="float-right" color="danger" style={{display:this.state.adddisplay}} onClick={() => this.toggle()}>Select Base</Button>
          <Button className="float-right" onClick={() => this.addData()} color="primary" disabled={this.state.addstatus} style={{display:this.state.adddisplay}}>Add</Button>
          {/* <span className="float-right" style={{display:this.state.basedisplay, backgroundColor:"white",padding:"5px", border:"2px solid #555555",borderRadius:"4px"}} >{this.state.code}</span> */}
        </div>
        <ReactTable NoDataComponent={() => null} columns={cols} minRows={10} data={this.state.data.documentItems === undefined ? this.state.data : this.state.data.documentItems} sortable={false} style={{background:'white'}}
            showPagination={false}/>
        <Card>
          <CardBody style={{textAlign:'right'}}>
            <Button onClick={() => this.createDocument()} style={{display:this.state.adddisplay}} color="primary"className="mr-sm-1">Create</Button>
            <Button style={{color:"#FFF"}} type="button" color="danger" onClick={() => this.props.history.push('/doc/gi/list')}>Close</Button>
            {this.state.resultstatus}
          </CardBody>
        </Card>

      </div>
    )
  }
}

export default IssuedManage;
