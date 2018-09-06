import React, { Component } from 'react';
import "react-table/react-table.css";
import {Input, Form, FormGroup, Card, CardBody, Button } from 'reactstrap';
import {TableGen,DropdownList} from './TableSetup';

class ListProduct extends Component{
  constructor(props) {
    super(props);

    this.state = {
      dropdownOpen: false,
      data : [{'ID':1,'Code':'ANONPHUPUI','Name':'Inactive','Status':true,},{'ID':2,'Code':'AUTOMOTIONWORKS','Name':'Inactive','Status':true},{'ID':3,'Code':'xx','Name':'Inactive','Status':false}],
      adddata : [],
      barcode:false,
      searchdata :[],
      ddlresult :[],
    };

    this.onClickBarcode = this.onClickBarcode.bind(this);
    this.onHandleClickSearch = this.onHandleClickSearch.bind(this);
    this.onHandleClickAccept = this.onHandleClickAccept.bind(this);
    this.onHandleClickAdd = this.onHandleClickAdd.bind(this);
    this.addkey = -1
  }
  onClickBarcode(){
    //event.preventDefault();
    return(
      this.setState({barcode:true})
    )
  }

  onHandleClickSearch(event){
    event.preventDefault();
    this.setState({adddata:[]})
    let filter = []
    if(this.state.ddlresult !== [])
        this.state.ddlresult.forEach((row, index)=>{
          if(row.name !== 'Status' && this.searchtext.value !== ""){
            filter.push({column:row.data,desc:this.searchtext.value})
          }
          else if(row.name === 'Status'){
            filter.push({column:row.name,desc:row.data})
          }
      })
    this.setState({searchdata:filter})
  }

  onHandleClickAdd(event){
    event.preventDefault();
    let adddata = [...this.state.adddata];
    adddata = []
    adddata.push({'ID':this.addkey,'Code':'Add New','Name':'-','Status':true,})
    this.addkey += -1
    this.setState({adddata});
  }

  onHandleClickAccept(event){
    event.preventDefault();
  }

  onHandleClickCallback = (data, name) =>{
    this.setState({adddata:[]})
    let result = this.state.ddlresult
    result.forEach((datarow,index) => {
      if(datarow.name === name){
        result.splice(index,1);
      }
    })
    result.push({"data":data,"name":name})

    result.forEach((datarow,index) => {
      if(datarow.data === 'All'){
        result.splice(index,1);
      }
    })

    this.setState({result})
  }
  
  render(){

    const data = {
      'status' : [{'key':'0','value':'Code'},{'key':'1','value':'Name'},{'key':'2','value':'Description'}],
      'header' : {'text':'ตาราง'},
    };

    const data2 = {
      'status' : [{'key':'0','value':'Inactive'},{'key':'1','value':'Active'},{'key':'2','value':'All'}],
      'header' : {'text':'สถานะ2'},
    };

    return(
      <Card>
        <CardBody>
          <Form inline>
            <FormGroup>
              <Input type="text" name="search" id="txbsearch" placeholder="ชื่อ รหัส รายละเอียด" className="mr-sm-2" innerRef={input => {this.searchtext = input}}/>
              <DropdownList data = {data} return={this.onHandleClickCallback} name="Column"/>{' '}
              <DropdownList data = {data2} return={this.onHandleClickCallback} name="Status"/>{' '}
              <Button onClick={this.onHandleClickSearch} color="primary"className="mr-sm-1">Search</Button>{' '}
              <Button onClick={this.onHandleClickAdd} color="primary"className="mr-sm-1">Add</Button>{' '}
            </FormGroup>
          </Form>
        </CardBody>
        <TableGen type={2} data={this.state.data} adddata={this.state.adddata} filter={this.state.searchdata}/>
        <CardBody>
          <Button onClick={this.onHandleClickAccept} color="primary"className="mr-sm-1">Accept</Button>
          <Button onClick={this.onHandleClickAccept} color="danger"className="mr-sm-1">Cancel</Button>
        </CardBody>
      </Card>
    )
  }
}

export default ListProduct;
