
import React from "react";
import AmStorageObjectStatus from "../../../components/AmStorageObjectStatus";
import RemoveCircle from "@material-ui/icons/RemoveCircle";
import CheckCircle from "@material-ui/icons/CheckCircle";
import Tooltip from '@material-ui/core/Tooltip';

const DataGenerateMulti = (data) => {

  data.forEach(x => {
    // console.log(x)
    if (x.SKU_Code != null) {
      x.SKU_Code = x.SKU_Code.split("\\n").map(y => (
        <div style={{ marginBottom: "3px" }}>{y}</div>
      ));
    }
    if (x.SKU_Name != null) {
      x.SKU_Name = x.SKU_Name.split("\\n").map(y => (
        <div style={{ marginBottom: "3px" }}>{y}</div>
      ));
    }
    if (x.Qty != null) {
      x.Qty = x.Qty.toString()
        .split("\\n")
        .map(y => <div style={{ marginBottom: "3px" }} >{y.split(".000")}</div>);
      x.Base_Unit = x.Base_Unit.split("\\n").map(y => (
        <div style={{ marginBottom: "3px" }}>{y}</div>
      ));
    }
    if (x.Lot != null) {
      x.Lot = x.Lot.split("\\n").map(y => (
        <div style={{ marginBottom: "3px" }}>{y}</div>
      ));
    }
    if (x.Status != null) {
      x.Status = x.Status.split("\\n").map(y => (
        <div style={{ marginBottom: "3px", textAlign: "center" }}>
          {/* {getStatus(y)} */}
          <div style={{ marginBottom: "3px" }}>{y}</div>
        </div>
      ));
    }
    if (x.HoldStatus != null) {
      x.HoldStatus = x.HoldStatus.split("\\n").map(y => (
        <div style={{ marginBottom: "3px", textAlign: "center" }}>
          {getIsHold(y)}
        </div>
      ));
    }
  });
  return data;
}

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