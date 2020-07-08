import React from "react";
import AmProcessQueue from "../../../pageComponent/AmProcessQueue/AmProcessQueue";

const ProcessQueue = () => {
  const columnsDocument = [{ "accessor": "Code", "Header": "Code", "sortable": true }];
  const colDocumentItem = [
    { "accessor": "Code", "Header": "Code", "sortable": false, "width": 300 },
    { "accessor": "SKUMaster_Name", "Header": "Name", "sortable": false },
    { "accessor": "Quantity", "Header": "Qty", "sortable": false, "width": 80 },
    { "accessor": "UnitType_Name", "Header": "Unit", "sortable": false, "width": 80 },
  ];
  const columnsConfirm = [
    { "accessor": "bstoCode", "Header": "Code", "sortable": false, "width": 200 },
    { "accessor": "pstoLot", "Header": "Lot", "sortable": false, "width": 100 },
    {
      "accessor": "pickBaseQty", "Header": "Pick Qty", "sortable": false, "width": 100, Cell: (e) => {
        if (e.original.totalPick !== undefined) {
          if (e.original.baseQty > e.original.totalPick) {
            return <div>{e.original.baseQty} / {e.original.totalPick} Partial</div>
          } else if (e.original.baseQty < e.original.totalPick) {
            return <div>{e.original.baseQty} / {e.original.totalPick} Over</div>
          }
          else {
            return <div>{e.original.baseQty} / {e.original.totalPick}</div>
          }
        }
        else {
          return <div>{e.original.pickBaseQty}</div>
        }
      }
    },
  ];

  const documentQuery = {
    queryString: window.apipath + "/v2/SelectDataTrxAPI/",
    t: "Document",
    q: '[{ "f": "Status", "c":"<", "v": 2},{ "f": "EventStatus", "c":"=", "v": 10},{ "f": "DocumentType_ID", "c":"=", "v": 1002}]',
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
  };

  const warehouseQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "Warehouse",
    q:
      '[{ "f": "Status", "c":"<", "v": 2}]',
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
  };

  const desAreaQuery = {
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: "AreaRouteV2",
    q:
      '[{ "f": "IOType", "c":"=", "v": 1}, { "f": "souAreaID", "c":"=", "v": 5}]',
    f: "desAreaCode as Code, desAreaID as ID, desAreaName as Name, desWarehouseID",
    g: "",
    s: "[{'f':'ID','od':'asc'},]",
    sk: 0,
    l: 100,
    all: ""
  };

  const processCondition = {
    "conditions": [{ "field": "Full Pallet", "key": "useFullPick", "enable": true, "defaultValue": false, "editable": false }],
    "eventStatuses": [{ "field": "Recevied", "value": 102, "enable": true, "defaultValue": true, "editable": false, },],
    "orderBys": [
      //{ "field": "Partial Pallet", "enable": true, "sortField": "psto.baseQuantity", "sortBy": "0", "editable": false },
      { "field": "Lot", "enable": true, "sortField": "psto.lot", "sortBy": "0", "editable": false, }
    ]
  }

  const documentDetail = {
    columns: 2,
    field: [{ "accessor": "Code", "label": "Code" }, { "accessor": "DocumentProcessType_ID", "label": "DocumentProcessType_ID" },],
    fieldHeader: [{ "accessor": "Code", "label": "Code" }, { "accessor": "RefID", "label": "RefID" }]
  }

  // const customDesArea = (area, doc, warehouse) => {
  //   return area.filter(x => x.desWarehouseID === warehouse)
  // }

  return <AmProcessQueue
    documentPopup={columnsDocument}
    documentQuery={documentQuery}
    warehouseQuery={warehouseQuery}
    areaQuery={desAreaQuery}
    documentItemDetail={colDocumentItem}
    documentDetail={documentDetail}
    processSingle={true}
    processCondition={processCondition}
    percentRandom={false}
    waveProcess={false}
    columnsConfirm={columnsConfirm}
    areaDefault={() => 2}
    customComfirmStyle={(e) => {
      if (e.lvl === 0) {
        console.log(e.baseQty, e.totalPick)
        if (e.baseQty > e.totalPick)
          return { background: "#CFDCCE" }
      }
      else if (e.baseQty < e.totalPick)
        return { background: "#DCCECE" }
      else
        return {}
    }
    }
  />
}

export default ProcessQueue;