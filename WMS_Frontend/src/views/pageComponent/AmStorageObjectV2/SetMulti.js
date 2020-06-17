
import React from "react";
import AmStorageObjectStatus from "../../../components/AmStorageObjectStatus";
import RemoveCircle from "@material-ui/icons/RemoveCircle";
import CheckCircle from "@material-ui/icons/CheckCircle";
import Tooltip from '@material-ui/core/Tooltip';

const DataGenerateMulti = (data) => {

  data.forEach(x => {
    x.SKU_Code = x.SKU_Code.split("\\n").map(y => (
      <div style={{ marginBottom: "3px" }}>{y}</div>
    ));
    x.SKU_Name = x.SKU_Name.split("\\n").map(y => (
      <div style={{ marginBottom: "3px" }}>{y}</div>
    ));
    x.Qty = x.Qty.toString()
      .split("\\n")
      .map(y => <div style={{ marginBottom: "3px" }} >{y.split(".000")}</div>);
    x.Base_Unit = x.Base_Unit.split("\\n").map(y => (
      <div style={{ marginBottom: "3px" }}>{y}</div>
    ));
    x.Lot = x.Lot.split("\\n").map(y => (
      <div style={{ marginBottom: "3px" }}>{y}</div>
    ));

    x.Status = x.Status.split("\\n").map(y => (
      <div style={{ marginBottom: "3px", textAlign: "center" }}>
        {getStatus(y)}
      </div>
    ));
    x.HoldStatus = x.HoldStatus.split("\\n").map(y => (
      <div style={{ marginBottom: "3px", textAlign: "center" }}>
        {getIsHold(y)}
      </div>
    ));
  });
  return data;
}

const getStatus = Status => {
  if (Status === "NEW") {
    return <AmStorageObjectStatus key={Status} statusCode={10} />;
  } else if (Status === "RECEIVING") {
    return <AmStorageObjectStatus key={Status} statusCode={11} />;
  } else if (Status === "RECEIVED") {
    return <AmStorageObjectStatus key={Status} statusCode={102} />;
  } else if (Status === "AUDITING") {
    return <AmStorageObjectStatus key={Status} statusCode={13} />;
  } else if (Status === "AUDITED") {
    return <AmStorageObjectStatus key={Status} statusCode={14} />;
  } else if (Status === "PICKING") {
    return <AmStorageObjectStatus key={Status} statusCode={17} />;
  } else if (Status === "PICKED") {
    return <AmStorageObjectStatus key={Status} statusCode={18} />;
  } else if (Status === "QUALITY_CONTROL") {
    return <AmStorageObjectStatus key={Status} statusCode={98} />;
  } else if (Status === "REMOVING") {
    return <AmStorageObjectStatus key={Status} statusCode={21} />;
  } else if (Status === "REMOVED") {
    return <AmStorageObjectStatus key={Status} statusCode={22} />;
  } else {
    return null;
  }

};
const getIsHold = value => {
  return value === "0" ? <div style={{ textAlign: "center" }}>
    <Tooltip title="NONE" >
      <RemoveCircle
        fontSize="small"
        style={{ color: "#9E9E9E" }}
      />
    </Tooltip>
  </div> : <div style={{ textAlign: "center" }}>
      <Tooltip title="HOLD" >
        <CheckCircle
          fontSize="small"
          style={{ color: "black" }}
        />
      </Tooltip>
    </div>
}

export { DataGenerateMulti }