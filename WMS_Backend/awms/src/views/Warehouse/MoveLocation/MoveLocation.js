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


class MoveLocation extends Component {
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
      AreaLocationMaster: {
        queryString: window.apipath + "/api/mst",
        t: "AreaLocationMaster",
        q: '[{ "f": "Status", "c":"=", "v": 1}]',
        f: "ID,Code,Name",
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
    this.checkAreaLocation = this.checkAreaLocation.bind(this)
    this.genDataCard = this.genDataCard.bind(this)
    // this.updateSto = this.updateSto.bind(this)

  }

  async componentWillMount() {
    document.title = "Move Location : AWMS";
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
  checkAreaLocation() {
    let QueryDoc = this.state.AreaLocationMaster
    let JSONDoc = []
    JSONDoc.push({ "f": "Code", "c": "=", "v": this.state.barcodeLocation })
    QueryDoc.q = JSON.stringify(JSONDoc)
    Axios.get(createQueryString(QueryDoc)).then((response) => {
      console.log(response)
      var checkArea = false
      if (response.data.datas.length !== 0) {
        response.data.datas.forEach(x => {
          checkArea = true
          this.setState({ show: "block" })
          this.setState({ barcodeLocationID: x.ID })
        })

      } else {
        alert("Don't have Location : " + this.state.barcodeLocation + " in system")
      }
      this.setState({ checkArea })
    })

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
      } else {
        alert("Don't have pallet : " + this.state.barcodePallet + " in system")
      }
      this.setState({ checkPallet })
      if (this.state.checkPallet === true && this.state.checkArea === true) {
        this.GetDataFromPallet()
      }

    })
  }


  GetDataFromPallet() {
    console.log(this.state.barcodePallet)
    Axios.get(window.apipath + "/api/trx/mapsto?type=1&code=" + this.state.barcodePallet + "&isToRoot=false&isToChild=true").then((rowselect) => {
      if (rowselect.data._result.status === 1) {
        console.log(rowselect.data)
        if (rowselect.data.mapsto != null) {
          console.log(rowselect.data.mapsto.mapstos)
          const dataCard = []
          // rowselect.data.mapsto.forEach(row => {
          console.log(rowselect.data.mapsto.id)
          rowselect.data.mapsto.mapstos.forEach(x => {

            console.log(x)
            dataCard.push({ id: rowselect.data.mapsto.id, name: x.name, baseQty: x.baseQty, baseUnitCode: x.baseUnitCode, lot: x.lot, batch: x.batch })
          })
          this.genDataCard(dataCard)
          // })

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
      return <Card key={index} style={{ background: 'rgb(116, 203, 147)' }}>
        <CardBody>
          <div style={{ textAlign: "center" }}><label style={{ fontWeight: "bolder" }}>Pallet : </label> {this.state.barcodePallet}</div>
          <div><label style={{ fontWeight: "bolder" }}>Item : </label> {list.name}</div>
          <div><label style={{ fontWeight: "bolder" }}>Qty : </label> {list.baseQty} </div>
          <div><label style={{ fontWeight: "bolder" }}>Unit Type : </label> {list.baseUnitCode}</div>
          <div><label style={{ fontWeight: "bolder" }}>Lot : </label> {list.lot}</div>
          <div><label style={{ fontWeight: "bolder" }}>Batch : </label> {list.batch} </div><br />

          <div style={{ textAlign: "center", width: "100%" }}><Button onClick={() => { this.updateSto(list.id) }} color="primary" >Confirm</Button>&nbsp;&nbsp;
    <Button onClick={() => { this.Clear() }} color="danger" >Cancel</Button></div>
        </CardBody>
      </Card>

    })
    this.setState({ displayDataCard: dataCard })
  }

  updateSto(bstos) {
    let postdata = {
      PalletCode: this.state.barcodePallet
      , LocationID: this.state.barcodeLocationID
      , bstosID: bstos
    }
    Axios.post(window.apipath + "/api/wm/VRMapSTO/moveLocation", postdata).then((res) => {
      console.log(res)
      if (res.data._result.status === 1) {
        window.success("Success")
        this.Clear()

      } else {

        alert(res.data._result.message)
      }
    })
  }

  Clear() {

    this.setState({ displayDataCard: null })
    this.setState({ barcodeLocation: "" })
    this.setState({ barcodePallet: "" })

  }
  render() {
    return (
      <div>
        <Row className="mb-2">
         
            <label style={{ width: '100%', display: "inline-block", marginRight: "10px", fontWeight: "bold", marginTop: "6px" }}>Location : </label>
            <Input id="barcodeLocation" type="text" style={{ textAlign: "center", width: '100%', display: 'inline-block' }}
              value={this.state.barcodeLocation} placeholder="BarCode Location"
              onChange={e => { this.setState({ barcodeLocation: e.target.value }) }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && this.state.barcodeLocation !== "") {
                  this.checkAreaLocation()

                }
                }} />
           
         
        </Row>
        <Row className="mb-2">
        
            <label style={{ fontWeight: "bolder", width: '100%', display: this.state.show, marginRight: "10px" }}>Barcode Pallet : </label>

                   <Input id="barcodePallet" style={{ textAlign: "center", width: '100%', display: this.state.show }} type="text"
              value={this.state.barcodePallet} placeholder="Barcode Pallet"
              onChange={e => { this.setState({ barcodePallet: e.target.value }) }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && this.state.barcodePallet !== "") {
                  this.checkPallet()
                }
              }} />
        
        </Row>
        {this.state.displayDataCard}
      </div>
    )
  }
}

export default MoveLocation;
