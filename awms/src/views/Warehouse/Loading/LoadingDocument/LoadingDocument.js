import React, { Component } from 'react';
import "react-table/react-table.css";
import {Input, Button, Row, Col, CardBody, Card } from 'reactstrap';
import ReactTable from 'react-table';
import moment from 'moment';
import {AutoSelect, apicall, createQueryString, DatePicker, Clone} from '../../ComponentCore';
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
      auto_customer:[],
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
      q:'[{ "f": "DocumentType_ID", "c":"=", "v": 1002},{ "f": "eventStatus", "c":"in", "v": "11,12"}]',
      f:"ID, Code, SouBranch, DesCustomer, ActionTime, DesCustomerName",
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

      this.customerselect = {queryString:window.apipath + "/api/mst",
        t:"Customer",
        q:'[{ "f": "Status", "c":"=", "v": 1}]',
        f:"ID,Code, Name",
        g:"",
        s:"[{'f':'ID','od':'asc'}]",
        sk:0,
        all:"",}
  }
 
  componentWillMount(){
    const values = queryString.parse(this.props.location.search)
    if(values.ID){
      this.setState({pageID:values.ID, readonly:true,
        addstatus:true,})
        API.get(window.apipath + "/api/wm/loading/doc/?getMapSto=true&docID=" + values.ID).then((rowselect1) => {
        if(rowselect1.data._result.status === 0){
          this.setState({data:[]})
        }
        else{
          this.setState({
            data:rowselect1.data.document.documentItems, 
            loading:rowselect1.data.document.code,
            documentStatus:rowselect1.data.document.eventStatus,
            warehouse:rowselect1.data.document.souWarehouseName,
            transport:rowselect1.data.document.transport,
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
      
      API.get(createQueryString(this.customerselect)).then(res => {
        this.setState({auto_customer : res.data.datas ,addstatus:false}, () => {
          const auto_customer = []
          this.state.auto_customer.forEach(row => {
            auto_customer.push({value:row.ID, label:row.Code + ' : ' + row.Name })
          })
          this.setState({auto_customer})
        })
      })
      
      this.setState({documentDate:this.DateNow.format('DD-MM-YYYY')})
      API.get(createQueryString(this.autocomplete)).then((res) => {
          this.setState({autocomplete:res.data.datas, autocompleteUpdate:Clone(res.data.datas),
            adddisplay:"inline-block"})
      })
    }    
  }

  componentDidUpdate(prevProps, prevState){
    
  }

  createList(){
    const bstos = this.state.bstos
    const res = bstos.map((row, index) => {
      return <div>
          <span>Code : {row.code}</span>|<span>Qty : {row.packQty}</span>|<span>Warehouse : {row.warehouseCode}</span>
      </div>
    })
    this.setState({bstostree:res})
  }

  editData(rowdata, value, field){
    const date = moment(value.ActionTime);
    const data = this.state.data;
    data[rowdata.index][field] = value.Code;
    data[rowdata.index]["Customer"] = value.DesCustomer + " : " + value.DesCustomerName;
    data[rowdata.index]["IssuedID"] = value.ID;
    data[rowdata.index]["ActionDate"] = date.format('DD-MM-YYYY HH:mm');
    this.setState({ data });

    let res = this.state.autocompleteUpdate
    this.state.data.forEach(datarow => {
      res = res.filter(row => {
        return datarow[field] !== row.Code
      })
    })
    this.setState({autocomplete:res})
  }

  createAutoComplete(rowdata){
    if(!this.state.readonly){

      return <div style={{display: 'flex',flexDirection: 'column',}}>
      <Downshift
      onChange={selection => {
        this.editData(rowdata, selection, rowdata.column.id)}
      }
      itemToString={item => {
        return item !== null ? item.Code : rowdata.value === "" ? "" : rowdata.value
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
        <div style={{width: '360px'}}>
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
                          <div style={{background:'white', width:'360px'}}
                            key={item.ID}
                            {...getItemProps({
                              item,
                              index,
                              style: {
                                backgroundColor:highlightedIndex === index ? 'lightgray' : 'white',
                                fontWeight: selectedItem === item ? 'bold' : 'normal',
                                width:'360px'
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
        desCustomerID:"xx",
        actionTime:this.state.date.format("YYYY-MM-DDThh:mm:ss"),
        documentDate:this.DateNow.format("YYYY-MM-DD"),
        remark:'',
        docItems:issuedList,
        _token:localStorage.getItem("Token")
      }
      API.post(window.apipath + "/api/wm/loading/doc", data).then((res) => {
        if(res.data._result.status === 1){
          this.props.history.push('/doc/ld/manage?ID='+ res.data.ID)
          window.location.reload()
        }
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
      {accessor: 'Code', Header: 'Issued No.', width:380,editable:true, Cell: (e) => {
        if(this.state.readonly){
          return <span>{e.original.code}</span>
        }
        else{
          return this.createAutoComplete(e)
        }
      }},
      {accessor: 'Customer', Header: 'Customer',editable:false,},
      {accessor: 'ActionDate', Header: 'Action Date',editable:false,},
      
      {show: this.state.readonly?false:true,width:80 , editable:false, Cell:(e) => {
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
      /* {show: this.state.readonly?false:true,width:80, editable:false, Cell:(e) => {
        return <Button color="danger" onClick={() => {
          const data = this.state.data
          data.forEach((datarow,index) => {
            if(datarow.ID === e.original.ID){
              data.splice(index,1);
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
        }
      }>Delete</Button>}}, */
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
          <Col sm="6" xs="6"><label style={{paddingRight:"10px"}}>Loading No. :</label><span>{this.state.loading}</span></Col>
          <Col sm="6" xs="6"><label>Document Date : </label><span>{this.state.documentDate}</span></Col>
        </Row>
        <Row>
          <Col sm="6" xs="6"><label style={{paddingRight:"10px"}}>Action Time : </label>
          <div style={{display:"inline-block"}}>{this.state.readonly ? this.state.date === undefined ? "" : this.state.date.format("DD-MM-YYYY hh:mm") : this.dateTimePicker()}</div></Col>
          <Col sm="6" xs="6"><label>Event Status : </label><span>{this.getStatusName(this.state.eventstatus)}</span></Col>
        </Row>
        <Row>
          <Col sm="6" xs="6"><label style={{paddingRight:"10px"}}>Transport : </label>
          <div style={{width:"250px", display:"inline-block"}}>{this.state.readonly ? this.state.transport : <AutoSelect data={this.state.auto_transport} result={(e) => this.setState({"transportvalue":e.value, "transporttext":e.label})}/>}</div></Col>
          <Col sm="6" xs="6"><label style={{paddingRight:"10px"}}>Warehouse : </label>
    <div style={{width:"250px", display:"inline-block"}}>{this.state.readonly ? this.state.warehouse : <AutoSelect data={this.state.auto_warehouse} result={(e) => this.setState({"warehousevalue":e.value, "warehousetext":e.label})}/>}</div></Col>
        </Row>
        <div className="clearfix">
          <Button onClick={() => this.addData()} color="primary" className="float-right" disabled={this.state.addstatus}
            style={{ display: this.state.readonly === true ? "none" : this.state.adddisplay, background: "#66bb6a", borderColor: "#66bb6a", width: '130px' }}>Add</Button>
        </div>
        <ReactTable columns={cols} minRows={5} data={this.state.data} sortable={false} style={{background:'white'}} filterable={false}
            showPagination={false} NoDataComponent={() => null}/>
          {/* {this.state.readonly ? this.state.bstostree : null} */}
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
