import React, { useState, useEffect } from "react";
import { ExplodeRangeNum, MergeRangeNum, ToRanges } from '../../../../components/function/RangeNumUtill';
import AmMappingPallet from '../../../pageComponent/AmMappingPallet';
import AmDialogs from '../../../../components/AmDialogs'
import queryString from 'query-string'
import * as SC from '../../../../constant/StringConst'
import { CustomInfoChipWIP, OnOldValueWH } from '../CustomComponent/CustomInfo'

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
const ReceiveWIPSup = (props) => {
    const { } = props;

    const inputWarehouse = { "visible": true, "field": "warehouseID", "typeDropdown": "normal", "name": "Warehouse", "placeholder": "Select Warehouse", "fieldLabel": ["Code", "Name"], "fieldDataKey": "ID", "defaultValue": 1, "customQ": "{ 'f': 'ID', 'c':'=', 'v': 1}" };
    const inputArea = { "visible": true, "field": "areaID", "typeDropdown": "normal", "name": "Area", "placeholder": "Select Area", "fieldLabel": ["Code", "Name"], "fieldDataKey": "ID", "defaultValue": 13, "customQ": "{ 'f': 'ID', 'c':'in', 'v': '8,13'}" };

    const inputSource = [
        { "field": SC.OPT_SOU_WAREHOUSE_ID, "type": "dropdown", "typeDropdown": "normal", "name": "Sou.Warehouse", "dataDropDown": WarehouseQuery, "placeholder": "Select Warehouse", "fieldLabel": ["Code", "Name"], "fieldDataKey": "ID", "defaultValue": 1, "required": true },
    ]
    const inputItem = [
        { "field": SC.OPT_REMARK, "type": "input", "name": "Remark", "placeholder": "Remark", "isFocus": true },
        {
            "field": SC.OPT_DONE_DES_EVENT_STATUS, "type": "radiogroup", "name": "Status", "fieldLabel": [
                { value: '12', label: "RECEIVED" }
            ],
            "defaultValue": { value: '12', disabled: true }
        },
        { "field": "scanCode", "type": "input", "name": "Scan Code", "placeholder": "Scan Code", "maxLength": 34, "required": true, "clearInput": true }
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
            let amount = 0;
            let SOU_WAREHOUSE_ID = null;
            let rootID = reqValue.rootID;
            let qryStrOpt = {};

            if (storageObj) {
                if (reqValue[SC.OPT_SOU_WAREHOUSE_ID]) {
                    SOU_WAREHOUSE_ID = reqValue[SC.OPT_SOU_WAREHOUSE_ID];
                }

                if (reqValue['scanCode']) {
                    reqValue.scanCode = reqValue.scanCode.trim();
                    if (reqValue['scanCode'].trim().length === 34) {
                        let orderNoStr = reqValue['scanCode'].substr(0, 19);
                        let tempCardNo = [];
                        let cardNos = orderNoStr.split(',').map((x, i) => { 
                            if(!x.match(/^\@{9}$/)){
                                let card = x.replace(/\@/g, "");
                                if(card.length > 0){
                                    tempCardNo.push(card.trim()); 
                                    amount += 1;
                                }
                            } 
                        });
                        orderNo = tempCardNo.join();

                        let skuCode1 = reqValue['scanCode'].substr(19, 15);
                        skuCode = skuCode1.replace(/\@/g, "").trim();
                        // skuCode = skuCode.trim();

                        // cartonNo = '0';
                        let checksku = false;
                        if (storageObj.mapstos !== null && storageObj.mapstos.length > 0) {
                            let dataMapstos = storageObj.mapstos[0];
                            qryStrOpt = queryString.parse(dataMapstos.options);

                            if (skuCode !== null && skuCode !== dataMapstos.code) {
                                alertDialogRenderer("Product doesn't match the previous product on the pallet.", "error", true);
                                skuCode = null;
                            } 
                            if(rootID && skuCode && orderNo){
                                if(reqValue.action === 2) {
                                    if(orderNo === dataMapstos.orderNo){
                                        amount = 2;
                                    }else{
                                        alertDialogRenderer("Card No. doesn't match the previous product on the pallet.", "error", true);
                                        orderNo = null;
                                    }
                                }else if(reqValue.action === 1){
                                    alertDialogRenderer("This product has been existed on pallet.", "error", true);
                                    skuCode = null;
                                }
                            }
                        }

                        if (rootID && skuCode && orderNo) {

                            if (reqValue.action != 2 && SOU_WAREHOUSE_ID) {
                                qryStrOpt[SC.OPT_SOU_WAREHOUSE_ID] = SOU_WAREHOUSE_ID;
                            }
                            qryStrOpt[SC.OPT_CARTON_NO] = "0";
                            let qryStr1 = queryString.stringify(qryStrOpt)
                            let uri_opt = decodeURIComponent(qryStr1);

                            dataScan = {
                                allowSubmit: true,
                                orderNo: orderNo,
                                scanCode: skuCode,
                                options: uri_opt,
                                amount: amount,
                                validateSKUTypeCodes: ["WIP"],
                                clearRemark: true
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
                                alertDialogRenderer("Please scan the pallet before scan the product.", "error", true);
                            }
                        }
                    } else {
                        if (reqValue.action === 2) {
                            if (storageObj.code === reqValue.scanCode) {
                                resValuePost = { ...reqValue, allowSubmit: true }
                            }
                        }else{
                            if (storageObj.code !== reqValue.scanCode) {
                            resValuePost = { ...reqValue, allowSubmit: true, mapnewpallet: true }
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
                setVisibleTabMenu={[null, 'Add', 'Remove']}
                autoPost={true}
                setMovementType={"2011"}
                showOldValue={OnOldValueWH}
                customInfoChip={CustomInfoChipWIP}
            />
        </div>
    );

}
export default ReceiveWIPSup;