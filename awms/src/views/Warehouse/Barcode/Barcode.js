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

  componentDidMount(){
    let setup = json.barcodesetup.find((data) => {
      return data.type === json.barcodetype;
    })
    const values = queryString.parse(this.props.location.search)
    this.setState({barcode:values.barcode,width:setup.width, height:setup.height, name:values.Name})
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
    event.preventDefault()
    const getbarcode = this.state.barcode
    let element_column = [];
    let element_row = []; 

    if(this.state.chkbar === true && this.state.chkqr === false){
      for(let i=0; i< this.state.column; i++){
        element_column.push(<Card key={i} style={{width:this.state.width, textAlign:'center', height:this.state.height,margin:'0 5px 5px 0'}}>
        <CardBody style={{ padding :'10px'}}>
          <span>{this.state.name}</span>
          <Barcode value={getbarcode} width={1.9} height={120} fontSize={13}/>
        </CardBody>
      </Card>)
      }

      for(let j=0; j< this.state.row; j++){
        element_row.push(<FormGroup style={{margin:'0 5px 5px 0'}} key={j}>{element_column}</FormGroup>);
      }
    }
    else if(this.state.chkqr === true && this.state.chkbar === false){
      for(let i=0; i< this.state.column; i++){
        element_column.push(<Card key={i} style={{width:'10cm', textAlign:'center', height:this.state.height,margin:'0 5px 5px 0'}}>
        <CardBody style={{ padding :'10px'}}>
          <span>{this.state.name}</span><br/>
          <QRCode value={getbarcode} size={120} /><br/>
          <span>{this.state.barcode}</span>
        </CardBody>
      </Card>)
      }

      for(let j=0; j< this.state.row; j++){
        element_row.push(<FormGroup style={{margin:'0 5px 5px 0'}} key={j}>{element_column}</FormGroup>);
      }
    }
    else{
      for(let i=0; i< this.state.column; i++){
        element_column.push(<Card key={i} style={{width:'10cm', textAlign:'center', height:this.state.height,margin:'0 5px 5px 0'}}>
        <CardBody style={{ padding :'10px'}}>
          <span>{this.state.name}</span><br/>
          <div style={{width:'45%', float:'left', marginTop:'10px'}}>
            <QRCode value={getbarcode} size={100} />
          </div>
          <div style={{width:'50%', float:'right'}}>
            <Barcode value={getbarcode} width={1.5} height={120} fontSize={13}/>
          </div>
        </CardBody>
      </Card>)
      }

      for(let j=0; j< this.state.row; j++){
        element_row.push(<FormGroup style={{margin:'0 5px 5px 0'}} key={j}>{element_column}</FormGroup>);
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
      return(<div ref={form => {this.form = form;}}><Form inline style={{ margin :'10px'}}>
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
