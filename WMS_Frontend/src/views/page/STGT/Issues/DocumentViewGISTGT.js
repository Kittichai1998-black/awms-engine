import DocView from "../../../pageComponent/AmDocumentViewPDF";
import React, { useState, useEffect, useContext } from "react";
import AmIconStatus from "../../../../components/AmIconStatus";
import { Button } from "@material-ui/core";
import AmStorageObjectStatus from "../../../../components/AmStorageObjectStatus";
import CheckCircle from "@material-ui/icons/CheckCircle";
import HighlightOff from "@material-ui/icons/HighlightOff";
import queryString from "query-string";

const DocumentViewGISTGT = props => {
  const TextHeader = [
    [
      { label: "Document No", values: "Code" },
      { label: "Document Date", values: "DocumentDate", type: "date" }
    ],
    [
      { label: "Movement Type", values: "MovementName" },
      { label: "Action Time", values: "ActionTime", type: "dateTime" }
    ],
    [
      { label: "Source Warehouse", values: "SouWarehouseName" },
      { label: "Destination Customer", values: "DesCustomerName" }
    ],
    [
      {
        label: "Doc Status",
        values: "renderDocumentStatus()",
        type: "function"
      },
      { label: "Remark", values: "Remark" }
    ]
  ];

  const columns = [
    { width: 120, accessor: "palletcode", Header: "Pallet Code" },
    { width: 200, accessor: "SKUMaster_Code", Header: "Reorder" },
    { accessor: "SKUMaster_Name", Header: "Brand" },
    { width: 130, accessor: "OrderNo", Header: "SI" },
    { width: 120, accessor: "_qty", Header: "Base Qty" },
    { width: 100, accessor: "UnitType_Name", Header: "Base Unit" },
    { width: 120, accessor: "_qtyConvert", Header: "Qty" },
    { width: 70, accessor: "_unitConvert", Header: "Unit" }
  ];

  const columnsDetailSOU = [
    {
      width: 40,
      accessor: "status",
      Header: "Task",
      Cell: e => getStatusGI(e.original)
    },

    { width: 100, accessor: "code", Header: "Pallet" },
    { width: 150, accessor: "packCode", Header: "Reorder" },
    { accessor: "packName", Header: "Brand" },
    { width: 125, accessor: "orderNo", Header: "SI" },
    { width: 110, accessor: "_packQty", Header: "Base Qty" },
    { width: 80, accessor: "packUnitCode", Header: "Base Unit" },
    {
      width: 120,
      accessor: "_packQtyConvert",
      Header: "Qty",
      Cell: e => getQtyConvert(e.original)
    },
    {
      width: 60,
      accessor: "distoUnitCodeConvert",
      Header: "Unit",
      Cell: e => getUnitConvert(e.original)
    }
  ];

  const getUnitConvert = value => {
    var result = null;
    if (value.distoQtyConverts[1] !== undefined) {
      result = value.distoQtyConverts[1]["unit"];
    }
    if (value.packCode === "000000000") {
      result = value.packUnitCode;
    }
    return result;
  };
  const getQtyConvert = value => {
    var result = null;
    if (value.distoQtyConverts[1] !== undefined) {
      result =
        value.distoQtyConverts[1]["qty"] +
        " / " +
        value.distoQtyConverts[1]["qtyMax"];
    }
    if (value.packCode === "000000000") {
      result = value._packQty;
    }

    return result;
  };
  const columnsDetailDES = [
    {
      width: 40,
      accessor: "status",
      Header: "Task",
      Cell: e => getStatusGI(e.original)
    },
    { width: 100, accessor: "code", Header: "Pallet" },
    { width: 150, accessor: "packCode", Header: "Reorder" },
    { accessor: "packName", Header: "Brand" },
    { width: 125, accessor: "orderNo", Header: "SI" },
    { width: 110, accessor: "_packQty", Header: "Qty" },
    { width: 60, accessor: "packUnitCode", Header: "Unit" }
  ];

  const optionDocItems = [{ optionName: "palletcode" }];

  const getStatusGI = value => {
    //console.log(value)
    if (value.status === 1) return <CheckCircle style={{ color: "green" }} />;
    else if (value.status === 0)
      return <HighlightOff style={{ color: "red" }} />;
    else return null;
  };
  const getDocID = () => {
    const values = queryString.parse(props.location.search);
    var ID = values.docID.toString();
    return ID;
  };

  //received
  //issued
  return (
    <div>
      <DocView
        openSOU={true}
        openDES={false}
        optionDocItems={optionDocItems}
        columnsDetailSOU={columnsDetailSOU}
        columnsDetailDES={columnsDetailDES}
        columns={columns}
        typeDoc={"issued"}
        typeDocNo={1002}
        docID={getDocID()}
        header={TextHeader}
        buttonBack={true}
        linkBack={"/issue/search"}
        history={props.history}
      />
    </div>
  );
};

export default DocumentViewGISTGT;
