import React, { useState, useEffect, useContext } from "react";
import AmStorageObjectMulti from "../../pageComponent/AmStorageObjectV2/AmStorageObjectMultiV2";
import {
  apicall,
  createQueryString
} from "../../../components/function/CoreFunction";
import AmRedirectLog from "../../../components/AmRedirectLog";
import { StorageObjectEvenstatusTxt } from "../../../components/Models/StorageObjectEvenstatus";
import { Hold, Lock } from "../../../components/Models/Hold";
import { AuditStatusGCL } from "../../../components/Models/AuditStatus";
import AmStorageObjectStatus from "../../../components/AmStorageObjectStatus";
import RemoveCircle from "@material-ui/icons/RemoveCircle";
import CheckCircle from "@material-ui/icons/CheckCircle";
import Tooltip from '@material-ui/core/Tooltip';
import queryString from "query-string";
import AmShowImage from '../../../components/AmShowImage'
import AmDialogUploadImage from '../../../components/AmDialogUploadImage'
import AuditStatusIcon from "../../../components/AmAuditStatus";


const Axios = new apicall();

//======================================================================
const StorageObject = props => {

  const iniCols = [

    {
      Header: "Status",
      accessor: "Status",
      width: 120,
      sortable: false,
      filterType: "dropdown",
      filterConfig: {
        filterType: "dropdown",
        dataDropDown: StorageObjectEvenstatusTxt,
        typeDropDown: "normal",
        widthDD: 105,
      },
      Cell: e => getStatus(e.original.Status)
    },
    { Header: "BO", accessor: "wms_doc", width: 100 },
    { Header: "Warehouse", accessor: "Warehouse", width: 100 },
    { Header: "Location", accessor: "Location", width: 100 },
    { Header: "Label", accessor: "ItemNo", width: 200, Cell:e=>(e.original.ItemNo??"").replace(/ /g,"\xa0") },
    { Header: "Customer", accessor: "Ref4", width: 100 },
    { Header: "Sku", accessor: "SKU_Code", width: 100 },
    { Header: "-", accessor: "SKU_Name", width: 200 },
    { Header: "Grade", accessor: "Ref1", width: 80 },
    { Header: "Lot", accessor: "Lot", width: 80 },
    { Header: "No", accessor: "Ref2", width: 80 },
    { Header: "UD Code", accessor: "Ref3", width: 80 },
    { Header: "Pallet", accessor: "Pallet", width: 100 },
    { Header: "Qty", accessor: "SaleQty", width: 70, type: "number" },
    { Header: "Unit", accessor: "Unit", width: 100 },
    {
      Header: "Received Time",
      accessor: "Receive_Time",
      width: 150,
      type: "datetime",
      filterType: "datetime",
      filterConfig: {
        filterType: "datetime",
      }
      , customFilter: { field: "Receive_Time" },
      dateFormat: "DD/MM/YYYY HH:mm"
    },
    {
      width: 60,
      accessor: "",
      Header: "Log ",
      filterable: false,
      Cell: e => getRedirectLog(e.original)
    }
  ];

  const getAuditStatus = Status => {
    //return null
    return <div style={{ marginBottom: "3px", textAlign: "center" }}>
      {getAuditStatusValue(Status)}
    </div>

  };
  const getAuditStatusValue = Status => {
    if (Status === "QI") {
      return <AuditStatusIcon key={4} statusCode={4} />;
    } else if (Status === "ACC") {
      return <AuditStatusIcon key={5} statusCode={5} />;
    } else if (Status === "ACD") {
      return <AuditStatusIcon key={6} statusCode={6} />;
    } else if (Status === "ACN") {
      return <AuditStatusIcon key={7} statusCode={7} />;
    } else if (Status === "ACM") {
      return <AuditStatusIcon key={8} statusCode={8} />;
    } else if (Status === "HOLD") {
      return <AuditStatusIcon key={9} statusCode={9} />;
    } else if (Status === "BLOCK") {
      return <AuditStatusIcon key={10} statusCode={10} />;
    } else if (Status === "UR") {
      return <AuditStatusIcon key={11} statusCode={11} />;
    } else {
      return null;
    }
  }

  const getOptions = value => {
    var qryStr = queryString.parse(value);
    return qryStr["remark"]
  }
  const getIsHold = value => {

    if (value === "UNLOCK") {
      return <div style={{ textAlign: "center" }}>
        <Tooltip title="UNLOCK" >
          <RemoveCircle
            fontSize="small"
            style={{ color: "#9E9E9E" }}
          />
        </Tooltip>
      </div>
    } else {
      return <div style={{ textAlign: "center" }}>
        <Tooltip title="LOCK" >
          <CheckCircle
            fontSize="small"
            style={{ color: "black" }}
          />
        </Tooltip>
      </div>
    }
  }

  const getRedirectLog = data => {
    return (
      <div
        style={{
          display: "flex",
          padding: "0px",
          paddingLeft: "10px"
        }}
      >
        {data.Code}
        <AmRedirectLog
          api={
            "/log/storageobjectlog?id=" +
            data.ID +
            "&ParentStorageObject_ID=" +
            data.ID
          }
          history={props.history}
          docID={""}
          title={"Log DocItemSto"}
        >
          {" "}
        </AmRedirectLog>
      </div>
    );
  };

  const columns = [
    {
      field: "Option",
      type: "input",
      name: "Remark",
      placeholder: "Remark",
      required: true
    }
  ];



  const getStatus = Status => {
    return Status.split("\\n").map(y => (
      <div style={{ marginBottom: "3px", textAlign: "center" }}>
        {getStatus1(y)}
      </div>
    ));
  };

  const getStatus1 = Status => {
    if (Status === "RECEIVING") {
      return <AmStorageObjectStatus key={Status} statusCode={11} />;
    } else if (Status === "RECEIVED") {
      return <AmStorageObjectStatus key={Status} statusCode={12} />;
    } else if (Status === "AUDITING") {
      return <AmStorageObjectStatus key={Status} statusCode={13} />;
    } else if (Status === "AUDITED") {
      return <AmStorageObjectStatus key={Status} statusCode={14} />;
    } else if (Status === "PICKING") {
      return <AmStorageObjectStatus key={Status} statusCode={33} />;
    } else if (Status === "PICKED") {
      return <AmStorageObjectStatus key={Status} statusCode={34} />;
    } else if (Status === "NEW") {
      return <AmStorageObjectStatus key={Status} statusCode={10} />;
    } else if (Status === "COUNTING") {
      return <AmStorageObjectStatus key={Status} statusCode={15} />;
    } else if (Status === "COUNTED") {
      return <AmStorageObjectStatus key={Status} statusCode={16} />;
    } else if (Status === "CONSOLIDATING") {
      return <AmStorageObjectStatus key={Status} statusCode={35} />;
    } else {
      return null;
    }
  };

  const getImgPallet = Pallet => {
    let link = window.apipath + "/v2/download/download_image?fileName=" + Pallet + "&token=" + localStorage.getItem("Token");
    return <div style={{ display: "flex", maxWidth: '250px' }}>
      <label>{Pallet}</label>
      <AmShowImage src={link} />
      <AmDialogUploadImage titleDialog={"Upload Image of Pallet : " + Pallet} fileName={Pallet} />
    </div>
  }
  return (
    <div>
      <AmStorageObjectMulti
        iniCols={iniCols}
        selection={true}
        dataRemark={columns}
        export={false}
        multi={true}
        // action={true}
      />
    </div>
  );
};

export default StorageObject;