import React, { useState, useEffect } from "react";
import { apicall, createQueryString, Clone } from '../../../../components/function/CoreFunction2';
import { ExplodeRangeNum, MergeRangeNum } from '../../../../components/function/RangeNumUtill';
import AmMappingPallet from '../../../pageComponent/AmMappingPallet';
import AmDialogs from '../../../../components/AmDialogs'
import queryString from 'query-string'
import moment from 'moment';
import ToListTree from '../../../../components/function/ToListTree';
import * as SC from '../../../../constant/StringConst'

const Axios = new apicall();


const MappingReceivePallet = (props) => {
    const { } = props;
    const [showDialog, setShowDialog] = useState(null);
    const [stateDialog, setStateDialog] = useState(false);
    const [msgDialog, setMsgDialog] = useState("");
    const [typeDialog, setTypeDialog] = useState("");
    // const [supplierData, setSupplierData] = useState(null);

    const SupplierQuery = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "Supplier",
        q: '[{ "f": "Status", "c":"=", "v": 1}]',
        f: "*",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
    }
    const inputWarehouse = { "visible": true, "field": "warehouseID", "typeDropdown": "normal", "name": "Warehouse", "placeholder": "Select Warehouse", "fieldLabel": ["Code", "Name"], "fieldDataKey": "ID", "defaultValue": 1 };
    const inputArea = { "visible": true, "field": "areaID", "typeDropdown": "normal", "name": "Area", "placeholder": "Select Area", "fieldLabel": ["Code", "Name"], "fieldDataKey": "ID", "defaultValue": 2 };
    // const inputHeader = [
    //     { "field": SC.OPT_SUPPLIER_ID, "type": "dropdown", "typeDropdown": "normal", "name": "Supplier", "dataDropDown": SupplierQuery, "placeholder": "Select Supplier", "fieldLabel": ["Code", "Name"], "fieldDataKey": "ID", "required": true  },
    //     { "field": "donateDate", "type": "datetimepicker", "name": "Donate Date/Time", "required": true  },
    // ]
    const inputItem = [
        { "field": SC.OPT_SUPPLIER_ID, "type": "dropdown", "typeDropdown": "search", "name": "Supplier", "dataDropDown": SupplierQuery, "placeholder": "Select Supplier", "fieldLabel": ["Code", "Name"], "defaultValue": 1297, "fieldDataKey": "ID", "required": true },
        { "field": "donateDate", "type": "datetimepicker", "name": "Donate Date/Time", "required": true },
        { "field": "amount", "type": "number", "name": "Quantity", "placeholder": "Quantity", "defaultValue": 1, "required": true, "clearInput": true },
        { "field": "scanCode", "type": "input", "name": "Scan Code", "placeholder": "Scan Code", "required": true, "clearInput": true },
    ]

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

    async function onBeforePost(reqValue, storageObj) {
        let resValuePost = null;
        let dataScan = {};

        if (reqValue) {

            if (reqValue.rootID) {

                let SUPPLIER_ID = null;
                let oldOptions = {};
                let options = null;
                let optDATE = null;
                let optSUPPLIER_ID = null;
                if (reqValue[SC.OPT_SUPPLIER_ID]) {
                    SUPPLIER_ID = reqValue[SC.OPT_SUPPLIER_ID];
                }

                if (storageObj.mapstos !== null && storageObj.mapstos.length > 0) {
                    let dataMapSto = findMapSto(storageObj, reqValue.scanCode);

                    if (dataMapSto) {
                        oldOptions = queryString.parse(dataMapSto.options);
                        if (dataMapSto.parentID !== reqValue.rootID) {
                            if (dataMapSto.parentID) {
                                reqValue.rootID = dataMapSto.parentID;
                                reqValue.rootType = dataMapSto.parentType;
                            } else {
                                if (reqValue.action !== 2) {
                                    reqValue.rootID = dataMapSto.parentID;
                                    reqValue.rootType = dataMapSto.parentType;
                                } else {
                                    reqValue.rootID = dataMapSto.id;
                                    reqValue.rootType = dataMapSto.type;
                                }
                            }

                        }

                    }

                    if (oldOptions && oldOptions[SC.OPT_DATE] && oldOptions[SC.OPT_SUPPLIER_ID] 
                        && oldOptions[SC.OPT_DATE].length > 0 && oldOptions[SC.OPT_SUPPLIER_ID].length > 0) {
                             
                            let newsupplier_id = "";
                            let newdate = "";

                            if (reqValue.action === 2) {
                                let date = oldOptions[SC.OPT_DATE] ? oldOptions[SC.OPT_DATE].split(',') : [];
                                let newdates = date.slice(0, date.length - reqValue.amount);
                                newdate = newdates.join(',');

                                let supplier_id = oldOptions[SC.OPT_SUPPLIER_ID] ? oldOptions[SC.OPT_SUPPLIER_ID].split(',') : [];
                                let newsupplier_ids = supplier_id.slice(0, supplier_id.length - reqValue.amount);
                                newsupplier_id = newsupplier_ids.join(',');

                            } else {
                                if (SUPPLIER_ID) {
                                    newsupplier_id = oldOptions[SC.OPT_SUPPLIER_ID] ? oldOptions[SC.OPT_SUPPLIER_ID] + "," + runOptions(reqValue.amount, SUPPLIER_ID) : SUPPLIER_ID;
                                }
                                newdate = oldOptions[SC.OPT_DATE] ? oldOptions[SC.OPT_DATE] + "," + runOptions(reqValue.amount, reqValue.donateDate) : reqValue.donateDate;
                            }
                            optDATE = newdate;
                            optSUPPLIER_ID = newsupplier_id;
                    } else {
                        optDATE = runOptions(reqValue.amount, reqValue.donateDate);
                        optSUPPLIER_ID = runOptions(reqValue.amount, SUPPLIER_ID);
                    }
                } else {
                    optDATE = runOptions(reqValue.amount, reqValue.donateDate);
                    optSUPPLIER_ID = runOptions(reqValue.amount, SUPPLIER_ID);
                }
                oldOptions[SC.OPT_DATE] = optDATE;
                oldOptions[SC.OPT_SUPPLIER_ID] = optSUPPLIER_ID;
                let qryStr1 = queryString.stringify(oldOptions);
                options = decodeURIComponent(qryStr1);

                dataScan = {
                    allowSubmit: true,
                    options: options,
                };
                if (reqValue.action != 2) { //ไม่ใช่เคสลบ
                    if (SUPPLIER_ID == null || SUPPLIER_ID.length === 0) {
                        alertDialogRenderer("Please select supplier before.", "error", true);
                        dataScan.allowSubmit = false;
                    }
                }

                resValuePost = { ...reqValue, ...dataScan }
            } else {
                resValuePost = { ...reqValue }
            }
        }
        // console.log(resValuePost)
        return resValuePost;
    }
    function OnOldValue(storageObj) {
        let oldValue = [];
        if (storageObj) {
            oldValue = [{
                field: "warehouseID",
                value: storageObj.warehouseID
            },
            {
                field: "areaID",
                value: storageObj.areaID
            },
            {
                field: "amount",
                value: 0
            }]

            if (storageObj.mapstos !== null && storageObj.mapstos.length > 0) {
                var dataLastPack = findPack(storageObj);
                if (dataLastPack) {
                    // console.log(dataLastPack)
                    let qryStrOpt = queryString.parse(dataLastPack.options);
                    let optSup = qryStrOpt[SC.OPT_SUPPLIER_ID].split(',');
                    oldValue.push({
                        field: SC.OPT_SUPPLIER_ID,
                        value: optSup[optSup.length - 1]
                    });
                }

            }
        }
        return oldValue;
    }
    const findPack = (storageObj) => {
        var mapstosToTree = ToListTree(storageObj, 'mapstos');
        mapstosToTree.reverse();
        var pack = null;
        for (let no in mapstosToTree) {
            if (mapstosToTree[no].type === 2) {
                pack = mapstosToTree[no];
                break;
            } else {
                continue;
            }
        }
        return pack;
    }
    const runOptions = (amount, val) => {
        let text = "";
        for (let i = 0; i < amount; i++) {
            if (i === (amount - 1)) {
                text += val;
            } else {
                text += val + ",";
            }
        }
        return text;
    }
    const findFocusSto = (storageObj) => {
        let mapstosToTree = ToListTree(storageObj, 'mapstos');
        mapstosToTree.reverse();
        let pack = null;
        for (let no in mapstosToTree) {
            if (mapstosToTree[no].isFocus) {
                pack = mapstosToTree[no];
                break;
            } else {
                continue;
            }
        }
        return pack;
    }
    const findMapSto = (storageObj, scanCode) => {
        let mapstosToTree = ToListTree(storageObj, 'mapstos');
        mapstosToTree.reverse();
        let pack = null;
        for (let no in mapstosToTree) {
            if (mapstosToTree[no].code === scanCode) {
                var found = mapstosToTree.find(element => {
                    if (mapstosToTree[no].parentID) {
                        return element.id === mapstosToTree[no].parentID && element.isFocus === true;
                    } else {
                        return element.isFocus === true;
                    }
                });
                if (found) {
                    pack = mapstosToTree[no];
                }
                break;
            } else {
                continue;
            }
        }
        // console.log(pack)
        return pack;
    }

    return (
        <div>
            {stateDialog ? showDialog ? showDialog : null : null}

            <AmMappingPallet
                showWarehouseDDL={inputWarehouse}
                showAreaDDL={inputArea}
                // headerCreate={inputHeader} //input header
                itemCreate={inputItem} //input scan pallet
                onBeforePost={onBeforePost}
                // customOptions={customOptions}
                showOptions={false}
                modeMultiSKU={true}
                showOldValue={OnOldValue}
                autoPost={true}
                confirmReceiveMapSTO={true}
                setVisibleTabMenu={[null, 'Add', 'Remove']}
            />
        </div>
    );

}
export default MappingReceivePallet;