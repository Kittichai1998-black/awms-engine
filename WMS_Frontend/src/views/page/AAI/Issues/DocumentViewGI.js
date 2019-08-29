import DocView from "../../../pageComponent/DocumentView";
import React, { useState, useEffect, useContext } from "react";
import AmIconStatus from "../../../../components/AmIconStatus";
import { Button } from "@material-ui/core";
import AmStorageObjectStatus from "../../../../components/AmStorageObjectStatus";
import queryString from "query-string";

const DocumentViewGI = props => {
  const TextHeader = [
    [
      { label: "Document No", values: "Code" },
      { label: "Document Date", values: "documentDate", type: "date" }
    ],
    [
      { label: "SAP Movement", values: "Ref2" },
      { label: "Action Time", values: "actionTime", type: "dateTime" }
    ],
    [{ label: "Source Warehouse", values: "SouWarehouseName" }],
    [
      {
        label: "Doc Status",
        values: "renderDocumentStatus()",
        type: "function"
      },
      { label: "Mode", values: "Ref1" }
    ]
  ];

  const columns = [
    //{"width": 70,"accessor":"palletCode", "Header":"palletCode"},
    //{ width: 120, accessor: "SKUMaster_Name", Header: "SU No." },
    //{ width: 200, accessor: "SKUMaster_Code", Header: "SKU Code" },
    { width: 120, accessor: "SKUMaster_Code", Header: "SKU Code" },
    { width: 120, accessor: "SKUMaster_Name", Header: "SKU Name" },
    { width: 120, accessor: "lenum", Header: "SU" },
    { width: 100, accessor: "posnr", Header: "Delivery Item" },
    { width: 150, accessor: "matnr", Header: "Material" },
    { width: 100, accessor: "charg", Header: "Batch" },
    { width: 100, accessor: "lgtyp", Header: "Dest. Styp." },
    { width: 100, accessor: "lgbtr", Header: "Dest. Sec" },
    { width: 100, accessor: "lgpla", Header: "Dest. BIN" },
    { width: 50, accessor: "bestq_ur", Header: "UR" },
    { width: 50, accessor: "bestq_qi", Header: "QI" },
    { width: 50, accessor: "bestq_blk", Header: "BLK" },
    { width: 120, accessor: "_qty", Header: "Qty" },
    { width: 70, accessor: "UnitType_Name", Header: "Unit" }
  ];

  const columnsDetailSOU = [
    {
      width: 40,
      accessor: "status",
      Header: "Task",
      Cell: e => getStatusGI(e.original)
    },
    { width: 100, accessor: "code", Header: "Pallet" },
    { width: 150, accessor: "packCode", Header: "SKU Code" },
    { accessor: "packName", Header: "SKU Name" },
    { width: 115, accessor: "batch", Header: "Batch" },
    { width: 125, accessor: "btanr", Header: "Transfer Order" },
    { width: 110, accessor: "_packQty", Header: "Qty" },
    { width: 60, accessor: "packUnitCode", Header: "Unit" }
  ];

  const columnsDetailDES = [
    {
      width: 40,
      accessor: "status",
      Header: "Task",
      Cell: e => getStatusGI(e.original)
    },
    { width: 100, accessor: "code", Header: "Pallet" },
    { width: 150, accessor: "packCode", Header: "SKU Code" },
    { accessor: "packName", Header: "SKU Name" },
    { width: 125, accessor: "batch", Header: "Batch" },
    { width: 125, accessor: "btanr", Header: "Transfer Order" },
    { width: 110, accessor: "_packQty", Header: "Qty" },
    { width: 60, accessor: "packUnitCode", Header: "Unit" }
  ];

  // const optionDocItems = [
  //     {"optionName": "palletCode"},
  //     {"optionName": "locationCode"},
  // ]
  const optionDocItems = [
    { optionName: "lenum" },
    { optionName: "posnr" },
    { optionName: "matnr" },
    { optionName: "charg" },
    { optionName: "lgtyp" },
    { optionName: "lgbtr" },
    { optionName: "lgpla" },
    { optionName: "bestq_ur" },
    { optionName: "bastq_qi" },
    { optionName: "bastq_blk" }
  ];
  const getStatusGI = value => {
    //console.log(value)
    if (value.status === 0)
      return <AmStorageObjectStatus key={17} statusCode={17} />;
    else if (value.status === 1)
      return <AmStorageObjectStatus key={18} statusCode={18} />;
    else return null;
  };

  const getDocID = () => {
    const values = queryString.parse(props.location.search);
    var ID = values.docID.toString();
    return ID;
  };
  const optionSouBstos = [{ optionName: "btanr" }];
  const optionDesBstos = [{ optionName: "btanr" }];
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
        typeDocNo={1002}
        docID={getDocID()}
        header={TextHeader}
        buttonBack={true}
        linkBack={"/issue/search"}
        history={props.history}
        optionSouBstos={optionSouBstos}
        optionDesBstos={optionDesBstos}
      />
    </div>
  );
};

export default DocumentViewGI;
