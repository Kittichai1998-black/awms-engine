import React, { Component } from 'react';
import "react-table/react-table.css";
import { Button, Row, Col, Input } from 'reactstrap';
import ReactTable from 'react-table';
import { apicall, AutoSelect, DatePicker, createQueryString } from '../ComponentCore';
import queryString from 'query-string'
import moment from 'moment';
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../ComponentCore/Permission';
import ExportFile from '../MasterData/ExportFile';
import _ from 'lodash';
import withFixedColumns from "react-table-hoc-fixed-columns";

const Axios = new apicall()
const ReactTableFixedColumns = withFixedColumns(ReactTable);


class CheckInventory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data1: [],
      data: [],
      PackMaster: {
        queryString: window.apipath + "/api/mst",
        t: "SKUMaster",
        q: '[{ "f": "Status", "c":"=", "v": 1}]',
        f: "ID,concat(Code,' : ',Name) as PackName , Code",
        g: "",
        s: "[{'f':'Code','od':'asc'}]",
        sk: 0,
        l: 0,
        all: "",
      },
      Document: {
        queryString: window.apipath + "/api/trx",
        t: "Document",
        q: '[{ "f": "DocumentType_ID", "c":"=", "v": 2004}]',
        f: "*",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 0,
        all: "",
      },
      DocAudit:[],
      PackMasterdata: [],
      batch: "",
      defaultPageS: 100,
      currentPage: 1,
      loading: false,
    }
    this.paginationButton = this.paginationButton.bind(this)
    this.pageOnHandleClick = this.pageOnHandleClick.bind(this)
  }

  async componentWillMount() {
    //permission
    let dataGetPer = await GetPermission()
    CheckWebPermission("STK_CARD", dataGetPer, this.props.history);
    //41	WarehouseCI_execute
    document.title = "Audit Report : AWMS";
    const values = queryString.parse(this.props.location.search)
    Axios.get(window.apipath + "/api/report/sp?apikey=FREE03&docID=" + values.docID
          + "&spname=CHECK_INVENTORY").then(res => {
            this.setState({data:res.data.datas, loading: false})
          });
  }

  datetimeBody(value) {
    if (value !== null) {
      const date = moment(value);
      return <div>{date.format('DD-MM-YYYY')}</div>
    }
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
  
  render() {
    const cols = [
      { Header: 'No.', fixed: "left", sortable: false, filterable: false, className: 'center', minWidth: 45, maxWidth: 45,},
      { accessor: 'docItemCode', Header: 'Audit Item Code', editable: false, sortable: false },
      { accessor: 'docItembatch', Header: 'Audit Item Batch', editable: false, sortable: false },
      { accessor: 'stoCode', Header: 'Stock Item Code', editable: false, sortable: false },
      { accessor: 'stobatch', Header: 'Stock Item Batch', editable: false, sortable: false },
    ];
    return (
      <div>
        <div>
          <Row style={{ marginTop: '3px', marginBottom: '3px' }}>
          <Col xs="6"></Col>
            <Col xs="6">
              <div className="float-right">
                <ExportFile column={cols} dataxls={this.state.data} filename={"AuditCheck"} />
              </div>
            </Col>
          </Row>
        </div>
        <ReactTable
          style={{ backgroundColor: 'white', border: '0.5px solid #eceff1', zIndex: 0, marginBottom: "20px" }}
          minRows={5}
          loading={this.state.loading}
          columns={cols}
          data={this.state.data}
          multiSort={false}
          filterable={false}
          className="-highlight"
          defaultPageSize={this.state.defaultPageS}
          PaginationComponent={this.paginationButton}
          getTrProps={(state, rowInfo) => {
            if (rowInfo !== undefined) {
              if(rowInfo.original.docItemCode === null || rowInfo.original.docItemCode === undefined ){
                return { className: "editrow" }
              }
              else{
                return {}
              }
            }
            else{
              return {}
            }
          }
        }
        />
      </div>
    )
  }
}
export default CheckInventory;
