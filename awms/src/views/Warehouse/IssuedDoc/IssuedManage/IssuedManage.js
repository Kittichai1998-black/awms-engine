import React, { Component } from 'react';
import {Link}from 'react-router-dom';
import "react-table/react-table.css";
import {Input, Form, FormGroup, Card, CardBody, Button } from 'reactstrap';
import {TableGen} from '../MasterData/TableSetup';
import Axios from 'axios';


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

class IssuedManage extends Component{
  constructor(props) {
    super(props);

    this.state = {
      data : [],
      branch:{queryString:"https://localhost:44366/api/mst",
      t:"Branch",
      q:"[{ 'f': 'Status', c:'=', 'v': 1}]",
      f:"*",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:"",
      l:"",
      all:"",},
      warehouse:{queryString:"https://localhost:44366/api/mst",
      t:"Warehouse",
      q:"[{ 'f': 'Status', c:'=', 'v': 1}]",
      f:"*",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:"",
      l:"",
      all:"",},
      customer:{queryString:"https://localhost:44366/api/mst",
      t:"Customer",
      q:'[{ "f": "Status", "c":"=", "v": 1}]',
      f:"*",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:"",
      l:"",
      all:"",},
    };
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.createQueryString = this.createQueryString.bind(this)
    this.getSelectionData = this.getSelectionData.bind(this)
    this.Date = new Date()
  }

  dropdownAuto(data, field){
    const style = {borderRadius: '3px',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
    background: 'rgba(255, 255, 255, 0.9)',
    padding: '2px 0',
    fontSize: '90%',
    position: 'fixed',
    overflow: 'auto',
    maxHeight: '50%', // TODO: don't cheat, let it flow to the bottom
    zIndex: '998',}
    
    return <div>
      <label style={{width:'80px'}}>{field}</label>
      <ReactAutocomplete
      menuStyle={style}
      shouldItemRender={(item, value) => item.Name.toLowerCase().indexOf(value.toLowerCase()) > -1}
      getItemValue={(item) => {
        {
          field === "Warehouse" ? this.setState({warehousevalue:{'key':item.Name,'value':item.ID}},() => {
            const area = this.state.area
            let areawhere = JSON.parse(area.q)
            areawhere.push({'f':'warehouse_ID','c':'=','v':item.ID})
            area.q = JSON.stringify(areawhere)
            Axios.get(createQueryString(area)).then((res) => {
              this.setState({areadata:res.data.datas})
            })
          }) : 
          field === "Supplier" ? this.setState({suppliervalue:[{'key':item.Name,'value':item.ID}]}) : 
          this.setState({areavalue:{'key':item.Name,'value':item.ID}})
        }
        return item.Name
      }}
      items={data}
      renderItem={(item, isHighlighted) =>
        <div key={item.id} style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
          {item.Name}
        </div>
      }
      value={field === "Warehouse" ? this.state.warehouseres : field === "Supplier" ? this.state.supplierres : this.state.areares }
      onChange={(e) => {
        field === "Warehouse" ? this.setState({warehouseres:e.target.value, ddlwarehouse:true}) : 
        field === "Supplier" ? this.setState({supplierres:e.target.value, ddlsupplier:true}) : 
        this.setState({areares:e.target.value, ddlarea:true})
      }}
      onSelect={value => {
        field === "Warehouse" ? this.setState({warehouseres:value, ddlwarehouse:true}) : 
        field === "Supplier" ? this.setState({supplierres:value, ddlsupplier:true}) : 
        this.setState({areares:value, ddlarea:true})
      }}/>
      <span>{field === "Warehouse" && this.state.ddlwarehouse===true?"": 
        field === "Supplier" && this.state.ddlsupplier===true?"": field === "Area" && this.state.ddlarea===true?"":" *"}</span>
    </div>
  }

  onHandleClickCancel(event){
    this.forceUpdate();
    event.preventDefault();
  }

  componentDidMount(){
  }

  getSelectionData(data){
    this.setState({selectiondata:data}, () => console.log(this.state.selectiondata))
  }

  workingData(data,status){
    let postdata = {docIDs:[]}
    if(data.length > 0){
      data.forEach(rowdata => {
        postdata["docIDs"].push(rowdata.ID)
      })
      if(status==="accept"){
        Axios.post("https://localhost:44366/api/wm/issued/doc/working", postdata).then(() => this.forceUpdate())
      }
      else{
        Axios.post("https://localhost:44366/api/wm/issued/doc/rejected", postdata).then(() => this.forceUpdate())
      }
    }
  }

  render(){
    return(
      <div>
      {/*
        column = คอลัมที่ต้องการแสดง
        data = json ข้อมูลสำหรับ select ผ่าน url
        ddlfilter = json dropdown สำหรับทำ dropdown filter
        addbtn = เปิดปิดปุ่ม Add
        accept = สถานะของในการสั่ง update หรือ insert 
    
      */}
      
        <Card>
          <CardBody>
            <Button onClick={() => this.workingData(this.state.selectiondata,"accept")} color="primary"className="mr-sm-1">Working</Button>
            <Button onClick={() => this.workingData(this.state.selectiondata,"reject")} color="danger"className="mr-sm-1">Reject</Button>
          </CardBody>
        </Card>
      </div>
    )
  }
}

export default IssuedManage;
