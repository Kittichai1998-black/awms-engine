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
import { error } from 'util';
import _ from "lodash";

const Axios = new apicall()


class CheckPallet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Pallet: {
        queryString: window.apipath + "/api/mst",
        t: "BaseMaster",
        q: '[{ "f": "Status", "c":"=", "v": 1}]',
        f: "ID,Code",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        all: "",
      },

      barcodeLocation: '',
      barcodePallet: '',
      resultPallet: [],
      resultLocation: [],
      show: "none",
      barcodeLocationID: ""
    }

    this.checkPallet = this.checkPallet.bind(this)
    this.genDataCard = this.genDataCard.bind(this)

  }

  async componentWillMount() {
    document.title = "Check pallet : AWMS";
    //permission
    let dataGetPer = await GetPermission()
    this.displayButtonByPermission(dataGetPer)
  }

  displayButtonByPermission(dataGetPer) {
    // 74	Move_create&modify 
    if (!CheckViewCreatePermission("Move_create&modify", dataGetPer)) {
      this.props.history.push("/404")
    }
  }


  checkPallet() {
    let QueryDoc = this.state.Pallet
    let JSONDoc = []
    JSONDoc.push({ "f": "Code", "c": "=", "v": this.state.barcodePallet })
    QueryDoc.q = JSON.stringify(JSONDoc)
    Axios.get(createQueryString(QueryDoc)).then((response) => {
      var checkPallet = false
      if (response.data.datas.length !== 0) {
        checkPallet = true
        this.setState({ checkPallet })
        this.GetDataFromPallet()
      } else {
        alert("Don't have pallet : " + this.state.barcodePallet + " in system")
      }


    })
  }


  GetDataFromPallet() {
    //console.log(this.state.barcodePallet)
    Axios.get(window.apipath + "/api/trx/mapsto?type=1&code=" + this.state.barcodePallet + "&isToRoot=false&isToChild=true").then((rowselect) => {

      if (rowselect.data._result.status === 1) {
        if (rowselect.data.mapsto != null) {
          console.log(rowselect.data.mapsto.mapstos)
          if(rowselect.data.mapsto.mapstos.length === 0){
            alert("Not found")
          }
          const dataCard = []

          console.log(rowselect.data.mapsto.id)
          rowselect.data.mapsto.mapstos.forEach(x => {

            console.log(x)
            dataCard.push({ id: rowselect.data.mapsto.id, name: x.name, baseQty: x.baseQty, baseUnitCode: x.baseUnitCode, lot: x.lot, batch: x.batch,orderNo:x.orderNo })
          })
          this.genDataCard(dataCard)

        } else {
          alert("Not found")
          this.Clear()
        }
      }
    })
  }

  genDataCard(data) {

    var dataCard = data.map((list, index) => {
      console.log(list)
      return <Card key={index} style={{ background: '#FFFFFF' }}>
        <CardBody>
          <div style={{ textAlign: "center" }}><label style={{ fontWeight: "bolder" }}>Pallet : </label> {this.state.barcodePallet}</div>
          <div><label style={{ fontWeight: "bolder" }}>Item : </label> {list.name}</div>
          <div><label style={{ fontWeight: "bolder" }}>Qty : </label> {list.baseQty} </div>
          <div><label style={{ fontWeight: "bolder" }}>Unit Type : </label> {list.baseUnitCode}</div>
          <div><label style={{ fontWeight: "bolder" }}>Lot : </label> {list.lot}</div>
          <div><label style={{ fontWeight: "bolder" }}>Batch : </label> {list.batch} </div>
          <div><label style={{ fontWeight: "bolder" }}>Order No : </label> {list.orderNo}</div><br />

          &nbsp;&nbsp;<Row>
          <Col xs="4"></Col>
          <Col xs="4"><Button onClick={() => { this.Clear() }} color="danger" style ={{width:"100px"}} >Close</Button></Col>
          <Col xs="4"></Col>
        </Row>
        
        </CardBody>
      </Card>

    })
    this.setState({ displayDataCard: dataCard })
  }

  Clear() {

    this.setState({ displayDataCard: null })
    this.setState({ barcodePallet: "" })

  }
  render() {
    return (
      <div>
        <Row className="mb-2">
        
            <label style={{ fontWeight: "bolder", width: '100%',marginRight: "10px" }}>Barcode Pallet : </label>

                   <Input id="barcodePallet" style={{ textAlign: "center", width: '100%'}} type="text"
              value={this.state.barcodePallet} placeholder="Barcode Pallet"
              onChange={e => { this.setState({ barcodePallet: e.target.value }) }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && this.state.barcodePallet !== "") {
                  this.checkPallet()
                }
              }} />
        
        </Row><br/>
        {this.state.displayDataCard}
      </div>
    )
  }
}

export default CheckPallet;
