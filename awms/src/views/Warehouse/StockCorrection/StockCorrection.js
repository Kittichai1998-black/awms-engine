import React, { Component } from 'react';
import "react-table/react-table.css";
import {Input, Button,CardBody,Card, ButtonGroup , Row, Col,
    Modal, ModalHeader, ModalBody, ModalFooter  } from 'reactstrap';
import Axios from 'axios';
import ReactTable from 'react-table';
import {AutoSelect, NumberInput} from '../ComponentCore'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { runInNewContext } from 'vm';

const createQueryString = (select) => {
    let queryS = select.queryString + (select.t === "" ? "?" : "?t=" + select.t)
    + (select.q === "" ? "" : "&q=" + select.q)
    + (select.f === "" ? "" : "&f=" + select.f)
    + (select.g === "" ? "" : "&g=" + select.g)
    + (select.s === "" ? "" : "&s=" + select.s)
    + (select.sk === "" ? "" : "&sk=" + select.sk)
    + (select.l === 0 ? "" : "&l=" + select.l)
    + (select.all === "" ? "" : "&all=" + select.all)
    return queryS
  }
  function clone(obj) {
    var copy;
  
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;
  
    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }
  
    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }
  
    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }
  
    throw new Error("Unable to copy obj! Its type isn't supported.");
  }
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
            warehousedata:[],
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
      
      }
      componentDidMount(){
        Axios.get(createQueryString(this.state.warehouse)).then(warehouseres => {
            const warehousedata = []
            warehouseres.data.datas.forEach(row => {
              warehousedata.push({value:row.ID, label:row.Code + ' : ' + row.Name })
            })
            this.setState({warehousedata})
          })  
        }
      dropdownAuto(data, field, fieldres, child){    
        return <div>
            <label style={{width:'80px',display:"inline-block", textAlign:"right", marginRight:"10px"}}>{field} : </label> 
            <div style={{display:"inline-block", width:"40%", minWidth:"200px"}}>
              <AutoSelect data={data} result={(res) => this.autoSelectData(field, res, fieldres)}  child={child}/>
            </div>
          </div>
      }

      autoSelectData(field, resdata, resfield){
        this.setState({[resfield]:resdata.value})
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
                        const clonemapsto = clone(this.state.mapSTOView)
                        header = clonemapsto
                        header.mapstos = this.sumChild(clonemapsto.mapstos)
                        })
                        return [header]
                    }else{
                        this.setState({control:"none"})
                        this.setState({showCard:"block"})
                        this.setState({response:<span class="text-center" >{response.data._result.message}</span>})
                        return null
                    }

                    }).then(res =>  res!==null?this.addtolist(res):null).then(res => {this.setState({result:res})})
            }else{
                alert("กรอกข้อมูลไม่ครบ")
            }
    }
        
      addtolist = (data) => {
        const condata = [...data]
        const focus = {color:'red', marginLeft:"-20px", fontSize:"13px"}
        const focusf = {color:'green', marginLeft:"-20px", fontSize:"13px"}
        return condata.map((child,i) => {
          let disQtys;
          if(child.objectSizeMaps.length > 0){
            disQtys = child.objectSizeMaps.map((v)=>{
              return <div><FontAwesomeIcon icon="puzzle-piece"/>{v.innerObjectSizeName + ' ' + v.quantity + (v.minQuantity?' : Min ' + v.minQuantity:'') + (v.maxQuantity?" : Max "+v.maxQuantity:'')}</div>
            });
          }
          else{
            disQtys = <div><FontAwesomeIcon icon="puzzle-piece"/>{child.allqty}</div>
          }
          
          return <ul key={i} style={child.isFocus===true?focus:focusf}>
            <span>{child.eventStatus === 10 ? <FontAwesomeIcon icon="pause"/> : <FontAwesomeIcon icon="box"/>} | </span>
            <span>{child.code} : {child.name} | </span>
            <span>{child.objectSizeName} | </span>
            <span>{child.minWeiKG?child.minWeiKG+ '/':''}
             {child.weiKG} {child.maxWeiKG?child.maxWeiKG+ '/' : ''} 
             {child.allqty !== undefined ? child.allqty : null}
             </span>
            <br/><span style={{color:'gray'}}> {disQtys}
            {child.mapstos.length > 0 ? null : <Input style={{height:"30px", width:"60px",background:"#FFFFE0"}} max="" type="number" 
                onChange={(e)=>{this.ChangeData(e,child.id,e.target.value)}}/>}
             </span>
            
            {(child.mapstos.map(child2 => {
              let z = this.addtolist([child2])
              return z}))
            }
            </ul>
        })
      }
      
      ChangeData(e,dataID,dataValue){
          e.target.style.background="yellow"

          let data = this.state.qtyEdit
            data.forEach((row,index)=>{
                if(row.stoID === dataID){
                    data.splice(index,1)
                }
            })
          data.push({stoID:dataID,qty:dataValue})
        this.setState({qtyEdit:data})

      }

      clickSubmit(){ 
        const data = {rootID:this.state.palletcode,adjustItems:this.state.qtyEdit};
    
        Axios.post(window.apipath + "/api/wm/stkcorr/doc",data).then((res) => {
         this.createListTable()
        })
      }

      clearTable(){
        this.setState({result:null,mapSTOView:null, mapSTO:null, control:"none", response:""})
      }

    render(){
        const display={display:'none'}
      return(
        <div> 
            <Row>
                <Col sm="6">
                    {this.dropdownAuto(this.state.warehousedata, "Warehouse", "warehouseres", false)}
                </Col>
                <Col sm="6">
                    <label style={{width:'80px',display:"inline-block", textAlign:"right", marginRight:"10px"}}>Barcode : </label>
                    <Input id="barcodetext" style={{width:'45%',display:'inline-block'}} type="text"
                    value={this.state.barcode} placeholder="กรุณาใส่บาร์โค้ด"
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
                <Button onClick={this.clickSubmit} color="primary">confrim</Button>
                <Button onClick={this.clearTable} color="danger" >Cancle</Button>
            </Row>
        </div>
      
      )
    }
  }
  
  export default StockCorrection;
  