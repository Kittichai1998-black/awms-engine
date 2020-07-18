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
      { label: "Doc. ProcessType", values: "DocumentProcessTypeName" },
      { label: "Action Time", values: "ActionTime", type: "dateTime" }
    ],
    [
      { label: "Customer", values: "ForCustomer" },
      { label: "Project", values: "Ref2" }
    ],
    [
      { label: "Doc Status", values: "renderDocumentStatus()", type: "function" },
      { label: "", values: "" }
    ]
  ];

  const columns = [
    { width: 100, accessor: "SKUMaster_Code", Header: "Code" },
    { accessor: "SKUMaster_Name", Header: "Item Code" },
    { width: 130, accessor: "advice", Header: "Advice" },
    { width: 130, accessor: "RefID", Header: "Serial" },
    { width: 130, accessor: "Lot", Header: "Lot" },
    { width: 120, accessor: "_baseqty", Header: "BaseQty" },
    { width: 70, accessor: "BaseUnitType_Code", Header: "BaseUnit" },
    { width: 120, accessor: "_qty", Header: "Qty" },
    { width: 70, accessor: "UnitType_Code", Header: "Unit" }
  ];

  const columnsDetailSOU = [
    { width: 40, accessor: "status", Header: "Task", Cell: e => getStatusGR(e.original) },
    { width: 130, Header: "Location", Cell: e => e.original.areaCode + ":" + e.original.areaLocationCode },
    { width: 100, accessor: "rootCode", Header: "Pallet" },
    { width: 150, accessor: "packCode", Header: "Pack Code" },
    { accessor: "packName", Header: "Pack Name" },
    { width: 125, accessor: "Lot", Header: "Lot" },
    { width: 110, accessor: "_packQty", Header: "Qty" },
    { width: 60, accessor: "packUnitCode", Header: "Unit" }
  ];


  const optionDocItems = [{ optionName: "advice" }, { optionName: "serial" }];

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

  const addPalletMapSTO = {
    ddlArea: {
      visible: true,
      field: "areaID",
      typeDropdown: "search",
      name: "Area",
      placeholder: "Select Area",
      fieldLabel: ["Code", "Name"],
      fieldDataKey: "ID",
      defaultValue: 4,
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
      defaultValue: 1541,
      required: false,
    },
    inputTitle: [
      {
        field: "WhOrder",
        name: "Wh.Order",
        type: "text",
        customShow: (dataDocument) => {
          return dataDocument.document.Ref1;
        },
      }
    ],
    inputBase:
    {
      visible: true,
      field: "baseCode",
      name: "Pallet Code",
      placeholder: "Pallet Code",
      maxLength: 10,
    },
  }

  //received
  //issued
  return (
    <DocView
      openSOU={true}
      openDES={false}
      optionDocItems={optionDocItems}
      columnsDetailSOU={columnsDetailSOU}
      columnsDetailDES={[]}
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
      //================================
      usePrintBarcodePallet={true}
    />
  );
};

export default GR_Detail;