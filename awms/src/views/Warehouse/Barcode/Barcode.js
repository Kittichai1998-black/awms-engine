import React, { Component } from 'react';
import Barcode from "react-barcode";
import QRCode from "qrcode.react";
import queryString from 'query-string'
import {Input, Form, FormGroup, Card, CardBody, Button} from 'reactstrap';
import ReactToPrint from "react-to-print";
import json from "./setup.json";
import jsPDF from "jspdf";
import html2canvas from 'html2canvas'

function myRenderFunction(imgData){
  var a = document.createElement('a');
  // toDataURL defaults to png, so we need to request a jpeg, then convert for file download.
  a.href = imgData.replace("image/jpeg", "image/octet-stream");//canvas.toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream");
  a.download = 'somefilename.jpg';
  a.click();
}

class SetBarcode extends Component{
  constructor(props){
    super(props);
    this.state={
      barcode:"",
      row:1,
      column:1,
      chkbar:false,
      chkqr:true,
      element:[],
      barcodesize:[],
      multiplebarcodesize:[],
      qrcodesize:0,
      fontsize:0,
      fontsizeqr:0,
      width:"",
      height:"",
      name:"",
      barcodetype:"barcode"
    };
    this.createBarcode = this.createBarcode.bind(this)
    this.columnChange = this.columnChange.bind(this)
    this.rowChange = this.rowChange.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.listBarcode = this.listBarcode.bind(this)
    this.componentRef = React.createRef()
    this.printDocument = this.printDocument.bind(this)
    this.createMultipleBarcode = this.createMultipleBarcode.bind(this)
    this.barcodeID = 1
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    
    this.setState({
      [name]: value
    });
  }

  componentDidMount(){
    const values = queryString.parse(this.props.location.search)
    console.log(values)
    let setup = json.barcodesetup.find((data) => {
      return data.type.toString() === values.barcodesize;
    })
    let setup2 = json.multiplebarcodesize.find((data) => {
      return data.type.toString() === values.barcodesize;
    })
    if(values.barcodesize){
      this.setState({
        barcode:values.barcode,
        barcodetype:values.barcodetype,
        width:setup.width, 
        height:setup.height,
        barcodesize:{width:setup.bwidth,height:setup.bheight},
        qrcodesize:setup.size,
        fontsize:setup.fontsize,
        fontsizeqr:setup.fontsizeqr,
        multiplebarcodesize:{width:setup2.width,height:setup2.height,qr:setup2.qr}
      })
    }
  }

  columnChange(event){
    this.setState({column:event.target.value})
    event.preventDefault()
  }

  rowChange(event){
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState(() => {
      return {[name]:value};
  });
  }

  printDocument() {
    const width = this.state.width.replace("cm","") * 1
    const height = this.state.height.replace("cm","") * 1
    const format = [width, height]
    
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'cm',
      format: format
    });

    this.ppp(1,this.barcodeID,pdf,format);
  }
  
  ppp(i,max,pdf,format){
    console.log(i + ":" + max)
    if(i < max){

      var bc = document.getElementById("barcode"+i)
      html2canvas(bc)
        .then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          pdf.addImage(imgData, 'PNG', 0,0, format[0], format[1]);
          if(this.barcodeID - i !== 1 )
            pdf.addPage();
          this.ppp(++i,max,pdf,format);
        })
    }
    else{
      pdf.save("barcode.pdf")
    }
  }

  createMultipleBarcode(event){
    this.barcodeID = 1
    this.setState({element:[]} , () => {
      const arrbarcodedata = JSON.parse(this.state.barcode)
      arrbarcodedata.forEach(row => {
        this.createBarcode(event, row.barcode, row.Name)
      })
    })
  }

  createBarcode(event, barcode, Name){
    const divstyle = {
      width:this.state.width, 
      textAlign:'center', 
      height:this.state.height, 
      margin:'0',
      display:'inline-block'
    }

    const groupstyle = {
      margin:'0',
    }
    let element_column = [];
    let element_row = this.state.element; 
    const text = {
      display: 'block',
      width: '250px',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    }

    if(this.state.barcodetype === "barcode"){
      for(let i=0; i< this.state.column; i++){
        element_column.push(<Card id={"barcode"+ this.barcodeID} style={divstyle}  key={"barcode"+ this.barcodeID}>
        <CardBody style={{ padding :'1px'}}>
          <span style={{fontSize:this.state.fontsize}}>{Name}</span>
          <Barcode renderAs="svg" value={barcode} width={this.state.barcodesize.width} height={this.state.barcodesize.height} fontSize={this.state.fontsize}/>
        </CardBody>
      </Card>)
      
      this.barcodeID += 1
      }
    }
    else if(this.state.barcodetype === "qr"){
      for(let i=0; i< this.state.column; i++){
        element_column.push(<Card id={"barcode"+ this.barcodeID} style={divstyle} key={"barcode"+ this.barcodeID + i}>
        <CardBody style={{ padding :'1px'}}>
          <QRCode renderAs="canvas" value={barcode} size={this.state.qrcodesize} style={{padding:'5px 5px 0px 5px'}} className="float-left"/>
          <span className="clearfix float-left" style={{fontSize:this.state.fontsizeqr, textAlign:'left'}}>
            <span style={text}>{barcode}</span>
            <span style={text}>{Name}</span>
          </span>
        </CardBody>
      </Card>)
      
      this.barcodeID += 1
      }
    }
    else if(this.state.barcodetype === "both"){
      for(let i=0; i< this.state.column; i++){
        element_column.push(<Card id={"barcode"+ this.barcodeID} style={divstyle} key={"barcode"+ this.barcodeID + i}>
        <CardBody style={{ padding :'1px'}}>
          <span style={{fontSize:this.state.fontsize}}>{Name}</span><br/>
          <div style={{marginTop:'1px'}}>
            <Barcode value={barcode} width={this.state.multiplebarcodesize.width} 
            height={this.state.multiplebarcodesize.height} fontSize={this.state.fontsize}/>
            <br/>
            <QRCode renderAs="svg" value={barcode} size={this.state.multiplebarcodesize.qr} style={{display:'inline-block'}}/>
          </div>
        </CardBody>
      </Card>)
      
      this.barcodeID += 1
      }
    }

    for(let j=0; j< this.state.row; j++){
      element_row.push(<FormGroup style={groupstyle} key={j}>{element_column}</FormGroup>);
    }

    const div = document.createElement('div');
    this.setState({element:element_row})
  }

  listBarcode(){
    if(this.state.column === 1){
      return(<Form style={{ marginTop :'10px'}}>
          {this.state.element.map((ele,key) => {
            return ele
          })}
      </Form>)
    }
    else if(this.state.column > 1){
      return(<Form style={{ marginTop :'10px'}}>
          {this.state.element.map((ele,key) => {
            return ele
          })}
      </Form>)
    }
    else{
      return(<Form style={{ marginTop :'10px'}}>
          {this.state.element.map((ele,key) => {
            return ele
          })}
      </Form>)
    }
  }

  render(){
    return(
      <div>
        <Form inline>
            <FormGroup>
              <Input ref={input => this.columnz = input} className="mr-sm-1" type="text" name="column" id="txbcolumn" placeholder="1" style={{width:'55px'}} maxLength="2" onChange={this.rowChange}/>
              {/* <span className="mr-sm-1">x</span>
              <Input className="mr-sm-1" type="text" name="row" id="txbrow" placeholder="1" style={{width:'55px'}} maxLength="3" onChange={this.rowChange}/> */}
              {/* <Input className="mr-sm-1" type="checkbox" name="chkqr" checked={this.state.chkqr}  onChange={this.handleInputChange}/>
              <span className="mr-sm-1"> : QRCode</span>
              <Input  className="mr-sm-1" type="checkbox" name="chkbar" checked={this.state.chkbar}  onChange={this.handleInputChange}/>
              <span className="mr-sm-1"> : Barcode</span> */}
            <Button className="mr-sm-1" color="primary" style={{ background: "#66bb6a", borderColor: "#66bb6a", width: '80px' }}
              onClick={this.createMultipleBarcode}>Create</Button>
            <Button className="mr-sm-1" color="primary" style={{ background: "#26c6da", borderColor: "#26c6da", width: '80px' }}
              onClick={this.printDocument}>Print</Button>
            </FormGroup>
          </Form>
          <div  style={{maxWidth:'10cm',}} ref={form => {this.form = form;}}>{this.listBarcode()}</div>
      </div>
    )
  }
}

export default SetBarcode;
