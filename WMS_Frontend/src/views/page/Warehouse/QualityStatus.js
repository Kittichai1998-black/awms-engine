import React, { useState, useEffect, useContext } from "react";
import AmStorageObjectMulti from "../../pageComponent/AmStorageObjectV2/AmStorageObjectMultiV2";
import {
  apicall,
  createQueryString
} from "../../../components/function/CoreFunction";
import AmRedirectLog from "../../../components/AmRedirectLog";
import { StorageObjectEvenstatusTxt } from "../../../components/Models/StorageObjectEvenstatus";
import { Hold, Lock } from "../../../components/Models/Hold";
import { AuditStatus } from "../../../components/Models/AuditStatus";
import AmStorageObjectStatus from "../../../components/AmStorageObjectStatus";
import AuditStatusIcon from "../../../components/AmAuditStatus";
import RemoveCircle from "@material-ui/icons/RemoveCircle";
import CheckCircle from "@material-ui/icons/CheckCircle";
import Tooltip from '@material-ui/core/Tooltip';
import queryString from "query-string";
import AmShowImage from '../../../components/AmShowImage'
import AmDialogUploadImage from '../../../components/AmDialogUploadImage'


const Axios = new apicall();

//======================================================================
const QualityStatus = props => {

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
    {
      Header: "Warehouse Lock",
      accessor: "IsHold",
      width: 30,
      sortable: false,
      filterType: "dropdown",
      filterConfig: {
        filterType: "dropdown",
        dataDropDown: Lock,
        typeDropDown: "normal",
        widthDD: 120,
      },
      Cell: e => getIsHold(e.original.IsHold)
    },
    {
      Header: "Quality Status",
      accessor: "AuditStatus",
      width: 50,
      sortable: false,
      filterType: "dropdown",
      filterConfig: {
        filterType: "dropdown",
        dataDropDown: AuditStatus,
        typeDropDown: "normal",
        widthDD: 130,
      },
      Cell: e => getAuditStatus(e.original.AuditStatus)
    },
    {
      Header: "Pallet",
      accessor: "Pallet",
      width: 130,
      //Cell: e => getImgPallet(e.original.Pallet)
    },
    {
      Header: "SKU Code",
      accessor: "SKU_Code",
      width: 100
    },
    {
      Header: "SKU Name",
      accessor: "SKU_Name",
      fixWidth: 200,

    },
    // { Header: "Project", accessor: "Project", width: 100 },
    { Header: "Customer", accessor: "For_Customer", width: 100 },
    { Header: "Area", accessor: "Area", width: 100 },
    { Header: "Location", accessor: "Location", width: 100 },
    { Header: "Lot", accessor: "Lot", width: 80 },
    {
      Header: "Qty",
      accessor: "Qty",
      width: 70,
      type: "number"
      // Cell: e => getNumberQty(e.original)
    },
    { Header: "Base Unit", accessor: "Base_Unit", width: 100 },
    { Header: "Remark", accessor: "Remark", width: 100, Cell: e => getOptions(e.original.Options) },
    {
      Header: "Received Date",
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

  const getOptions = value => {
    var qryStr = queryString.parse(value);
    return qryStr["remark"]
  }
  const getIsHold = value => {
    if (value !== undefined) {
      return value === false ? <div style={{ textAlign: "center" }}>
        <Tooltip title="UNLOCK" >
          <RemoveCircle
            fontSize="small"
            style={{ color: "#9E9E9E" }}
          />
        </Tooltip>
      </div> : <div style={{ textAlign: "center" }}>
          <Tooltip title="LOCK" >
            <CheckCircle
              fontSize="small"
              style={{ color: "black" }}
            />
          </Tooltip>
        </div>
    } else {
      return null
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
            "/log/docitemstolog?id=" +
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
  //AuditStatus
  const getAuditStatus = Status => {
    //return null
    return <div style={{ marginBottom: "3px", textAlign: "center" }}>
      {getAuditStatusValue(Status)}
    </div>

  };
  const getAuditStatusValue = Status => {
    if (Status === 0) {
      return <AuditStatusIcon key={Status} statusCode={0} />;
    } else if (Status === 1) {
      return <AuditStatusIcon key={Status} statusCode={1} />;
    } else if (Status === 2) {
      return <AuditStatusIcon key={Status} statusCode={2} />;
    } else if (Status === 9) {
      return <AuditStatusIcon key={Status} statusCode={9} />;
    } else {
      return null;
    }
  }


  const getStatus = Status => {
    return Status.split("\\n").map(y => (
      <div style={{ marginBottom: "3px", textAlign: "center" }}>
        {getStatusValue(y)}
      </div>
    ));
  };

  const getStatusValue = Status => {
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
        action={true}
        actionAuditStatus={true}
      />
    </div>
  );
};

export default QualityStatus;