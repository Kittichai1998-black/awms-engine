import DocView from "../../../pageComponent/DocumentView";
import React, { useState, useEffect, useContext } from "react";
import AmIconStatus from "../../../../components/AmIconStatus";
import { Button } from "@material-ui/core";
import AmStorageObjectStatus from "../../../../components/AmStorageObjectStatus";
import queryString from "query-string";

const DocumentViewGR = props => {
  const TextHeader = [
    [
      { label: "Document No", values: "code" },
      { label: "Document Date", values: "documentDate", type: "date" }
    ],
    [{ label: "Action Time", values: "actionTime", type: "dateTime" }],
    [
      { label: "Source Warehouse", values: "souWarehouseName" },
      { label: "Destination Warehouse", values: "desWarehouseName" }
    ],
    [
      { label: "Movement Type", values: "movementName" },
      { label: "", values: "" }
    ],
    [
      {
        label: "Doc Status",
        values: "renderDocumentStatus()",
        type: "function"
      },
      { label: "", values: "" }
    ]
  ];

  const columns = [
    { width: 200, accessor: "skuMaster_Code", Header: "SKU Code" },
    { accessor: "skuMaster_Name", Header: "SKU Name" },
    { width: 130, accessor: "batch", Header: "batch" },
    { width: 120, accessor: "_qty", Header: "Qty" },
    { width: 70, accessor: "unitType_Name", Header: "Unit" }
  ];

  const columnsDetailSOU = [
    {
      width: 40,
      accessor: "status",
      Header: "Task",
      Cell: e => getStatusGR(e.original)
    },
    { width: 120, accessor: "code", Header: "Pallet" },
    { width: 150, accessor: "packCode", Header: "SKU Code" },
    { accessor: "packName", Header: "SKU Name" },
    { width: 125, accessor: "batch", Header: "batch" },
    { width: 110, accessor: "_packQty", Header: "Qty" },
    { width: 60, accessor: "packUnitCode", Header: "Unit" }
  ];

  const columnsDetailDES = [
    //{"width": 40,"accessor":"status", "Header":"Task","Cell":(e)=>getStatusGI(e.original)},
    { width: 120, accessor: "code ", Header: "Pallet" },
    { width: 150, accessor: "packCode", Header: "SKU Code" },
    { accessor: "packName", Header: "SKU Name" },
    { width: 125, accessor: "batch", Header: "batch" },
    { width: 110, accessor: "_packQty", Header: "Qty" },
    { width: 60, accessor: "packUnitCode", Header: "Unit" }
  ];

  // const optionDocItems = [{ optionName: "DocItem" }, { optionName: "DocType" }];

  // const optionSouBstos = [{ optionName: "itemNo" }];
  // const optionDesBstos = [{ optionName: "itemNo" }];

  const getStatusGR = value => {
    if (value.status === 0)
      return <AmStorageObjectStatus key={11} statusCode={11} />;
    else if (value.status === 1)
      return <AmStorageObjectStatus key={12} statusCode={12} />;
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
        //optionDocItems={optionDocItems}
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
        // optionSouBstos={optionSouBstos}
        // optionDesBstos={optionDesBstos}
      />
    </div>
  );
};

export default DocumentViewGR;
