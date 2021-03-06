import React, { useState, useEffect } from "react";
import { apicall, createQueryString, Clone } from '../../../components/function/CoreFunction';
import { ConvertRangeNumToString, ConvertStringToRangeNum, ToRanges } from '../../../components/function/Convert';
import AmPickingReturn from '../../pageComponent/AmPickingReturn';
import AmDialogs from '../../../components/AmDialogs'
import queryString from 'query-string'

// const Axios = new apicall()


const PickingReturn = (props) => {
    const { } = props;

    const inputWarehouse = { "visible": true, "field": "warehouseID", "typeDropdown": "normal", "name": "Warehouse", "placeholder": "Select Warehouse", "fieldLabel": ["Code", "Name"], "fieldDataKey": "ID", "defaultValue": 1 };
    const inputArea = { "visible": true, "field": "areaID", "typeDropdown": "normal", "name": "Area", "placeholder": "Select Area", "fieldLabel": ["Code", "Name"], "fieldDataKey": "ID", "defaultValue": 5 };

    // const inputHeader = [
    //     { "field": "warehouseID", "type": "dropdown", "typeDropdown": "normal", "name": "Warehouse", "dataDropDown": WarehouseQuery, "placeholder": "Select Warehouse", "fieldLabel": ["Code", "Name"], "fieldDataKey": "ID", "defaultValue": 1 },
    //     { "field": "areaID", "type": "dropdown", "typeDropdown": "normal", "name": "Area", "dataDropDown": AreaMasterQuery, "placeholder": "Select Area", "fieldLabel": ["Code", "Name"], "fieldDataKey": "ID", "defaultValue": 13 },
    //     // { "field": "MovementType_ID", "type": "dropdown", "typeDropdown": "search", "name": "Movement Type", "dataDropDown": MVTQuery, "placeholder": "Movement Type", "fieldLabel": ["Code"], "fieldDataKey": "ID" },
    //     // { "field": "ActionDateTime", "type": "datepicker", "name": "Action Date/Time", "placeholder": "ActionDateTime" },
    // ]
    const inputItem = [
        // { "field": "Quantity", "type": "number", "name": "Quantity", "placeholder": "Quantity" },
        { "field": "scanCode", "type": "input", "name": "Scan Code", "placeholder": "Scan Code" },
    ]

    const [showDialog, setShowDialog] = useState(null);
    const [stateDialog, setStateDialog] = useState(false);
    const [msgDialog, setMsgDialog] = useState("");
    const [typeDialog, setTypeDialog] = useState("");

    const customOptions = (value) => {
        var qryStr = queryString.parse(value)
        var res = [{
            text: 'CN',
            value: qryStr.CartonNo,
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
    async function onBeforePost(reqValue, storageObj) {
        //split ?????????
        var resValuePost = null;
        var dataScan = {};
        if (reqValue) {
            // var storageObj = resData.bsto;
            if (storageObj) {
                if (reqValue['scanCode'].length === 26) {
                    let orderNo = reqValue['scanCode'].substr(0, 7);
                    let skuCode1 = reqValue['scanCode'].substr(7, 15);
                    let skuCode = skuCode1.trim(); //??????????????? ?????????skucode????????????????????????????????????????????? ??????????????????????????????xxx????????????????????????
                    let cartonNo = parseInt(reqValue['scanCode'].substr(22, 4));
                    let rootID = reqValue.rootID;
                    //check Storage Object
                    if (storageObj.mapstos !== null && storageObj.mapstos.length > 0) {
                        let dataMapstos = storageObj.mapstos[0];
                        var qryStr = queryString.parse(dataMapstos.options);
                        let mvt = qryStr.MVT;
                        if (skuCode !== dataMapstos.code || orderNo !== dataMapstos.orderNo) {
                            alertDialogRenderer("The new product doesn't match the previous product on the pallet.", "error", true);
                            skuCode = null;
                            orderNo = null;
                        }
                        if (rootID && skuCode && orderNo) {
                            let oldOptions = qryStr.CartonNo;
                            let resCartonNo = ConvertRangeNumToString(oldOptions);
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
                                        ///?????????carton no ????????? ??????????????????????????????????????? ????????????????????????????????????????????????????????????????????????

                                        alertDialogRenderer("Pallet No. " + storageObj.code + (window.project === "TAP" ? " had Part NO.: " : " had SKU Code: ") + skuCode + " and Carton No." + cartonNo.toString() + " already", "error", true);

                                        cartonNo = null;
                                        break;
                                    }
                                    else {
                                        if (numCarton === lenSplitCartonNo) {
                                            cartonNo = ConvertStringToRangeNum(resCartonNo + "," + cartonNo.toString());
                                        } else {
                                            continue;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (cartonNo && rootID && skuCode && orderNo) {
                        dataScan = {
                            // rootID: rootID,
                            orderNo: orderNo,
                            scanCode: skuCode,
                            options: cartonNo === "0" ? null : "CartonNo=" + cartonNo.toString() + "&MVT=1091",
                            // amount: 1,
                            // mode: 0,
                            // action: 1,
                            // isRoot: false
                        };
                        resValuePost = { ...reqValue, ...dataScan }
                    } else {
                        if (rootID === null) {
                            alertDialogRenderer("Please scan the pallet before scanning the product or CartonNo Not Found.", "error", true);

                        }
                    }
                } else {
                    resValuePost = { ...reqValue }
                }
            } else {
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
            <AmPickingReturn
                showWarehouseDDL={inputWarehouse}
                showAreaDDL={inputArea}
                // headerCreate={inputHeader} //input header
                itemCreate={inputItem} //input scan pallet
                // apiCreate={apiCreate} // api ??????????????? sto default => "/v2/ScanPickingReturnAPI"
                onBeforePost={onBeforePost} //???????????????????????????????????????????????????????????????????????? ??????????????????????????? api
                // //???????????????????????????????????????????????????????????????????????????????????? options ?????????
                customOptions={customOptions}
                showOptions={true}
            // useMultiSKU={false}
            />
        </div>
    );

}
export default PickingReturn;