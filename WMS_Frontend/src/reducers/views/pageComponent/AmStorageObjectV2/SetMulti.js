
import React from "react";

const DataGenerateMulti = (data) => {

  if (data != null) {
    data.forEach(x => {
      if (x.SKU_Code != null) {
        x.SKU_Code = x.SKU_Code.split("\\n").map((y,idx) => (
          <div style={{ marginBottom: "3px" }} key={idx}>{y}</div>
        ));
      }
      if (x.SKU_Name != null) {
        x.SKU_Name = x.SKU_Name.split("\\n").map((y,idx) => (
          <div style={{ marginBottom: "3px" }} key={idx}>{y}</div>
        ));
      }
      if (x.Qty != null) {
        x.Qty = x.Qty.toString()
          .split("\\n")
          .map((y,idx) => <div style={{ marginBottom: "3px" }} key={idx}>{y.split(".000")}</div>);
        x.Base_Unit = x.Base_Unit.split("\\n").map((y,idx) => (
          <div style={{ marginBottom: "3px" }} key={idx}>{y}</div>
        ));
      }
      if (x.Lot != null) {
        x.Lot = x.Lot.split("\\n").map((y,idx) => (
          <div style={{ marginBottom: "3px" }} key={idx}>{y}</div>
        ));
      }
      if (x.For_Customer != null) {
        x.For_Customer = x.For_Customer.split("\\n").map((y,idx) => (
          <div style={{ marginBottom: "3px" }} key={idx}>{y}</div>
        ));
      }
      if (x.Project != null) {
        x.Project = x.Project.split("\\n").map((y,idx) => (
          <div style={{ marginBottom: "3px" }} key={idx}>{y}</div>
        ));
      }

    });
  }
  return data;
}


export { DataGenerateMulti }