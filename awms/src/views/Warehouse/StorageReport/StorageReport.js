import React, { Component } from 'react';
import "react-table/react-table.css";
import ReactTable from 'react-table'
import { TableGen } from '../MasterData/TableSetup';
import moment from 'moment';
import { AutoSelect, Clone, apicall, createQueryString } from '../ComponentCore';
import ExtendTable from '../MasterData/ExtendTable';
import ExportFile from '../MasterData/ExportFile';
import { Button, Row, Col } from 'reactstrap';
import _ from "lodash";

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
      sum1:0

    }


  }

  componentDidMount() {
    document.title = "Storage Object - AWMS"
        Axios.get(createQueryString(this.state.select)).then((response) => {
          this.setState({
            data: response.data.datas
          })

          console.log(this.state.data)
        })
  }


  datetimeBody(value) {
    if (value !== null) {
      const date = moment(value);
      return <div>{date.format('DD-MM-YYYY')}</div>
    }
  }

  render() {

    let cols = [
      { accessor: 'Pallet', Header: 'Pallet', Filter: "text", sortable: true, },
      { accessor: 'Warehouse', Header: 'Warehouse', Filter: "text", sortable: true, },
      { accessor: 'Area', Header: 'Area', Filter: "text", sortable: true },
      { accessor: 'Location', Header: 'Location', Filter: "text", sortable: true },
      { accessor: 'SKU_Code', Header: 'SKU Code', Filter: "text", sortable: true, },
      { accessor: 'SKU_Name', Header: 'SKU Name', Filter: "text", sortable: true, },
      { accessor: 'Batch', Header: 'Batch', Filter: "text", sortable: true },
      { accessor: 'Lot', Header: 'Lot', Filter: "text", sortable: true },
      { accessor: 'OrderNo', Header: 'OrderNo', Filter: "text", sortable: true },
      {
        accessor: 'Qty', Header: 'Qty', Filter: "text", sortable: false, Footer: ("cdsvfdf")
    
      },

      { accessor: 'Base_Unit', Header: 'Unit', Filter: "text", sortable: false, },
      { accessor: 'WeiPallet', Header: 'Weight Pallet', Filter: "text", sortable: false, },
      { accessor: 'WeiPack', Header: 'Weight Pack', Filter: "text", sortable: false, },
      { accessor: 'Status', Header: 'Status', Filter: "text", sortable: true },
      {
        accessor: 'Receive_Time', Header: 'Receive Time', Filter: "text", sortable: true, Cell: (e) =>
          this.datetimeBody(e.value) },
    ];

    return (

      <div>
        {/*ปุ่ม export excel ส่งค่าจาก tablegen มาแสดงแทน <div> 
          <Row>
            <Col xs="12">
              <ExportFile column={cols} dataexp={this.state.data} filename={this.state.name} />
            </Col>
          </Row>
        </div> */}

        <TableGen column={cols} data={this.state.select} filterable={true}
          uneditcolumn={this.uneditcolumn} className='-striped -highlight'
          defaultPageSize={10} expFilename={"StorageObject"} exportfilebtn={false} 
         />
         
      </div>

    )
  }
}

export default StoragReport;
