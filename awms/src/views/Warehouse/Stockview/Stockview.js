import React, { Component } from 'react';
import "react-table/react-table.css";
import { Input, Card, CardBody, Button } from 'reactstrap';
import "react-table/react-table.css";
import ReactTable from 'react-table'
import { apicall } from '../ComponentCore'
import { EventStatus, DocumentStatus } from '../Status'
import Axios from 'axios';
import moment from 'moment';
import queryString from 'query-string';
import DatePicker from 'react-datepicker';
import ReactAutocomplete from 'react-autocomplete';
//import { TableGen } from '../MasterData/TableSetup';



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

const API = new apicall()

class Stockview extends Component{
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      pagedocID: 0,
 
    };

    this.getSelectionData = this.getSelectionData.bind(this)
    this.initialData = this.initialData.bind(this)
    this.DateNow = moment()
    this.addIndex = 0



  }   
  
  initialData() {
    const values = queryString.parse(this.props.location.search)
    if (values.docID !== undefined) {
    
      this.setState({
        pageID: values.docID,
      })
      API.get(window.apipath + "/api/wm/stkcorr/doc?docID=" + values.docID + "&getMapSto=true").then((rowselect1) => {
        if (rowselect1.data._result.status === 0) {
          this.setState({ data: [] })
        }
        else {
          this.setState({
         
            documentStatus: rowselect1.data.document.eventStatus,
            code: rowselect1.data.document.code,
            souWarehouse: rowselect1.data.document.souWarehouse,     
            documentDate: moment(rowselect1.data.document.documentDate).format("DD-MM-YYYY"),
            //date: moment(rowselect1.data.document.documentItems.actionTime),
            
          })

          rowselect1.data.document.documentItems.forEach(row => {
            let bstosdata = rowselect1.data.bstos.filter(row2 => {
              return row.packMaster_ID === row2.packID
            })
            this.setState({
              data: [{
                rootCode: bstosdata[0].rootCode,
                packCode: bstosdata[0].packCode,
                packName: bstosdata[0].packName,
                quantity: row.quantity,
                unitType_Code: row.unitType_Code,
              
              }]
            })
            
          })
         
        }
       
      })
    }
   
   
 


  }

  componentDidMount() {
    this.initialData()
  }


  getSelectionData(data) {
    this.setState({ selectiondata: data })
  }

  createText(data, field) {
    let datafield = data.filter(row => row.docID === field)
    let result = datafield.map(row => { return <span key={row.Code}>{row.Code + ' : ' + row.Name}</span> })
    return result
  }




  renderDocumentStatus() {
    const res = EventStatus.filter(row => {
      return row.code === this.state.documentStatus
    })
    return res.map(row => {
      return <span><img src={row.pathImg} width={row.width} style={{ marginRight: "10px"}} />{row.status}</span>
    })
  }

  dateTimePicker() {
    return <DatePicker selected={this.state.date}
      onChange={(e) => { this.setState({ date: e }) }}
      onChangeRaw={(e) => {
        if (moment(e.target.value).isValid()) {
          this.setState({ date: e.target.value })
        }
      }}
      dateFormat="DD/MM/YYYY HH:mm:ss" />
  }



  createAutoCompleteCell(rowdata) {
    const style = {
      borderRadius: '3px',
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
      background: 'rgba(255, 255, 255, 0.9)',
      padding: '2px 0',
      fontSize: '90%',
      position: 'fixed',
      overflow: 'auto',
      maxHeight: '50%',
      zIndex: '998',
    }
    if (this.state.autocomplete.length > 0) {
      return <ReactAutocomplete
        menuStyle={style}
        getItemValue={(item) => item.Code + ' : ' + item.Name}
        items={this.state.autocomplete}
        shouldItemRender={(item, value) => item.Code.toLowerCase().indexOf(value.toLowerCase()) > -1}
        renderItem={(item, isHighlighted) =>
          <div key={item.docID} style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
            {item.Code + ' : ' + item.Name}
          </div>
        }
        value={rowdata.value}
  
        onSelect={(val, row) => {
          this.editData(rowdata, row, rowdata.column.id)
        }}
      />
    }
  }
  



  render() {
    const style = { width: "100px", textAlign: "right", paddingRight: "10px" }
    let cols
  
      cols = [
        { accessor: "rootCode", Header: "Root Code", Cell: (e) => <span>{e.original.rootCode}</span> },
        { accessor: "packCode", Header: "Item Code", Cell: (e) => <span>{e.original.packCode}</span> },
        { accessor: "packName", Header: "Item Name", Cell: (e) => <span>{e.original.packName}</span> },
        { accessor: "quantity", Header: "Adjust", Cell: (e) => <span>{e.original.quantity}</span> },
        { accessor: "unitType_Code", Header: "Unit", Cell: (e) => <span>{e.original.unitType_Code}</span> },
        {
          Cell: (e) => <Button color="primary"  onClick={() => { this.props.history.push('' + e.original.id) }}>Detail</Button>
        }
       
      ]
    

    return (

      <div>

        
        <div className="clearfix">
          <div className="heading">
            <div className="float-right">
            <div>Document Date : <span className="heading">{this.state.documentDate}</span></div>
            <div>Event Status :  {this.renderDocumentStatus()} <span></span></div>
            
          </div>
          
          <div className="d-block"><label >Stock Colection No : </label><span>{this.state.code}</span></div>
            <div className="d-block"><label >Ware House : </label><span>{this.state.souWarehouse}</span></div>
          </div>
          </div>
       
        <div>
          <div className="d-block"><label> </label><span></span></div>
        </div>
        <div className="d-block"><label className="heading">Item list</label><span></span></div>
        <ReactTable  columns={cols} minRows={10} data={this.state.data} sortable={false} style={{ background: 'white' }}
          showPagination={false}   />
          <Card>
          <CardBody style={{ textAlign: 'right' }}>
            <Button style={{ color: "#FFF" }} type="button" color="danger" onClick={() => this.props.history.push('/doc/stc/manage')}>Close</Button>
            </CardBody>
        </Card>


        </div>
   
    )
  }
        }
        


export default Stockview;
