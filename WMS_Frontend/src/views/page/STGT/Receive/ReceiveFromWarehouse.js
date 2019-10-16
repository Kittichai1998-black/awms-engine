import React, { useState, useEffect } from "react";
import { ConvertRangeNumToString, ConvertStringToRangeNum, ToRanges, match } from '../../../../components/function/Convert';
import AmMappingPallet from '../../../pageComponent/AmMappingPallet';
import AmMappingPallet2 from '../../../pageComponent/AmMappingPallet2';
import AmDialogs from '../../../../components/AmDialogs'
import queryString from 'query-string'
import * as SC from '../../../../constant/StringConst'
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
const ReceiveFromWarehouse = (props) => {
    const { } = props;

    const inputWarehouse = { "visible": true, "field": "warehouseID", "typeDropdown": "normal", "name": "Warehouse", "placeholder": "Select Warehouse", "fieldLabel": ["Code", "Name"], "fieldDataKey": "ID", "defaultValue": 1, "customQ": "{ 'f': 'ID', 'c':'=', 'v': 1}" };
    const inputArea = { "visible": true, "field": "areaID", "typeDropdown": "normal", "name": "Area", "placeholder": "Select Area", "fieldLabel": ["Code", "Name"], "fieldDataKey": "ID", "defaultValue": 13, "customQ": "{ 'f': 'ID', 'c':'=', 'v': 13}" };

    const inputSource = [
        { "field": SC.OPT_SOU_WAREHOUSE_ID, "type": "dropdown", "typeDropdown": "normal", "name": "Sou.Warehouse", "dataDropDown": WarehouseQuery, "placeholder": "Select Warehouse", "fieldLabel": ["Code", "Name"], "fieldDataKey": "ID", "defaultValue": 1, "required": true },
    ]

    const inputItem = [
        { "field": "orderNo", "type": "input", "name": "SI (Order No.)", "placeholder": "SI (Order No.)", "isFocus": true, "maxLength": 7, "required": true },
        { "field": "scanCode", "type": "input", "name": "Reorder (SKU Code)", "placeholder": "Reorder (SKU Code)", "maxLength": 20, "required": true },
        { "field": "cartonNo", "type": "input", "name": "Carton No.", "placeholder": "ex. 1) 1-100 2) 10-20,30-40 3) 1,2,3,10-15", "clearInput": true, "required": true },
        { "field": "amount", "type": "number", "name": "Quantity", "placeholder": "Quantity", "clearInput": true, "required": true, "disabled": true },
        { "field": SC.OPT_REMARK, "type": "input", "name": "Remark", "placeholder": "Remark" },
        {
            "field": SC.OPT_DONE_DES_EVENT_STATUS, "type": "radiogroup", "name": "Status", "fieldLabel": [
                { value: '98', label: "QC" },
                { value: '12', label: "RECEIVED" },

            ],
            "defaultValue": { value: '98' }
        }
    ]

    const inputFirst = [
        { "field": SC.OPT_REMARK, "type": "input", "name": "Remark", "placeholder": "Remark", "isFocus": true },
        {
            "field": SC.OPT_DONE_DES_EVENT_STATUS, "type": "radiogroup", "name": "Status", "fieldLabel": [
                { value: '98', label: "QC" },
                { value: '12', label: "RECEIVED" },

            ],
            "defaultValue": { value: '98' }
        },
        { "field": "scanCode", "type": "input", "name": "Scan Pallet", "placeholder": "Scan Pallet", "required": true, "clearInput": true }
    ]
    const [showDialog, setShowDialog] = useState(null);
    const [stateDialog, setStateDialog] = useState(false);
    const [msgDialog, setMsgDialog] = useState("");
    const [typeDialog, setTypeDialog] = useState("");

    const customOptions = (value) => {
        var qryStr = queryString.parse(value)
        var res = [{
            text: 'CN',
            value: qryStr[SC.OPT_CARTON_NO],
            textToolTip: 'Carton No.'
        }] 

        return res;
    }
    function onOldValue(storageObj) {
        let oldValue = [];
        if (storageObj) {
            let qryStrOpt_root = queryString.parse(storageObj.options);
            oldValue = [{
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
            }, {
                field: SC.OPT_REMARK,
                value: qryStrOpt_root[SC.OPT_REMARK]
            }]

            if (storageObj.mapstos !== null && storageObj.mapstos.length > 0) {
                let dataMapstos = storageObj.mapstos[0];
                let qryStrOpt = queryString.parse(dataMapstos.options);

                oldValue.push({
                    field: SC.OPT_SOU_WAREHOUSE_ID,
                    value: qryStrOpt[SC.OPT_SOU_WAREHOUSE_ID]
                }, {
                    field: "orderNo",
                    value: dataMapstos.orderNo
                }, {
                    field: "scanCode",
                    value: dataMapstos.code
                });
            } else {
                oldValue.push({
                    field: "scanCode",
                    value: ""
                });
            }
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
            let SOU_WAREHOUSE_ID = null;
            let rootID = reqValue.rootID;
            let qryStrOpt = {};

            let cartonNoList = [];
            let newQty = 0;
            if (storageObj) {
                if (reqValue[SC.OPT_SOU_WAREHOUSE_ID]) {
                    SOU_WAREHOUSE_ID = reqValue[SC.OPT_SOU_WAREHOUSE_ID];
                } else {
                    if (reqValue.action != 2) {
                        alertDialogRenderer("Please select source warehouse before.", "error", true);
                    }
                }

                if (reqValue['scanCode']) {
                    if (reqValue['scanCode'].trim().length !== 0) {
                        skuCode = reqValue['scanCode'].trim();
                    } else {
                        if (curInput === 'scanCode') {
                            skuCode = null;
                            alertDialogRenderer("Reorder No. must be value.", "error", true);
                        }
                    }
                    if (reqValue['orderNo']) {
                        if (reqValue['orderNo'].trim().length === 7) {
                            orderNo = reqValue['orderNo'].trim();
                        } else {
                            if (curInput === 'orderNo') {
                                orderNo = null;
                                if (reqValue.action != 2 && storageObj.mapstos != null && storageObj.mapstos[0].code === skuCode) {
                                    console.log("scan pallet")
                                } else {
                                    alertDialogRenderer("SI (Order No.) must be equal 7-digits", "error", true);

                                }
                            }
                        }
                    }

                    if (reqValue['cartonNo']) {
                        let resCartonNo = ConvertRangeNumToString(reqValue['cartonNo']);
                        cartonNoList = resCartonNo.split(",").map((x, i) => { return x = parseInt(x) });
                    } else {
                        if (curInput === 'cartonNo') {
                            cartonNo = null;
                            if (reqValue.action != 2 && storageObj.mapstos != null && storageObj.mapstos[0].code === skuCode) {
                                console.log("scan pallet")
                            } else {
                                alertDialogRenderer("Carton No. must be value.", "error", true);
                            }
                        }
                    }
                } else {
                    if (reqValue['orderNo']) {
                        if (reqValue['orderNo'].trim().length === 7) {
                            orderNo = reqValue['orderNo'].trim();
                        } else {
                            if (curInput === 'orderNo') {
                                orderNo = null;
                                alertDialogRenderer("SI (Order No.) must be equal 7-digits", "error", true);

                            }
                        }
                    }

                    if (reqValue['cartonNo']) {
                        let resCartonNo = ConvertRangeNumToString(reqValue['cartonNo']);
                        cartonNoList = resCartonNo.split(",").map((x, i) => { return x = parseInt(x) });
                    } else {
                        if (curInput === 'cartonNo') {
                            cartonNo = null;
                            alertDialogRenderer("Carton No. must be value.", "error", true);
                        }
                    }
                }


                if (storageObj.mapstos != null && storageObj.mapstos.length > 0) {
                    let dataMapstos = storageObj.mapstos[0];
                    qryStrOpt = queryString.parse(dataMapstos.options);

                    if (skuCode !== null && orderNo !== null) {
                        if (skuCode !== dataMapstos.code && orderNo !== dataMapstos.orderNo) {
                            alertDialogRenderer("The new product doesn't match the previous product on the pallet.", "error", true);
                            skuCode = null;
                            orderNo = null;
                        } else if (skuCode !== null && skuCode !== dataMapstos.code) {
                            alertDialogRenderer("Reorder No. doesn't match the previous product on the pallet.", "error", true);
                            skuCode = null;
                        } else if (orderNo !== null && orderNo !== dataMapstos.orderNo) {
                            alertDialogRenderer("SI (Order No.) doesn't match the previous product on the pallet.", "error", true);
                            orderNo = null;
                        }
                    }
                    let oldOptions = qryStrOpt[SC.OPT_CARTON_NO];
                    let resCartonNo = ConvertRangeNumToString(oldOptions);
                    let splitCartonNo = resCartonNo.split(",").map((x, i) => { return x = parseInt(x) });

                    if (reqValue.action === 2) {
                        let lenNewCarton = null;
                        let diffCarton = match(splitCartonNo, cartonNoList);
                        if (diffCarton.length > 0) {
                            let numCarton = 0;
                            let lenDiffCarton = diffCarton.length;
                            let delCartonList = [];
                            let noHasCartonList = [];
                            for (let no in diffCarton) {
                                numCarton++;
                                let indexCartonNo = splitCartonNo.indexOf(diffCarton[no]);
                                if (indexCartonNo < 0) {
                                    noHasCartonList.push(diffCarton[no]);

                                } else {
                                    delCartonList.push(diffCarton[no]);
                                    splitCartonNo.splice(indexCartonNo, 1);
                                }
                                if (numCarton === lenDiffCarton) {
                                    if (noHasCartonList.length > 0) {
                                        let noHascarNoMatch = noHasCartonList.length === 1 ? noHasCartonList.join() : ConvertStringToRangeNum(noHasCartonList.join());
                                        if (noHascarNoMatch.length > 0) {
                                            alertDialogRenderer("This Carton No. " + noHascarNoMatch + " doesn't exist in pallet.", "error", true);
                                        }
                                        cartonNo = null;
                                    } else {
                                        lenNewCarton = delCartonList.length;
                                        if (splitCartonNo.length === 0) {
                                            cartonNo = "0";
                                        } else if (splitCartonNo.length == 1) {
                                            cartonNo = splitCartonNo[0].toString();
                                        } else {
                                            var rangcartonNo = ToRanges(splitCartonNo);
                                            cartonNo = rangcartonNo.join();
                                        }
                                    }
                                    break;
                                } else {
                                    continue;
                                }
                            }
                            newQty = lenNewCarton;

                        } else {
                            let carNoMatch = cartonNoList.length === 1 ? cartonNoList.join() : ConvertStringToRangeNum(cartonNoList.join());
                            if (carNoMatch.length > 0) {
                                alertDialogRenderer("This Carton No. " + carNoMatch + " doesn't exist in pallet.", "error", true);
                            }
                            cartonNo = null;
                            let eleCartonNo = document.getElementById('cartonNo');
                            if (eleCartonNo) {
                                eleCartonNo.value = "";
                                reqValue['cartonNo'] = "";
                            }
                        }
                    } else {
                        let diffCarton = match(splitCartonNo, cartonNoList);
                        if (diffCarton.length > 0) {
                            let carNoMatch = diffCarton.length === 1 ? diffCarton.join() : ConvertStringToRangeNum(diffCarton.join());
                            alertDialogRenderer("Pallet No. " + storageObj.code + " had Carton No. " + carNoMatch + " already", "error", true);
                            cartonNo = null;
                            let eleCartonNo = document.getElementById('cartonNo');
                            if (eleCartonNo) {
                                eleCartonNo.value = "";
                                reqValue['cartonNo'] = "";
                            }
                        } else {
                            cartonNo = cartonNoList.length > 0 ? ConvertStringToRangeNum(resCartonNo + "," + cartonNoList.join()) : null;
                            newQty = cartonNoList.length;
                        }

                    }

                } else {
                    cartonNo = cartonNoList.length === 1 ? cartonNoList.join() : ConvertStringToRangeNum(cartonNoList.join());
                    newQty = cartonNoList.length;
                }
                if (curInput === 'amount') {
                    if (parseInt(reqValue['amount'], 10) !== newQty) {
                        alertDialogRenderer("The quantity of carton doesn't match.", "error", true);
                        let eleAmount = document.getElementById('amount');
                        if (eleAmount) {
                            eleAmount.value = newQty;
                            reqValue['amount'] = newQty;
                        }
                    }
                } else {
                    let eleAmount = document.getElementById('amount');
                    if (eleAmount) {
                        eleAmount.value = newQty;
                        reqValue['amount'] = newQty;
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
                            dataScan.allowSubmit = false;
                        }
                    }
                    resValuePost = { ...reqValue, ...dataScan }
                } else {
                    if (rootID === null) {
                        alertDialogRenderer("Please scan the pallet before scanning the product.", "error", true);
                    } else {
                        if (reqValue.action === 2) {
                            reqValue.scanCode = reqValue.scanCode.trim();
                            if (storageObj.code === reqValue.scanCode) {
                                resValuePost = { ...reqValue, allowSubmit: true }
                            } else {
                                resValuePost = { ...reqValue, allowSubmit: false }
                            }
                        } else {
                            resValuePost = { ...reqValue, allowSubmit: false }
                        }
                    }
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
            <AmMappingPallet2
                showWarehouseDDL={inputWarehouse}
                showAreaDDL={inputArea}
                sourceCreate={inputSource}
                // headerCreate={inputHeader} //input header
                itemCreate={inputItem} //input scan pallet
                FirstScans={inputFirst}
                // apiCreate={apiCreate} // api ���ҧ sto default => "/v2/ScanMapStoAPI"
                onBeforePost={onBeforePost} //�ѧ����������������ͧ ��͹��� api
                // //�ѧ�����������������ʴ��� options �ͧ
                customOptions={customOptions}
                showOptions={true}
                setVisibleTabMenu={[null, 'Add', 'Remove']}
                autoPost={false}
                autoDoc={true}
                setMovementType={"1011"}
                showOldValue={onOldValue}
            />
        </div>
    );

}
export default ReceiveFromWarehouse;