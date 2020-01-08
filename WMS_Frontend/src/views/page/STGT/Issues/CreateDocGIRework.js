import React, { useState, useEffect } from "react";

import AmCreateDocument from "../../../../components/AmCreateDocumentNew";

import {
  apicall,
  createQueryString
} from "../../../../components/function/CoreFunction";
import DocView from "../../../pageComponent/DocumentView"; //css

// import Axios from 'axios'
const Axios = new apicall();

export default props => {
  const [dataWarehouse, setDataWarehouse] = useState("");
  const [dataHeader, setDataHeader] = useState([]);
  const [table, setTable] = useState(null);

  const PalletCode = {
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: "PalletSto",
    q: '[{ "f": "EventStatus", "c":"=", "v": "12"}]', //เงื่อนไข '[{ "f": "Status", "c":"<", "v": 2}]'
    f:
      "ID,PalletCode as palletcode,Code,Batch,Name,Quantity,UnitCode,BaseUnitCode,LocationCode,LocationName,SKUItems,srmLine,OrderNo as orderNo",
    g: "",
    s: "[{'f':'ID','od':'ASC'}]",
    sk: 0,
    l: 100,
    all: ""
  };

  const columsFindpopUpPALC = [
    {
      Header: "Pallet Code",
      accessor: "palletcode",
      width: 110,
      Cell: e => <div style={{ textAlign: "center" }}>{e.value}</div>
    },
    {
      Header: "SRM Line",
      accessor: "srmLine",
      width: 95,
      Cell: e => <div style={{ textAlign: "center" }}>{e.value}</div>
    },
    { Header: "Reorder", accessor: "SKUItems", width: 350 },
    // { Header: "SKU Code", accessor: 'Code', width: 110 },
    // { Header: "SKU Name", accessor: 'Name', width: 170 },
    {
      Header: "Location",
      accessor: "LocationCode",
      width: 90,
      Cell: e => <div style={{ textAlign: "center" }}>{e.value}</div>
    },
    {
      Header: "Order No.",
      accessor: "orderNo",
      width: 100,
      Cell: e => <div style={{ textAlign: "center" }}>{e.value}</div>
    },
    // { Header: 'Batch', accessor: 'Batch' },

    { Header: "Quantity", accessor: "Quantity", width: 90 },
    { Header: "Unit", accessor: "BaseUnitCode", width: 70 }
  ];

  const addList = {
    queryApi: PalletCode,
    columns: columsFindpopUpPALC,
    search: [
      { accessor: "palletcode", placeholder: "Pallet Code" },
      { accessor: "Code", placeholder: "Reorder" },
      { accessor: "LocationCode", placeholder: "Location" },
      { accessor: "remark", placeholder: "Remark" }
    ]
  }

  //get api set dataWarehouse
  useEffect(() => {
    Axios.get(createQueryString(WarehouseQuery)).then(row => {
      if (row.data.datas && row.data.datas.length > 0) {
        setDataWarehouse(row.data.datas[0]);
      }
    });
  }, []);

  //set headerCreate check state dataWarehouse
  useEffect(() => {
    if (dataWarehouse !== "") {
      const headerCreates = [
        [
          { label: "Document No.", type: "labeltext", key: "", texts: "-" },
          { label: "Document Date", type: "date", key: "documentDate" }
        ],
        [
          {
            label: "Movement Type",
            type: "labeltext",
            key: "movementTypeID",
            texts: "FG_REWORK_WM",
            valueTexts: "1061"
          },
          { label: "Action Time", type: "dateTime", key: "actionTime" }
        ],
        [
          {
            label: "Source Warehouse",
            type: "labeltext",
            key: "souWarehouseID",
            texts: dataWarehouse.Name,
            valueTexts: dataWarehouse.ID
          },
          {
            label: "Destination Warehouse",
            type: "labeltext",
            key: "desWarehouseID",
            texts: dataWarehouse.Name,
            valueTexts: dataWarehouse.ID
          }
        ],
        [
          { label: "Doc Status", type: "labeltext", key: "", texts: "NEW" },
          { label: "Remark", type: "input", key: "remark" }
        ]
      ];
      setDataHeader(headerCreates);
    }
  }, [dataWarehouse]);

  useEffect(() => {
    if (dataHeader.length > 0) {
      setTable(
        <AmCreateDocument
          addList={addList}
          headerCreate={dataHeader}
          columns={columns}
          columnEdit={columnEdit}
          apicreate={apicreate}
          createDocType={"issue"}
          history={props.history}
          apiRes={apiRes}
        />
      );
    }
  }, [dataHeader]);



  // const UnitType = {
  //     queryString: window.apipath + "/v2/SelectDataMstAPI/",
  //     t: "UnitType",
  //     q: '', //เงื่อนไข '[{ "f": "Status", "c":"<", "v": 2}]'
  //     f: "ID,Code,Name",
  //     g: "",
  //     s: "[{'f':'ID','od':'ASC'}]",
  //     sk: 0,
  //     l: 100,
  //     all: ""
  // }

  const SKUMaster = {
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: "SKUMaster",
    q: '[{ "f": "Status", "c":"<", "v": 2}]',
    f:
      "ID,Code,Name,UnitCode,BaseUnitCode, ID as SKUID,concat(Code, ' : ' ,Name) as SKUItems, ID as SKUIDs,Code as skuCode",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
  };

  const WarehouseQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "Warehouse",
    q: '[{ "f": "Status", "c":"<", "v": 2},{ "f": "ID", "c":"=", "v": 1}]',
    f: "ID,Code,Name",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
  };

  const columsFindpopUpSKU = [
    {
      Header: "Code",
      accessor: "Code",
      fixed: "left",
      width: 100,
      sortable: true
    },
    { Header: "Name", accessor: "Name", width: 250, sortable: true }
  ];

  const columnEdit = [
    {
      Header: "Pallet Code",
      accessor: "palletcode",
      type: "findPopUp",
      idddl: "palletcode",
      queryApi: PalletCode,
      fieldLabel: ["palletcode"],
      columsddl: columsFindpopUpPALC
    },
    {
      Header: "Reorder",
      accessor: "SKUItems",
      type: "findPopUp",
      pair: "skuCode",
      idddl: "skuitems",
      queryApi: SKUMaster,
      fieldLabel: ["SKUItems"],
      columsddl: columsFindpopUpSKU
    },
    { Header: "Order No.", accessor: "orderNo", type: "input" },
    { Header: "Quantity", accessor: "quantity", type: "inputNum" },
    {
      Header: "Unit",
      accessor: "unitType",
      type: "text"
    }
  ];

  const columns = [
    { id: "row", Cell: row => row.index + 1, width: 35 },
    { Header: "Pallet Code", accessor: "palletcode", width: 110 },
    { Header: "SKU Item", accessor: "SKUItems" },
    { Header: "Order No.", accessor: "orderNo", width: 100 },
    { Header: "Quantity", accessor: "quantity", width: 90 },
    { Header: "Unit", accessor: "unitType", width: 70 }
  ];

  const apicreate = "/v2/CreateGIDocAPI/"; //API สร้าง Doc
  const apiRes = "/issue/detail?docID="; //path หน้ารายละเอียด ตอนนี้ยังไม่เปิด

  return table;
};
