import React, { Component, useEffect, useState } from "react";

import { AmEditorTable } from "../../../../components/table";

import {
  apicall,
  createQueryString
} from "../../../../components/function/CoreFunction";
import styled from "styled-components";
import AmCreateDocument from "./AmCreateDocument";
import AmButton from "../../../../components/AmButton";
import AmInput from "../../../../components/AmInput";
import Grid from "@material-ui/core/Grid";

const FormInline = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  label {
    margin: 5px 5px 5px 0;
  }
  input {
    vertical-align: middle;
  }
  @media (max-width: 800px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const LabelH = styled.label`
  font-weight: bold;
  width: 200px;
`;

const InputDiv = styled.div`
  margin: 5px;
  @media (max-width: 800px) {
    margin: 0;
  }
`;

const Axios = new apicall();

const AmCreateDocumentR2 = props => {
  const [sapResponse, setSAPResponse] = useState([]);
  const [editData, setEditData] = useState({});
  const [editPopup, setEditPopup] = useState(false);
  const [sapReq, setSAPReq] = useState([]);
  const [headerData, setHeaderData] = useState([]);
  
  const [reload, setRelaod] = useState();
  const [remove, setRemove] = useState()

  useEffect(()=>{
    const onHandleDelete = row => {
      let del = [...sapResponse].filter(x=>x.RSNUM !== row.RSNUM);
      setSAPResponse([...del]);
      setRelaod({});
    };
    if(remove !== null || remove !== undefined){
      onHandleDelete(remove);
    }
  }, [remove])

  const headerCreates = [
    [
      { label: "Document No.", type: "labeltext", key: "sapdoc", texts: "-" },
      { label: "Document Date", type: "dateTime", key: "documentDate" }
    ],
    [
      {
        label: "Movement Type",
        type: "labeltext",
        key: "movementTypeID",
        texts: "STO_TRANSFER",
        valueTexts: "5010"
      },
      { label: "Action Time", type: "dateTime", key: "actionTime" }
    ],
    [
      {
        label: "Source Warehouse",
        type: "labeltext",
        key: "souWarehouseID",
        texts: "Warehouse1/ASRS",
        valueTexts: 1
      }
    ],
    [
      { label: "Doc Status", type: "labeltext", key: "", texts: "New" },
      {
        label: "Mode",
        type: "labeltext",
        key: "ref1",
        texts: "R2-เบิกเต็มพาเลทตามใบ Resvation เพื่อผลิต",
        valueTexts: "R02"
      }
    ]
  ];

  var columnsModify = [
    {
      Header: "Reservation",
      accessor: "RSNUM"
    },
    {
      Header: "Material",
      accessor: "MATNR"
    },
    {
      Header: "Batch",
      accessor: "CHARG"
    },
    {
      Header: "Quantity",
      accessor: "BDMNG"
    },
    {
      Header: "Unit",
      accessor: "MEINS"
    },
    {
      Header: "BIN",
      accessor: "LGPLA"
    },
    {
      Header: "MVT",
      accessor: "BWLVS"
    },
    {
      Header: "UR",
      accessor: "BESTQ_UR"
    },
    {
      Header: "QI",
      accessor: "BESTQ_QI"
    },
    {
      Header: "Blocked",
      accessor: "BESTQ_BLK"
    },
    {
      Header: "",
      Cell: e => {
        return (
          <AmButton
            styleType="delete"
            onClick={() => setRemove(e.original)}
          >
            Remove
          </AmButton>
        );
      }
    }
  ];

  const apicreate = "/v2/CreateGIDocAPI/"; //API สร้าง Doc
  const apiRes = "/issue/detail?docID=";

  const sapConnectorR2 = postData => {
    //setSAPResponse([{RSNUM:111}, {RSNUM:222}])
    Axios.post(window.apipath + "/v2/SAPZWMRF003R2API", postData).then(res => {
      if (res.data._result.status === 1) {
        var sapRes  = [...sapResponse].concat(res.data.datas)

        var sap = sapRes.filter((x, index, self) =>
          index === self.findIndex((t) => x.RSNUM === t.RSNUM)
        )
        setSAPResponse(sap);
      } else {
      }
    });
  };

  const onHandleEditConfirm = (status, rowdata) => {
    if (status) {
      var postData = {};
      sapReq.forEach(x => {
        postData[x.field] = x.value;
      });
      postData["_token"] = localStorage.getItem("Token");
      sapConnectorR2(postData);
    }
    setEditPopup(false);
  };

  const onChangeEditor = (field, value) => {
    setSAPReq([{ field: field, value: value }]);
  };

  const editorList = [
    {
      field: "Reservation Number",
      component: (data, cols, key) => {
        return (
          <FormInline>
            <LabelH>Reservation Number : </LabelH>
            <InputDiv>
              <AmInput
                defaultValue={data ? data.Name2 : ""}
                onChange={value => {
                  onChangeEditor("RSNUM", value);
                }}
              />
            </InputDiv>
          </FormInline>
        );
      }
    }
  ];

  const CreateDocument = () => {
    var groupMVT = sapResponse.map((item, idx) => {
        return item.BWLVS;
      })
      .filter((value, index, self) => self.indexOf(value) === index)
      .join(",");

    let document = {
      actionTime:
        headerData.actionTime === undefined ? null : headerData.actionTime,
      forCustomerID:
        headerData.forCustomerID === undefined
          ? null
          : headerData.forCustomerID,
      forCustomerCode:
        headerData.forCustomerCode === undefined
          ? null
          : headerData.forCustomerCode,
      batch: headerData.batch === undefined ? null : headerData.batch,
      lot: headerData.lot === undefined ? null : headerData.lot,
      orderno: headerData.orderno === undefined ? null : headerData.orderno,
      souSupplierID:
        headerData.souSupplierID === undefined
          ? null
          : headerData.souSupplierID,
      souCustomerID:
        headerData.souCustomerID === undefined
          ? null
          : headerData.souCustomerID,
      souBranchID:
        headerData.souBranchID === undefined ? null : headerData.souBranchID,
      souAreaMasterID:
        headerData.souAreaMasterID === undefined
          ? null
          : headerData.souAreaMasterID,
      souSupplierCode:
        headerData.souSupplierCode === undefined
          ? null
          : headerData.souSupplierCode,
      souCustomerCode:
        headerData.souCustomerCode === undefined
          ? null
          : headerData.souCustomerCode,
      souBranchCode:
        headerData.souBranchCode === undefined
          ? null
          : headerData.souBranchCode,
      souWarehouseID:
        headerData.souWarehouseID === undefined ? 1 : headerData.souWarehouseID,
      souAreaMasterCode:
        headerData.souAreaMasterCode === undefined
          ? null
          : headerData.souAreaMasterCode,
      desBranchID:
        headerData.desBranchID === undefined ? null : headerData.desBranchID,
      desWarehouseID:
        headerData.desWarehouseID === undefined
          ? null
          : headerData.desWarehouseID,
      desAreaMasterID:
        headerData.desAreaMasterID === undefined
          ? null
          : headerData.desAreaMasterID,
      desBranchCode:
        headerData.desBranchCode === undefined
          ? null
          : headerData.desBranchCode,
      desCustomerID:
        headerData.desCustomerID === undefined
          ? null
          : headerData.desCustomerID,
      desSupplierID:
        headerData.desSupplierID === undefined
          ? null
          : headerData.desSupplierID,
      desWarehouseCode:
        headerData.issueItems === undefined ? null : headerData.issueItems,
      desAreaMasterCode:
        headerData.desAreaMasterCode === undefined
          ? null
          : headerData.desAreaMasterCode,
      documentDate:
        headerData.documentDate === undefined ? null : headerData.documentDate,
      movementTypeID:
        headerData.movementTypeID === undefined
          ? null
          : headerData.movementTypeID,
      ref1: "R02",
      ref2: groupMVT,
      refID: sapResponse.length > 0 ? sapResponse.map(x=>x.RSNUM).join(',') : null,
      remark: headerData.remark === undefined ? null : headerData.remark,
      receiveItems:
        headerData.receiveItems === undefined ? null : headerData.receiveItems
    };

    let documentItem = sapResponse.map((item, idx) => {
      let options =
        "bestq_ur=" +
        item.BESTQ_UR +
        "&bestq_qi=" +
        item.BESTQ_QI +
        "&rsnum=" +
        item.RSNUM +
        "&lgtyp=" +
        item.LGTYP +
        "&bestq_blk=" +
        item.BESTQ_BLK +
        "&lgpla=" +
        item.LGPLA;

      if (item.LENUM !== "" && item.LENUM !== null) {
        options = options + "&lgpla=" + item.LENUM;
      }
      return {
        ID: null,
        skuCode: item.MATNR.replace(/^0+/, ''),
        packCode: item.MATNR.replace(/^0+/, ''),
        quantity: item.BDMNG,
        unitType: item.MEINS,
        batch: item.CHARG,
        ref1: "R02",
        ref2: item.BWLVS,
        refID: item.RSNUM,
        options: options
      };
    });

    document.issueItems = documentItem;

    let documentData = {
      document: document,
      docItem: documentItem
    };
    return documentData;
  };
  

  const customAdd = () => {
    return (
      <AmEditorTable
        style={{ width: "600px", height: "500px" }}
        titleText={"Add"}
        open={editPopup}
        onAccept={(status, rowdata) => onHandleEditConfirm(status, rowdata)}
        data={editData}
        columns={editorList}
      />
    );
  };

  return (
    <div>
      <AmCreateDocument
        headerCreate={headerCreates} //ข้อมูลตรงด้านบนตาราง
        //columnsModifi={columnsModifi} //ใช้เฉพาะหน้าที่ต้องทำปุ่มเพิ่มขึ้นมาใหม่
        columns={[]} //colums
        reload={reload}
        columnEdit={[]} //ข้อมูลที่จะแก้ไขใน popUp
        apicreate={apicreate} //api ที่จะทำการสร้างเอกสาร
        createDocType={"custom"} //createDocType มี audit issue recive
        history={props.history} //ส่ง porps.history ไปทุกรอบ
        apiRes={apiRes} //หน้ารายละเอียดเอกสาร
        //btnProps={btnAdd}  //ปุ่มที่ส่งเข้าไป
        //dataSource={dataSou} //ข้อมูลที่จัดการจากปุ่มที่ส่งเข้าไป
        // dataCreate={} //dataที่จะส่งไปสร้างเอกสาร

        //customEditData={(editData)=> setEditData(editData)}
        customAddBtnRender={
          <AmButton
            className="float-right"
            styleType="add"
            style={{ width: "150px" }}
            onClick={() => setEditPopup(true)}
          >
            Add
          </AmButton>
        }
        customAddComponentRender={customAdd()}
        customDataSource={sapResponse}
        customTableColumns={columnsModify}
        customDocumentData={CreateDocument()}
        customGetHeaderData={headerData => setHeaderData(headerData)}
      />

      <div />
    </div>
  );
};

export default AmCreateDocumentR2;
