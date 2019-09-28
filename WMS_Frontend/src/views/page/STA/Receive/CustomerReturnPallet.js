import React, { useState, useEffect } from "react";
import { ConvertRangeNumToString, ConvertStringToRangeNum, ToRanges, match } from '../../../../components/function/Convert';
import AmMappingPallet from '../../../pageComponent/AmMappingPallet';
import AmMappingPallet2 from '../../../pageComponent/AmMappingPallet2';
import AmDialogs from '../../../../components/AmDialogs'
import queryString from 'query-string'
import * as SC from '../../../../constant/StringConst'

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
    all: "",
}
const CustomerReturnPallet = (props) => {
    const { } = props;

    const inputWarehouse = { "visible": true, "field": "warehouseID", "typeDropdown": "normal", "name": "Warehouse", "placeholder": "Select Warehouse", "fieldLabel": ["Code", "Name"], "fieldDataKey": "ID", "defaultValue": 1, "customQ": "{ 'f': 'ID', 'c':'=', 'v': 1}" };
    const inputArea = { "visible": true, "field": "areaID", "typeDropdown": "normal", "name": "Area", "placeholder": "Select Area", "fieldLabel": ["Code", "Name"], "fieldDataKey": "ID", "defaultValue": 13, "customQ": "{ 'f': 'ID', 'c':'=', 'v': 13}" };

    const inputSource = [
        { "field": SC.OPT_SOU_CUSTOMER_ID, "type": "dropdown", "typeDropdown": "search", "name": "Sou.Customer", "dataDropDown": CustomerQuery, "placeholder": "Select Source Customer", "fieldLabel": ["Code", "Name"], "fieldDataKey": "ID" },
    ]

    const inputItem = [
        { "field": "orderNo", "type": "input", "name": "SI (Order No.)", "placeholder": "SI (Order No.)", "isFocus": true },
        { "field": "scanCode", "type": "input", "name": "Reorder (SKU Code)", "placeholder": "Reorder (SKU Code)" },
        { "field": "cartonNo", "type": "input", "name": "Carton No.", "placeholder": "Carton No." },
        { "field": "amount", "type": "number", "name": "Quantity", "placeholder": "Quantity" },
        { "field": SC.OPT_REMARK, "type": "input", "name": "Remark", "placeholder": "Remark" },
        {
            "field": SC.OPT_DONE_DES_EVENT_STATUS, "type": "radiogroup", "name": "Status", "fieldLabel": [
                { value: '96', label: "RETURN" },
            ],
            "defaultValue": { value: '96', disabled: true }
        }
    ]

    const inputFirst = [
        { "field": "scanCode", "type": "input", "name": "Scan Code", "placeholder": "Scan Code", "isFocus": true },
        { "field": SC.OPT_REMARK, "type": "input", "name": "Remark", "placeholder": "Remark" },
        {
            "field": SC.OPT_DONE_DES_EVENT_STATUS, "type": "radiogroup", "name": "Status", "fieldLabel": [
                { value: '96', label: "PARTIAL" }
            ],
            "defaultValue": { value: '96', disabled: true }
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
        //split ���
        var resValuePost = null;
        var dataScan = {};

        if (reqValue) {

            if (reqValue['scanCode'] && reqValue['orderNo'] && reqValue['cartonNo']) {
                if (reqValue[SC.OPT_SOU_CUSTOMER_ID]) {
                    let orderNo = reqValue['orderNo'];
                    let skuCode = reqValue['scanCode'].trim();
                    let cartonNo = reqValue['cartonNo'];
                    let rootID = reqValue.rootID;
                    let qryStr = {};
                    let cartonNoList = [];
                    let newQty = null;
                   
                    if (reqValue['cartonNo']) {
                        let resCartonNo = ConvertRangeNumToString(reqValue['cartonNo']);
                        cartonNoList = resCartonNo.split(",").map((x, i) => { return x = parseInt(x) });

                    }

                    //check Storage Object
                    if (storageObj.mapstos !== null && storageObj.mapstos.length > 0) {
                        let dataMapstos = storageObj.mapstos[0];
                        qryStr = queryString.parse(dataMapstos.options);
                        if (skuCode !== dataMapstos.code || orderNo !== dataMapstos.orderNo) {
                            alertDialogRenderer("The new product doesn't match the previous product on the pallet.", "error", true);
                            skuCode = null;
                            orderNo = null;
                        }
                        if (rootID && skuCode && orderNo) {
                            let oldOptions = qryStr[SC.OPT_CARTON_NO];
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
                                } else {
                                    let carNoMatch = cartonNoList.length === 1 ? cartonNoList.join() : ConvertStringToRangeNum(cartonNoList.join());
                                    alertDialogRenderer("This Carton No. " + carNoMatch + " doesn't exist in pallet.", "error", true);
                                    cartonNo = null;
                                }
    
                                if (curInput === 'amount') {
                                    if (parseInt(reqValue['amount'], 10) !== lenNewCarton) {
    
                                        alertDialogRenderer("The quantity of carton doesn't match.", "error", true);
    
                                    }
                                } else {
    
                                    let eleAmount = document.getElementById('amount');
                                    if (eleAmount) {
                                        eleAmount.value = lenNewCarton;
                                        reqValue['amount'] = lenNewCarton;
                                    }
                                }
    
                            } else {
                                let diffCarton = match(splitCartonNo, cartonNoList);
                                if (diffCarton.length > 0) {
                                    let carNoMatch = diffCarton.length === 1 ? diffCarton.join() : ConvertStringToRangeNum(diffCarton.join());
                                    alertDialogRenderer("Pallet No. " + storageObj.code + " had SKU Code: " + skuCode + " and Carton No." + carNoMatch + " already", "error", true);
                                    cartonNo = null;
                                } else {
                                    if (curInput === 'amount') {
                                        if (parseInt(reqValue['amount'], 10) !== cartonNoList.length) {
                                            alertDialogRenderer("The quantity of carton doesn't match.", "error", true);
                                        }
                                    } else {
                                        newQty = cartonNoList.length;
                                        let eleAmount = document.getElementById('amount');
                                        if (eleAmount) {
                                            eleAmount.value = newQty;
                                            reqValue['amount'] = newQty;
                                        }
                                    }
    
                                    cartonNo = ConvertStringToRangeNum(resCartonNo + "," + cartonNoList.join());
                                }
    
                            }
                        }
                    } else {
                        if (curInput === 'amount') {
                            if (parseInt(reqValue['amount'], 10) !== cartonNoList.length) {
                             alertDialogRenderer("The quantity of carton doesn't match.", "error", true);
    
                            }
                        } else {
                            newQty = cartonNoList.length;
                            let eleAmount = document.getElementById('amount');
                            if (eleAmount) {
                                eleAmount.value = newQty;
                                reqValue['amount'] = newQty;
                            }
                        }
                        cartonNo = cartonNoList.length === 1 ? cartonNoList.join() : ConvertStringToRangeNum(cartonNoList.join());
                    }
                    if (cartonNo && rootID && skuCode && orderNo) {
                        if (reqValue[SC.OPT_SOU_CUSTOMER_ID]) {
                            qryStr[SC.OPT_SOU_CUSTOMER_ID] = reqValue[SC.OPT_SOU_CUSTOMER_ID];
                        }
                        // qryStr[SC.OPT_DONE_EVENT_STATUS] = "96";
                        qryStr[SC.OPT_CARTON_NO] = cartonNo.toString();
                        let qryStr1 = queryString.stringify(qryStr)
                        let uri_opt = decodeURIComponent(qryStr1);

                        dataScan = {
                            // rootID: rootID,
                            orderNo: orderNo,
                            scanCode: skuCode,
                            options: cartonNo === "0" ? null : uri_opt
                        };
                        resValuePost = { ...reqValue, ...dataScan }
                    } else {
                        if (rootID === null) {
                            alertDialogRenderer("Please scan the pallet before scanning the product or CartonNo Not Found.", "error", true);
                        }
                    }
                } else {
                    alertDialogRenderer("Please select source customer before.", "error", true);
                    resValuePost = { ...reqValue, ...dataScan }
                }
            } else {
                if(reqValue['orderNo'].length === 0 && reqValue['cartonNo'].length === 0){
                    alertDialogRenderer("SI (Order No.) and Carton No. must be value", "error", true);
                }else if(reqValue['orderNo'].length === 0){
                    alertDialogRenderer("SI (Order No.) must be value", "error", true);
                }else{
                    alertDialogRenderer("Carton No. must be value", "error", true);
                }
                resValuePost = { ...reqValue }
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
                setMovementType={"1012"}
                autoPost={false}
            />
        </div>
    );

}
export default CustomerReturnPallet;