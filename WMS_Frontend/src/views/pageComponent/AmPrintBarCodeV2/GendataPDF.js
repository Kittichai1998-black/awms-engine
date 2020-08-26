import React from "react";

import moment from "moment";
function LoadDataPDF(data, supplierName, supplierCode, numCount, remark) {
  console.log(data)
  let dataGenPDF = []


  for (let indexName in data) {
    console.log(indexName)
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

      console.log(pts)
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
    console.log(pcodeArr)
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
    console.log(pcode)
    itemPDF = {
      code: "N|" + indexName + "|" + pid + "|" + qty,
      title: skutype,
      skuType: 4,
      options: "codeNo=" + pcode + "&itemName=" + pname +
        "&lotNo=" + lot + "&controlNo=" + orderNo +
        "&supplier=" + supplierName + "&codeNo=" + supplierCode +
        "&mfgdate=" + productionDate + "&expdate=" + expireDate +
        "&qty=" + qty +
        "&unit=" + unitTypeCode +
        "&palletNo=" + indexName + "/" + (numCount - 1) +
        "&remark=" + remark
    }

    dataGenPDF.push(itemPDF)
    console.log(itemPDF)

  }
  console.log(dataGenPDF)
  let reqjson = {
    "layoutType": 91,
    "listsCode": dataGenPDF
  }
  console.log(reqjson)
  return reqjson
}
export { LoadDataPDF }
