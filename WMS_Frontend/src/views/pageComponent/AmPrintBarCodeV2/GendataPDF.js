import React from "react";

import moment from "moment";
function LoadDataPDF(data, supplierName, supplierCode, numCount) {
  console.log(moment().format("MM/DD/YYYY").toString())
  let dataGenPDF = []
  let itemPDF = {}
  var pcodeArr = []
  var pidArr = []
  var lotArr = []
  var orderNoArr = []
  var qtyArr = []
  var skutype = ""
  for (let indexName in data) {
    console.log(indexName)
    //var pcode = data[indexName].SKUMaster_Code.join()
    //console.log(pcode)
    data[indexName].forEach((pts) => {

      console.log(pts)
      if (pts.SKUMaster_Code !== null)
        pcodeArr.push(pts.SKUMaster_Code)
      if (pts.ID !== null)
        pidArr.push(pts.ID)
      if (pts.OrderNo !== null)
        orderNoArr.push(pts.OrderNo)
      if (pts.Lot !== null)
        lotArr.push(pts.Lot)
      if (pts.Quantity_Genarate !== null)
        qtyArr.push(pts.Quantity_Genarate)

      skutype = pts.SKUMasterTypeName
    })
    console.log(pcodeArr)
    var pcode = pcodeArr.join()
    var pid = pidArr.join()
    var qty = qtyArr.join()
    var lot = lotArr.join()
    var orderNo = orderNoArr.join()
    console.log(pcode)
    itemPDF = {
      code: "N|" + indexName + "|" + pid + "|" + qty,
      title: skutype,
      options: "itemName=" + pcode +
        "&lotNo=" + lot + "&controlNo=" + orderNo +
        "&supplier=" + supplierName + "&codeNo=" + supplierCode +
        "&receivedDate=" + moment().format("MM/DD/YYYY").toString() + "&qtyReceived=" + qty +
        "&palletNo=" + indexName + "/" + (numCount - 1)
    }

    dataGenPDF.push(itemPDF)
    console.log(itemPDF)

  }
  console.log(dataGenPDF)
  return null
}
export { LoadDataPDF }
