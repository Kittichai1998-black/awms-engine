import DocView from "../../../pageComponent/DocumentView";
import React, { useState, useEffect, useContext } from "react";
import AmIconStatus from "../../../../components/AmIconStatus";
import { Button } from "@material-ui/core";
import CheckCircle from "@material-ui/icons/CheckCircle";
import HighlightOff from "@material-ui/icons/HighlightOff";
import AmStorageObjectStatus from "../../../../components/AmStorageObjectStatus";
import queryString from "query-string";

const DocumentViewGR = props => {
  const TextHeader = [
    [
      { label: "Document No", values: "Code" },
      { label: "Document Date", values: "documentDate", type: "date" }
    ],
    [
      { label: "Source Customer", values: "SouCustomerName" },
      { label: "Action Time", values: "actionTime", type: "dateTime" }
    ],
    [
      { label: "Source Warehouse", values: "SouWarehouseName" },
      { label: "Destination Warehouse", values: "DesWarehouseName" }
    ],
    [
      { label: "Movement Type", values: "MovementName" },
      { label: "", values: "" }
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
    { width: 200, accessor: "SKUMaster_Code", Header: "Reorder" },

    { accessor: "SKUMaster_Name", Header: "Brand" },
    { width: 130, accessor: "OrderNo", Header: "SI." },
    { width: 120, accessor: "_qty", Header: "Qty" },
    { width: 70, accessor: "UnitType_Name", Header: "Unit" }
  ];

  const columnsDetailSOU = [
    {
      width: 40,
      accessor: "status",
      Header: "Task",
      Cell: e => getStatusGR(e.original)
    },
    { width: 100, accessor: "code", Header: "Pallet Code" },
    { width: 125, accessor: "orderNo", Header: "SI." },
    { width: 150, accessor: "packCode", Header: "Reorder" },
    { accessor: "packName", Header: "Brand" },
    { width: 125, accessor: "skuType", Header: "Size" },
    { width: 110, accessor: "_packQty", Header: "Qty" },
    { width: 60, accessor: "packUnitCode", Header: "Unit" }
  ];

  const columnsDetailDES = [
    //{"width": 40,"accessor":"status", "Header":"Task","Cell":(e)=>getStatusGI(e.original)},
    { width: 100, accessor: "code ", Header: "Pallet Code" },
    { width: 125, accessor: "นrderNo", Header: "SI." },
    { width: 150, accessor: "packCode", Header: "Reorder" },
    { accessor: "packName", Header: "Brand" },
    { width: 125, accessor: "skuType", Header: "Size" },
    { width: 110, accessor: "_packQty", Header: "Qty" },
    { width: 60, accessor: "packUnitCode", Header: "Unit" }
  ];

  const optionDocItems = [{ optionName: "DocItem" }, { optionName: "DocType" }];

  // const getStatusGR = value => {
  //   if (value.status === 0)
  //     return <AmStorageObjectStatus key={11} statusCode={11} />;
  //   else if (value.status === 1)
  //     return <AmStorageObjectStatus key={12} statusCode={12} />;
  //   else return null;
  // };

  const getStatusGR = value => {
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
        typeDoc={"received"}
        typeDocNo={1001}
        docID={getDocID()}
        header={TextHeader}
        buttonBack={true}
        linkBack={"/receive/search"}
        history={props.history}
      />
    </div>
  );
};

export default DocumentViewGR;
