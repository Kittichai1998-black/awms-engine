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
import { EntityEventStatusAll } from "../../../components/Models/EntityStatus";
import { AuditStatus } from "../../../components/Models/StorageObjectEvenstatus";
import { DocumentEventStatus } from "../../../components/Models/DocumentEventStatus";
import AmAuditStatus from "../../../components/AmAuditStatus";

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

const DocumentItemLog = (props) => {
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
      Header: "RefDoc.Item ID",
      accessor: "RefDocumentItem_ID",
      width: 150,
      Cell: (data) => {
        return (
          <div style={{ display: "flex", maxWidth: '250px' }}>
            <AmRediRectInfo type="link" textLink={data.original.RefDocumentItem_ID} api={'/log/documentlog?id=' + data.original.Document_ID} />
          </div>
        )
      }
    },
    {
      Header: "Document",
      accessor: "Document_Code",
      width: 150,
      Cell: (data) => {
        return (
          <div style={{ display: "flex", maxWidth: '250px' }}>
            <AmRediRectInfo type="link" textLink={data.original.Document_Code} api={'/log/documentlog?id=' + data.original.Document_ID} />
          </div>
        )
      }
    },
    {
      Header: "SKU Code",
      accessor: "SKUMaster_Code",
      width: 150,
    },
    {
      Header: "Pack Code",
      accessor: "PackMaster_Code",
      width: 150,
    },
    {
      Header: "DocItemCode",
      accessor: "Code",
      width: 150,
    },
    {
      Header: "Qty",
      accessor: "Quantity",
    },
    {
      Header: "Unit",
      accessor: "UnitType_Code",
    },
    {
      Header: "Base Qty",
      accessor: "BaseQuantity",
    },
    {
      Header: "Base Unit",
      accessor: "BaseUnitType_Code",
    },
    {
      Header: "Item No.",
      accessor: "ItemNo",
    },
    {
      Header: "Order No.",
      accessor: "OrderNo",
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
      Header: "CartonNo",
      accessor: "CartonNo",
    },
    {
      Header: "Options",
      accessor: "Options",
      Cell: (dataRow) => getMessage(dataRow.original, "Options"),
      width: 150,
    },
    {
      Header: "Production Date",
      accessor: "ProductionDate",
      width: 150,
      type: "datetime",
      dateFormat: "DD/MM/YYYY",
      filterType: "datetime",
      filterConfig: {
        filterType: "date",
      },
      customFilter: { field: "ProductionDate" },
    },
    {
      Header: "Expire Date",
      accessor: "ExpireDate",
      width: 150,
      type: "datetime",
      dateFormat: "DD/MM/YYYY HH:mm",
      filterType: "datetime",
      filterConfig: {
        filterType: "date",
      },
      customFilter: { field: "ExpireDate" },
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
      Header: "Audit Status",
      accessor: "AuditStatus",
      filterConfig: {
        filterType: "dropdown",
        dataDropDown: AuditStatus,
        typeDropDown: "normal",
        widthDD: 105,
      },
      Cell: (dataRow) => getStatus(dataRow.original.AuditStatus, "AuditStatus")
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
      Header: "Incubation Day",
      accessor: "IncubationDay",
    },
    {
      Header: "Shelf Life Day",
      accessor: "ShelfLifeDay",
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
      } else if (type === "AuditStatus") {
        return <AmAuditStatus statusCode={value}/>
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
      tableQuery={"DocumentItemEvent"}
      columns={columns}
      height={500}
      // sortable={true}
      historySearch={props.history.location.search}
      pageSize={25}
    />
  </>
}

export default withStyles(styles)(DocumentItemLog);