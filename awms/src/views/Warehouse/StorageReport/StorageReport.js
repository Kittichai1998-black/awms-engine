import React, { Component } from 'react';
import "react-table/react-table.css";
import ReactTable from 'react-table'
import moment from 'moment';
import { apicall, createQueryString } from '../ComponentCore';
import ExportFile from '../MasterData/ExportFile';
import { Input, Row, Col } from 'reactstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import _ from "lodash";

const Axios = new apicall()



class StoragReport extends Component {

  constructor() {
    super();
    this.state = {
      data: [],
      loading: true,
      defaultPageS: 100,
      currentPage: 1,
      select: {
        queryString: window.apipath + "/api/viw",
        t: "r_StorageObject",
        q: '',
        f: "ID,Pallet,Warehouse,Area,Location,SKU_Code,SKU_Name,Batch,Lot,OrderNo,Qty,Base_Unit,Status,Receive_Time,Wei_PalletPack,Wei_Pack,concat(Wei_PalletPack, ' ','kg') AS WeiPallet,concat(Wei_Pack, ' ','kg') AS WeiPack, Receive_Date",
        g: "",
        s: "[{'f':'Pallet','od':'asc'}]",
        sk: 0,
        l: 0,
        all: "",
      },
      datafilter: [],
    }
    this.paginationButton = this.paginationButton.bind(this)
    this.pageOnHandleClick = this.pageOnHandleClick.bind(this)
  }

  componentDidMount() {
    document.title = "Storage Object - AWMS";
    this.getData();
  }

  getData() {
    Axios.get(createQueryString(this.state.select)).then(res => {
      let countpages = null;
      let counts = res.data.counts;
      countpages = Math.ceil(counts / this.state.defaultPageS);
      this.setState({ data: res.data.datas, countpages: countpages, loading: false })
    })
  }

  DatePickerFilter(datetime) {
    this.setState({ date: datetime })
    let filter = this.state.datafilter
    filter.forEach((x, index) => {
      if (x.id === "Receive_Date")
        filter.splice(index, 1);
    });
    if (datetime !== null) {
      filter.push({ id: "Receive_Date", value: moment(datetime).format('YYYY-MM-DD'), type: "date" });
    }
    this.setState({ datafilter: filter }, () => { this.onCheckFliter() });
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


  sumFooterQty(){
    return _.sumBy(this.state.data, 
      x => _.every(this.state.data, ["Base_Unit", x.Base_Unit]) == true ?
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
      { accessor: 'Pallet', Header: 'Pallet', Filter: (e) => this.createCustomFilter(e), sortable: true, },
      { accessor: 'Warehouse', Header: 'Warehouse', Filter: (e) => this.createCustomFilter(e), sortable: true, },
      { accessor: 'Area', Header: 'Area', Filter: (e) => this.createCustomFilter(e), sortable: true },
      { accessor: 'Location', Header: 'Location', Filter: (e) => this.createCustomFilter(e), sortable: true },
      { accessor: 'SKU_Code', Header: 'SKU Code', Filter: (e) => this.createCustomFilter(e), sortable: true, },
      { accessor: 'SKU_Name', Header: 'SKU Name', Filter: (e) => this.createCustomFilter(e), sortable: true, },
      { accessor: 'Batch', Header: 'Batch', Filter: (e) => this.createCustomFilter(e), sortable: true },
      { accessor: 'Lot', Header: 'Lot', Filter: (e) => this.createCustomFilter(e), sortable: true },
      { accessor: 'OrderNo', Header: 'Order No.', Filter: (e) => this.createCustomFilter(e), sortable: true },

      { accessor: 'Qty', Header: 'Qty', editable: false, Footer:
      (<span><label>Sum :</label>{" "} {this.sumFooterQty() === 0 ? "-":this.sumFooterQty()}</span>)},
      
      // {
      //   accessor: 'Qty', Header: 'Qty', filterable: false, sortable: false, Footer:
      //     (<span style={{ fontWeight: 'bold' }}><label>Sum :</label>{" "}{_.sumBy(this.state.data,
      //       x => _.every(this.state.data, ["Base_Unit", x.Base_Unit]) == true ?
      //         parseFloat(x.Qty) : null)}</span>)
      // },

      { accessor: 'Base_Unit', Header: 'Unit', Filter: (e) => this.createCustomFilter(e), sortable: false, },
      {
        accessor: 'WeiPallet', Header: 'Weight Pallet', filterable: false, sortable: false, Footer:
          (<span style={{ fontWeight: 'bold' }}><label>Sum :</label>{" "}{_.sumBy(this.state.data, x => parseFloat(x.WeiPallet))}</span>)
      },
      {
        accessor: 'WeiPack', Header: 'Weight Pack', filterable: false, sortable: false, Footer:
          (<span style={{ fontWeight: 'bold' }}><label>Sum :</label>{" "}{_.sumBy(this.state.data, x => parseFloat(x.WeiPack))}</span>)
      },
      { accessor: 'Status', Header: 'Status', Filter: (e) => this.createCustomFilter(e), sortable: true },
      {
        accessor: 'Receive_Time', Header: 'Received Date', filterable: false, sortable: true, Cell: (e) =>
          this.datetimeBody(e.value)
      },
    ];

    return (

      <div>
        <div className="clearfix" style={{ paddingBottom: '.5rem' }}>
          <Row>
            <Col xs="6">
              <span className="float-right" style={{ fontWeight: 'bold' }}>Recieved Date : </span>
            </Col>
            <Col xs="4">
              <DatePicker className="float-right" selected={this.state.date}
                customInput={<Input />}
                onChange={(e) => {
                  if (e === null) {
                    this.DatePickerFilter(null)
                  }
                  else {
                    if (e.isValid() && e !== null) {
                      this.DatePickerFilter(e)
                    }
                  }


                }}
                timeIntervals={1}
                timeFormat="HH:mm"
                timeCaption="Time"
                showTimeSelect={false}
                dateFormat={"DD-MM-YYYY"} />
            </Col>
            <Col xs="2">
              <ExportFile column={cols} dataxls={this.state.data} filename={"StorageReport"} />
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

export default StoragReport;
