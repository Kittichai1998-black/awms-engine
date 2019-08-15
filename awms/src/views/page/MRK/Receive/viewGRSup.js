import queryString from "query-string";
import React from "react";

import AmStorageObjectStatus from "../../../../components/AmStorageObjectStatus";
import DocView from "../../../pageComponent/DocumentView"; //css
import AmButton from "../../../../components/AmButton";
export default props => {
  const TextHeader = [
    [
      { label: "Document No", values: "code" },
      { label: "Document Date", values: "documentDate", type: "date" }
    ],
    [
      { label: "Movement Type", values: "movementName" },
      { label: "Action Time", values: "actionTime", type: "dateTime" }
    ],
    [
      { label: "Souruce Supplier", values: "souSupplierName" },
      { label: "Destination Warehouse", values: "desWarehouseName" }
    ],
    [
      {
        label: "Doc Status",
        values: "renderDocumentStatus()",
        type: "function"
      },
      { label: "Remark", values: "remark" }
    ]
  ];

  const columns = [
    { width: 200, accessor: "skuMaster_Code", Header: "SKU Code" },
    { accessor: "skuMaster_Name", Header: "SKU Name" },
    { width: 130, accessor: "batch", Header: "Batch" },
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
    { width: 150, accessor: "code", Header: "Pallet" },
    { width: 150, accessor: "packCode", Header: "SKU Code" },
    { accessor: "packName", Header: "SKU Name" },
    { width: 125, accessor: "batch", Header: "Batch" },
    { width: 110, accessor: "_packQty", Header: "Qty" },
    { width: 60, accessor: "packUnitCode", Header: "Unit" },
    {
      width: 80,
      accessor: "",
      Header: "",
      Cell: e => getPrintButton(e.original)
    }
  ];

  const columnsDetailDES = [
    {
      width: 40,
      accessor: "status",
      Header: "Task",
      Cell: e => getStatusGR(e.original)
    },
    { width: 120, accessor: "code ", Header: "Pallet" },
    { width: 150, accessor: "packCode", Header: "SKU Code" },
    { accessor: "packName", Header: "SKU Name" },
    { width: 125, accessor: "batch", Header: "Batch" },
    { width: 110, accessor: "_packQty", Header: "Qty" },
    { width: 60, accessor: "packUnitCode", Header: "Unit" }
  ];

  const optionDocItems = [{ optionName: "DocItem" }, { optionName: "DocType" }];

  const getStatusGR = value => {
    if (value.status === 0)
      return <AmStorageObjectStatus key={11} statusCode={11} />;
    else if (value.status === 1)
      return <AmStorageObjectStatus key={12} statusCode={12} />;
    else return null;
  };
  const getPrintButton = value => {
    console.log(value);
    return (
      <AmButton styleType="confirm" onClick={() => printBarcode(value.code)}>
        Print
      </AmButton>
    );
  };

  const printBarcode = code => {
    if (props.history === "" || props.history === undefined) {
      props.history.push("/");
    } else {
      props.history.push("/warehouse/printbarcode?palletcode=" + code);
    }
  };
  const getDocID = () => {
    const values = queryString.parse(props.location.search);
    var ID = values.docID.toString();
    return ID;
  };

  //received
  //issued
  return (
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
  );
};
