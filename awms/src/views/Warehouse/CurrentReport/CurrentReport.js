import React, { Component } from 'react';
import "react-table/react-table.css";
import ReactTable from 'react-table'
import { apicall, createQueryString, FilterURL } from '../ComponentCore';
import ExportFile from '../MasterData/ExportFile';
import { Button, Row, Col, Input } from 'reactstrap';
import _ from 'lodash';
import withFixedColumns from "react-table-hoc-fixed-columns";
import '../../Warehouse/componentstyle.css'
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../ComponentCore/Permission';

const Axios = new apicall()
const ReactTableFixedColumns = withFixedColumns(ReactTable);

class CurrentReport extends Component {

  constructor() {
    super();
    this.state = {
      data: [],
      datafilter: [],
      loading: true,
      defaultPageS: 100,
      currentPage: 1,
      select: {}
    };
    this.queryString = {
      queryString: window.apipath + "/api/viw",
      t: "r_CurrentInventory",
      q: '',
      f: "*",
      g: "",
      s: "[{'f':'SKU_Code','od':'asc'}]",
      sk: 0,
      l: 100,
      all: "",
    }
    this.paginationButton = this.paginationButton.bind(this)
    this.pageOnHandleClick = this.pageOnHandleClick.bind(this)
    this.NextLastPage = this.NextLastPage.bind(this)
    this.customSorting = this.customSorting.bind(this);
  }

  async componentWillMount() {
    document.title = "Current Inventory - AWMS";
    let dataGetPer = await GetPermission()
    CheckWebPermission("CUR_INV", dataGetPer, this.props.history);
  }
  componentDidMount() {
    if (this.props.location.search) {
      let select = FilterURL(this.props.location.search, this.queryString)
      this.setState({ select: select }, () => this.getData())
    } else {
      this.setState({ select: this.queryString }, () => this.getData())
    }
  }
  componentWillUnmount() {


  }

  getData() {
    Axios.get(createQueryString(this.state.select)).then((response) => {
      let countpages = null;
      let counts = response.data.counts;
      console.log(counts)
      countpages = Math.ceil(counts / this.state.defaultPageS);
      this.setState({ data: response.data.datas, countpages: countpages, loading: false })
    })
  }

  createCustomFilter(name) {
    return <Input autoComplete="off" type="text" id={name.column.id} style={{ background: "#FAFAFA" }} placeholder="filter..."
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          let filter = this.state.datafilter
          filter.forEach((x, index) => {
            if (x.id === name.column.id)
              filter.splice(index, 1);
          });
          if(e.target.value !== "")
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
        return { "f": x.id, "c": "like", "v": x.value }
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
    const notPageactiveLast = {
      pointerEvents: 'none',
      cursor: 'default',
      textDecoration: 'none',
    }
    const pageactiveLast = {
      textDecoration: 'none',
    }
    return (
      <div style={{ paddingTop: '3px', textAlign: 'center', margin: 'auto', minWidth: "450px", maxWidth: "450px" }}>
        <nav>
          <ul className="pagination">
            <li className="page-item" style={{display:"flex"}}><Button style={this.state.currentPage === 1 ? {...notPageactiveLast,marginRight:"5px"} : {pageactiveLast,marginRight:"5px"}}  outline color="success" onClick={() => this.NextLastPage("prev")}>{"<<"}</Button>{' '}<a className="page-link" style={this.state.currentPage === 1 ? notPageactive : pageactive}
              onClick={() => this.pageOnHandleClick("prev")}>
              Previous</a></li>
            <p style={{ margin: 'auto', minWidth: "60px", paddingRight: "10px", paddingLeft: "10px", verticalAlign: "middle" }}>Page : {this.state.currentPage} of {this.state.countpages === 0 || this.state.countpages === undefined ? '1' : this.state.countpages}</p>
            <li className="page-item" style={{display:"flex"}}> <a className="page-link" style={this.state.currentPage >= this.state.countpages || this.state.countpages === undefined ? notPageactive : pageactive}
              onClick={() => this.pageOnHandleClick("next")} >
              Next</a><Button style={this.state.currentPage >= this.state.countpages || this.state.countpages === undefined ? {...notPageactiveLast,marginLeft:"5px"} : {...pageactiveLast,marginLeft:"5px"}} outline color="success" onClick={() => this.NextLastPage("next")}>{">>"}</Button>{' '} </li> 
          </ul>
        </nav>
      </div>
    )
  }

  NextLastPage(position){
    this.setState({ loading: true })
    let queryString = "";
    const select = this.state.select
     if (position === 'next') {   
       select.sk = ((this.state.countpages * 100) - 100)
      //  console.log(select)
      queryString = createQueryString(select)
    }
    else {
     select.sk = 0 
    //  console.log(select)
      queryString = createQueryString(select)
    }

    Axios.get(queryString).then(
      (res) => {
        if (res.data.datas.length > 0) {
          if (position === 'next') {
            this.setState({currentPage:(this.state.countpages)})
          }
          else {
            this.setState({currentPage:1})
          }
          this.setState({ data: res.data.datas })
        }
        else {
          select.sk = parseInt(select.sk === "" ? 0 : select.sk, 10) - parseInt(select.l, 10)
        }
        this.setState({ loading: false })
      }
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
  customSorting(data) {
    const select = this.state.select
    select["s"] = JSON.stringify([{ 'f': data[0].id, 'od': data[0].desc === false ? 'asc' : 'desc' }])
    let queryString = ""
    this.setState({ currentPage: 1 })
    if (this.props.url === undefined || null) {
      queryString = createQueryString(select)
    }
    // else {
    //   queryString = createQueryStringStorage(this.props.url, data[0].id, data[0].desc === false ? 'asc' : 'desc')
    // }
    Axios.get(queryString).then(
      (res) => {
        this.setState({ data: res.data.datas, loading: false })
      })
  }

  sumFooterQty() {
    var sumVal = _.sumBy(this.state.data,
      x => _.every(this.state.data, ["Base_Unit", x.Base_Unit]) == true ?
        parseFloat(x.QtySummary) : null)
    if (sumVal === 0 || sumVal === null || sumVal === undefined)
      return '-'
    else
      return sumVal.toFixed(3)
  }

  sumFooter(value) {
    var sumVal = _.sumBy(this.state.data, x => parseFloat(x[value]))
    if (sumVal === 0 || sumVal === null || sumVal === undefined)
      return '-'
    else
      return sumVal.toFixed(3)
  }

  render() {

    let cols = [
      {
        Header: 'No.', fixed: "left", sortable: false, filterable: false, className: 'center', minWidth: 45, maxWidth: 45,
        Footer: <span style={{ fontWeight: 'bold' }}>Total</span>,
        Cell: (e) => {
          let numrow = 0;
          if (this.state.currentPage !== undefined) {
            if (this.state.currentPage > 1) {
              // e.index + 1 + (2*100)  
              numrow = e.index + 1 + ((parseInt(this.state.currentPage) - 1) * parseInt(this.state.defaultPageS));
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
        }),
      },
      { accessor: 'SKU_Code', fixed: "left", Header: 'SKU Code', Filter: (e) => this.createCustomFilter(e), sortable: true, minWidth: 130 },
      { accessor: 'SKU_Name', Header: 'SKU Name', Filter: (e) => this.createCustomFilter(e), sortable: true, minWidth: 250 },
      { accessor: 'Warehouse', Header: 'Warehouse', Filter: (e) => this.createCustomFilter(e), sortable: true },
      { accessor: 'Area', Header: 'Area', filterable: true, sortable: true, Filter: (e) => this.createCustomFilter(e), },
      { accessor: 'Batch', Header: 'Batch', filterable: true, sortable: true, Filter: (e) => this.createCustomFilter(e) },
      { accessor: 'Lot', Header: 'Lot', filterable: true, sortable: true, Filter: (e) => this.createCustomFilter(e) },
      { accessor: 'OrderNo', Header: 'Order No.', filterable: true, sortable: true, Filter: (e) => this.createCustomFilter(e) },
      {
        accessor: 'QtyReceiving', Header: 'Qty Receiving', editable: false, filterable: false, className: "right",
        getFooterProps: () => ({
          style: {
            backgroundColor: '#c8ced3'
          }
        }),
        Footer:
          (<span style={{ fontWeight: 'bold' }}>{this.sumFooter("QtyReceiving")}</span>)
      },
      {
        accessor: 'QtyReceived', Header: 'Qty Received', editable: false, filterable: false, className: "right",
        getFooterProps: () => ({
          style: {
            backgroundColor: '#c8ced3'
          }
        }),
        Footer:
          (<span style={{ fontWeight: 'bold' }}>{this.sumFooter("QtyReceived")}</span>)
      },
      {
        accessor: 'QtyPicking', Header: 'Qty Picking', editable: false, filterable: false, className: "right",
        getFooterProps: () => ({
          style: {
            backgroundColor: '#c8ced3'
          }
        }),
        Footer:
          (<span style={{ fontWeight: 'bold' }}>{this.sumFooter("QtyPicking")}</span>)
      },
      {
        accessor: 'QtyAuditing', Header: 'Qty Auditing', editable: false, filterable: false, className: "right",
        getFooterProps: () => ({
          style: {
            backgroundColor: '#c8ced3'
          }
        }),
        Footer:
          (<span style={{ fontWeight: 'bold' }}>{this.sumFooter("QtyAuditing")}</span>)
      },
      {
        accessor: 'QtySummary', Header: 'Qty', editable: false, filterable: false, className: "right",
        getFooterProps: () => ({
          style: {
            backgroundColor: '#c8ced3'
          }
        }),
        Footer:
          (<span style={{ fontWeight: 'bold' }}>{this.sumFooterQty()}</span>)
      },
      { accessor: 'Base_Unit', Header: 'Unit', filterable: true, Filter: (e) => this.createCustomFilter(e), sortable: false, minWidth: 100 },
      {
        accessor: 'Wei_PalletPack', Header: 'Weight Pallet (kg)', filterable: false, sortable: false, className: "right",
        getFooterProps: () => ({
          style: {
            backgroundColor: '#c8ced3'
          }
        }),
        Footer:
          (<span style={{ fontWeight: 'bold' }}>{this.sumFooter("Wei_PalletPack")}</span>)
      },
      {
        accessor: 'Wei_Pack', Header: 'Weight Pack (kg)', filterable: false, sortable: false, className: "right",
        getFooterProps: () => ({
          style: {
            backgroundColor: '#c8ced3'
          }
        }),
        Footer:
          (<span style={{ fontWeight: 'bold' }}>{this.sumFooter("Wei_Pack")}</span>)
      },
      {
        accessor: 'Wei_PackStd', Header: 'Weight Standard (kg)', filterable: false, sortable: false, className: "right",
        getFooterProps: () => ({
          style: {
            backgroundColor: '#c8ced3'
          }
        }),
        Footer:
          (<span style={{ fontWeight: 'bold' }}>{this.sumFooter("Wei_PackStd")}</span>)
      },
    ];

    return (
      <div>
        <div>
          <Row style={{ marginBottom: '3px' }}>
            <Col xs="6">

            </Col>
            <Col xs="6">
              <div className="float-right">
                <ExportFile column={cols} dataselect={this.state.select} filename={"CurrentInventory"} />
              </div>
            </Col>

          </Row>
        </div>
        <ReactTableFixedColumns
          innerRef={(ref) => { this.tableRef = ref; }}
          style={{ backgroundColor: 'white', border: '0.5px solid #eceff1', zIndex: 0, marginBottom: "20px" }}
          minRows={5}
          loading={this.state.loading}
          columns={cols}
          data={this.state.data}
          editable={false}
          className="-highlight"
          multiSort={false}
          filterable={true}
          defaultPageSize={this.state.defaultPageS}
          PaginationComponent={this.paginationButton}
          onSortedChange={(sorted) => {
            this.setState({ data: [], loading: true });
            this.customSorting(sorted)
          }}
        />
      </div>

    )
  }
}

export default CurrentReport;
