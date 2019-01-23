import React, { Component } from 'react';
import "react-table/react-table.css";
import ReactTable from 'react-table'
import { TableGen } from '../MasterData/TableSetup';
import moment from 'moment';
import { AutoSelect, Clone, apicall, createQueryString } from '../ComponentCore';
import ExtendTable from '../MasterData/ExtendTable';
import ExportFile from '../MasterData/ExportFile';
import { Button, Row, Col, Input } from 'reactstrap';

const Axios = new apicall()



class CurrentReport extends Component {

  constructor() {
    super();
    this.state = {
      data: [],
      select: {
        queryString: window.apipath + "/api/viw",
        t: "r_CurrentInventory",
        q: '',
        f: "SKU_ID,SKU_Code,SKU_Name,Warehouse,Qty,Base_Unit,Batch,OrderNo,Lot",
        g: "",
        s: "[{'f':'SKU_Code','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
      },
    }
  }

  componentDidMount() {

    Axios.get(createQueryString(this.state.select)).then((response) => {
      this.setState({
        data: response.data.datas
      })
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

  onChangeFilter(inputValue, rowData) {
    let selectUrl = this.state.select;
    let selectCondition = JSON.parse(selectUrl.q === "" ? "[]" : selectUrl.q);

    if (selectCondition.length > 0) {
      selectCondition.forEach((row, index) => {
        if (row.f === rowData.column.id) {
          selectCondition.splice(index, 1)
        }
      })
    }

    selectCondition.push({ 'f': rowData.column.id, c: 'like', 'v': '*' + inputValue.target.value + '*' })
    selectUrl.q = JSON.stringify(selectCondition);

    console.log(selectUrl)
    Axios.get(createQueryString(selectUrl)).then((response) => {
      this.setState({
        data: response.data.datas, select: selectUrl
      }, () => console.log(this.state.select))
    })
  }

  render() {

    let cols = [
      { accessor: 'SKU_Code', Header: 'SKU_Code', Filter: (e) => <Input onKeyPress={(input) => { if (input.key === 'Enter') { this.onChangeFilter(input, e) } }} />, sortable: false, minWidth: 130 },
      { accessor: 'SKU_Name', Header: 'SKU_Name', Filter: (e) => <Input onKeyPress={(input) => { if (input.key === 'Enter') { this.onChangeFilter(input, e) } }} />, sortable: false, minWidth: 250 },
      { accessor: 'Warehouse', Header: 'Warehouse', Filter: (e) => <Input onKeyPress={(input) => { if (input.key === 'Enter') { this.onChangeFilter(input, e) } }} />, sortable: true },
      { accessor: 'Batch', Header: 'Batch', filterable: false, sortable: true },
      { accessor: 'Lot', Header: 'Lot', filterable: false, sortable: true },
      { accessor: 'OrderNo', Header: 'OrderNo', filterable: false, sortable: true },
      { accessor: 'Qty', Header: 'Qty', filterable: false, sortable: true },
      { accessor: 'Base_Unit', Header: 'Base_Unit', Filter: (e) => <Input onKeyPress={(input) => { if (input.key === 'Enter') { this.onChangeFilter(input, e) } }} />, sortable: false, minWidth: 130 },
    ];

    return (

      <div>
        <div>
          <Row>
            <Col xs="10">
            </Col>
            <Col xs="2">
              <ExportFile column={cols} dataexp={this.state.data} filename={this.state.name} />
            </Col>
          </Row>
          <Row>
            <Col xs="12">

            </Col>
          </Row>
        </div>
        {/* <TableGen column={cols} data={this.state.select} dropdownfilter={this.state.statuslist}
          filterable={true} autocomplete={this.state.autocomplete}
          uneditcolumn={this.uneditcolumn}
          table="amvr_StorageObject" /> */}
        <ReactTable style={{ backgroundColor: 'white', border: '0.5px solid #eceff1', zIndex: 0 }} minRows={5}
          columns={cols} data={this.state.data} editable={false} filterable={true} defaultPageSize={100} />
      </div>

    )
  }
}

export default CurrentReport;
