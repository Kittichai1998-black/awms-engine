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
import AmButton from "../../../components/AmButton";


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
      accessor: "IsHoldName",
      width: 30,
      sortable: false,
      filterType: "dropdown",
      filterConfig: {
        filterType: "dropdown",
        dataDropDown: Lock,
        typeDropDown: "normal",
        widthDD: 120,
      },
      Cell: e => getIsHold(e.original.IsHoldName)
    },
    {
      Header: "Quality Status",
      accessor: "AuditStatusName",
      width: 50,
      sortable: false,
      filterType: "dropdown",
      filterConfig: {
        filterType: "dropdown",
        dataDropDown: AuditStatus,
        typeDropDown: "normal",
        widthDD: 120,
      },
      Cell: e => getAuditStatus(e.original.AuditStatusName)
    },
    //{ Header: "Lot", accessor: "Lot", width: 80 },
    { Header: "Vendor Lot", accessor: "Ref1", width: 80 },

    {
      Header: "Item Code",
      accessor: "SKU_Code",
      width: 100
    },
    {
      Header: "Item Name",
      accessor: "SKU_Name",
      fixWidth: 200,

    }, {
      Header: "Pallet",
      accessor: "Pallet",
      width: 130,
      //Cell: e => getImgPallet(e.original.Pallet)
    },
    { Header: "Control No.", accessor: "OrderNo", width: 100 },
    { Header: "Customer", accessor: "For_Customer", width: 100 },
    { Header: "Area", accessor: "Area", width: 100 },
    { Header: "Location", accessor: "Location", width: 100 },
    {
      Header: "Qty",
      accessor: "SaleQty",
      width: 70,
      type: "number"
      // Cell: e => getNumberQty(e.original)
    },
    { Header: "Unit", accessor: "Unit", width: 100 },
    { Header: "Remark", accessor: "Remark", width: 100, Cell: e => getOptions(e.original.Options) },
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
    if (Status === "QUARANTINE") {
      return <AuditStatusIcon key={0} statusCode={0} />;
    } else if (Status === "PASSED") {
      return <AuditStatusIcon key={1} statusCode={1} />;
    } else if (Status === "REJECTED") {
      return <AuditStatusIcon key={2} statusCode={2} />;
    } else if (Status === "HOLD") {
      return <AuditStatusIcon key={9} statusCode={9} />;
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

  const SendEmail = <AmButton styleType="add_clear" onClick={() => {
    Axios.post(window.apipath + "/v2/audit_send_notify", {})
  }}>Send Notify</AmButton>

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
        customTopLeftControl={SendEmail}
        typeSKU={"PM"}
      />
    </div>
  );
};

export default QualityStatus;