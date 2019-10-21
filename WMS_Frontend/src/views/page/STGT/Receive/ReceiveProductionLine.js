import React, { useState, useEffect } from "react";
import {
  ExplodeRangeNum,
  MergeRangeNum,
  ToRanges,
  match
} from "../../../../components/function/RangeNumUtill";
import AmMappingPallet from "../../../pageComponent/AmMappingPallet";
import AmMappingPallet2 from "../../../pageComponent/AmMappingPallet2";
import AmDialogs from "../../../../components/AmDialogs";
import queryString from "query-string";
import * as SC from "../../../../constant/StringConst";

// const Axios = new apicall()

const CustomerQuery = {
  queryString: window.apipath + "/v2/SelectDataMstAPI/",
  t: "Customer",
  q: '[{ "f": "Status", "c":"<", "v": 2}]',
  f: "*",
  g: "",
  s: "[{'f':'ID','od':'asc'}]",
  sk: 0,
  l: 100,
  all: ""
};
const CustomerReturnPalletByBarcode = props => {
  const {} = props;

  const inputWarehouse = {
    visible: true,
    field: "warehouseID",
    typeDropdown: "normal",
    name: "Warehouse",
    placeholder: "Select Warehouse",
    fieldLabel: ["Code", "Name"],
    fieldDataKey: "ID",
    defaultValue: 1,
    customQ: "{ 'f': 'ID', 'c':'=', 'v': 1}"
  };
  const inputArea = {
    visible: true,
    field: "areaID",
    typeDropdown: "normal",
    name: "Area",
    placeholder: "Select Area",
    fieldLabel: ["Code", "Name"],
    fieldDataKey: "ID",
    defaultValue: 13,
    customQ: "{ 'f': 'ID', 'c':'=', 'v': 13}"
  };

  const inputSource = [
    {
      field: SC.OPT_SOU_CUSTOMER_ID,
      type: "dropdown",
      typeDropdown: "search",
      name: "Sou.Customer",
      dataDropDown: CustomerQuery,
      placeholder: "Select Customer",
      fieldLabel: ["Code", "Name"],
      fieldDataKey: "ID",
      required: true
    }
  ];

  const inputItem = [
    {
      field: SC.OPT_REMARK,
      type: "input",
      name: "Remark",
      placeholder: "Remark",
      isFocus: true
    },
    {
      field: SC.OPT_DONE_DES_EVENT_STATUS,
      type: "radiogroup",
      name: "Status",
      fieldLabel: [{ value: "12", label: "RECEIVED" }],
      defaultValue: { value: "12", disabled: true }
    },
    {
      field: "scanCode",
      type: "input",
      name: "Scan Code",
      placeholder: "Scan Code",
      maxLength: 31,
      required: true,
      clearInput: true
    }
  ];

  const [showDialog, setShowDialog] = useState(null);
  const [stateDialog, setStateDialog] = useState(false);
  const [msgDialog, setMsgDialog] = useState("");
  const [typeDialog, setTypeDialog] = useState("");

  const customOptions = value => {
    var qryStr = queryString.parse(value);
    var res = [
      {
        text: "CN",
        value: qryStr[SC.OPT_CARTON_NO],
        textToolTip: "Carton No."
      }
    ];
    // , {
    // text: 'MVT',
    // value: QryStrGetValue(value, 'MVT'),
    // styleAvatar: {
    //     backgroundColor: '#1769aa'
    // }

    return res;
  };
  function onOldValue(storageObj) {
    let oldValue = [];
    if (storageObj) {
      let qryStrOpt_root = queryString.parse(storageObj.options);
      oldValue = [
        {
          field: "warehouseID",
          value: storageObj.warehouseID
        },
        {
          field: "areaID",
          value: storageObj.areaID
        },
        {
          field: SC.OPT_DONE_DES_EVENT_STATUS,
          value: qryStrOpt_root[SC.OPT_DONE_DES_EVENT_STATUS]
        },
        {
          field: SC.OPT_REMARK,
          value: qryStrOpt_root[SC.OPT_REMARK]
            ? qryStrOpt_root[SC.OPT_REMARK]
            : ""
        },
        {
          field: "scanCode",
          value: ""
        }
      ];
    }
    return oldValue;
  }
  async function onBeforePost(reqValue, storageObj, curInput) {
    var resValuePost = null;
    var dataScan = {};
    if (reqValue) {
      let orderNo = null;
      let skuCode = null;
      let cartonNo = null;
      let SOU_CUSTOMER_ID = null;
      let rootID = reqValue.rootID;
      let qryStrOpt = {};

      if (storageObj) {
        if (reqValue["scanCode"]) {
          if (reqValue["scanCode"].trim().length === 31) {
            orderNo = reqValue["scanCode"].substr(0, 7);
            let skuCode1 = reqValue["scanCode"].substr(7, 20);
            if (skuCode1.includes("@")) {
              skuCode = skuCode1.replace(/\@/g, " ");
            } else {
              skuCode = skuCode1;
            }
            skuCode = skuCode.trim();
            cartonNo = parseInt(reqValue["scanCode"].substr(27, 4));

            if (storageObj.mapstos !== null && storageObj.mapstos.length > 0) {
              let dataMapstos = storageObj.mapstos[0];
              qryStrOpt = queryString.parse(dataMapstos.options);
              if (
                skuCode !== dataMapstos.code ||
                orderNo !== dataMapstos.orderNo
              ) {
                alertDialogRenderer(
                  "The new product doesn't match the previous product on the pallet.",
                  "error",
                  true
                );
                skuCode = null;
                orderNo = null;
              }
              if (rootID && skuCode && orderNo) {
                let oldOptions = qryStrOpt[SC.OPT_CARTON_NO];
                let resCartonNo = ExplodeRangeNum(oldOptions);
                let splitCartonNo = resCartonNo.split(",").map((x, i) => {
                  return (x = parseInt(x));
                });
                let lenSplitCartonNo = splitCartonNo.length;
                let numCarton = 0;
                if (reqValue.action === 2) {
                  var indexCartonNo = splitCartonNo.indexOf(cartonNo);
                  if (indexCartonNo < 0) {
                    alertDialogRenderer(
                      "This Carton No. " +
                        cartonNo +
                        " doesn't exist in pallet.",
                      "error",
                      true
                    );
                    cartonNo = null;
                  } else {
                    splitCartonNo.splice(indexCartonNo, 1);
                    if (splitCartonNo.length === 0) {
                      cartonNo = "0";
                    } else if (splitCartonNo.length == 1) {
                      cartonNo = splitCartonNo[0].toString();
                    } else {
                      var rangcartonNo = ToRanges(splitCartonNo);
                      cartonNo = rangcartonNo.join();
                    }
                  }
                } else {
                  for (let no in splitCartonNo) {
                    numCarton++;

                    if (cartonNo === parseInt(splitCartonNo[no])) {
                      ///เลขcarton no ซ้ำ รับเข้าไม่ได้ วางสินค้าลงบนพาเลทไม่ได้

                      alertDialogRenderer(
                        "Pallet No. " +
                          storageObj.code +
                          " had SKU Code: " +
                          skuCode +
                          " and Carton No." +
                          cartonNo.toString() +
                          " already",
                        "error",
                        true
                      );

                      cartonNo = null;
                      break;
                    } else {
                      if (numCarton === lenSplitCartonNo) {
                        cartonNo = MergeRangeNum(
                          resCartonNo + "," + cartonNo.toString()
                        );
                      } else {
                        continue;
                      }
                    }
                  }
                }
              }
            }

            if (cartonNo && rootID && skuCode && orderNo) {
              qryStrOpt[SC.OPT_CARTON_NO] = cartonNo.toString();
              let qryStr1 = queryString.stringify(qryStrOpt);
              let uri_opt = decodeURIComponent(qryStr1);

              dataScan = {
                allowSubmit: true,
                orderNo: orderNo,
                scanCode: skuCode,
                options: cartonNo === "0" ? null : uri_opt,
                validateSKUTypeCodes: ["FG"]
              };

              resValuePost = { ...reqValue, ...dataScan };
            } else {
              if (rootID === null) {
                alertDialogRenderer(
                  "Please scan the pallet before scanning the product.",
                  "error",
                  true
                );
              }
            }
          } else {
            if (reqValue.action === 2) {
              reqValue.scanCode = reqValue.scanCode.trim();
              if (storageObj.code === reqValue.scanCode) {
                resValuePost = { ...reqValue, allowSubmit: true };
              }
            } else {
              alertDialogRenderer(
                "Please scan code of product.",
                "error",
                true
              );
              resValuePost = { ...reqValue, allowSubmit: false };
            }
          }
        } else {
          resValuePost = { ...reqValue, allowSubmit: false };
        }
      } else {
        resValuePost = { ...reqValue, allowSubmit: false };
      }
    }
    return resValuePost;
  }
  const alertDialogRenderer = (message, type, state) => {
    setMsgDialog(message);
    setTypeDialog(type);
    setStateDialog(state);
  };
  useEffect(() => {
    if (typeDialog && msgDialog && stateDialog) {
      setShowDialog(
        <AmDialogs
          typePopup={typeDialog}
          content={msgDialog}
          onAccept={e => {
            setStateDialog(e);
          }}
          open={stateDialog}
        ></AmDialogs>
      );
    } else {
      setShowDialog(null);
    }
  }, [stateDialog, msgDialog, typeDialog]);
  return (
    <div>
      {stateDialog ? (showDialog ? showDialog : null) : null}
      <AmMappingPallet
        showWarehouseDDL={inputWarehouse}
        showAreaDDL={inputArea}
        //sourceCreate={inputSource}
        itemCreate={inputItem} //input scan pallet
        onBeforePost={onBeforePost}
        customOptions={customOptions}
        showOptions={true}
        setVisibleTabMenu={[null, "Add", "Remove"]}
        //setMovementType={"1012"}
        autoPost={true}
        piCreate={"/v2/ScanReceivedProductionLineAPI"}
        showOldValue={onOldValue}
      />
    </div>
  );
};
export default CustomerReturnPalletByBarcode;
