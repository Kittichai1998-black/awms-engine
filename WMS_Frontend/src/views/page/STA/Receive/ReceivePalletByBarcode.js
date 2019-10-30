import React, { useState, useEffect } from "react";
import { ExplodeRangeNum, MergeRangeNum, ToRanges } from '../../../../components/function/RangeNumUtill';
import AmMappingPallet from '../../../pageComponent/AmMappingPallet';
import AmDialogs from '../../../../components/AmDialogs'
import queryString from 'query-string'
import * as SC from '../../../../constant/StringConst'
import { CustomInfoChip, OnOldValueWH } from '../CustomComponent/CustomInfo'
// const Axios = new apicall()

const WarehouseQuery = {
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: "Warehouse",
    q: '[{ "f": "Status", "c":"=", "v": 1}]',
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'asc'}]",
    sk: 0,
    l: 100,
    all: "",
}
const ReceivePallet = (props) => {
    const { } = props;

    const inputWarehouse = { "visible": true, "field": "warehouseID", "typeDropdown": "normal", "name": "Warehouse", "placeholder": "Select Warehouse", "fieldLabel": ["Code", "Name"], "fieldDataKey": "ID", "defaultValue": 1, "customQ": "{ 'f': 'ID', 'c':'=', 'v': 1}" };
    const inputArea = { "visible": true, "field": "areaID", "typeDropdown": "normal", "name": "Area", "placeholder": "Select Area", "fieldLabel": ["Code", "Name"], "fieldDataKey": "ID", "defaultValue": 13, "customQ": "{ 'f': 'ID', 'c':'=', 'v': 13}" };
 
    const inputSource = [
        { "field": SC.OPT_SOU_WAREHOUSE_ID, "type": "dropdown", "typeDropdown": "normal", "name": "Sou.Warehouse", "dataDropDown": WarehouseQuery, "placeholder": "Select Warehouse", "fieldLabel": ["Code", "Name"], "fieldDataKey": "ID", "defaultValue": 1, "required": true },
    ]
    const inputItem = [
        { "field": SC.OPT_REMARK, "type": "input", "name": "Remark", "placeholder": "Remark", "isFocus": true },
        {
            "field": SC.OPT_DONE_DES_EVENT_STATUS, "type": "radiogroup", "name": "Status", "fieldLabel": [
                { value: '98', label: "QC" },
                { value: '12', label: "RECEIVED" },

            ],
            "defaultValue": { value: '98' }
        },
        { "field": "scanCode", "type": "input", "name": "Scan Code", "placeholder": "Scan Code", "maxLength": 26, "required": true, "clearInput": true }
    ]
    const [showDialog, setShowDialog] = useState(null);
    const [stateDialog, setStateDialog] = useState(false);
    const [msgDialog, setMsgDialog] = useState("");
    const [typeDialog, setTypeDialog] = useState("");
  
    async function onBeforePost(reqValue, storageObj, curInput) {
        var resValuePost = null;
        var dataScan = {};
        if (reqValue) {
            let orderNo = null;
            let skuCode = null;
            let cartonNo = null;
            let SOU_WAREHOUSE_ID = null;
            let rootID = reqValue.rootID;
            let qryStrOpt = {};

            if (storageObj) {
                if (reqValue[SC.OPT_SOU_WAREHOUSE_ID]) {
                    SOU_WAREHOUSE_ID = reqValue[SC.OPT_SOU_WAREHOUSE_ID];
                }
                if (reqValue['scanCode']) {
                    reqValue.scanCode = reqValue.scanCode.trim();
                    if (reqValue['scanCode'].trim().length === 26) {
                        let orderNoStr = reqValue['scanCode'].substr(0, 7);
                        if (orderNoStr.match(/^[A-Za-z0-9]{7}$/)) {
                            orderNo = orderNoStr;
                        } else {
                            alertDialogRenderer("SI (Order No.) must be equal to 7-characters in alphanumeric format.", "error", true);
                        }
                        let skuCode1 = reqValue['scanCode'].substr(7, 15);

                        if (skuCode1.includes('@')) {
                            skuCode = skuCode1.replace(/\@/g, " ");
                        } else {
                            skuCode = skuCode1;
                        }
                        skuCode = skuCode.trim();
                        let cartonStr = reqValue['scanCode'].substr(22, 4);
                        if (cartonStr.match(/^\d{4}$/)) {
                            cartonNo = parseInt(cartonStr);
                        } else {
                            alertDialogRenderer("Carton No. must be equal to 4-digits in number format.", "error", true);
                        }

                        if (storageObj.mapstos !== null && storageObj.mapstos.length > 0) {
                            let dataMapstos = storageObj.mapstos[0];
                            qryStrOpt = queryString.parse(dataMapstos.options);

                            if (skuCode !== null && skuCode !== dataMapstos.code) {
                                alertDialogRenderer("Reorder No. doesn't match the previous product on the pallet.", "error", true);
                                skuCode = null;
                            }
                            if (orderNo !== null && orderNo !== dataMapstos.orderNo) {
                                alertDialogRenderer("SI (Order No.) doesn't match the previous product on the pallet.", "error", true);
                                orderNo = null;
                            }
                            if (rootID && skuCode && orderNo && cartonNo) {
                                let oldOptions = qryStrOpt[SC.OPT_CARTON_NO];
                                let resCartonNo = ExplodeRangeNum(oldOptions);
                                let splitCartonNo = resCartonNo.split(",").map((x, i) => { return x = parseInt(x) });
                                let lenSplitCartonNo = splitCartonNo.length;
                                let numCarton = 0;
                                if (reqValue.action === 2) {
                                    var indexCartonNo = splitCartonNo.indexOf(cartonNo);
                                    if (indexCartonNo < 0) {
                                        alertDialogRenderer("This Carton No. " + cartonNo + " doesn't exist in pallet.", "error", true);
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

                                            alertDialogRenderer("Pallet No. " + storageObj.code + " had SKU Code: " + skuCode + " and Carton No." + cartonNo.toString() + " already", "error", true);

                                            cartonNo = null;
                                            break;
                                        }
                                        else {
                                            if (numCarton === lenSplitCartonNo) {
                                                cartonNo = MergeRangeNum(resCartonNo + "," + cartonNo.toString());
                                            } else {
                                                continue;
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        if (cartonNo && rootID && skuCode && orderNo) {

                            if (reqValue.action != 2 && SOU_WAREHOUSE_ID) {
                                qryStrOpt[SC.OPT_SOU_WAREHOUSE_ID] = SOU_WAREHOUSE_ID;
                            }
                            qryStrOpt[SC.OPT_CARTON_NO] = cartonNo.toString();
                            let qryStr1 = queryString.stringify(qryStrOpt)
                            let uri_opt = decodeURIComponent(qryStr1);

                            dataScan = {
                                allowSubmit: true,
                                orderNo: orderNo,
                                scanCode: skuCode,
                                options: cartonNo === "0" ? null : uri_opt,
                                validateSKUTypeCodes: ["FG"]
                            };
                            if (reqValue.action != 2) { //ไม่ใช่เคสลบ
                                if (SOU_WAREHOUSE_ID == null || SOU_WAREHOUSE_ID.length === 0) {
                                    alertDialogRenderer("Please select source warehouse before.", "error", true);
                                    dataScan.allowSubmit = false;
                                }
                            }
                            resValuePost = { ...reqValue, ...dataScan }
                        } else {
                            if (rootID === null) {
                                alertDialogRenderer("Please scan the pallet before scanning the product.", "error", true);
                            }
                        }
                    } else {
                        if (reqValue.action === 2) {
                            if (storageObj.code === reqValue.scanCode) {
                                resValuePost = { ...reqValue, allowSubmit: true }
                            }
                        }
                    }
                } else {
                    alertDialogRenderer("Please scan code of product.", "error", true);
                    resValuePost = { ...reqValue, allowSubmit: false }
                }

            } else {
                resValuePost = { ...reqValue, allowSubmit: false }
            }
        }
        return resValuePost;
    }
    const alertDialogRenderer = (message, type, state) => {
        setMsgDialog(message);
        setTypeDialog(type);
        setStateDialog(state);
    }
    useEffect(() => {
        if (typeDialog && msgDialog && stateDialog) {
            setShowDialog(<AmDialogs typePopup={typeDialog} content={msgDialog} onAccept={(e) => { setStateDialog(e) }} open={stateDialog}></AmDialogs >);
        } else {
            setShowDialog(null);
        }
    }, [stateDialog, msgDialog, typeDialog]);
    return (
        <div>
            {stateDialog ? showDialog ? showDialog : null : null}
            <AmMappingPallet
                showWarehouseDDL={inputWarehouse}
                showAreaDDL={inputArea}
                sourceCreate={inputSource}
                // headerCreate={inputHeader} //input header
                itemCreate={inputItem} //input scan pallet
                // apiCreate={apiCreate} // api สร้าง sto default => "/v2/ScanMapStoAPI"
                onBeforePost={onBeforePost} //ฟังก์ชั่นเตรียมข้อมูลเอง ก่อนส่งไป api
                // //ฟังก์ชั่นเตรียมข้อมูลเเสดงผล options เอง
                setVisibleTabMenu={[null, 'Add', 'Remove']}
                autoPost={true}
                setMovementType={"1011"}
                showOldValue={OnOldValueWH}
                customInfoChip={CustomInfoChip}
            />
        </div>
    );

}
export default ReceivePallet;