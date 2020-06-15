import DocView from "../../../pageComponent/DocumentView";
import React from "react";
// import AmIconStatus from "../../../../components/AmIconStatus";
// import { Button } from "@material-ui/core";
// import AmStorageObjectStatus from "../../../../components/AmStorageObjectStatus";
import CheckCircle from "@material-ui/icons/CheckCircle";
import HighlightOff from "@material-ui/icons/HighlightOff";
import queryString from "query-string";

const GR_Detail = props => {
  const TextHeader = [
    [
      { label: "Document No.", values: "Code" },
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
      { label: "Doc Status", values: "renderDocumentStatus()", type: "function" },
      { label: "Remark", values: "Remark" }
    ]
  ];

  const columns = [
    // { width: 200, accessor: "SKUMaster_Code", Header: "Reorder" },
    { accessor: "SKUMaster_Name", Header: "Item Code" },
    { width: 130, accessor: "OrderNo", Header: "Order No." },
    { width: 120, accessor: "_qty", Header: "Qty" },
    { width: 70, accessor: "UnitType_Code", Header: "Unit" }
  ];

  const columnsDetailSOU = [
    { width: 40, accessor: "status", Header: "Task", Cell: e => getStatusGR(e.original) },
    { width: 100, accessor: "rootCode", Header: "Pallet" },
    { width: 150, accessor: "packCode", Header: "Pack Code" },
    { accessor: "packName", Header: "Pack Name" },
    { width: 125, accessor: "orderNo", Header: "Order No." },
    { width: 110, accessor: "_packQty", Header: "Qty" },
    { width: 60, accessor: "packUnitCode", Header: "Unit" }
  ];

  const columnsDetailDES = [
    //{"width": 40,"accessor":"status", "Header":"Task","Cell":(e)=>getStatusGI(e.original)},
    { width: 100, accessor: "code ", Header: "Pallet" },
    // { width: 150, accessor: "packCode", Header: "Pack Code" },
    // { accessor: "packName", Header: "Pack Name" },
    { Header: "Item Code", accessor: "SKUItems" },
    { width: 125, accessor: "orderNo", Header: "Order No." },
    { width: 110, accessor: "_packQty", Header: "Qty" },
    { width: 60, accessor: "packUnitCode", Header: "Unit" }
  ];

  const optionDocItems = [{ optionName: "DocItem" }, { optionName: "DocType" }];

  const getStatusGR = value => {
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

  const colListDocItems = [
    { width: 200, accessor: "SKUMaster_Name", Header: "Item Code" },
    { width: 130, accessor: "Lot", Header: "Lot" },
    { width: 150, accessor: "Quantity", Header: "จำนวนที่รับเข้าได้" },
    { width: 70, accessor: "UnitType_Code", Header: "Unit" }
  ];
  const addPalletMapSTO = {
    apiCreate: '/v2/ScanMapStoFromDocAPI',
    // columnsDocItems: colListDocItems,
    ddlWarehouse: {
      visible: true,
      field: "warehouseID",
      typeDropdown: "search",
      name: "Warehouse",
      placeholder: "Select Warehouse",
      fieldLabel: ["Code", "Name"],
      fieldDataKey: "ID",
      defaultValue: 1,
      required: true,
      // customQ: "{ 'f': 'ID', 'c':'=', 'v': 1}"
    },
    ddlArea: {
      visible: true,
      field: "areaID",
      typeDropdown: "search",
      name: "Area",
      placeholder: "Select Area",
      fieldLabel: ["Code", "Name"],
      fieldDataKey: "ID",
      defaultValue: 15,
      required: true,
      // customQ: "{ 'f': 'AreaMasterType_ID', 'c':'in', 'v': '30'}"
    },
    ddlLocation: {
      visible: true,
      field: "locationID",
      typeDropdown: "search",
      name: "Location",
      placeholder: "Select Location",
      fieldLabel: ["Code", "Name"],
      fieldDataKey: "ID",
      // defaultValue: 14,
      required: false,
      // customQ: "{ 'f': 'AreaMasterType_ID', 'c':'in', 'v': '30'}"
    },
    inputTitle: [
      {
        field: "projCode",
        name: "Project",
        type: "text",
        customShow: (dataDocument)=>{
          return dataDocument.document.Ref1;
        },
      }
    ],
    inputBase:
    {
      visible: true,
      field: "baseCode",
      type: "input",
      name: "Pallet Code",
      placeholder: "Pallet Code",
      maxLength: 10,
      required: true,
      validate: /^.+$/,
    },
    // [
    //   {
    //     field: "baseCode",
    //     placeholder: "Pallet Code",
    //     required: true,
    //     type: "input",
    //     name: "Pallet Code",
    //     maxLength: 10,
    //     validate: /^.+$/,
    //   }
    // ]
  }
 
  //received
  //issued
  return (
    <DocView
      openSOU={true}
      openDES={true}
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
      useAddPalletMapSTO={true}
      addPalletMapSTO={addPalletMapSTO}
      buttonConfirmMappingSTO={true}
    />
  );
};

export default GR_Detail;
