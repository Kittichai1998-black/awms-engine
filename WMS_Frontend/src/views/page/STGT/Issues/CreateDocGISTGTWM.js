import React, { useState, useEffect } from "react";

import AmCreateDocument from "../../../../components/AmCreateDocument";
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
            texts: "FG_TRANSFER_WM",
            valueTexts: "1011"
          },
          { label: "Action Time", type: "dateTime", key: "actionTime" }
        ],
        [
          {
            label: "Source Warehouse",
            type: "labeltext",
            key: "souWarehuoseID",
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
          typeAdd={"sku"}
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

  const PalletCode = {
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: "PalletSto",
    q: "", //เงื่อนไข '[{ "f": "Status", "c":"<", "v": 2}]'
    f:
      "ID,BaseCode,PackCode,Batch,Name,Quantity,UnitCode,BaseUnitCode,concat(BaseCode, ' : ' ,Name) as SKUItems",
    g: "",
    s: "[{'f':'ID','od':'ASC'}]",
    sk: 0,
    l: 100,
    all: ""
  };

  const UnitType = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "UnitType",
    q: "", //เงื่อนไข '[{ "f": "Status", "c":"<", "v": 2}]'
    f: "ID,Code,Name",
    g: "",
    s: "[{'f':'ID','od':'ASC'}]",
    sk: 0,
    l: 100,
    all: ""
  };

  const SKUMaster = {
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: "SKUMaster",
    q: '[{ "f": "Status", "c":"<", "v": 2}]',
    f:
      "ID,Code,Name,UnitTypeCode, ID as SKUID,concat(Code, ' : ' ,Name) as SKUItems, ID as SKUIDs,Code as skuCode",
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

  const columsFindpopUpPALC = [
    {
      Header: "Pallet Code",
      accessor: "BaseCode",
      fixed: "left",
      width: 200,
      sortable: true
    },
    { Header: "SKU Code", accessor: "PackCode", width: 200, sortable: true },
    { Header: "SKU Name", accessor: "Name", width: 200, sortable: true },
    { Header: "Batch", accessor: "Batch", width: 200, sortable: true },
    { Header: "Qty", accessor: "Quantity", width: 200, sortable: true },
    { Header: "Unit", accessor: "UnitCode", width: 200, sortable: true }
  ];

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
      accessor: "BaseCode",
      type: "findPopUp",
      idddl: "palletcode",
      queryApi: PalletCode,
      fieldLabel: ["BaseCode"],
      columsddl: columsFindpopUpPALC
    },
    {
      Header: "SKU Item",
      accessor: "SKUItems",
      type: "findPopUp",
      pair: "skuCode",
      idddl: "skuitems",
      queryApi: SKUMaster,
      fieldLabel: ["SKUItems"],
      columsddl: columsFindpopUpSKU
    },
    { Header: "Batch", accessor: "batch", type: "input" },
    { Header: "Quantity", accessor: "quantity", type: "inputNum" },
    {
      Header: "Unit",
      accessor: "unitType",
      type: "dropdown",
      fieldLabel: ["Code"],
      idddl: "unitType"
    }
  ];

  const columns = [
    { Header: "Pallet Code", accessor: "BaseCode" },
    { Header: "SKU Item", accessor: "SKUItems" },
    { Header: "Batch", accessor: "batch" },
    { Header: "Quantity", accessor: "quantity" },
    { Header: "Unit", accessor: "unitType" }
  ];

  const apicreate = "/v2/CreateGIDocAPI/"; //API สร้าง Doc
  const apiRes = "/issue/detail?docID="; //path หน้ารายละเอียด ตอนนี้ยังไม่เปิด

  return table;
};
