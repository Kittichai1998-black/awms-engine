import React, { Component } from 'react';
import "react-table/react-table.css";
import {Input, Button,CardBody,Card , Row, Col,
    Modal, ModalHeader, ModalBody, ModalFooter  } from 'reactstrap';
//import Axios from 'axios';
import { AutoSelect , apicall, createQueryString ,Clone } from '../ComponentCore'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


const Axios = new apicall()
class StockCorrection extends Component{
    constructor(props) {
        super(props);
        this.state = {
            control:"none",
            showCard:"none",
            mapSTO:null,
            mapSTOView:null,
            Mode:0,
            radiostate:false,
            warehouse:{queryString:window.apipath + "/api/mst",
            t:"Warehouse",
            q:"[{ 'f': 'Status', c:'=', 'v': 1}]",
            f:"ID,Code,Name",
            g:"",
            s:"[{'f':'ID','od':'asc'}]",
            sk:"",
            l:"",
            all:"",},
            qtyEdit:[],
            remark:"",
            detailPopup:false,
            data:[],
            barcode:"",
            qty:"1",
        };
        this.dropdownAuto = this.dropdownAuto.bind(this)
        this.createListTable = this.createListTable.bind(this)
        this.addtolist = this.addtolist.bind(this)
        this.clickSubmit =this.clickSubmit.bind(this)
        this.clearTable = this.clearTable.bind(this)
        this.Highlight = {background:"green"}
        this.togglePopup = this.togglePopup.bind(this)
        this.detailBaseData = this.detailBaseData.bind(this)
      
      }

    componentWillMount(){
          Axios.get(createQueryString(this.state.warehouse)).then(res => {
            this.setState({warehousedata : res.data.datas ,addstatus:false}, () => {
              const warehousedata = []
              this.state.warehousedata.forEach(row => {
                warehousedata.push({value:row.ID, label:row.Code + ' : ' + row.Name })
              })
              this.setState({warehousedata})
            })
          })
    }

    dropdownAuto(){
      return <div>
          <label style={{width:'80px',display:"inline-block", textAlign:"right", marginRight:"10px"}}>Warehouse : </label> 
          <div style={{display:"inline-block", width:"40%", minWidth:"200px"}}>
            <AutoSelect data={this.state.warehousedata} result={(res) => this.setState({"warehouseres":res.value})}/>
          </div>
        </div>
    }

      sumChild(data){
        let getdata = []
        data.forEach(row1 => {
          let xx = getdata.filter(row => row.code == row1.code)
          if(xx.length > 0){
            let qty = xx[0].allqty
            xx[0].allqty = xx[0].allqty + 1
            if(row1.mapstos.length > 0)
              this.sumChild(row1.mapstos)
          }
          else{
            row1.allqty = 1
            getdata.push(row1)
            row1.mapstos = this.sumChild(row1.mapstos)
          }
        })
        return getdata
      }
      
      createListTable(){
        let status = true;
        if(this.state.warehouseres===undefined||this.state.barcode===""){
            status = false;
        } 
            if(status){ 
                let data = {"scanCode":this.state.barcode,"amount":0,"action":0,
                "mode":0,"options":null,"warehouseID":this.state.warehouseres,"mapsto":null};
                Axios.post(window.apipath + "/api/wm/VRMapSTO",data).then((response) => {
                this.setState({palletcode:response.data.id})
                let header = []
                this.setState({response:""})
                    if(response.data._result.status !== 0){

                        this.setState({showCard:"block"})
                        this.setState({control:"block"})
                        this.setState({mapSTO:response.data, mapSTOView:response.data}, () => {
                        const clonemapsto = Clone(this.state.mapSTOView)
                        header = clonemapsto
                        header.mapstos = this.sumChild(clonemapsto.mapstos)
                        })
                        return [header]
                    }else{
                        this.setState({control:"none"})
                        this.setState({showCard:"block"})
                        this.setState({response:<span class="text-center" >{response.data._result.message}</span>})
                        this.state.barcode = ""
                        return null
                    }

                    }).then(res =>  res!==null?this.addtolist(res):null).then(res => {this.setState({result:res})})
            }else{
                alert("กรอกข้อมูลไม่ครบ")
            }
    }
        
      addtolist = (data,parent) => {
          
        const condata = [...data]
        const focus = {color:'red', marginLeft:"-20px", fontSize:"13px"}
        const focusf = {color:'green', marginLeft:"-20px", fontSize:"13px"} 
        return condata.map((child,i) => {
          let disQtys;
          if(child.parentID === null){
            this.rootID=child.id

          }
          if(child.objectSizeMaps.length > 0){
            disQtys = child.objectSizeMaps.map((v,ind)=>{
              return <div key={ind}><FontAwesomeIcon icon="puzzle-piece"/>{v.innerObjectSizeName + ' ' + v.quantity + (v.minQuantity?' : Min ' + v.minQuantity:'') + (v.maxQuantity?" : Max "+v.maxQuantity:'')}</div>
            });
          }
          else{
            disQtys = <div ><FontAwesomeIcon icon="puzzle-piece"/>{child.allqty}</div>
          }
          
          return <ul key={i} style={child.isFocus===true?focus:focusf}>
          <div style={{ display:'inline-block'}} onClick={(e) => {
          let getElement = document.getElementById(child.id).innerHTML
          if(getElement !== "")
            this.setState({DataPopup:getElement,HeaderPopup:child.code}, () => {this.togglePopup()})
        }}>
            <span>{child.eventStatus === 10 ? <FontAwesomeIcon icon="pause"/> : <FontAwesomeIcon icon="box"/>} | </span>
            <span>{child.code} : {child.name}  | </span> 
            <span>{child.objectSizeName} | </span>
            <span>{child.minWeiKG?child.minWeiKG+ '/':''}
             {child.weiKG===0?"":child.weiKG} {child.maxWeiKG?child.maxWeiKG+ '/' : ''} 
              {child.allqty !== undefined ? (child.mapstos.length > 0? null:"Qty:") : null}
             </span>
             <span style={{color:'gray',display:'none'}} id={child.id}> {disQtys}      
             </span>
             </div>
                {child.mapstos.length > 0 ? null : <Input defaultValue={child.allqty}  style={{height:"30px", width:"60px",background:"#FFFFE0",display:"inline-block"}} max="" type="number" 
                onChange={(e)=>{this.ChangeData(e,child.id,child.code,e.target.value,parent);
                child.allqty = e.target.value}}/>}
              

             {(child.mapstos.map(child2 => {
              let z = this.addtolist([child2],child.id)
              return z}))
            }
            </ul> 
        }) 
      }
      togglePopup() { 
        this.setState({
          detailPopup: !this.state.detailPopup
        });
      }

      detailBaseData(){
        return  <Modal isOpen={this.state.detailPopup}>
                  <ModalHeader toggle={this.togglePopup}>{this.state.HeaderPopup}</ModalHeader>
                  <ModalBody>
                    <div dangerouslySetInnerHTML={{__html:this.state.DataPopup}}/>
                  </ModalBody>
                  <ModalFooter>
                    <Button color="secondary" id="off" onClick={this.togglePopup}>Cancel</Button>
                  </ModalFooter>
                </Modal>
      }

      ChangeData(e,dataID,dataCode,dataValue,dataParent){
          e.target.style.background="yellow"
            let rootdata
          let data = this.state.qtyEdit
            data.forEach((row,index)=>{
                if(row.baseStoID === dataParent){
                    data.splice(index,1)
                }
            })
            data.push({baseStoID:dataParent,packStoCode:dataCode,packQty:dataValue})

            this.setState({qtyEdit:data})
            rootdata = { "rootStoID":this.rootID,
            "remark":this.state.remark,
            "adjustItems":data}

            this.setState({updateQty:rootdata})
        
      }

      clickSubmit(){ 
        const data = {rootID:this.state.palletcode,remark:this.state.remark,adjustItems:this.state.qtyEdit};
    
        Axios.post(window.apipath + "/api/wm/stkcorr/doc/closed",this.state.updateQty).then((res) => {
            this.createListTable()
        })
      }

      clearTable(){
        this.setState({showCard:"none"})
        this.setState({result:null,mapSTOView:null, mapSTO:null, control:"none", response:""})
      }

    render(){
      return(
        <div> 
            {this.detailBaseData()}
            <Row>
                <Col sm="6">
                    {this.dropdownAuto()}
                </Col>
                <Col sm="6">
                <label style={{width:'80px',display:"inline-block", textAlign:"right", marginRight:"10px"}}>Remark : </label>
                    <Input id="remarktext" style={{width:'66.5%',display:'inline-block'}} type="text" 
                    value={this.state.remark}  onChange={e => {this.setState({remark:e.target.value})}}
                    placeholder="Remark"></Input>
                </Col>
                <Col sm="6">
                    <label style={{width:'80px',display:"inline-block", textAlign:"right", marginRight:"10px"}}>Barcode : </label>
                    <Input id="barcodetext" style={{width:'45%',display:'inline-block'}} type="text"
                    value={this.state.barcode} placeholder="Barcode"
                    onChange={e => {this.setState({barcode:e.target.value})}}
                    onKeyPress={(e) => {
                        if(e.key === 'Enter' && this.state.barcode !== ""){
                        this.createListTable()
                         }
                    }}/>{' '}
                    <Button onClick={this.createListTable} color="primary" >Scan</Button>
                </Col>
            </Row>
            <br></br>
            <Card style={{display:this.state.showCard}}>
                <CardBody>
                    <Row>
                        {this.state.response}

                    </Row>
                    <Row>
                        {this.state.result}
                    </Row>
                </CardBody>
            </Card>

            <Row className="text-center" style={{display:this.state.control}}>
                <Button onClick={this.clickSubmit} color="primary">Confirm</Button>
                <Button onClick={this.clearTable} color="danger" >Cancel</Button>
            </Row>
        </div>
      
      )
    }
  }
  
  export default StockCorrection;
  