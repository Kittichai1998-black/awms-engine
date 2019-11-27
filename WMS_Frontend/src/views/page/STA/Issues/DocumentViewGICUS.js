import DocView from "../../../pageComponent/DocumentView";
import React, { useState, useEffect, useContext } from "react";
import AmIconStatus from "../../../../components/AmIconStatus";
import { Button } from "@material-ui/core";
import CheckCircle from "@material-ui/icons/CheckCircle";
import HighlightOff from "@material-ui/icons/HighlightOff";
import AmStorageObjectStatus from "../../../../components/AmStorageObjectStatus";
import queryString from "query-string";

const DocumentViewGICUS = props => {
  const [dataHeader, setDataHeader] = useState(null);

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
      { label: "Destination Warehouse", values: "DesWarehouseName" }
    ],
    [
      {
        label: "Doc Status",
        values: "renderDocumentStatus()",
        type: "function"
      },
      { label: "Destination Customer", values: "DesCustomerName" }
    ],
    [{}, { label: "Remark", values: "Remark" }]
  ];

  const columns = [
    { width: 120, accessor: "palletcode", Header: "Pallet Code" },
    { width: 130, accessor: "OrderNo", Header: "SI." },
    { width: 200, accessor: "SKUMaster_Code", Header: "Reorder" },
    { accessor: "SKUMaster_Name", Header: "Brand" },

    { width: 120, accessor: "_qty", Header: "Qty" },
    { width: 70, accessor: "UnitType_Name", Header: "Unit" }
  ];

  const columnsDetailSOU = [
    {
      width: 50,
      accessor: "status",
      Header: "QC",
      Cell: e => getPass(e.original)
    },
    {
      width: 40,
      accessor: "status",
      Header: "Task",
      Cell: e => getStatusGI(e.original)
    },
    { width: 120, accessor: "code", Header: "Pallet Code" },
    { width: 125, accessor: "orderNo", Header: "SI." },
    { width: 150, accessor: "packCode", Header: "Reorder" },
    { accessor: "packName", Header: "Brand" },
    //{ width: 100, accessor: "itemNo", Header: "Item No." },
    { width: 125, accessor: "skuType", Header: "Size" },
    { width: 110, accessor: "_packQty", Header: "Qty" },
    { width: 60, accessor: "packUnitCode", Header: "Unit" }
  ];
  const getPass = value => {
    return <AmIconStatus styleType={"PASS"}>PASS</AmIconStatus>;
  };
  const columnsDetailDES = [
    {
      width: 40,
      accessor: "status",
      Header: "Task",
      Cell: e => getStatusGI(e.original)
    },
    { width: 120, accessor: "code", Header: "Pallet Code" },
    { width: 125, accessor: "orderNo", Header: "SI." },
    { width: 150, accessor: "packCode", Header: "Reorder" },
    { accessor: "packName", Header: "Brand" },
    // { width: 100, accessor: "itemNo", Header: "Item No." },
    { width: 125, accessor: "orderNo", Header: "SI." },
    { width: 125, accessor: "skuType", Header: "Size" },
    { width: 110, accessor: "_packQty", Header: "Qty" },
    { width: 60, accessor: "packUnitCode", Header: "Unit" }
  ];

  const optionDocItems = [
    { optionName: "palletCode" }
    //{"optionName": "locationCode"},
  ];

  const optionSouBstos = [{ optionName: "itemno" }];
  const optionDesBstos = [{ optionName: "itemno" }];
  const getStatusGI = value => {
    //console.log(value)
    if (value.status === 1) return <CheckCircle style={{ color: "green" }} />;
    else if (value.status === 0)
      return <HighlightOff style={{ color: "red" }} />;
    else return null;
  };
  //   const getStatusGI = value => {
  //     //console.log(value)
  //     if (value.status === 0)
  //       return <AmStorageObjectStatus key={17} statusCode={17} />;
  //     else if (value.status === 1)
  //       return <AmStorageObjectStatus key={18} statusCode={18} />;
  //     else return null;
  //   };

  const getStatusAD = value => {
    if (value.status === 0) {
      // return <AmIconStatus styleType={"AUDITING"}>AUDITING</AmIconStatus>
      return <AmStorageObjectStatus key={13} statusCode={13} />;
    } else if (value.status === 1) {
      return <AmStorageObjectStatus key={14} statusCode={14} />;
    } else return null;
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
        dataHeader={res => {
          console.log(res);
          setDataHeader(res);
        }}
        openSOU={true}
        openDES={false}
        //optionDocItems={optionDocItems}
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

export default DocumentViewGICUS;
