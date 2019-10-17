import React, { useState, useEffect } from "react";
import { ExplodeRangeNum, MergeRangeNum, ToRanges, match } from '../../../../components/function/RangeNumUtill';
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
const ReceivePallet = (props) => {
    const { } = props;

    const inputWarehouse = { "visible": true, "field": "warehouseID", "typeDropdown": "normal", "name": "Warehouse", "placeholder": "Select Warehouse", "fieldLabel": ["Code", "Name"], "fieldDataKey": "ID", "defaultValue": 1, "customQ": "{ 'f': 'ID', 'c':'=', 'v': 1}" };
    const inputArea = { "visible": true, "field": "areaID", "typeDropdown": "normal", "name": "Area", "placeholder": "Select Area", "fieldLabel": ["Code", "Name"], "fieldDataKey": "ID", "defaultValue": 13, "customQ": "{ 'f': 'ID', 'c':'=', 'v': 13}" };

    const inputSource = [
        { "field": SC.OPT_SOU_WAREHOUSE_ID, "type": "dropdown", "typeDropdown": "normal", "name": "Sou.Warehouse", "dataDropDown": WarehouseQuery, "placeholder": "Select Warehouse", "fieldLabel": ["Code", "Name"], "fieldDataKey": "ID", "defaultValue": 1 },
    ]

    const inputItem = [
        { "field": "lot", "type": "input", "name": "Lot", "placeholder": "Lot" },
        { "field": "scanCode", "type": "input", "name": "Reorder (SKU Code)", "placeholder": "Reorder (SKU Code)" },
       
        { "field": "amount", "type": "number", "name": "Quantity", "placeholder": "Quantity" },
        { "field": SC.OPT_REMARK, "type": "input", "name": "Remark", "placeholder": "Remark" },
        {
            "field": SC.OPT_DONE_DES_EVENT_STATUS, "type": "radiogroup", "name": "Status", "fieldLabel": [
              
                { value: '12', label: "RECEIVED" },

            ],
            "defaultValue": { value: '12' }
        }
    ]

    const inputFirst = [
        { "field": "scanCode", "type": "input", "name": "Scan Code", "placeholder": "Scan Code" },
        { "field": SC.OPT_REMARK, "type": "input", "name": "Remark", "placeholder": "Remark" },
        {
            "field": SC.OPT_DONE_DES_EVENT_STATUS, "type": "radiogroup", "name": "Status", "fieldLabel": [
             
                { value: '12', label: "RECEIVED" },

            ],
            "defaultValue": { value: '12' }
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

            if (reqValue['scanCode'] && reqValue['lot'] && reqValue['cartonNo']) {
                if (reqValue[SC.OPT_SOU_WAREHOUSE_ID]) {
                    let lot = reqValue['Lot'];
                    let skuCode = reqValue['scanCode'].trim();
                    let cartonNo = reqValue['cartonNo'];
                    let rootID = reqValue.rootID;
                    let qryStr = {};

                    let cartonNoList = [];
                    let newQty = null;
                   
                    if (reqValue['cartonNo']) {
                        let resCartonNo = ExplodeRangeNum(reqValue['cartonNo']);
                        cartonNoList = resCartonNo.split(",").map((x, i) => { return x = parseInt(x) });

                    }

                    //check Storage Object
                    if (storageObj.mapstos !== null && storageObj.mapstos.length > 0) {
                        let dataMapstos = storageObj.mapstos[0];
                        qryStr = queryString.parse(dataMapstos.options);
                        if (skuCode !== dataMapstos.code || lot !== dataMapstos.lot) {
                            alertDialogRenderer("The new product doesn't match the previous product on the pallet.", "error", true);
                            skuCode = null;
                            lot = null;
                        }
                        if (rootID && skuCode && lot) {
                            let oldOptions = qryStr[SC.OPT_CARTON_NO];
                            let resCartonNo = ExplodeRangeNum(oldOptions);
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
                                                let noHascarNoMatch = noHasCartonList.length === 1 ? noHasCartonList.join() : MergeRangeNum(noHasCartonList.join());
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
                                    let carNoMatch = cartonNoList.length === 1 ? cartonNoList.join() : MergeRangeNum(cartonNoList.join());
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
                                    let carNoMatch = diffCarton.length === 1 ? diffCarton.join() : MergeRangeNum(diffCarton.join());
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
    
                                    cartonNo = MergeRangeNum(resCartonNo + "," + cartonNoList.join());
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
                        cartonNo = cartonNoList.length === 1 ? cartonNoList.join() : MergeRangeNum(cartonNoList.join());
                    }
                    if (cartonNo && rootID && skuCode && lot) {
                        if (reqValue[SC.OPT_SOU_WAREHOUSE_ID]) {
                            qryStr[SC.OPT_SOU_WAREHOUSE_ID] = reqValue[SC.OPT_SOU_WAREHOUSE_ID];
                        }
                        qryStr[SC.OPT_CARTON_NO] = cartonNo.toString();
                        console.log(qryStr)
                        let qryStr1 = queryString.stringify(qryStr)
                        let uri_opt = decodeURIComponent(qryStr1);

                        dataScan = {
                            // rootID: rootID,
                            lot: lot,
                            scanCode: skuCode,
                            options: cartonNo === "0" ? null : uri_opt,
                            validateSKUTypeCodes: ["FG"]
                        };
                        resValuePost = { ...reqValue, ...dataScan }
                    } else {
                        if (rootID === null) {
                            alertDialogRenderer("Please scan the pallet before scanning the product or CartonNo Not Found.", "error", true);

                        }
                    }
                } else {
                    alertDialogRenderer("Please select source warehouse before.", "error", true);
                    resValuePost = { ...reqValue, ...dataScan }
                }
            } else {
                if(reqValue['lot'].length === 0 && reqValue['cartonNo'].length === 0){
                    alertDialogRenderer("SI (Order No.) and Carton No. must be value", "error", true);
                }else if(reqValue['lot'].length === 0){
                    alertDialogRenderer("SI (Order No.) must be value", "error", true);
                }else{
                    //alertDialogRenderer("Carton No. must be value", "error", true);
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
                autoPost={false}
                setMovementType={"1011"}
            />
        </div>
    );

}
export default ReceivePallet;