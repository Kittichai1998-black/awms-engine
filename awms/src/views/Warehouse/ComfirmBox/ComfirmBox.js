import React, { Component } from 'react';
import "react-table/react-table.css";
import {Input,Button,Alert } from 'reactstrap';
//import Axios from 'axios';
import ReactTable from 'react-table';
import {apicall} from '../ComponentCore'

const Axios = new apicall()

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

class ComfirmBox extends Component{
  constructor(props) {
    super(props);
    this.state = {
      data:[],
      select2:{queryString:window.apipath + "/api/mst",
      t:"BaseMaster",
      q:'[{ "f": "Status", "c":"=", "v": 0}]',
      f:"ID,Code,Status,ModifyTime",
      g:"",
      s:"[{'f':'Code','od':'asc'}]",
      sk:0,
      l:10,
      all:"",},
      visible: false
      
    };
    this.onDismiss = this.onDismiss.bind(this);
  }
  onDismiss() {
    this.setState({ visible:!this.state.visible });
  }

  componentDidMount(){
    Axios.get(createQueryString(this.state.select2)).then((response) => {
      this.setState({data:response.data.datas})
    })
  }
  scanbarcode(){
    let dataselect = this.state.data.filter((datarow)=>{return datarow.Code===this.state.barcode})
    if(dataselect.length > 0){
      let updjson = {
        "_token": null,
        "_apikey": null,
        "t": "ams_BaseMaster",
        "pk": "ID",
        "datas": [{"ID":dataselect[0].ID,"code":this.state.barcode,"status":1}],
        "nr": false
    }
    Axios.put(window.apipath+"/api/mst",updjson).then((res)=>{
      Axios.get(createQueryString(this.state.select2)).then((response) => {
        this.setState({data:response.data.datas})
        this.setState({checkdata:"Success"})
        this.onDismiss()
      })
    })}else{
      this.setState({checkdata:"No barcode in the system"})
      this.onDismiss()
    }
  }


  render(){  const style={width:"100px", textAlign:"right", paddingRight:"10px"}
  let cols
    cols = [
      {accessor:"Code",Header:"Code"},
      {accessor:"ModifyTime",Header:"Last Update"},
    ]

    return(  
      <div> 
        <Alert isOpen={this.state.visible} toggle={this.onDismiss}>{this.state.checkdata}</Alert>
     <    label>BarCode : </label> <Input  type="text" placeholder="BoxCode" style={{display:"inline-block",width:"150px"} }
          onChange={e => {this.setState({barcode:e.target.value})}} 
          onKeyPress={(e) => {
                if(e.key === 'Enter' && this.state.barcode !== ""){
                  this.scanbarcode()
                }
        }}></Input>{' '}
            <Button color="primary" onClick={() => this.scanbarcode()}>Scan</Button>
            <br></br><br></br>
            <ReactTable columns={cols} minRows={10} sortable={false} style={{background:'white'}}
        showPagination={false} data={this.state.data}/>
      </div>
    )
  }
}

export default ComfirmBox;
