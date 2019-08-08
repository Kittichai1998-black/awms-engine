import React, { Component, useState, useEffect } from "react";
import AmCreateDocument from "../../../../components/AmCreateDocument";
import {
  apicall,
  createQueryString
} from "../../../../components/function/CoreFunction";
import axios from "axios";
import Clone from "../../../../components/function/Clone";
const Axios = new apicall();

const CreateDocPI = props => {
  const [dataWarehouse, setDataWarehouse] = useState("");
  const [dataMovementType, setDataMovementType] = useState("");
  const [dataTest, setDataTest] = useState([]);
  const [table, setTable] = useState(null);
  useEffect(() => {
    Axios.get(createQueryString(WarehouseQuery)).then(row => {
      if (row.data.datas) {
        setDataWarehouse(row.data.datas[0].Name);
      }
    });

    Axios.get(createQueryString(MovementTypeQuery)).then(res => {
      if (res.data.datas) {
        setDataMovementType(res.data.datas[0].Name);
      }
    });
  }, []);

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
            texts: "FG_PHYSICAL_COUNT_WM ",
            valueTexts: "1041"
          },
          { label: "Action Time", type: "dateTime", key: "actionTime" }
        ],
        [
          {
            label: "Source Warehouse",
            type: "labeltext",
            key: "souWarehouseID",
            texts: dataWarehouse,
            valueTexts: "1"
          },
          {
            label: "Destination Warehouse",
            type: "labeltext",
            key: "desWarehouseID",
            texts: dataWarehouse,
            valueTexts: "1"
          }
        ],
        [
          { label: "Doc Status", type: "labeltext", key: "", texts: "New" },
          { label: "Remark", type: "input", key: "remark" }
        ]
        //[{ Header: "SKU Items", accessor: 'SKUItems', type: "dropdown", pair: "SKUIDs", idddl: "skuitems", queryApi: SKUMaster, fieldLabel: ["Code", "Name"] },{ label: "", type: "", key: "",texts: "" },]
      ];
      setDataTest(headerCreates);
    }
  }, [dataWarehouse, dataMovementType]);

  useEffect(() => {
    if (dataTest.length > 0) {
      setTable(
        <AmCreateDocument
          headerCreate={dataTest}
          columns={columns}
          columnEdit={columnEdit}
          apicreate={apicreate}
          createDocType={"audit"}
          history={props.history}
          apiRes={apiRes}
        />
      );
    }
  }, [dataTest]);

  const SKUMaster = {
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: "SKUMaster",
    q: '[{ "f": "Status", "c":"<", "v": 2}]',
    f:
      "ID,Code,Name,UnitTypeCode,concat(Code, ':' ,Name) as SKUItem, ID as SKUID,concat(Code, ':' ,Name) as SKUItems, ID as SKUIDs,Code as skuCode",
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

  const AreaLocationMaster = {
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: "AreaLocationMaster",
    q: '[{ "f": "Status", "c":"<", "v": 2}]',
    f: "ID,Code AS locationcode,Name,Code",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
  };
  const MovementTypeQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "MovementType",
    q: '[{ "f": "Status", "c":"<", "v": 2},{ "f": "ID", "c":"=", "v": 1041}]',
    f: "ID,Code,Name",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
  };

  const columsFindpopUp = [
    {
      Header: "Code",
      accessor: "Code",
      fixed: "left",
      width: 130,
      sortable: true
    },
    {
      Header: "Name",
      accessor: "Name",
      width: 200,
      sortable: true
    }
  ];

  const columnEdit = [
    { Header: "Pallet Code", accessor: "palletcode", type: "input" },
    {
      Header: "Location",
      accessor: "locationcode",
      type: "findPopUp",
      pair: "locationcode",
      idddl: "locationcode",
      queryApi: AreaLocationMaster,
      fieldLabel: ["Code", "Name"],
      columsddl: columsFindpopUp
    },
    {
      Header: "SKU Item",
      accessor: "SKUItems",
      type: "findPopUp",
      pair: "skuCode",
      idddl: "skuitems",
      queryApi: SKUMaster,
      fieldLabel: ["Code", "Name"],
      columsddl: columsFindpopUp
    },
    { Header: "OrderNO", accessor: "orderNo", type: "input" },
    {
      Header: "Counting (%)",
      accessor: "qtyrandom",
      type: "inputNum",
      TextInputnum: "%"
    }
  ];

  const columns = [
    { Header: "Pallet Code", accessor: "palletcode", width: 100 },
    { Header: "Location", accessor: "locationcode", width: 100 },
    { Header: "SKU Item", accessor: "SKUItems" },
    { Header: "Order NO", accessor: "orderNo", width: 100 },
    { Header: "Counting (%)", accessor: "qtyrandom", width: 100 },
    { Header: "Unit", accessor: "unitType", type: "unitType", width: 70 }
  ];

  const apicreate = "/v2/CreateADDocAPI/"; //API ���ҧ Doc
  const apiRes = "/counting/detail?docID="; //path ˹����������´ �͹����ѧ����Դ

  return (
    <div>
      {table}
      <div />
    </div>
  );
};

export default CreateDocPI;
