import React from "react";

import moment from "moment";
function LoadDataPDF(data, supplierName, supplierCode, totalPallet, remark, docID) {
  let dataGenPDF = []
  for (let indexName in data) {
    var pcodeArr = []
    var pnameArr = []
    var pidArr = []
    var lotArr = []
    var orderNoArr = []
    var qtyArr = []
    var productionDateArr = []
    var expireDateArr = []
    var unitTypeCodeArr = []
    var skutype = ""
    var skuID = ""
    data[indexName].forEach((pts) => {

      if (pts.SKUMaster_Code !== null)
        pcodeArr.push(pts.SKUMaster_Code)
      if (pts.SKUMaster_Name !== null)
        pnameArr.push(pts.SKUMaster_Name)
      if (pts.ID !== null)
        pidArr.push(pts.ID)
      if (pts.OrderNo !== null)
        orderNoArr.push(pts.OrderNo)
      if (pts.Lot !== null)
        lotArr.push(pts.Lot)
      if (pts.Quantity_Genarate !== null)
        qtyArr.push(pts.Quantity_Genarate)
      if (pts.ProductionDate !== null)
        productionDateArr.push(pts.ProductionDate)
      if (pts.ExpireDate !== null)
        expireDateArr.push(pts.ExpireDate)
      if (pts.UnitType_Code !== null)
        unitTypeCodeArr.push(pts.UnitType_Code)

      skuID = pts.SKUMasterTypeID
      skutype = pts.SKUMasterTypeName
    })
    let itemPDF = {}
    var pcode = pcodeArr.join()
    var pid = pidArr.join()
    var qty = qtyArr.join()
    var lot = lotArr.join()
    var orderNo = orderNoArr.join()
    var pname = pnameArr.join()
    var productionDate = productionDateArr.join()
    var expireDate = expireDateArr.join()
    var unitTypeCode = unitTypeCodeArr.join()
    var ts = Math.round((new Date()).getTime() / 1000);
    itemPDF = {
      code: "N|" + indexName + "|" + pid + "|" + qty + "|" + ts + "-" + indexName + pid,
      title: skutype,
      skuType: 4,
      options: "codeNo=" + pcode + "&itemName=" + pname +
        "&lotNo=" + lot + "&controlNo=" + orderNo +
        "&supplier=" + supplierName + "&codeNo=" + supplierCode +
        "&mfgdate=" + productionDate + "&expdate=" + expireDate +
        "&qty=" + qty +
        "&unit=" + unitTypeCode +
        "&palletNo=" + indexName + "/" + totalPallet +
        "&remark=" + (remark === null ? "" : remark)
    }

    dataGenPDF.push(itemPDF)
  }
  let reqjson = {
    "layoutType": 91,
    "docID": docID,
    "listsCode": dataGenPDF
  }
  return reqjson
}
export { LoadDataPDF }
