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
        l: 100,
        all: "",
      },

    }


  }

  componentDidMount() {
    document.title = "Storage Object - AWMS"
    //     Axios.get(createQueryString(this.state.select)).then((response) => {
    //       this.setState({
    //         data: response.data.datas
    //       })

    //       console.log(this.state.data)
    //     })


    //     var arrdata = []
    //     var sum = 0
    //     Axios.get(createQueryString(this.state.select)).then((res) => {
    //     console.log(res)
    //     res.data.datas.forEach(x => {

    //         arrdata.push({Pallet:x.Pallet,Warehouse:x.Warehouse
    //           ,Area:x.Area,Location:x.Location
    //           ,SKU_Code:x.SKU_Code,SKU_Name:x.SKU_Name
    //           ,Batch:x.Batch,Lot:x.Lot
    //           ,OrderNo:x.OrderNo,Qty:x.Qty
    //           ,Base_Unit:x.Base_Unit,WeiPallet:x.WeiPallet
    //           ,WeiPack:x.WeiPack,Status:x.Status,Receive_Time:x.Receive_Time
    //         })
    //         if(x.Qty !== null){
    //           sum = sum + parseFloat(x.Qty)
    //         }

    //       })
    //       console.log(sum)
    //       arrdata.push({Pallet:null,Warehouse:null
    //         ,Area:null,Location:null
    //         ,SKU_Code:null,SKU_Name:null
    //         ,Batch:null,Lot:null
    //         ,OrderNo:null,Qty:sum
    //         ,Base_Unit:null,WeiPallet:null
    //         ,WeiPack:null,Status:null,Receive_Time:null
    //       })

    //       console.log(arrdata)
    // this.setState({a:sum})
    // console.log(this.state.a)
    //this.setState({dataselect:arrdata},()=>{console.log(this.state.dataselect)})
    // })
  }


  datetimeBody(value) {
    if (value !== null) {
      const date = moment(value);
      return <div>{date.format('DD-MM-YYYY')}</div>
    }
  }

  render() {

    let cols = [
      { Header: 'No.', fixed: "left", Type: 'numrows', filterable: false, className: 'center', minWidth: 45, maxWidth: 45 },
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
        accessor: 'Qty', Header: 'Qty', Filter: "text", sortable: false, Footer:
          (<span><label>Sum :</label>{" "}{_.sumBy(cols, x => parseFloat(x.Qty))}</span>)
      },

      { accessor: 'Base_Unit', Header: 'Unit', Filter: "text", sortable: false, },
      { accessor: 'WeiPallet', Header: 'Weight Pallet', Filter: "text", sortable: false, },
      { accessor: 'WeiPack', Header: 'Weight Pack', Filter: "text", sortable: false, },
      { accessor: 'Status', Header: 'Status', Filter: "text", sortable: true },
      {
        accessor: 'Receive_Time', Header: 'Receive Time', Filter: "text", sortable: true, Cell: (e) =>
          this.datetimeBody(e.value)
      },
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

        {/* <ReactTable pageSize="10000" NoDataComponent={() => <div style={{ textAlign: "center", height: "100px", color: "rgb(200,206,211)" }}>No row found</div>} sortable={false} style={{ background: "white", marginBottom: "50px" }}
          filterable={false} showPagination={false} minRows={2} columns={cols} data={this.state.dataselect} /> */}
      </div>

    )
  }
}

export default StoragReport;
