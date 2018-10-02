import React, { Component } from 'react';
import Barcode from "react-barcode";
import QRCode from "qrcode.react";
import queryString from 'query-string'
import {Input, Form, FormGroup, Card, CardBody, Button} from 'reactstrap';
import ReactToPrint from "react-to-print";
import json from "./setup.json";

class SetBarcode extends Component{
  constructor(props){
    super(props);
    this.state={
      barcode:"",
      row:1,
      column:1,
      chkbar:true,
      chkqr:false,
      element:[],
      barcodesize:[],
      multiplebarcodesize:[],
      qrcodesize:0,
      fontsize:0,
      width:"",
      height:"",
      name:"",
    };
    this.createBarcode = this.createBarcode.bind(this)
    this.columnChange = this.columnChange.bind(this)
    this.rowChange = this.rowChange.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.listBarcode = this.listBarcode.bind(this)
    this.componentRef = React.createRef()

  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  componentDidUpdate(prevState){

  }

  componentDidMount(){
    const values = queryString.parse(this.props.location.search)
    console.log()
    let setup = json.barcodesetup.find((data) => {
      return data.type.toString() === values.barcodesize;
    })
    console.log(setup)
    let setup2 = json.multiplebarcodesize.find((data) => {
      return data.type.toString() === values.barcodesize;
    })
    this.setState({
      barcode:values.barcode,
      width:setup.width, 
      height:setup.height, 
      name:values.Name,
      barcodesize:{width:setup.bwidth,height:setup.bheight},
      qrcodesize:setup.size,
      fontsize:setup.fontsize,
      multiplebarcodesize:{width:setup2.width,height:setup2.height,qr:setup2.qr}
    })

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

  createBarcode(event){
    const divstyle = {
      width:this.state.width, 
      textAlign:'center', 
      height:this.state.height, 
      margin:'0 5px 5px 0',
      display:'inline-block'
    }

    const groupstyle = {
      margin:'0 5px 5px 0',
    }

    event.preventDefault()
    const getbarcode = this.state.barcode
    let element_column = [];
    let element_row = []; 

    if(this.state.chkbar === true && this.state.chkqr === false){
      for(let i=0; i< this.state.column; i++){
        element_column.push(<Card key={i} style={divstyle}>
        <CardBody style={{ padding :'1px'}}>
          <span style={{fontSize:this.state.fontsize}}>{this.state.name}</span>
          <Barcode renderAs="svg" value={getbarcode} width={this.state.barcodesize.width} height={this.state.barcodesize.height} fontSize={this.state.fontsize}/>
        </CardBody>
      </Card>)
      }

      for(let j=0; j< this.state.row; j++){
        element_row.push(<FormGroup style={groupstyle} key={j}>{element_column}</FormGroup>);
      }
    }
    else if(this.state.chkqr === true && this.state.chkbar === false){
      for(let i=0; i< this.state.column; i++){
        element_column.push(<Card key={i} style={divstyle}>
        <CardBody style={{ padding :'1px'}}>
          <QRCode renderAs="svg" value={getbarcode} size={this.state.qrcodesize} style={{paddingTop:'5px', position:"relative"}} className="float-left"/>
          <span className="clearfix" style={{fontSize:this.state.fontsize, textAlign:'left'}}>{this.state.name}</span>
          <span style={{fontSize:this.state.fontsize, position:"absolute", left:0, right:0,}}>{this.state.barcode}</span>
        </CardBody>
      </Card>)
      }

      for(let j=0; j< this.state.row; j++){
        element_row.push(<FormGroup style={groupstyle} key={j}>{element_column}</FormGroup>);
      }
    }
    else if(this.state.chkqr === true && this.state.chkbar === true){
      for(let i=0; i< this.state.column; i++){
        element_column.push(<Card key={i} style={divstyle}>
        <CardBody style={{ padding :'1px'}}>
          <span style={{fontSize:this.state.fontsize}}>{this.state.name}</span><br/>
          <div style={{marginTop:'1px'}}>
            <Barcode value={getbarcode} width={this.state.multiplebarcodesize.width} 
            height={this.state.multiplebarcodesize.height} fontSize={this.state.fontsize}/>
            <br/>
            <QRCode renderAs="svg" value={getbarcode} size={this.state.multiplebarcodesize.qr} style={{display:'inline-block'}}/>
          </div>
        </CardBody>
      </Card>)
      }

      for(let j=0; j< this.state.row; j++){
        element_row.push(<FormGroup style={groupstyle} key={j}>{element_column}</FormGroup>);
      }
    }
    const div = document.createElement('div');
    this.setState({element:element_row})
  }

  listBarcode(){
    if(this.state.column === 1){
      return(<div ref={form => {this.form = form;}}><Form style={{ margin :'10px'}}>
          {this.state.element.map((ele,key) => {
            return ele
          })}
      </Form></div>)
    }
    else if(this.state.column > 1){
      return(<div ref={form => {this.form = form;}}><Form style={{ margin :'10px'}}>
          {this.state.element.map((ele,key) => {
            return ele
          })}
      </Form></div>)
    }
    else{
      return(<div ref={form => {this.form = form;}}><Form style={{ margin :'10px'}}>
          {this.state.element.map((ele,key) => {
            return ele
          })}
      </Form></div>)
    }
  }

  render(){
    return(
      <div>
        <Form inline>
            <FormGroup>
              <Input ref={input => this.columnz = input} className="mr-sm-1" type="text" name="column" id="txbcolumn" placeholder="1" style={{width:'55px'}} maxLength="2" onChange={this.rowChange}/>
              <span className="mr-sm-1">x</span>
              <Input className="mr-sm-1" type="text" name="row" id="txbrow" placeholder="1" style={{width:'55px'}} maxLength="3" onChange={this.rowChange}/>
              <Input className="mr-sm-1" type="checkbox" name="chkqr" checked={this.state.chkqr}  onChange={this.handleInputChange}/>
              <span className="mr-sm-1"> : QRCode</span>
              <Input  className="mr-sm-1" type="checkbox" name="chkbar" checked={this.state.chkbar}  onChange={this.handleInputChange}/>
              <span className="mr-sm-1"> : Barcode</span>
              <Button className="mr-sm-1" onClick={this.createBarcode}>Create</Button>
              <ReactToPrint
                trigger={() => <Button className="mr-sm-1">Print</Button>}
                content={() => this.form}
              />
            </FormGroup>
          </Form>
          {this.listBarcode()}
      </div>
    )
  }
}

export default SetBarcode;
