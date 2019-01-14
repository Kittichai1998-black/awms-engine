import React, { Component } from 'react';
import "react-table/react-table.css";
import { TableGen } from '../MasterData/TableSetup';
import { AutoSelect, apicall, createQueryString, Clone } from '../ComponentCore'
import DatePicker from 'react-datepicker';
import moment from 'moment';
import {
  Input, Button, CardBody, Card, Row, Col,
  Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';
import ReactTable from 'react-table';
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../ComponentCore/Permission';

const Axios = new apicall()


class Return extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Document: {
        queryString: window.apipath + "/api/trx",
        t: "Document",
        q: "[{ 'f': 'DocumentType_ID', c:'=', 'v': 1002},{ 'f': 'EventStatus', c:'!=', 'v': 24}]",
        f: "ID,Code",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: "",
        l: "",
        all: "",
      },
      DocumentItemSto: {
        queryString: window.apipath + "/api/viw",
        t: "DocItemSto",
        q: "[{ 'f': 'EventStatus', c:'!=', 'v': 24}]",
        f: "*",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: "",
        l: "",
        all: "",
      },
      PalletSto: {
        queryString: window.apipath + "/api/viw",
        t: "PalletSto",
        q: "[{ 'f': 'Status', c:'!=', 'v': 2}]",
        f: "*",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: "",
        l: "",
        all: "",
      },
      DocItem: {
        queryString: window.apipath + "/api/trx",
        t: "DocumentItem",
        q: "[{ 'f': 'Status', c:'!=', 'v': 2}]",
        f: "*",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: "",
        l: "",
        all: "",
      },
      qtyEdit: [],
      dataTable: [],


    }
    this.createListTable = this.createListTable.bind(this)
    //this.checkPalletAndGI = this.checkPalletAndGI.bind(this)
    //this.genDocItemData = this.genDocItemData.bind(this)
  }

  async componentWillMount() {
    document.title = "Return : AWMS";
    let dataGetPer = await GetPermission()
    CheckWebPermission("Return", dataGetPer, this.props.history);
    Axios.get(createQueryString(this.state.Document)).then((response) => {
      const IssueDocdata = []
      const IssueDocID = []
      response.data.datas.forEach(row => {
        IssueDocID.push({value:row.ID})
        IssueDocdata.push({ value: row.ID, label: row.Code })

      })
      // this.setState({ IssueDocdata})
      // this.setState({ IssueDocID})
    })

    // let QueryDoc = this.state.DocItem
    // let JSONDoc = []
    // JSONDoc.push({ "f": "DocumentDate", "c": "<=", "v": this.state.IssueDocID })
    // QueryDoc.q = JSON.stringify(JSONDoc)  
    // Axios.get(createQueryString(this.state.Document)).then((response) => {
    //   const IssueDocItem = []
    //   response.data.datas.forEach( x => {
    //     IssueDocItem.push({value: x.ID, label: x.Code})
    //   })
    //   this.setState({IssueDocItem})
    // })

  }
  
  

  // checkPalletAndGI(checkPallet,checkGI){

  //   var result = checkGI.filter(x=> {
  //     return x.Batch === checkPallet.Batch &&  x.Lot === checkPallet.Lot 
      
  //   })
  // }

  // genDocItemData(data) {
  //   if (data) {
  //     const DocItem = this.DocItem
  //     DocItem.q = '[{ "f": "Document_ID", "c":"=", "v": ' + this.state.branch + '}]'
  //     Axios.get(createQueryString(DocItem)).then((res) => {
  //       const auto_warehouse = []
  //       res.data.datas.forEach(row => {
  //         auto_warehouse.push({ value: row.ID, label: row.Code + ' : ' + row.Name })
  //       })
  //       this.setState({ auto_warehouse })
  //     })
  //   }
  // }

  dropdownAuto() {
    return <div>
      <label style={{ width: '80px', display: "inline-block", textAlign: "right", marginRight: "10px" }}>Issue Doc : </label>
      <div style={{ display: "inline-block", width: "40%", minWidth: "200px" }}>
        <AutoSelect data={this.state.IssueDocdata} result={(res) => this.setState({ "Issue": res.value })} />
      </div>
    </div>
  }


  createListTable() {
    console.log(this.state.Issue)
    let QueryDoc = this.state.DocumentItemSto
    let JSONDoc = []
    const arrdata = []
    JSONDoc.push({ "f": "Document_ID", "c": "=", "v": this.state.Issue })
    QueryDoc.q = JSON.stringify(JSONDoc)
    Axios.get(createQueryString(QueryDoc)).then((res) => {
      res.data.datas.forEach(row => {
        arrdata.push({ Code: row.Code, Qty: row.Quantity, UnitTypeName: row.UnitTypeName })
      })
      this.setState({ dataTable: arrdata }, () => console.log(this.state.dataTable))
    })
  }

  render() {
    const cols = [
      { accessor: 'Code', Header: 'Doc Item', editable: false, },
      { accessor: 'Qty', Header: 'Qty', editable: false, },
      { accessor: 'UnitTypeName', Header: 'Unit Type', editable: false, },

    ];
    return (
      <div>

        <Row>
          <Col sm="6">
            {/* {this.dropdownAuto()}
             */}
          </Col>
          <Col sm="6">
          <div style={{ width: "355px", display: "inline-block" }}><AutoSelect data={this.state.IssueDocID} result={(e) => this.setState({ "Deswarehouse": e.value, "Deswarehouseresult": e.label, "DesWareCode": e.DesWarecode })} /></div>
          </Col>
        </Row><br />
        <ReactTable NoDataComponent={() => null} columns={cols} minRows={10} data={this.state.dataTable} sortable={false} style={{ background: 'white' }}
          showPagination={false} />

        <Button onClick={this.createListTable} color="primary" style={{ display: 'inline-block' }} disabled={this.state.poststatus}>Post</Button>
      </div>


    )
  }
}

export default Return;
