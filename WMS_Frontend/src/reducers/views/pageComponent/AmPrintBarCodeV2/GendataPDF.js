import React from "react";
import _ from "lodash";
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
    var tag_qr = []
    var skutype = ""
    var skuID = ""
    // console.log(data[indexName])
    // console.log(_.groupBy(data[indexName], "SKUMaster_Code"))
    var groupSKUMaster_Code = _.groupBy(data[indexName], "SKUMaster_Code");
    var pcodeArr = Object.keys(groupSKUMaster_Code)

    var groupSKUMaster_Name = _.groupBy(data[indexName], "SKUMaster_Name");
    var pnameArr = Object.keys(groupSKUMaster_Name)

    var groupOrderNo = _.groupBy(data[indexName], "OrderNo");
    var orderNoArr = Object.keys(groupOrderNo)

    var groupProductionDate = _.groupBy(data[indexName], "ProductionDate");
    var productionDateArr = Object.keys(groupProductionDate)

    var groupExpireDate = _.groupBy(data[indexName], "ExpireDate");
    var expireDateArr = Object.keys(groupExpireDate)

    var groupRef1 = _.groupBy(data[indexName], "Ref1");
    var ref1Arr = Object.keys(groupRef1)

    var groupLot = _.groupBy(data[indexName], "Lot");
    var lotArr = Object.keys(groupLot)
    // console.log(xx)
    // console.log(xx.join())
    data[indexName].forEach((pts) => {
      var ts = Math.round((new Date()).getTime() / 1000);
      // if (pts.SKUMaster_Code !== null) {
      //   console.log(pts)
      //   pcodeArr.push(pts.SKUMaster_Code)
      //   console.log(_.groupBy(pts, "SKUMaster_Code"))
      // }
      // if (pts.SKUMaster_Name !== null)
      //   pnameArr.push(pts.SKUMaster_Name)
      if (pts.ID !== null) {
        pidArr.push(pts.ID)
        tag_qr.push(ts + "-" + indexName + pts.ID)
      }
      // if (pts.OrderNo !== null)
      //   orderNoArr.push(pts.OrderNo)
      if (pts.Lot !== null) {
        if (pts.SKUMasterTypeName === "Pack Material" || pts.SKUMasterTypeName === "Other") {
          //lotArr.push(pts.Ref1)
          lotArr = ref1Arr
        } else {
          lotArr = lotArr
          //lotArr.push(pts.Lot)
        }
      }
      if (pts.Quantity_Genarate !== null)
        qtyArr.push(pts.Quantity_Genarate)
      // if (pts.ProductionDate !== null)
      //   productionDateArr.push(pts.ProductionDate)
      // if (pts.ExpireDate !== null)
      //   expireDateArr.push(pts.ExpireDate)
      if (pts.UnitType_Code !== null)
        unitTypeCodeArr.push(pts.UnitType_Code)



      skuID = pts.SKUMasterTypeID
      skutype = pts.SKUMasterTypeName
    })
    //console.log(lot)
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
    var tag = tag_qr.join()

    itemPDF = {
      code: "N|" + indexName + "|" + pid + "|" + qty + "|" + tag,
      title: skutype,
      skuType: 4,
      options: "codeNo=" + (pcode.length < 15 ? pcode : (pcode.substring(0, 15) + "...")) +
        "&itemName=" + (pname.length < 35 ? pname : (pname.substring(0, 35) + "...")) +
        "&lotNo=" + (lot.length < 30 ? lot : (lot.substring(0, 30) + "...")) +
        "&controlNo=" + (orderNo.length < 13 ? orderNo : (orderNo.substring(0, 13) + "...")) +
        "&supplier=" + supplierName + "&codeNo=" + supplierCode +
        "&mfgdate=" + (productionDate.length < 13 ? productionDate : (productionDate.substring(0, 13) + "...")) +
        "&expdate=" + (expireDate.length < 13 ? expireDate : (expireDate.substring(0, 13) + "...")) +
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
  //console.log(reqjson)
  return reqjson
}
export { LoadDataPDF }
