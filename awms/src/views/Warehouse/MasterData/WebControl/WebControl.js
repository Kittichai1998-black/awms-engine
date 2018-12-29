import React, { Component } from 'react';
import "react-table/react-table.css";
import { TableGen } from '../TableSetup';
import Axios from 'axios';
import { createQueryString } from '../../ComponentCore'
import { GetPermission, CheckWebPermission, CheckViewCreatePermission } from '../../../ComponentCore/Permission';

class WebControl extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      autocomplete: [],
      statuslist: [{
        'status': [{ 'value': '*', 'label': 'All' }, { 'value': '1', 'label': 'Active' }, { 'value': '0', 'label': 'Inactive' }],
        'header': 'Status',
        'field': 'Status',
        'mode': 'check',
      }],
      acceptstatus: false,
      select: {
        queryString: window.apipath + "/api/viw",
        t: "WebControl",
        q: "[{ 'f': 'Status', c:'<', 'v': 2}]",
        f: "ID,Code,Name,Description,ElementSelector,WebPage_ID,WebPage_Code,Permission_ID,Permission_Code,Status,Created,Modified",
        g: "",
        s: "[{'f':'Code','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
      },
      sortstatus: 0,

    };
    this.onHandleClickCancel = this.onHandleClickCancel.bind(this);
    this.displayButtonByPermission = this.displayButtonByPermission.bind(this)
    this.filterList = this.filterList.bind(this)
    this.uneditcolumn = ["WebPage_Code", "Permission_Code", "Created", "Modified"]
  }

  onHandleClickCancel(event) {
    this.forceUpdate();
    event.preventDefault();
  }
  componentDidMount() {
    document.title = "Web Control : AWMS";
  }
  async componentWillMount() {
    let dataGetPer = await GetPermission()
    CheckWebPermission("WebControl", dataGetPer, this.props.history);
    this.displayButtonByPermission(dataGetPer)
    this.filterList();
  }
  displayButtonByPermission(dataGetPer) {
    let checkview = true
    if (CheckViewCreatePermission("Administrator", dataGetPer)) {
      checkview = false //แก้ไข
    }

    if (checkview === true) {
      this.setState({ permissionView: false })
    } else if (checkview === false) {
      this.setState({ permissionView: true })
    }
  }
  componentWillUnmount() {
    Axios.isCancel(true);
  }

  filterList() {
    const WebPageselect = {
      queryString: window.apipath + "/api/mst",
      t: "WebPage",
      q: "[{ 'f': 'Status', c:'<', 'v': 2}",
      f: "ID,concat(Code,' : ',Name) as Code",
      g: "",
      s: "[{'f':'ID','od':'asc'}]",
      sk: 0,
      all: "",
    }

    const Permissionselect = {
      queryString: window.apipath + "/api/mst",
      t: "Permission",
      q: "[{ 'f': 'Status', c:'<', 'v': 2}",
      f: "ID,concat(Code,' : ',Name) as Code",
      g: "",
      s: "[{'f':'ID','od':'asc'}]",
      sk: 0,
      all: "",
    }

    Axios.all([Axios.get(createQueryString(WebPageselect) + "&_token=" + localStorage.getItem("Token")),
    Axios.get(createQueryString(Permissionselect) + "&_token=" + localStorage.getItem("Token"))]).then(
      (Axios.spread((WebPageresult, Permissionresult) => {
        let ddl = [...this.state.autocomplete]
        let WebPageList = {}
        let PermissionList = {}
        WebPageList["data"] = WebPageresult.data.datas
        WebPageList["field"] = "WebPage_Code"
        WebPageList["pair"] = "WebPage_ID"
        WebPageList["mode"] = "Dropdown"

        PermissionList["data"] = Permissionresult.data.datas
        PermissionList["field"] = "Permission_Code"
        PermissionList["pair"] = "Permission_ID"
        PermissionList["mode"] = "Dropdown"

        ddl = ddl.concat(WebPageList).concat(PermissionList)
        this.setState({ autocomplete: ddl })
      })))
  }

  render() {
    const view = this.state.permissionView
    const cols = [
      { accessor: 'Code', Header: 'Code', editable: view, Filter: "text", fixed: "left" },
      { accessor: 'Name', Header: 'Name', editable: view, Filter: "text", fixed: "left" },
      //{accessor: 'Description', Header: 'Description', sortable:false,Filter:"text",editable:true,},
      { accessor: 'ElementSelector', Header: 'Element Selector', sortable: false, Filter: "text", editable: view },
      { accessor: 'WebPage_Code', Header: 'Web Page', updateable: view, Filter: "text", Type: "autocomplete" },
      { accessor: 'Permission_Code', Header: 'Permission', updateable: view, Filter: "text", Type: "autocomplete" },
      //{accessor: 'Status', Header: 'Status', editable:true, Type:"checkbox" ,Filter:"dropdown",Filter:"dropdown"},
      { accessor: 'Created', Header: 'Create', editable: false, filterable: false },
      /* {accessor: 'CreateTime', Header: 'CreateTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false}, */
      { accessor: 'Modified', Header: 'Modify', editable: false, filterable: false },
      //{accessor: 'ModifyTime', Header: 'ModifyTime', editable:false, Type:"datetime", dateformat:"datetime",filterable:false},
      { Show: view, Header: '', Aggregated: "button", Type: "button", filterable: false, sortable: false, btntype: "Remove", btntext: "Remove" },
    ];

    const btnfunc = [{
      btntype: "Barcode",
      func: this.createBarcodeBtn
    }]

    return (
      <div>
        {/*
        column = คอลัมที่ต้องการแสดง
        data = json ข้อมูลสำหรับ select ผ่าน url
        ddlfilter = json dropdown สำหรับทำ dropdown filter
      */}
        <TableGen column={cols} data={this.state.select} dropdownfilter={this.state.statuslist} expFilename={"WebControl"}
          filterable={true} autocomplete={this.state.autocomplete} accept={view} exportfilebtn={view} addExportbtn={view}
          btn={btnfunc} uneditcolumn={this.uneditcolumn}
          table="ams_WebControl" />
      </div>
    )
  }
}

export default WebControl;
