import React, { useState, useEffect } from "react";
import { apicall, createQueryString, Clone } from '../../../../components/function/CoreFunction2';
import { ConvertRangeNumToString, ConvertStringToRangeNum } from '../../../../components/function/Convert';
import AmMappingPallet from '../../../pageComponent/AmMappingPallet';
import AmDialogs from '../../../../components/AmDialogs'
import queryString from 'query-string'
import moment from 'moment';
import ToListTree from '../../../../components/function/ToListTree';

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
    const inputHeader = [
        { "field": "supplierID", "type": "dropdown", "typeDropdown": "normal", "name": "Supplier", "dataDropDown": SupplierQuery, "placeholder": "Select Supplier", "fieldLabel": ["Code", "Name"], "fieldDataKey": "ID" },
        { "field": "donateDate", "type": "datetimepicker", "name": "Donate Date/Time" },
    ]
    const inputItem = [
        { "field": "amount", "type": "number", "name": "Quantity", "placeholder": "Quantity", "defaultValue": 1 },
        { "field": "scanCode", "type": "input", "name": "Scan Code", "placeholder": "Scan Code" },
    ]
    // useEffect(() => {
    //     GetSupplier();
    // }, [])
    // async function GetSupplier() {
    //     await Axios.get(createQueryString(SupplierQuery)).then(res => {
    //         if (res.data.datas) {
    //             setSupplierData(res.data.datas);
    //         }
    //     });
    // }
    // const getnew = (val) => {
    //     var show = "";
    //     for (let no in supplierData) {
    //         if (supplierData[no].ID === parseInt(val)) {
    //             show = supplierData[no].Code + " - " + supplierData[no].Name;
    //             break;
    //         } else {
    //             continue;
    //         }
    //     }
    //     return show;
    // }
    // const customOptions = (value) => {
    //     var qryStr = queryString.parse(value);
    //     let supNew = getnew(qryStr.supplier_id);
    //     let date = moment(qryStr.date).format("DD-MM-YYYY hh:mm")
    //     var res = [{
    //         text: 'SP',
    //         value: supNew,
    //         textToolTip: 'Supplier'
    //     }, {
    //         text: 'DT',
    //         value: date,
    //         textToolTip: 'Donate Date'
    //     }]

    //     return res;
    // }
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
        var resValuePost = null;
        var dataScan = {};
        if (reqValue) {
            if (reqValue.rootID) {
                var options = null;
                if (storageObj.mapstos !== null && storageObj.mapstos.length > 0) {
                    var dataMapSto = findMapSto(storageObj, reqValue.scanCode)
                    console.log(dataMapSto)
                    var oldOptions = null;
                    if (dataMapSto) {
                        oldOptions = dataMapSto.options !== undefined ? queryString.parse(dataMapSto.options) : null;
                    }

                    if (oldOptions) {
                        var newsupplier_id = "";
                        var newdate = "";

                        if (reqValue.action === 2) {
                            var date = oldOptions.date ? oldOptions.date.split(',') : [];
                            var newdates = date.slice(0, date.length - reqValue.amount);
                            newdate = newdates.join(',');

                            var supplier_id = oldOptions.supplier_id ? oldOptions.supplier_id.split(',') : [];
                            var newsupplier_ids = supplier_id.slice(0, supplier_id.length - reqValue.amount);
                            newsupplier_id = newsupplier_ids.join(',');

                        } else {
                            newsupplier_id = oldOptions.supplier_id ? oldOptions.supplier_id + "," + runOptions(reqValue.amount, reqValue.supplierID) : reqValue.supplierID;
                            newdate = oldOptions.date ? oldOptions.date + "," + runOptions(reqValue.amount, reqValue.donateDate) : reqValue.donateDate;
                        }
                        oldOptions.date = newdate;
                        oldOptions.supplier_id = newsupplier_id;
                        var qryStr1 = queryString.stringify(oldOptions);
                        options = decodeURIComponent(qryStr1)
                    }

                } else {
                    options = "date=" + runOptions(reqValue.amount, reqValue.donateDate) + "&supplier_id=" + runOptions(reqValue.amount, reqValue.supplierID)
                }
                dataScan = {
                    options: options,
                };
                resValuePost = { ...reqValue, ...dataScan }
            } else {
                resValuePost = { ...reqValue }
            }
        }
        return resValuePost;
    }

    const runOptions = (amount, val) => {
        var text = "";
        for (var i = 0; i < amount; i++) {
            if (i === (amount - 1)) {
                text += val;
            } else {
                text += val + ",";
            }
        }
        return text;
    }
    const findMapSto = (storageObj, scanCode) => {
        var mapstosToTree = ToListTree(storageObj, 'mapstos');
        mapstosToTree.reverse();
        var pack = null;
        for (let no in mapstosToTree) {
            if (mapstosToTree[no].code === scanCode) {
                pack = mapstosToTree[no];
                break;
            } else {
                continue;
            }
        }
        return pack;
    }
    return (
        <div>
            {stateDialog ? showDialog ? showDialog : null : null}

            <AmMappingPallet
                showWarehouseDDL={inputWarehouse}
                showAreaDDL={inputArea}
                headerCreate={inputHeader} //input header
                itemCreate={inputItem} //input scan pallet
                onBeforePost={onBeforePost}
                // customOptions={customOptions}
                showOptions={false}
                modeMultiSKU={true}
                confirmReceiveMapSTO={true}
                setVisibleTabMenu={[null, 'Add', 'Remove']}
            />
        </div>
    );

}
export default MappingReceivePallet;