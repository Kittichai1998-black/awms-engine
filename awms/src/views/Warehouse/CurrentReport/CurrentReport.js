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
      datafilter: [],
      loading: true,
      defaultPageS: 100,
      currentPage: 1,
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
    };
    this.paginationButton = this.paginationButton.bind(this)
    this.pageOnHandleClick = this.pageOnHandleClick.bind(this)
  }

  componentDidMount() {
    document.title = "Current Inventory - AWMS";
    this.getData()


  }
  componentWillUnmount() {


  }

  getData() {
    Axios.get(createQueryString(this.state.select)).then((response) => {
      let countpages = null;
      let counts = response.data.counts;
      countpages = Math.ceil(counts / this.state.defaultPageS);
      this.setState({ data: response.data.datas, countpages: countpages, loading: false })
    })
  }

  createCustomFilter(name) {
    return <Input type="text" id={name.column.id} style={{ background: "#FAFAFA" }} placeholder="filter..."
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          let filter = this.state.datafilter
          filter.forEach((x, index) => {
            if (x.id === name.column.id)
              filter.splice(index, 1);
          });
          filter.push({ id: name.column.id, value: e.target.value });
          this.setState({ datafilter: filter }, () => { this.onCheckFliter() });

        }
      }
      } />
  }

  onCheckFliter() {
    this.setState({ loading: true })
    let getFilter = this.state.datafilter;
    let listFilter = getFilter.map(x => {
      if (x.type === "date")
        return { "f": x.id, "c": "=", "v": x.value }
      else
        return { "f": x.id, "c": "like", "v": "*" + x.value + "*" }
    })
    let strCondition = JSON.stringify(listFilter);
    let getSelect = this.state.select;
    getSelect.q = strCondition;
    this.setState({ select: getSelect }, () => { this.getData() })
  }

  paginationButton() {
    const notPageactive = {
      pointerEvents: 'none',
      cursor: 'default',
      textDecoration: 'none',
      color: 'black',
      background: '#eceff1',
      minWidth: '90px'
    }
    const pageactive = {
      textDecoration: 'none',
      color: 'black',
      background: '#cfd8dc',
      minWidth: '90px'
    }
    return (
      <div style={{ paddingTop: '3px', textAlign: 'center', margin: 'auto', minWidth: "300px", maxWidth: "300px" }}>
        <nav>
          <ul className="pagination">
            <li className="page-item"><a className="page-link" style={this.state.currentPage === 1 ? notPageactive : pageactive}
              onClick={() => this.pageOnHandleClick("prev")}>
              Previous</a></li>
            <p style={{ margin: 'auto', minWidth: "60px", paddingRight: "10px", paddingLeft: "10px", verticalAlign: "middle" }}>Page : {this.state.currentPage} of {this.state.countpages === 0 || this.state.countpages === undefined ? '1' : this.state.countpages}</p>
            <li className="page-item"><a className="page-link" style={this.state.currentPage >= this.state.countpages || this.state.countpages === undefined ? notPageactive : pageactive}
              onClick={() => this.pageOnHandleClick("next")}>
              Next</a></li>
          </ul>
        </nav>
      </div>
    )
  }

  pageOnHandleClick(position) {
    this.setState({ loading: true })
    const select = this.state.select
    if (position === 'next') {
      select.sk = parseInt(select.sk === "" ? 0 : select.sk, 10) + parseInt(select.l, 10)
      ++this.state.currentPage
    }
    else {
      if (select.sk - select.l >= 0) {
        select.sk = select.sk - select.l
        if (this.state.currentPage !== 1)
          --this.state.currentPage
      }
    }
    this.setState({ select }, () => { this.getData() })
  }

  sumFooterQty(){
    return _.sumBy(this.state.data, 
      x => _.every(this.state.data, ["Base_Unit",x.Base_Unit]) == true ?
      parseFloat(x.Qty) : null)
  }

  render() {

    let cols = [
      {
        Header: 'No.', fixed: "left", filterable: false, className: 'center', minWidth: 45, maxWidth: 45,
        Cell: (e) => {
          let numrow = 0;
          if (this.state.currentPage !== undefined) {
            if (this.state.currentPage > 1) {
              // e.index + 1 + (2*100)  
              numrow = e.index + 1 + (parseInt(this.state.currentPage) * parseInt(this.state.defaultPageS));
            } else {
              numrow = e.index + 1;
            }
          }
          return <span style={{ fontWeight: 'bold' }}>{numrow}</span>
        },
        getProps: (state, rowInfo) => ({
          style: {
            backgroundColor: '#c8ced3'
          }
        })
      },
      { accessor: 'SKU_Code', Header: 'SKU_Code', Filter: (e) => this.createCustomFilter(e), sortable: true, minWidth: 130 },
      { accessor: 'SKU_Name', Header: 'SKU_Name', Filter: (e) => this.createCustomFilter(e), sortable: true, minWidth: 250 },
      { accessor: 'Warehouse', Header: 'Warehouse', Filter: (e) => this.createCustomFilter(e), sortable: true },
      { accessor: 'Batch', Header: 'Batch', filterable: true, sortable: true },
      { accessor: 'Lot', Header: 'Lot', filterable: true, sortable: true },
      { accessor: 'OrderNo', Header: 'OrderNo', filterable: true, sortable: true },
      // {
      //   accessor: 'Qty', Header: 'Qty', filterable: false, sortable: true,
      //   Footer:
      //     (<span style={{ fontWeight: 'bold' }}><label>Sum :</label>{" "}{_.sumBy(this.state.data,
      //       x => _.every(this.state.data, ["Base_Unit", x.Base_Unit]) == true ?
      //         parseFloat(x.Qty) : null)}</span>)
      // },

      { accessor: 'Qty', Header: 'Qty', editable: false, Footer:
      (<span><label>Sum :</label>{" "} {this.sumFooterQty() === 0 ? "-":this.sumFooterQty()}</span>)},

      { accessor: 'Base_Unit', Header: 'Base_Unit', Filter: (e) => this.createCustomFilter(e), sortable: false, minWidth: 130 },
    ];

    return (
      <div>
        <div>
          <Row>
            <Col xs="10">
            </Col>
            <Col xs="2">
              <ExportFile column={cols} dataxls={this.state.data} filename={"CurrentInventory"} />
            </Col>
          </Row>
          <Row>
            <Col xs="12">

            </Col>
          </Row>
        </div>
        <ReactTable
          style={{ backgroundColor: 'white', border: '0.5px solid #eceff1', zIndex: 0, marginBottom: "20px" }}
          minRows={5}
          loading={this.state.loading}
          columns={cols}
          data={this.state.data}
          editable={false}
          filterable={true}
          defaultPageSize={this.state.defaultPageS}
          PaginationComponent={this.paginationButton} />
      </div>

    )
  }
}

export default CurrentReport;
