import React, { Component } from 'react';
import "react-table/react-table.css";
import ReactTable from 'react-table'
import { apicall, createQueryString } from '../ComponentCore';
import ExportFile from '../MasterData/ExportFile';
import { Row, Col, Input } from 'reactstrap';
import _ from 'lodash';

const Axios = new apicall()



class CurrentReport extends Component {

  constructor() {
    super();
    this.state = {
      data: [],
      datafilter:[],
      loading:true,
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
    document.title = "Current Inventory - AWMS";
    this.getData()
    

  }
  componentWillUnmount() {


  }

  getData(){
    Axios.get(createQueryString(this.state.select)).then((response) => {
      this.setState({
        data: response.data.datas
      })
    })
  }

  initialData() {
    //Axios.get(createQueryString(this.state.select)).then((rowselect2) => {
    //  this.setState({
    //    data: rowselect2.data.datas,
    //  })
    //  console.log(this.state.data)
    //})
  }
  createCustomFilter(name) {
    return <Input type="text" id={name.column.id} style={{ background: "#FAFAFA" }} placeholder="filter..."
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          let filter =  this.state.datafilter
          filter.forEach((x, index) => {
            if(x.id === name.column.id)
              filter.splice(index, 1);
          });
          filter.push({id:name.column.id, value: e.target.value});
          this.setState({datafilter:filter}, () => {this.onCheckFliter()});
          
        }
      }
    } />
  }

  onCheckFliter() {
    this.setState({ loading: true })
    let getFilter = this.state.datafilter;
    let listFilter = getFilter.map(x=> {
      if(x.type === "date")
      return { "f": x.id, "c": "=", "v": x.value}
      else
        return { "f": x.id, "c": "like", "v": "*" + x.value + "*" }
    })
    let strCondition = JSON.stringify(listFilter);
    let getSelect = this.state.select;
    getSelect.q = strCondition;
    this.setState({select:getSelect}, () => {this.getData()})
  }

  render() {

    let cols = [
      { accessor: 'SKU_Code', Header: 'SKU_Code', Filter: (e) => this.createCustomFilter(e), sortable: false, minWidth: 130 },
      { accessor: 'SKU_Name', Header: 'SKU_Name', Filter: (e) => this.createCustomFilter(e), sortable: false, minWidth: 250 },
      { accessor: 'Warehouse', Header: 'Warehouse', Filter: (e) => this.createCustomFilter(e), sortable: true },
      { accessor: 'Batch', Header: 'Batch', filterable: false, sortable: true },
      { accessor: 'Lot', Header: 'Lot', filterable: false, sortable: true },
      { accessor: 'OrderNo', Header: 'OrderNo', filterable: false, sortable: true },
      { accessor: 'Qty', Header: 'Qty', filterable: false, sortable: true,
        Footer:
        (<span><label>Sum :</label>{" "}{_.sumBy(this.state.data, 
          x => _.every(this.state.data, ["Base_Unit",x.Base_Unit]) == true ?
          parseFloat(x.Qty) : null)}</span>)
      },
      { accessor: 'Base_Unit', Header: 'Base_Unit', Filter: (e) => this.createCustomFilter(e), sortable: false, minWidth: 130 },
    ];

    return (
      <div>
        <div>
          <Row>
            <Col xs="10">
            </Col>
            <Col xs="2">
              <ExportFile column={cols} dataselect={this.state.select} filename={"CurrentInventory"} />
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
