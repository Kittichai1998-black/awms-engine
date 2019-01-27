import React, { Component } from 'react';
import "react-table/react-table.css";
import ReactTable from 'react-table'
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../../ComponentCore/Permission';
import { apicall, createQueryString } from '../../ComponentCore'
import { Button, Row, Col, Input, Card, CardBody } from 'reactstrap';
import ExportFile from '../../MasterData/ExportFile';

const Axios = new apicall()

class Pack extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: [],
            dataedit:[],
            select: {
                queryString: window.apipath + "/api/viw",
                t: "PackMaster",
                q: '[{ "f": "Status", "c":"<", "v": 2}]',
                f: "ID,SKUMaster_ID,SKU_Code,PackMasterType_ID,PackCode,PackName,UnitType_ID,UnitTypeCode,UnitTypeName,ObjectSize_ID,ObjectSizeCode,ObjectSize_Code,Code,Name,Description,WeightKG,WidthM,LengthM,HeightM,ItemQty,Revision,Status,Created,Modified,LastUpdate",
                g: "",
                s: "[{'f':'Code','od':'asc'}]",
                sk: 0,
                l: 100,
                all: "",
            },
            datafilter:[],UnitType:[],ObjSize:[],currentPage:1,
        };
        this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
        this.displayButtonByPermission = this.displayButtonByPermission.bind(this)
        this.paginationButton = this.paginationButton.bind(this)
        this.filterList = this.filterList.bind(this);
        this.onClickUpdateData = this.onClickUpdateData.bind(this)
        this.UnitTypeSelect = {
            queryString: window.apipath + "/api/mst",
            t: "UnitType",
            q: "[{ 'f': 'Status', c:'<', 'v': 2}",
            f: "ID,Code",
            g: "",
            s: "[{'f':'ID','od':'asc'}]",
            sk: 0,
            all: "",
        };
        this.ObjSizeSelect = {
            queryString: window.apipath + "/api/mst",
            t: "ObjectSize",
          q: "[{ 'f': 'Status', c:'<', 'v': 2},{ 'f': 'ObjectType', c:'like', 'v': 2}",
          f: "ID,Code",
            g: "",
            s: "[{'f':'ID','od':'asc'}]",
            sk: 0,
            all: "",
        };
        this.statuslist = [{
            'status': [{ 'value': '*', 'label': 'All' }, { 'value': '1', 'label': 'Active' }, { 'value': '0', 'label': 'Inactive' }],
            'header': 'Status',
            'field': 'Status',
            'mode': 'check',
        }];
    }

    onHandleClickCancel(event) {
        this.forceUpdate();
        event.preventDefault();
    }

    async componentWillMount() {
        //permission
        let dataGetPer = await GetPermission()
        CheckWebPermission("Pack", dataGetPer, this.props.history);
        this.displayButtonByPermission(dataGetPer)
        document.title = "SKU Unit - AWMS"
        this.filterList();
        this.getData();
    }

    
    getData(){
        Axios.get(createQueryString(this.state.select)).then(res => {
        this.setState({ data: res.data.datas, loading:false})
        })
    }

    //permission
    displayButtonByPermission(dataGetPer) {
        let checkview = true
        if (CheckViewCreatePermission("SKU_view", dataGetPer)) {
            checkview = true //แสดงข้อมูลเฉยๆ
        }
        if (CheckViewCreatePermission("SKU_create&modify", dataGetPer)) {
            checkview = false //แก้ไข
        }
        if (checkview === true) {
            this.setState({ permissionView: false })
        } else if (checkview === false) {
            this.setState({ permissionView: true })
        }
    }

    filterList() {
        Axios.get(createQueryString(this.UnitTypeSelect)).then(res =>{
            this.setState({UnitType:res.data.datas});
        });
        Axios.get(createQueryString(this.ObjSizeSelect)).then(res =>{
            this.setState({ObjSize:res.data.datas});
        });
    }

    createCustomFilter(columns) {
        return <Input type="text" id={columns.column.id} style={{ background: "#FAFAFA" }} placeholder="filter..."
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              let filter =  this.state.datafilter
              filter.forEach((x, index) => {
                if(x.id === columns.column.id)
                  filter.splice(index, 1);
              });
              filter.push({id:columns.column.id, value: e.target.value});
              this.setState({datafilter:filter}, () => {this.onCheckFliter()});
            }
          }
        } />
    }
    
    onCheckFliter() {
        this.setState({ loading: true })
        let getFilter = this.state.datafilter;
        let listFilter = getFilter.map(x=> {
            if(x.id === "Status"){
                return { "f": x.id, "c": "!=", "v": "*" + x.value + "*" }
            }
            else{
                return { "f": x.id, "c": "like", "v": "*" + x.value + "*" }
            }
        })
        let strCondition = JSON.stringify(listFilter);
        let getSelect = this.state.select;
        getSelect.q = strCondition;
        this.setState({select:getSelect}, () => {this.getData()})
    }

    onCreateInputEditCell(rowdata){
        return <Input type="text" value={rowdata.value} onChange={(e) => {this.onHandleEditData(e.target.value, rowdata, rowdata.column.id)}}/>
    }

    onHandleEditData(editdata, rowdata, field){
        let data = this.state.data;
        let dataedit = this.state.dataedit;
        data.forEach(d => {
            if(rowdata.original.ID === d.ID){
                d[field] = editdata;
            }
        })

        dataedit.forEach((x,idx) => {
            if(x.ID === rowdata.original.ID){
                dataedit.splice(idx,1);
            }
        });

        dataedit.push(rowdata.original)
        this.setState({data, dataedit})
    }

    onCreateDropdownFilter(columns, data,field){
        let list = data.map((x, idx) => {
          return <option key={idx} value={x.ID}>{x.Code}</option>
        });
        return <select style={{ background: "#FAFAFA" }} onChange={(e) => {
                let filter =  this.state.datafilter
                filter.forEach((x, index) => {
                  if (x.id === field)
                    filter.splice(index, 1);
                });
                if (e.target.value !== "") {
                  filter.push({ id: field, value: e.target.value});
                  }
                this.setState({datafilter:filter}, () => {this.onCheckFliter()});
          }}>{list}</select>
    }

    onCreateDropdownEdit(rowdata, data, field){
        let list = data.map((x, idx) => {
            return <option key={idx} value={x.ID}>{x.Code}</option>
        });
        return <Input value={rowdata.original[field]} type="select" style={{ background: "#FAFAFA" }} onChange={(e) => {
                this.onHandleEditData(e.target.value, rowdata, field)
          }}>{list}</Input>
    }

    onCreateDropdownEditAll(data){
        let list = data.map((x, idx) => {
            return <option key={idx} value={x.ID}>{x.Code}</option>
        });
        return <select type="select" style={{ background: "#FAFAFA", width:"100px", margin:" 0 10px" }} onChange={(e) => {
                this.setState({setWeightAllID:e.target.value})
          }}>{list}</select>
    }

    onClickEditAllWeight(){

      if (this.state.setWeightAllID !== undefined) {
            let data = this.state.data;
            data.forEach(d => {
                d.ObjectSize_ID = this.state.setWeightAllID;
            });
            this.setState({data, dataedit:data})
        }
    }

    onClickUpdateData(){
        let dataedit = this.state.dataedit.map(x => {
            return {
                "ID":x.ID,
                "WeightKG":x.WeightKG,
                "UnitType_ID":x.UnitType_ID,
            }
        });
        
        let updjson = {
            "t": "ams_PackMaster",
            "pk": "ID",
            "datas": dataedit,
            "nr": false
          }
          Axios.put(window.apipath + "/api/mst", updjson).then((res) => {
            console.log(res.data)
          });
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
                <p style={{ margin: 'auto', minWidth: "60px", paddingRight: "10px", paddingLeft: "10px", verticalAlign: "middle" }}>Page : {this.state.currentPage}  {this.state.countpages}</p>
                <li className="page-item"><a className="page-link" style={this.state.currentPage === this.state.countpages ? notPageactive : pageactive}
                  onClick={() => this.pageOnHandleClick("next")}>
                  Next</a></li>
              </ul>
            </nav>
          </div>
        )
      }
    
    pageOnHandleClick(position){
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
        this.setState({select}, ()=>{this.getData()})
    }

    render() {
        const cols = [
            { Header: 'No.', fixed: "left", Type: 'numrows', filterable: false, className: 'center', minWidth: 45, maxWidth: 45 },
            { accessor: 'Code', Header: 'SKU Code', editable: false, Filter:  (e) => this.createCustomFilter(e), fixed: "left", },
            { accessor: 'Name', Header: 'SKU Name', updateable: false, Filter: (e) => this.createCustomFilter(e), Type: "autocomplete", fixed: "left", minWidth: 230 },
            { accessor: 'WeightKG', Header: 'Gross Weight (Kg.)', editable: false },
            { accessor: 'UnitTypeCode', Header: 'Unit Converter', updateable: false },
            //{ accessor: 'WeightKG', Header: 'Gross Weight (Kg.)', editable: false, Filter:  (e) => this.createCustomFilter(e), datatype: "int", className: "right", minWidth: 80, Cell:(e) => this.onCreateInputEditCell(e), },
            //{ accessor: 'UnitTypeCode', Header: 'Unit Converter', updateable: false, Filter:  (e) => this.createCustomFilter(e), Type: "autocomplete", minWidth: 80, className: "left", Cell:(e) => this.onCreateDropdownEdit(e, this.state.UnitType, "UnitType_ID") },
            { accessor: 'ObjCode', Header: 'Weight Validate', updateable: false, Filter:  (e) => this.createCustomFilter(e), Type: "autocomplete", minWidth: 80, className: "left" },
            { accessor: 'ItemQty', Header: 'Base Qty/Unit', editable: false, Filter:  (e) => this.createCustomFilter(e), datatype: "int", className: "right", minWidth: 70 },
          { accessor: 'ObjectSizeCode', Header: '% Weight Verify', updateable: true, Filter: (e) => this.onCreateDropdownFilter(e, this.state.ObjSize, "ObjectSize_ID"), Cell:(e) => this.onCreateDropdownEdit(e, this.state.ObjSize, "ObjectSize_ID") },
            { accessor: 'LastUpdate', Header: 'Last Update', filterable: false, minWidth: 180, maxWidth: 180 },
            { show: false, Header: '', Aggregated: "button", Type: "button", filterable: false, sortable: false, btntype: "Remove", btntext: "Remove" },
        ];

        return (
          <div>
            <Row>

              <Col xs="6">
              
              </Col>
          
              <Col xs="6">
                <div className="float-right" style={{ marginBottom:'3px' }} >
                  <ExportFile style={{ width: "130px" }} column={cols} dataselect={this.state.data} filename={"SKUUnit"} />
                </div>
                <div className="float-right">


                  <span style={{ fontWeight: 'bold' }} >Edit Weight Verify : </span>


                  {this.onCreateDropdownEditAll(this.state.ObjSize)}               
                  <Button style={{ width: "130px", marginRight: "5px" }} color="primary" onClick={() => { this.onClickEditAllWeight() }}>Accept</Button>
                </div>
                  </Col>
              
            </Row>
 

            <ReactTable style={{ backgroundColor: 'white', border: '0.5px solid #eceff1', zIndex: 0 }}  data ={this.state.data} columns={cols} filterable={true}
                    getTrProps={(state, rowInfo) => {
                        let result = false
                        let rmv = false
                        this.state.dataedit.forEach(row => {
                        if (rowInfo && rowInfo.row) {
                            if (row.ID === rowInfo.original.ID) {
                            result = true
                            if (row.Status === 2) {
                                rmv = true
                            }
                            }
                        }
                        })
                        if (result && !rmv)
                        return { className: "editrow" }
                        else if (rmv)
                        return {
                            className: "rmv"
                        }
                        else
                        return {}
                    }}
                    PaginationComponent={this.paginationButton}
                />
                <Card>
                    <CardBody>
                        <Button onClick={() => this.onClickUpdateData()} color="primary" style={{ width: '130px', marginLeft: '5px' }} className="float-right">Accept</Button>
                        
                    </CardBody>
                </Card>
            </div>
        )
    }
}

export default Pack;
