import React, { Component } from 'react';
import "react-table/react-table.css";
import {Input, Button, Row, Col, CardBody, Card } from 'reactstrap';
import ReactTable from 'react-table';
import moment from 'moment';
import {AutoSelect, apicall, createQueryString, DatePicker} from '../../ComponentCore';
import {DocumentEventStatus} from '../../Status'
import Downshift from 'downshift'
import queryString from 'query-string'

const API = new apicall();

class LoadingDocument extends Component{
  constructor(props) {
    super(props);
    this.state = {
      data:[],
      inputstatus:true,
      pageID:null,
      addstatus:false,
      adddisplay:"inline-block",
      auto_transport:[],
      auto_warehouse:[],
      readonly:false,
      eventstatus:10,
    }
    this.addData = this.addData.bind(this)
    this.createDocument = this.createDocument.bind(this)
    this.createList = this.createList.bind(this)
    this.DateNow = moment()
    this.addIndex = 0
    this.transportselect = {queryString:window.apipath + "/api/mst",
       t:"Transport",
       q:'[{ "f": "Status", "c":"=", "v": 1}]',
       f:"ID, Code, Name",
       g:"",
       s:"[{'f':'ID','od':'asc'}]",
       sk:0,
       all:"",}
      
    this.autocomplete = {queryString:window.apipath + "/api/viw",
      t:"Document",
      q:'[{ "f": "DocumentType_ID", "c":"=", "v": 1002},{ "f": "Status", "c":"=", "v": 1}]',
      f:"ID, Code, SouBranch, DesCustomer, ActionTime",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:0,
      all:"",}
      
    this.warehouseselect = {queryString:window.apipath + "/api/mst",
      t:"Warehouse",
      q:'[{ "f": "Status", "c":"=", "v": 1}]',
      f:"ID,Code, Name",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:0,
      all:"",}
  }
 
  componentDidMount(){
    const values = queryString.parse(this.props.location.search)
    if(values.ID){
      this.setState({pageID:values.ID, readonly:true,
        addstatus:true,})
        API.get(window.apipath + "/api/wm/loading/doc/?getMapSto=true&docID=" + values.ID).then((rowselect1) => {
        if(rowselect1.data._result.status === 0){
          this.setState({data:[]})
        }
        else{
          console.log(rowselect1.data.document.transport_ID)
          this.setState({
            data:rowselect1.data.document.documentItems, 
            loading:rowselect1.data.document.code,
            documentStatus:rowselect1.data.document.eventStatus,
            warehouse:rowselect1.data.document.souWarehouse,
            transportID:rowselect1.data.document.transport_ID,
            documentDate:moment(rowselect1.data.document.documentDate).format("DD-MM-YYYY"),
            date:moment(rowselect1.data.document.actionTime),
            addstatus:true,
            bstos:rowselect1.data.bstos,
            issuedNo:rowselect1.data.document.code
          }, () => {this.createList()})
        }
      })
    }
    else{
      API.get(createQueryString(this.transportselect)).then(res => {
        this.setState({auto_transport : res.data.datas ,addstatus:false}, () => {
          const auto_transport = []
          this.state.auto_transport.forEach(row => {
            auto_transport.push({value:row.ID, label:row.Code + ' : ' + row.Name })
          })
          this.setState({auto_transport})
        })
      })
      
      API.get(createQueryString(this.warehouseselect)).then(res => {
        this.setState({auto_warehouse : res.data.datas ,addstatus:false}, () => {
          const auto_warehouse = []
          this.state.auto_warehouse.forEach(row => {
            auto_warehouse.push({value:row.ID, label:row.Code + ' : ' + row.Name })
          })
          this.setState({auto_warehouse})
        })
      })
      
      this.setState({documentDate:this.DateNow.format('DD-MMMM-YYYY')})
      API.get(createQueryString(this.autocomplete)).then((res) => {
          this.setState({autocomplete:res.data.datas,
            adddisplay:"inline-block"})
      })
    }    
  }

  createList(){
    const bstos = this.state.bstos
    console.log(this.state.bstos)
    const res = bstos.map((row, index) => {
      return <div>
          <span>Code : {row.code}</span>|<span>Qty : {row.packQty}</span>|<span>Warehouse : {row.warehouseCode}</span>
      </div>
    })
    this.setState({bstostree:res}, () => console.log(this.state.bstostree))
  }

  createAutoComplete(rowdata){
    if(!this.state.readonly){

      return <div style={{display: 'flex',flexDirection: 'column',}}>
      <Downshift
      onChange={selection => {
        rowdata.value = selection.ID
        this.editData(rowdata, selection, rowdata.column.id)}
      }
      itemToString={item => (item ? item.Code : rowdata.value)}
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
        <div style={{width: '150px'}}>
          <div style={{position: 'relative'}}>
                  <Input
                    {...getInputProps({
                      isOpen,
                      onFocus:()=>openMenu(),
                    })}
                  />
                </div>
                <div style={{position: 'absolute', zIndex:'1000', height:"100px", overflow:'auto'}}>
                  <div {...getMenuProps({isOpen})} style={{position: 'relative'}}>
                    {isOpen
                      ? this.state.autocomplete
                        .filter(item => !inputValue || item.Code.includes(inputValue))
                        .map((item, index) => (
                          <div style={{background:'white', width:'150px'}}
                            key={item.ID}
                            {...getItemProps({
                              item,
                              index,
                              style: {
                                backgroundColor:highlightedIndex === index ? 'lightgray' : 'white',
                                fontWeight: selectedItem === item ? 'bold' : 'normal',
                                width:'150px'
                              }
                            })}
                          >
                            {item ? item.Code : ''}
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

  sumChild(data){
    let getdata = []
    data.forEach(row1 => {
      let xx = getdata.filter(row => row.code === row1.code)
      if(xx.length > 0){
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
  
  getStatusName(status){
    const res = DocumentEventStatus.filter(row => {
      return row.code === status
    })
    return res.map(row => row.status)
  }
  
  createDocumentItemList(data){
    return data.map((rowdata, index) => {
      return <ul key={index}>
        <span>{this.getStatusName(rowdata.eventStatus)} /</span><span>{rowdata.code} : {rowdata.name}/</span>
        <span>Object Name{rowdata.objectSizeName} /</span><span>Qty : {rowdata.allqty} /</span><span>Weight : {rowdata.weiKG} /</span>
        {this.createDocumentItemList(rowdata.mapstos)}
      </ul>
    })
  }
  
  dateTimePicker(){
    return <DatePicker onChange={(e) => {this.setState({date:e})}} dateFormat="DD/MM/YYYY HH:mm"/>
  }

  addData(){
    const data = this.state.data
    data.push({ID:this.addIndex,Code:"",Branch:"",Customer:"",ActionDate:"",IssuedID:""})
    this.addIndex += 1
    this.setState({data})
  }

  editData(rowdata, value, field){
    const date = moment(value.ActionTime);
    const data = this.state.data;
    data[rowdata.index][field] = value.Code;
    data[rowdata.index]["Branch"] = value.SouBranch;
    data[rowdata.index]["Customer"] = value.DesCustomer;
    data[rowdata.index]["IssuedID"] = value.ID;
    data[rowdata.index]["ActionDate"] = date.format('DD-MM-YYYY HH:mm:ss');
    this.setState({ data });
  }

  /* createAutoCompleteCell(rowdata){
    const style = {borderRadius: '3px',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
    background: 'rgba(255, 255, 255, 0.9)',
    padding: '2px 0',
    fontSize: '90%',
    position: 'fixed',
    overflow: 'auto',
    maxHeight: '50%',
    zIndex: '998',}
    if(this.state.autocomplete.length > 0){
      return <ReactAutocomplete
        menuStyle={style}
        getItemValue={(item) => item.Code + ' : ' + item.Name}
        items={this.state.autocomplete}
        shouldItemRender={(item, value) => item.Code.toLowerCase().indexOf(value.toLowerCase()) > -1}
        renderItem={(item, isHighlighted) =>
          <div key={item.ID} style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
            {item.Code}
          </div>
        }
        value={rowdata.value}
        onChange={(e) => {
          rowdata.value = e.target.value
          this.editData(rowdata, e.target.value, rowdata.column.id)
        }}
        onSelect={(val, row) => {
          this.editData(rowdata, row, rowdata.column.id)
        }}
      />
    }
  } */
  
  createDocument(){
    let issuedList = []
    this.state.data.forEach(item => {
      issuedList.push({issuedDocID:item.IssuedID})
    })
    if(this.state.transportvalue && this.state.warehousevalue && this.state.date !== undefined){
      let data = {
        refID:"Load01",
        transportID:this.state.transportvalue,
        transportCode:null,
        souWarehouseID:this.state.warehousevalue,
        souWarehouseCode:null,
        actionTime:this.state.date.format("YYYY/MM/DDThh:mm:ss"),
        documentDate:this.DateNow.format("YYYY/MM/DD"),
        remark:'',
        docItems:issuedList
      }
      API.post(window.apipath + "/api/wm/loading/doc", data).then((res) => {
  
      })
    }
    else{
      alert("กรอกข้อมูลไม่ครบ")
    }
  }

  createText(data,field){
    let datafield = data.filter(row => row.ID === field)
    let result = datafield.map(row => {return <span key={row.Code}>{row.Code + ' : ' + row.Name}</span>})
    return result
  }

  render(){
    const cols = [
      {accessor: 'Code', Header: 'Issued No.',editable:true, Cell: (e) => {
        if(this.state.readonly){
          return <span>{e.original.code}</span>
        }
        else{
          return this.createAutoComplete(e)
        }
      }},
      {accessor: 'Branch', Header: 'Branch',editable:false},
      {accessor: 'Customer', Header: 'Customer',editable:false,},
      {accessor: 'ActionDate', Header: 'Action Date',editable:false,},
      {show: this.state.readonly?false:true, editable:false, Cell:(e) => {
        return <Button color="danger" onClick={() => {
          const data = this.state.data
          data.forEach((datarow,index) => {
            if(datarow.code === e.original.code){
              data.splice(index,1);
            }
          })
          this.setState({data})
        }
      }>Delete</Button>}},
      {show: this.state.readonly?false:true, editable:false, Cell:(e) => {
        return <Button color="primary" onClick={() => {
          if(e.original.IssuedID !== ""){
            if(this.state.readonly){
              window.open('/doc/gi/manage?ID='+ e.original.id)
            }
            else{
              window.open('/doc/gi/manage?ID='+ e.original.IssuedID)
            }
          }
        }
      }>Detail</Button>}},
    ];

    return(
      <div>
      {/*
        column = คอลัมที่ต้องการแสดง
        data = json ข้อมูลสำหรับ select ผ่าน url
        ddlfilter = json dropdown สำหรับทำ dropdown filter
        addbtn = เปิดปิดปุ่ม Add
        accept = สถานะของในการสั่ง update หรือ insert 
    
      */}
        <Row>
          <Col sm="6" xs="6"><label style={{paddingRight:"10px"}}>Loading No. :</label><span></span></Col>
          <Col sm="6" xs="6"><label>Document Date : </label><span>{this.state.documentDate}</span></Col>
        </Row>
        <Row>
          <Col sm="6" xs="6"><label style={{paddingRight:"10px"}}>Action Time : </label>
          <div style={{display:"inline-block"}}>{this.state.readonly ? this.state.date === undefined ? "" : this.state.date.format("DD-MM-YYYY hh:mm") : this.dateTimePicker()}</div></Col>
          <Col sm="6" xs="6"><label>Event Status : </label></Col>
        </Row>
        <Row>
          <Col sm="6" xs="6"><label style={{paddingRight:"10px"}}>Transport : </label>
          <div style={{width:"250px", display:"inline-block"}}>{this.state.readonly ? this.state.transportID : <AutoSelect data={this.state.auto_transport} result={(e) => this.setState({"transportvalue":e.value, "transporttext":e.label})}/>}</div></Col>
          <Col sm="6" xs="6"><label style={{paddingRight:"10px"}}>Warehouse : </label>
    <div style={{width:"250px", display:"inline-block"}}>{this.state.readonly ? this.state.warehouse : <AutoSelect data={this.state.auto_warehouse} result={(e) => this.setState({"warehousevalue":e.value, "warehousetext":e.label})}/>}</div></Col>
        </Row>
        <div className="clearfix">
          <Button onClick={() => this.addData()} color="primary" className="float-right" disabled={this.state.addstatus}
            style={{ display: this.state.readonly === true ? "none" : this.state.adddisplay, background: "#66bb6a", borderColor: "#66bb6a", width: '130px' }}>Add</Button>
        </div>
        <ReactTable columns={cols} minRows={5} data={this.state.data} sortable={false} style={{background:'white'}} filterable={false}
            showPagination={false}/>
          {this.state.readonly ? this.state.bstostree : null}
          <Card>
          <CardBody>
            <Button color="danger" className="float-right" style={{ background: "#ef5350", borderColor: "#ef5350", width: '130px' }}
              onClick={() => this.props.history.push('/doc/ld/list')}>Close</Button>
            <Button color="primary" className="float-right" style={{ display: this.state.readonly === true ? "none" : "inline", background: "#26c6da", borderColor: "#26c6da", width: '130px' }}
              onClick={this.createDocument}>Create</Button>
            
          </CardBody>
        </Card>
      </div>
    )
  }
}

export default LoadingDocument;
