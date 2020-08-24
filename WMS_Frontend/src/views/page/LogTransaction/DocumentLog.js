import React, { useState, useEffect } from "react";
import { apicall, createQueryString, Clone } from '../../../components/function/CoreFunction';
import { withStyles } from '@material-ui/core/styles';
import AmDropdown from "../../../components/AmDropdown";
import { useTranslation } from "react-i18next";
import AmDatePicker from "../../../components/AmDate";
import moment from "moment";
import queryString from "query-string";
import ReactJson from 'react-json-view'
import AmRediRectInfo from '../../../components/AmRedirectInfo'
import Divider from '@material-ui/core/Divider';
import Typography from "@material-ui/core/Typography";
import ViewList from '@material-ui/icons/ViewList';
import PageView from '@material-ui/icons/Pageview';
import SvgIcon from '@material-ui/core/SvgIcon';
import AmInput from "../../../components/AmInput";
import AmLog from "../../pageComponent/AmLog";
import AmEntityStatus from "../../../components/AmEntityStatus";
import AmDocumentStatus from "../../../components/AmDocumentStatus";
import { DocumentEventStatus } from "../../../components/Models/DocumentEventStatus";
import { EntityEventStatusAll } from "../../../components/Models/EntityStatus";

const Axios = new apicall();
const styles = theme => ({
  textNowrap: { overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', whiteSpace: 'nowrap' },
});
function JsonIcon(props) {
  return (
    <SvgIcon {...props} >
      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
    </SvgIcon>
  );
}
const handleCopy = (copy) => {
  navigator.clipboard.writeText(JSON.stringify(copy.src, null, '\t'))
}
const queryDocType = {
  queryString: window.apipath + "/v2/SelectDataMstAPI",
  t: "DocumentType",
  q: '[{ "f": "Status", "c":"=", "v": 1}]',
  f: "*",
  g: "",
  s: "[{'f':'ID','od':'asc'}]",
  sk: 0,
  l: 100,
  all: ""
}; 
const queryDocProcessType = {
  queryString: window.apipath + "/v2/SelectDataMstAPI",
  t: "DocumentProcessType",
  q: '[{ "f": "Status", "c":"=", "v": 1}]',
  f: "*",
  g: "",
  s: "[{'f':'ID','od':'asc'}]",
  sk: 0,
  l: 100,
  all: ""
}; 
const DocumentLog = (props) => {
  const { t } = useTranslation();
  const { classes } = props;


  const columns = [
    {
      Header: "Log Time",
      accessor: "LogTime",
      width: 150,
      sortable: true,
      type: "datetime",
      dateFormat: "DD/MM/YYYY HH:mm:ss",
      filterType: "datetime",
      filterConfig: {
        filterType: "datetime",
      },
      customFilter: { field: "LogTime" },
    },
    {
      Header: "Log Row",
      accessor: "LogRow",
      width: 70,
      sortable: true,
    },
    {
      Header: "LogRefID",
      accessor: "LogRefID",
      width: 150,
      Cell: (data) => {
        return (
          <div style={{ display: "flex", maxWidth: '250px' }}>
            <AmRediRectInfo type="link" textLink={data.original.LogRefID} api={'/log/apiservicelog?LogRefID=' + data.original.LogRefID} />
          </div>
        )
      }
    },
    {
      Header: "Document",
      accessor: "Code",
      width: 150,
    },
    {
      Header: "Parent Doc.",
      accessor: "ParentDocument",
      width: 150,
      Cell: (data) => {
        return (
          <div style={{ display: "flex", maxWidth: '250px' }}>
            <AmRediRectInfo type="link" textLink={data.original.ParentDocument} api={'/log/documentlog?id=' + data.original.ParentDocument_ID} />
          </div>
        )
      }
    },
    {
      Header: "Doc.Type",
      accessor: "DocumentType_Code",
      width: 150,
      filterType: "dropdown",
      filterConfig: {
        filterType: "dropdown",
        dataDropDown: queryDocType,
        typeDropDown: "search",
        fieldDataKey: "ID",
        fieldLabel: ["Code", "Name"]
      },
      customFilter: { field: "DocumentType_ID" },
    },
    {
      Header: "Sou_Customer",
      accessor: "Sou_Customer_Code",
    },
    {
      Header: "Sou_Supplier",
      accessor: "Sou_Supplier_Code",
    },
    {
      Header: "Sou_Branch",
      accessor: "Sou_Branch_Code",
    },
    {
      Header: "Sou_Warehouse",
      accessor: "Sou_Warehouse_Code",
    },
    {
      Header: "Sou_Area",
      accessor: "Sou_AreaMaster_Code",
    },
    {
      Header: "Des_Customer",
      accessor: "Des_Customer_Code",
    },
    {
      Header: "Des_Supplier",
      accessor: "Des_Supplier_Code",
    },
    {
      Header: "Des_Branch",
      accessor: "Des_Branch_Code",
    },
    {
      Header: "Des_Warehouse",
      accessor: "Des_Warehouse_Code",
    },
    {
      Header: "Des_Area",
      accessor: "Des_AreaMaster_Code",
    },
    {
      Header: "For_Customer",
      accessor: "For_Customer_Code",
    },
    {
      Header: "Transport",
      accessor: "Transport_Code",
    },
    {
      Header: "Document Process Type",
      accessor: "DocumentProcessType_Name",
      width: 150,
      filterType: "dropdown",
      filterConfig: {
        filterType: "dropdown",
        dataDropDown: queryDocProcessType,
        typeDropDown: "search",
        fieldDataKey: "ID",
        fieldLabel: ["Code", "Name"]
      },
      customFilter: { field: "DocumentProcessType_ID" },
    },
    {
      Header: "Wave ID",
      accessor: "Wave_ID",
    },
    {
      Header: "Batch",
      accessor: "Batch",
    },
    {
      Header: "Lot",
      accessor: "Lot",
    },
    {
      Header: "Options",
      accessor: "Options",
      Cell: (dataRow) => getMessage(dataRow.original, "Options"),
      width: 150,
    },
    {
      Header: "Remark",
      accessor: "Remark"
    },
    {
      Header: "DocumentDate",
      accessor: "DocumentDate",
      width: 150,
      type: "datetime",
      dateFormat: "DD/MM/YYYY",
      filterType: "datetime",
      filterConfig: {
        filterType: "date",
      },
      customFilter: { field: "DocumentDate" },
    },
    {
      Header: "Action Time",
      accessor: "ActionTime",
      width: 150,
      type: "datetime",
      dateFormat: "DD/MM/YYYY HH:mm",
      filterType: "datetime",
      filterConfig: {
        filterType: "datetime",
      },
      customFilter: { field: "ActionTime" },
    },
    {
      Header: "RefID",
      accessor: "RefID",
    },
    {
      Header: "Ref1",
      accessor: "Ref1",
    },
    {
      Header: "Ref2",
      accessor: "Ref2",
    },
    {
      Header: "Ref3",
      accessor: "Ref3",
    },
    {
      Header: "Ref4",
      accessor: "Ref4",
    },
    {
      Header: "EventStatus",
      accessor: "EventStatus",
      filterConfig: {
        filterType: "dropdown",
        dataDropDown: DocumentEventStatus,
        typeDropDown: "normal",
        widthDD: 105,
      },
      Cell: (dataRow) => getStatus(dataRow.original.EventStatus, "EventStatus")
    },
    {
      Header: "Status",
      accessor: "Status",
      filterType: "dropdown",
      filterConfig: {
        filterType: "dropdown",
        dataDropDown: EntityEventStatusAll,
        typeDropDown: "normal",
        widthDD: 105,
      },
      Cell: (dataRow) => getStatus(dataRow.original.Status, "Status")
    },
    {
      Header: "Create By",
      accessor: "CreateBy_Name",
    },
    {
      Header: "Create Time",
      accessor: "CreateTime",
      width: 150,
      type: "datetime",
      dateFormat: "DD/MM/YYYY HH:mm",
      filterType: "datetime",
      filterConfig: {
        filterType: "datetime",
      },
      customFilter: { field: "CreateTime" },
    },
    {
      Header: "Modify By",
      accessor: "ModifyBy_Name",
    },
    {
      Header: "Modify Time",
      accessor: "ModifyTime",
      width: 150,
      type: "datetime",
      dateFormat: "DD/MM/YYYY HH:mm",
      filterType: "datetime",
      filterConfig: {
        filterType: "datetime",
      },
      customFilter: { field: "ModifyTime" },
    },
  ]
  const getStatus = (value, type) => {
    if (value != null || value != undefined) {
      if (type === "Status") {
        return <AmEntityStatus statusCode={value} />;
      } else if (type === "EventStatus") {
        return <AmDocumentStatus statusCode={value} />;
      }
    } else {
      return null;
    }
  };

  const getMessage = (data, field) => {
    if (data[field]) {
      if (data[field].length > 50) {
        let listOpt = data[field].split("&").map((x, idx) => {
          return <div style={{ marginBottom: '3px' }} key={idx}>{x}</div>
        })

        return (
          <div style={{ display: "flex", maxWidth: '250px' }}><label className={classes.textNowrap}>{data[field]}</label>
            <AmRediRectInfo type={"customdialog"} customIcon={<PageView style={{ color: "#1a237e" }} />} bodyDialog={listOpt} titleDialog={field} />
          </div>
        )
      } else {

        return <label>{data[field]}</label>
      }
    } else {
      return null;
    }
  }
  return <>
    <AmLog
      tableQuery={"DocumentEvent"}
      columns={columns}
      height={500}
      // sortable={true}
      historySearch={props.history.location.search}
      pageSize={25}
    />
  </>
}

export default withStyles(styles)(DocumentLog);