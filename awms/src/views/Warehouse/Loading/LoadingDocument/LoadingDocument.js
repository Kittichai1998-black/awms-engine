import React, { Component } from 'react';
import "react-table/react-table.css";
import {Input, Button, Row, Col, CardBody, Card } from 'reactstrap';
import ReactTable from 'react-table';
import moment from 'moment';
import {AutoSelect, apicall, createQueryString, DatePicker, Clone} from '../../ComponentCore';
import {DocumentEventStatus} from '../../Status'
import Downshift from 'downshift'
import queryString from 'query-string'
import _ from 'lodash'
import ReactAutocomplete from 'react-autocomplete'
import arrimg from '../../../../img/arrowhead.svg'
import GenBillPDF from '../GenBillPDF'

const API = new apicall();
const iconpdf = <img style={{ width: "17px", height: "inherit" }} src="data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTguMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDU2IDU2IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1NiA1NjsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSI1MTJweCIgaGVpZ2h0PSI1MTJweCI+CjxnPgoJPHBhdGggc3R5bGU9ImZpbGw6I0U5RTlFMDsiIGQ9Ik0zNi45ODUsMEg3Ljk2M0M3LjE1NSwwLDYuNSwwLjY1NSw2LjUsMS45MjZWNTVjMCwwLjM0NSwwLjY1NSwxLDEuNDYzLDFoNDAuMDc0ICAgYzAuODA4LDAsMS40NjMtMC42NTUsMS40NjMtMVYxMi45NzhjMC0wLjY5Ni0wLjA5My0wLjkyLTAuMjU3LTEuMDg1TDM3LjYwNywwLjI1N0MzNy40NDIsMC4wOTMsMzcuMjE4LDAsMzYuOTg1LDB6Ii8+Cgk8cG9seWdvbiBzdHlsZT0iZmlsbDojRDlEN0NBOyIgcG9pbnRzPSIzNy41LDAuMTUxIDM3LjUsMTIgNDkuMzQ5LDEyICAiLz4KCTxwYXRoIHN0eWxlPSJmaWxsOiNDQzRCNEM7IiBkPSJNMTkuNTE0LDMzLjMyNEwxOS41MTQsMzMuMzI0Yy0wLjM0OCwwLTAuNjgyLTAuMTEzLTAuOTY3LTAuMzI2ICAgYy0xLjA0MS0wLjc4MS0xLjE4MS0xLjY1LTEuMTE1LTIuMjQyYzAuMTgyLTEuNjI4LDIuMTk1LTMuMzMyLDUuOTg1LTUuMDY4YzEuNTA0LTMuMjk2LDIuOTM1LTcuMzU3LDMuNzg4LTEwLjc1ICAgYy0wLjk5OC0yLjE3Mi0xLjk2OC00Ljk5LTEuMjYxLTYuNjQzYzAuMjQ4LTAuNTc5LDAuNTU3LTEuMDIzLDEuMTM0LTEuMjE1YzAuMjI4LTAuMDc2LDAuODA0LTAuMTcyLDEuMDE2LTAuMTcyICAgYzAuNTA0LDAsMC45NDcsMC42NDksMS4yNjEsMS4wNDljMC4yOTUsMC4zNzYsMC45NjQsMS4xNzMtMC4zNzMsNi44MDJjMS4zNDgsMi43ODQsMy4yNTgsNS42Miw1LjA4OCw3LjU2MiAgIGMxLjMxMS0wLjIzNywyLjQzOS0wLjM1OCwzLjM1OC0wLjM1OGMxLjU2NiwwLDIuNTE1LDAuMzY1LDIuOTAyLDEuMTE3YzAuMzIsMC42MjIsMC4xODksMS4zNDktMC4zOSwyLjE2ICAgYy0wLjU1NywwLjc3OS0xLjMyNSwxLjE5MS0yLjIyLDEuMTkxYy0xLjIxNiwwLTIuNjMyLTAuNzY4LTQuMjExLTIuMjg1Yy0yLjgzNywwLjU5My02LjE1LDEuNjUxLTguODI4LDIuODIyICAgYy0wLjgzNiwxLjc3NC0xLjYzNywzLjIwMy0yLjM4Myw0LjI1MUMyMS4yNzMsMzIuNjU0LDIwLjM4OSwzMy4zMjQsMTkuNTE0LDMzLjMyNHogTTIyLjE3NiwyOC4xOTggICBjLTIuMTM3LDEuMjAxLTMuMDA4LDIuMTg4LTMuMDcxLDIuNzQ0Yy0wLjAxLDAuMDkyLTAuMDM3LDAuMzM0LDAuNDMxLDAuNjkyQzE5LjY4NSwzMS41ODcsMjAuNTU1LDMxLjE5LDIyLjE3NiwyOC4xOTh6ICAgIE0zNS44MTMsMjMuNzU2YzAuODE1LDAuNjI3LDEuMDE0LDAuOTQ0LDEuNTQ3LDAuOTQ0YzAuMjM0LDAsMC45MDEtMC4wMSwxLjIxLTAuNDQxYzAuMTQ5LTAuMjA5LDAuMjA3LTAuMzQzLDAuMjMtMC40MTUgICBjLTAuMTIzLTAuMDY1LTAuMjg2LTAuMTk3LTEuMTc1LTAuMTk3QzM3LjEyLDIzLjY0OCwzNi40ODUsMjMuNjcsMzUuODEzLDIzLjc1NnogTTI4LjM0MywxNy4xNzQgICBjLTAuNzE1LDIuNDc0LTEuNjU5LDUuMTQ1LTIuNjc0LDcuNTY0YzIuMDktMC44MTEsNC4zNjItMS41MTksNi40OTYtMi4wMkMzMC44MTUsMjEuMTUsMjkuNDY2LDE5LjE5MiwyOC4zNDMsMTcuMTc0eiAgICBNMjcuNzM2LDguNzEyYy0wLjA5OCwwLjAzMy0xLjMzLDEuNzU3LDAuMDk2LDMuMjE2QzI4Ljc4MSw5LjgxMywyNy43NzksOC42OTgsMjcuNzM2LDguNzEyeiIvPgoJPHBhdGggc3R5bGU9ImZpbGw6I0NDNEI0QzsiIGQ9Ik00OC4wMzcsNTZINy45NjNDNy4xNTUsNTYsNi41LDU1LjM0NSw2LjUsNTQuNTM3VjM5aDQzdjE1LjUzN0M0OS41LDU1LjM0NSw0OC44NDUsNTYsNDguMDM3LDU2eiIvPgoJPGc+CgkJPHBhdGggc3R5bGU9ImZpbGw6I0ZGRkZGRjsiIGQ9Ik0xNy4zODUsNTNoLTEuNjQxVjQyLjkyNGgyLjg5OGMwLjQyOCwwLDAuODUyLDAuMDY4LDEuMjcxLDAuMjA1ICAgIGMwLjQxOSwwLjEzNywwLjc5NSwwLjM0MiwxLjEyOCwwLjYxNWMwLjMzMywwLjI3MywwLjYwMiwwLjYwNCwwLjgwNywwLjk5MXMwLjMwOCwwLjgyMiwwLjMwOCwxLjMwNiAgICBjMCwwLjUxMS0wLjA4NywwLjk3My0wLjI2LDEuMzg4Yy0wLjE3MywwLjQxNS0wLjQxNSwwLjc2NC0wLjcyNSwxLjA0NmMtMC4zMSwwLjI4Mi0wLjY4NCwwLjUwMS0xLjEyMSwwLjY1NiAgICBzLTAuOTIxLDAuMjMyLTEuNDQ5LDAuMjMyaC0xLjIxN1Y1M3ogTTE3LjM4NSw0NC4xNjh2My45OTJoMS41MDRjMC4yLDAsMC4zOTgtMC4wMzQsMC41OTUtMC4xMDMgICAgYzAuMTk2LTAuMDY4LDAuMzc2LTAuMTgsMC41NC0wLjMzNWMwLjE2NC0wLjE1NSwwLjI5Ni0wLjM3MSwwLjM5Ni0wLjY0OWMwLjEtMC4yNzgsMC4xNS0wLjYyMiwwLjE1LTEuMDMyICAgIGMwLTAuMTY0LTAuMDIzLTAuMzU0LTAuMDY4LTAuNTY3Yy0wLjA0Ni0wLjIxNC0wLjEzOS0wLjQxOS0wLjI4LTAuNjE1Yy0wLjE0Mi0wLjE5Ni0wLjM0LTAuMzYtMC41OTUtMC40OTIgICAgYy0wLjI1NS0wLjEzMi0wLjU5My0wLjE5OC0xLjAxMi0wLjE5OEgxNy4zODV6Ii8+CgkJPHBhdGggc3R5bGU9ImZpbGw6I0ZGRkZGRjsiIGQ9Ik0zMi4yMTksNDcuNjgyYzAsMC44MjktMC4wODksMS41MzgtMC4yNjcsMi4xMjZzLTAuNDAzLDEuMDgtMC42NzcsMS40NzdzLTAuNTgxLDAuNzA5LTAuOTIzLDAuOTM3ICAgIHMtMC42NzIsMC4zOTgtMC45OTEsMC41MTNjLTAuMzE5LDAuMTE0LTAuNjExLDAuMTg3LTAuODc1LDAuMjE5QzI4LjIyMiw1Mi45ODQsMjguMDI2LDUzLDI3Ljg5OCw1M2gtMy44MTRWNDIuOTI0aDMuMDM1ICAgIGMwLjg0OCwwLDEuNTkzLDAuMTM1LDIuMjM1LDAuNDAzczEuMTc2LDAuNjI3LDEuNiwxLjA3M3MwLjc0LDAuOTU1LDAuOTUsMS41MjRDMzIuMTE0LDQ2LjQ5NCwzMi4yMTksNDcuMDgsMzIuMjE5LDQ3LjY4MnogICAgIE0yNy4zNTIsNTEuNzk3YzEuMTEyLDAsMS45MTQtMC4zNTUsMi40MDYtMS4wNjZzMC43MzgtMS43NDEsMC43MzgtMy4wOWMwLTAuNDE5LTAuMDUtMC44MzQtMC4xNS0xLjI0NCAgICBjLTAuMTAxLTAuNDEtMC4yOTQtMC43ODEtMC41ODEtMS4xMTRzLTAuNjc3LTAuNjAyLTEuMTY5LTAuODA3cy0xLjEzLTAuMzA4LTEuOTE0LTAuMzA4aC0wLjk1N3Y3LjYyOUgyNy4zNTJ6Ii8+CgkJPHBhdGggc3R5bGU9ImZpbGw6I0ZGRkZGRjsiIGQ9Ik0zNi4yNjYsNDQuMTY4djMuMTcyaDQuMjExdjEuMTIxaC00LjIxMVY1M2gtMS42NjhWNDIuOTI0SDQwLjl2MS4yNDRIMzYuMjY2eiIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=" />;

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
      eventstatus: 10 
    }
    this.addData = this.addData.bind(this)
    this.getIssuedList = this.getIssuedList.bind(this)
    this.createDocument = this.createDocument.bind(this)
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
        else {
          this.setState({
            data:rowselect1.data.document.documentItems, 
            loading:rowselect1.data.document.code,
            warehouse:rowselect1.data.document.souWarehouseName,
            customer:rowselect1.data.document.desCustomerName,
            transport: rowselect1.data.document.transport,
            eventstatus: rowselect1.data.document.eventStatus,
            documentDate:moment(rowselect1.data.document.documentDate).format("DD-MM-YYYY"),
            date:moment(rowselect1.data.document.actionTime),
            addstatus:true,
            issuedNo: rowselect1.data.document.code,
          })
          API.get(window.apipath + "/api/wm/loading/conso?docID=" + values.ID).then(res => {
            let groupdata = _.groupBy(res.data.datas, (e) => { return e.id })
            let groupdisplay = []
            let packname = []
            for(let row in groupdata){
              groupdata[row].forEach(grow => {
                packname.forEach((prow, index) => {
                  if(prow === grow.packName)
                    packname.splice(index, 1)
                })
                packname.push(grow.packName)
              })
              let result = groupdata[row][0]
              result.item = packname.join(",")
              groupdisplay.push(groupdata[row][0])
              packname = []
            }
            this.setState({bstos:groupdisplay})
          })
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
      
    }    
  }

  componentDidUpdate(prevProps, prevState){
    
  }

  editData(rowdata, value, field){
    const date = moment(value.ActionTime);
    const data = this.state.data;
    data[rowdata.index][field] = value.Code === undefined ? value : value.Code;
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

  /* createAutoComplete(rowdata){
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
  } */

  createAutoComplete(rowdata) {
    if (!this.state.readonly) {
      const style = {
        borderRadius: '3px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '2px 0',
        fontSize: '90%',
        position: 'fixed',
        overflow: 'auto',
        maxHeight: '50%', // TODO: don't cheat, let it flow to the bottom
        zIndex: '998',
      }

      return <ReactAutocomplete
        inputProps={{
          style: {
            width: "100%", borderRadius: "1px", backgroundImage: 'url(' + arrimg + ')',
            backgroundPosition: "8px 8px",
            backgroundSize: "10px",
            backgroundRepeat: "no-repeat",
            paddingLeft: "25px"
          }
        }}
        wrapperStyle={{ width: "100%" }}
        menuStyle={style}
        getItemValue={(item) => item.Code}
        items={this.state.autocomplete}
        shouldItemRender={(item, value) => item.Code.toLowerCase().indexOf(value.toLowerCase()) > -1}
        renderItem={(item, isHighlighted) =>
          <div key={item.Code} style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
            {item.Code}
          </div>
        }
        value={rowdata.original.Code}
        onChange={(e) => {
          const res = this.state.autocomplete.filter(row => {
            return row.Code.toLowerCase().indexOf(e.target.value.toLowerCase()) > -1
          });
          console.log()
          if (res.length === 1) {
            if (res[0].Code === e.target.value)
              this.editData(rowdata, res[0], rowdata.column.id)
            else
              this.editData(rowdata, e.target.value, rowdata.column.id)
          }
          else {
            this.editData(rowdata, e.target.value, rowdata.column.id)
          }
        }}
        onSelect={(val, row) => {
          this.editData(rowdata, row, rowdata.column.id)
        }}
      />
    }
    else {
      return <span>{rowdata.value}</span>
    }
  }

  getIssuedList(){
    const autocomplete = {queryString:window.apipath + "/api/viw",
      t:"DocumentIssuedNotUse",
      q:'[{ "f": "Des_Customer_ID", "c":"=", "v": '+ this.state.customervalue +'},{ "f": "DocumentType_ID", "c":"=", "v": 1002},{ "f": "eventStatus", "c":"in", "v": "11,12"}]',
      f:"ID, Code,Des_Customer_Code, ActionTime, Des_Customer_Name",
      g:"",
      s:"[{'f':'ID','od':'asc'}]",
      sk:0,
      all:"",}

    API.get(createQueryString(autocomplete)).then((res) => {
      this.setState({autocomplete:res.data.datas, autocompleteUpdate:Clone(res.data.datas),
        adddisplay:"inline-block"})
    })
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
    this.addIndex -= 1
    this.setState({data})
  }

  createDocument(){
    let issuedList = []
    this.state.data.forEach(item => {
      if (item.IssuedID > 0) 
      issuedList.push({issuedDocID:item.IssuedID})
    })
    if(this.state.transportvalue && this.state.warehousevalue && this.state.date !== undefined){
      let data = {
        refID:"Load01",
        transportID:this.state.transportvalue,
        transportCode:null,
        souWarehouseID:this.state.warehousevalue,
        souWarehouseCode:null,
        desCustomerID:this.state.customervalue,
        desCustomerCode:null,
        actionTime:this.state.date.format("YYYY-MM-DDThh:mm:ss"),
        documentDate:this.DateNow.format("YYYY-MM-DD"),
        remark:'',
        docItems:issuedList,
        _token:localStorage.getItem("Token")
      }
      if (issuedList.length > 0)
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
   
  clearpdf = () => {
    this.setState({ isClick: false });
    this.setState({ divpdf: null });
  }
  onLoadPDF() {
    this.setState({ isClick: !this.state.isClick }, () => {
      console.log("onLoadPDF" + this.state.pageID);
      console.log("issuedNo" + this.state.issuedNo);
      this.setState({ divpdf: <GenBillPDF id={this.state.pageID} clearpdf={this.clearpdf} /> });
    });
  }

  render(){
    const colsdetail = [
      {accessor: 'code', Header: 'Code',editable:false,},
      {accessor: 'item', Header: 'Item',editable:false,},
      { accessor: 'issuedCode', Header: 'Issued Document',editable:false,},
      {accessor: 'isLoaded', Header: 'Loaded',editable:false, Cell:e => <span>{e.value === true ? "Loaded" : "Wait"}</span>},
    ];

    const cols = [
      {accessor: 'Code', Header: 'Issued No.', width:380,editable:true, Cell: (e) => {
        if(this.state.readonly){
          return <span>{e.original.code}</span>
        }
        else{
          return this.createAutoComplete(e)
        }
      }},
      //{accessor: 'Customer', Header: 'Customer',editable:false,},
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
      {show: this.state.readonly?false:true,width:80, editable:false, Cell:(e) => {
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
      }>Delete</Button>}},
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
        <Row>
          <Col sm="6" xs="6"><label style={{paddingRight:"10px"}}>Customer : </label>
            <div style={{ width: "250px", display: "inline-block" }}>{this.state.readonly ? this.state.customer : <AutoSelect data={this.state.auto_customer} result={(e) => { this.setState({ "customervalue": e.value, "customertext": e.label }, () => this.getIssuedList()) }} />}</div></Col>
          <Col sm="6" xs="6"><Button color="primary" className="float-right" onClick={() => { this.onLoadPDF() }} style={{ display: this.state.readonly === true ? this.state.adddisplay : "none" }}>{iconpdf} Download PDF</Button></Col>
        </Row>
        <div className="clearfix">
          <Button onClick={() => this.addData()} color="primary" className="float-right" disabled={this.state.addstatus}
            style={{ display: this.state.readonly === true ? "none" : this.state.adddisplay, background: "#66bb6a", borderColor: "#66bb6a", width: '130px' }}>Add</Button>
        </div>
        <ReactTable columns={cols} minRows={5} data={this.state.data} sortable={false} style={{background:'white'}} filterable={false}
          showPagination={false} NoDataComponent={() => null} defaultPageSize={100000}/>
        {this.state.readonly ?
          <ReactTable columns={colsdetail} minRows={5} data={this.state.bstos} defaultPageSize={100000} sortable={false} style={{ background: 'white' }} filterable={false}
            showPagination={false}/> : null}
          <Card>
          <CardBody>
            <Button color="danger" className="float-right" style={{ background: "#ef5350", borderColor: "#ef5350", width: '130px' }}
              onClick={() => this.props.history.push('/doc/ld/list')}>Close</Button>
            <Button color="primary" className="float-right" style={{ display: this.state.readonly === true ? "none" : "inline", background: "#26c6da", borderColor: "#26c6da", width: '130px' }}
              onClick={this.createDocument}>Create</Button>
            
          </CardBody>
        </Card>
        {this.state.isClick ? this.state.divpdf : null}
      </div>
    )
  }
}

export default LoadingDocument;
