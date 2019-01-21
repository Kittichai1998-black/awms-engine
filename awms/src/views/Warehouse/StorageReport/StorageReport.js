import React, { Component } from 'react';
import "react-table/react-table.css";
import ReactTable from 'react-table'
import { TableGen } from '../MasterData/TableSetup';
import moment from 'moment';
import { AutoSelect, Clone, apicall, createQueryString } from '../ComponentCore';
import ExtendTable from '../MasterData/ExtendTable';
import ExportFile from '../MasterData/ExportFile';
import { Button, Row, Col } from 'reactstrap';

const Axios = new apicall()



class StoragReport extends Component {

  constructor() {
    super();
    this.state = {
      select: {
        queryString: window.apipath + "/api/viw",
        t: "r_StorageObject",
        q: '',
        f: "ID,Pallet,Warehouse,Area,Location,SKU_Code,SKU_Name,Batch,Lot,OrderNo,Qty,Base_Unit,Status,Receive_Time,Wei_PalletPack,Wei_Pack,concat(Wei_PalletPack, ' ','kg') AS WeiPallet,concat(Wei_Pack, ' ','kg') AS WeiPack",
        g: "",
        s: "[{'f':'Pallet','od':'asc'}]",
        sk: 0,
        l: 0,
        all: "",
      },

    }


  }

  componentDidMount() {

    Axios.get(createQueryString(this.state.select)).then((response) => {
      this.setState({
        data: response.data.datas
      })

      console.log(this.state.data)
    })

  }
  componentWillUnmount() {


  }


  initialData() {
    //Axios.get(createQueryString(this.state.select)).then((rowselect2) => {
    //  this.setState({
    //    data: rowselect2.data.datas,
    //  })
    //  console.log(this.state.data)
    //})
  }

  render() {

    let cols = [
      { accessor: 'Pallet', Header: 'Pallet', Filter: "text", sortable: false, },
      { accessor: 'Warehouse', Header: 'Warehouse', Filter: "text", sortable: false, },
      { accessor: 'Area', Header: 'Area', Filter: "text", sortable: true },
      { accessor: 'Location', Header: 'Location', Filter: "text", sortable: true },
      { accessor: 'SKU_Code', Header: 'SKU Code', Filter: "text", sortable: false, },
      { accessor: 'SKU_Name', Header: 'SKU Name', Filter: "text", sortable: false, },
      { accessor: 'Batch', Header: 'Batch', Filter: "text", sortable: true },
      { accessor: 'Lot', Header: 'Lot', Filter: "text", sortable: true },
      { accessor: 'OrderNo', Header: 'OrderNo', Filter: "text", sortable: true },
      { accessor: 'Qty', Header: 'Qty', Filter: "text", sortable: false, },
      { accessor: 'Base_Unit', Header: 'Unit', Filter: "text", sortable: false, },
      { accessor: 'WeiPallet', Header: 'Weight Pallet', Filter: "text", sortable: false, },
      { accessor: 'WeiPack', Header: 'Weight Pack', Filter: "text", sortable: false, },
      { accessor: 'Status', Header: 'Status', Filter: "text", sortable: true },
      { accessor: 'Receive_Time', Header: 'Receive Time', Filter: "text", sortable: true },
    ];

    return (

      <div>
        <div>
          <Row>
            <Col xs="12">
              <ExportFile column={cols} dataexp={this.state.data} filename={this.state.name} />
            </Col>
          </Row>
        </div>
        <TableGen column={cols} data={this.state.select} filterable={true}
          uneditcolumn={this.uneditcolumn}
          table="amv_r_StorageObject" />
      </div>

    )
  }
}

export default StoragReport;
