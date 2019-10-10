import React, { useState, useEffect } from "react";
import { ConvertRangeNumToString, ConvertStringToRangeNum, ToRanges, match } from '../../../../components/function/Convert';
import AmMappingPallet from '../../../pageComponent/AmMappingPallet';
import AmMappingPallet2 from '../../../pageComponent/AmMappingPallet2';
import AmDialogs from '../../../../components/AmDialogs'
import queryString from 'query-string'
import * as SC from '../../../../constant/StringConst'
// const Axios = new apicall()

const ReceivePallet = (props) => {
    const { } = props;

    const inputWarehouse = { "visible": true, "field": "warehouseID", "typeDropdown": "normal", "name": "Warehouse", "placeholder": "Select Warehouse", "fieldLabel": ["Code", "Name"], "fieldDataKey": "ID", "defaultValue": 1, "customQ": "{ 'f': 'ID', 'c':'=', 'v': 1}" };
    const inputArea = { "visible": true, "field": "areaID", "typeDropdown": "normal", "name": "Area", "placeholder": "Select Area", "fieldLabel": ["Code", "Name"], "fieldDataKey": "ID", "defaultValue": 13, "customQ": "{ 'f': 'ID', 'c':'in', 'v': '13'}" };

    const inputItem = [
        { "field": "orderNo", "type": "input", "name": "SI (Order No.)", "placeholder": "SI (Order No.)", "isFocus": true, "maxLength": 7, "required": true },
        { "field": "scanCode", "type": "input", "name": "Reorder (SKU Code)", "placeholder": "Reorder (SKU Code)", "maxLength": 15, "required": true },
        { "field": "cartonNo", "type": "input", "name": "Carton No.", "placeholder": "Carton No.", "clearInput": true, "required": true },
        { "field": "amount", "type": "number", "name": "Quantity", "placeholder": "Quantity", "clearInput": true, "required": true, "disabled": true },
        { "field": SC.OPT_REMARK, "type": "input", "name": "Remark", "placeholder": "Remark" },
        {
            "field": SC.OPT_DONE_DES_EVENT_STATUS, "type": "radiogroup", "name": "Status", "fieldLabel": [
                { value: '97', label: "PARTIAL" }
            ],
            "defaultValue": { value: '97', disabled: true }
        }
    ]

    const inputFirst = [
        { "field": "scanCode", "type": "input", "name": "Scan Code", "placeholder": "Scan Code", "isFocus": true, "required": true },
        { "field": SC.OPT_REMARK, "type": "input", "name": "Remark", "placeholder": "Remark" },
        {
            "field": SC.OPT_DONE_DES_EVENT_STATUS, "type": "radiogroup", "name": "Status", "fieldLabel": [
                { value: '97', label: "PARTIAL" }
            ],
            "defaultValue": { value: '97', disabled: true }
        }

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
        // , {
        // text: 'MVT',
        // value: QryStrGetValue(value, 'MVT'),
        // styleAvatar: {
        //     backgroundColor: '#1769aa'
        // }

        return res;
    }


    async function onBeforePost(reqValue, storageObj, curInput) {
        var resValuePost = null;
        var dataScan = {};
        if (reqValue) {
            let orderNo = null;
            let skuCode = null;
            let cartonNo = null;
            let rootID = reqValue.rootID;
            let qryStrOpt = {};

            let cartonNoList = [];
            let newQty = null;
            if (storageObj) {

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
                if (reqValue['scanCode']) {
                    if (reqValue['scanCode'].trim().length !== 0) {
                        skuCode = reqValue['scanCode'].trim();
                    } else {
                        if (curInput === 'scanCode') {
                            skuCode = null;
                            alertDialogRenderer("Reorder No. must be value.", "error", true);
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

                if (storageObj.mapstos !== null && storageObj.mapstos.length > 0) {
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
                                        alertDialogRenderer("This Carton No. " + noHascarNoMatch + " doesn't exist in pallet.", "error", true);

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
                            alertDialogRenderer("This Carton No. " + carNoMatch + " doesn't exist in pallet.", "error", true);
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

                    qryStrOpt[SC.OPT_CARTON_NO] = cartonNo.toString();
                    // qryStr[SC.OPT_DONE_EVENT_STATUS] = "97";
                    let qryStr1 = queryString.stringify(qryStrOpt)
                    let uri_opt = decodeURIComponent(qryStr1);

                    dataScan = {
                        allowSubmit: true,
                        orderNo: orderNo,
                        scanCode: skuCode,
                        options: cartonNo === "0" ? null : uri_opt
                    };
                } else {
                    if (rootID === null) {
                        alertDialogRenderer("Please scan the pallet before scanning the product.", "error", true);
                    } else {
                        dataScan = {
                            allowSubmit: false
                        };
                    }
                }
            } else {
                dataScan = {
                    allowSubmit: false
                };
            }
            resValuePost = { ...reqValue, ...dataScan }
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
                // headerCreate={inputHeader} //input header
                itemCreate={inputItem} //input scan pallet
                FirstScans={inputFirst}
                // apiCreate={apiCreate} // api สร้าง sto default => "/v2/ScanMapStoAPI"
                onBeforePost={onBeforePost} //ฟังก์ชั่นเตรียมข้อมูลเอง ก่อนส่งไป api
                // //ฟังก์ชั่นเตรียมข้อมูลเเสดงผล options เอง
                customOptions={customOptions}
                showOptions={true}
                setVisibleTabMenu={[null, 'Add', 'Remove']}
                autoPost={false}
                setMovementType={"1111"}
            />
        </div>
    );

}
export default ReceivePallet;