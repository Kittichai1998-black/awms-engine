import React, { useState, useEffect, useContext } from "react";
import AmProcessQueue from "../../../../components/AmProcessQueue";
import Axios from "axios";

const createQueryString = select => {
  let queryS =
    select.queryString +
    (select.t === "" ? "?" : "?t=" + select.t) +
    (select.q === "" ? "" : "&q=" + select.q) +
    (select.f === "" ? "" : "&f=" + select.f) +
    (select.g === "" ? "" : "&g=" + select.g) +
    (select.s === "" ? "" : "&s=" + select.s) +
    (select.sk === "" ? "" : "&sk=" + select.sk) +
    (select.l === 0 ? "" : "&l=" + select.l) +
    (select.all === "" ? "" : "&all=" + select.all) +
    "&isCounts=true" +
    "&apikey=free01";
  return queryS;
};
const WorkQueueAAIR6 = props => {
  const AreaMaster = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "AreaMaster",
    q:
      '[{ "f": "Name", "c":"in", "v": "Out Full Right,Out Full Left"},{ "f": "Status", "c":"=", "v": 1}]',
    f: "ID,Code,Name",
    g: "",
    s: "[{'f':'ID','od':'desc'}]",
    sk: 0,
    l: 100,
    all: ""
  };

  const Warehouse = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "Warehouse",
    q: '[{ "f": "Status", "c":"=", "v": 1}]',
    f: "ID,Code,Name",
    g: "",
    s: "[{'f':'ID','od':'desc'}]",
    sk: 0,
    l: 100,
    all: ""
  };

  const orderDDL = [
    { label: "FIFO", value: "FIFO" },
    { label: "LIFO", value: "LIFO" }
  ];

  const ordersDDL = [
    { label: "createtime", value: "createtime" },
    { label: "Batch", value: "Batch" }
  ];

  const Priolity = [
    { label: "Very Low", value: "0" },
    { label: "Low", value: "1" },
    { label: "Normal", value: "2" },
    { label: "High", value: "3" },
    { label: "Very High", value: "4" },
    { label: "Critical", value: "5" }
  ];

  const Document = {
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: "Document",
    q:
      '[{ "f": "Status", "c":"=", "v": 1},{ "f": "EventStatus", "c":"=", "v": 10},{ "f": "DocumentType_ID", "c":"=", "v": 1002}]',
    f: "ID as value, Code as label, ID, Code",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
  };

  const columnCondition = [
    { Header: "Batch", accessor: "Batch", type: "input", field: "Batch" },
    // { Header: "Lot", accessor: "Lot", type: "input", field: "Lot" },
    //{ Header: "Order", accessor: "OrderNo", type: "input", field: "OrderNo" },
    {
      Header: "Qty",
      accessor: "BaseQuantity",
      type: "inputnum",
      field: "BaseQuantity"
    },
    {
      Header: "Unit",
      accessor: "UnitType_Name",
      type: "unitType",
      field: "Unit"
    }
  ];

  const columnSort = [
    {
      Header: "Order ",
      accessor: "Order",
      type: "dropdown",
      field: "Order",
      dataDDL: orderDDL,
      idddls: "Order"
    },
    {
      Header: "By",
      accessor: "By",
      type: "dropdown",
      field: "By",
      dataDDL: ordersDDL,
      idddls: "By"
    }
  ];

  const DefaulSorting = [
    {
      By: "createtime",
      ID: -1,
      Order: "FIFO"
    }
  ];

  const columnConfirm = [
    { Header: "SKU", accessor: "SKU", width: 200 },
    { Header: "Pallet", accessor: "Pallet", width: 200 },
    { Header: "Batch", accessor: "Batch" },
    { Header: "Qty", accessor: "BaseQuantity", Footer: true },
    { Header: "Unit", accessor: "Unit" }
  ];

  const ProcessQ = [
    {
      Label: "Destination Area",
      key: "desASRSAreaName",
      type: "dropdownapi",
      fieldLabel: ["Code", "Name"],
      idddls: "desASRSAreaName",
      queryApi: AreaMaster
    }
  ];

  return (
    <div>
      <AmProcessQueue
        orderDDL={orderDDL}
        ordersDDL={ordersDDL}
        columnCondition={columnCondition}
        columnSort={columnSort}
        columnConfirm={columnConfirm}
        ProcessQ={ProcessQ}
        DefaulSorting={DefaulSorting}
        history={props.history}
        apiwarehouse={Warehouse}
        advanceCondition={true}
        //fullPallet={true}
        //receive={true}
        priolity={Priolity}
        DocType={1002}
        docType={"issue"}
        status={true}
        random={false}
        dataSortShow={true}
        apidetail={"/issue/detail?docID="}
        apiResConfirm={"/issue/managequeue"}
        //Advance Conditions
        // ShelfLifeDate={true}
        // defaultShelfLifeDate={true}
        // disibleShelfLifeDate={false}

        FullPallet={true}
        defaultFullPallete={true}
        disibleFullPallet={true}
        checkedFullPallet={true}
        ExpireDate={true}
        defaultExpireDate={false}
        disibleExpireDate={false}
        IncubateDate={true}
        defaultIncubateDate={false}
        disibleIncubateDate={false}
        //Status from Doc  ʶҹз������Ҩҡ Options
        OptionGIdoc={true}
        ConditionsQryDoc="{ 'f': 'Ref1', c: '=', 'v': 'R06' }"
      ></AmProcessQueue>
    </div>
  );
};

export default WorkQueueAAIR6;
