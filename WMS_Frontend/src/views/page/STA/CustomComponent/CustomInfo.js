import queryString from "query-string";
import * as SC from '../../../../constant/StringConst'

const CustomInfoChip = (row) => {
    let tempInfo = [];
    if (row.skuTypeName && row.skuTypeName !== null) {
        tempInfo.push({
            text: 'S',
            value: row.skuTypeName,
            textToolTip: 'Size'
        })
    }else{
        if (row.objectSizeName && row.objectSizeName !== null) {
            tempInfo.push({
                text: 'OS',
                value: row.objectSizeName,
                textToolTip: 'Object Size'
            })
        }
    }
    
    if (row.orderNo && row.orderNo !== null) {
        tempInfo.push({
            text: 'SI',
            value: row.orderNo,
            textToolTip: 'SI.'
        })
    }
    if (row.qty && row.unitCode && row.qty !== null && row.unitCode !== null) {
        tempInfo.push({
            text: 'Q',
            value: row.qty + " " + row.unitCode,
            textToolTip: 'Quantity'
        })
    }
    if (row.options !== null) {
        var qryStr = queryString.parse(row.options)
        if (qryStr[SC.OPT_CARTON_NO]) {
            tempInfo.push({
                text: 'CN',
                value: qryStr[SC.OPT_CARTON_NO],
                textToolTip: 'Carton No.'
            })
        }
    }
    return tempInfo
};

const CustomInfoChipWIP = (row) => {
    let tempInfo = [];
    if (row.skuTypeName && row.skuTypeName !== null) {
        tempInfo.push({
            text: 'S',
            value: row.skuTypeName,
            textToolTip: 'Size'
        })
    }else{
        if (row.objectSizeName && row.objectSizeName !== null) {
            tempInfo.push({
                text: 'OS',
                value: row.objectSizeName,
                textToolTip: 'Object Size'
            })
        }
    }
    
    if (row.orderNo && row.orderNo !== null) {
        tempInfo.push({
            text: 'CA',
            value: row.orderNo,
            textToolTip: 'Card No.'
        })
    }
    if (row.qty && row.unitCode && row.qty !== null && row.unitCode !== null) {
        tempInfo.push({
            text: 'Q',
            value: row.qty + " " + row.unitCode,
            textToolTip: 'Quantity'
        })
    }

    return tempInfo
};

function OnOldValueWH(storageObj) {
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
            value: qryStrOpt_root[SC.OPT_REMARK] ? qryStrOpt_root[SC.OPT_REMARK] : ""
        }, {
            field: "scanCode",
            value: ""
        }]

        if (storageObj.mapstos !== null && storageObj.mapstos.length > 0) {
            let dataMapstos = storageObj.mapstos[0];
            let qryStrOpt = queryString.parse(dataMapstos.options);

            oldValue.push({
                field: SC.OPT_SOU_WAREHOUSE_ID,
                value: parseInt(qryStrOpt[SC.OPT_SOU_WAREHOUSE_ID])
            });
        }
    }
    return oldValue;
}

function OnOldValue(storageObj) {
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
            value: qryStrOpt_root[SC.OPT_REMARK] ? qryStrOpt_root[SC.OPT_REMARK] : ""
        }, {
            field: "cartonNo",
            value: ""
        }, {
            field: "amount",
            value: 0
        }]

        if (storageObj.mapstos !== null && storageObj.mapstos.length > 0) {
            let dataMapstos = storageObj.mapstos[0];
            //let qryStrOpt = queryString.parse(dataMapstos.options);

            oldValue.push({
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
            }, {
                field: "orderNo",
                value: ""
            });
        }
    }
    return oldValue;
}
export { CustomInfoChip, CustomInfoChipWIP, OnOldValueWH, OnOldValue }