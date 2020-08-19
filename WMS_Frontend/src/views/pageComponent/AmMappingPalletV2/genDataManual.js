import React from "react";
import queryString from "query-string";

function genDataManual(postdata, valueInput, columnsManual) {
  console.log(postdata)
  console.log(valueInput)
  console.log(columnsManual)
  let manualData = {}


  manualData["pstoCode"] = (valueInput["pstoCode"] === undefined ? null : valueInput["pstoCode"])
  manualData["batch"] = (valueInput["batch"] === undefined ? null : valueInput["batch"])
  manualData["lot"] = (valueInput["lot"] === undefined ? null : valueInput["lot"])
  manualData["orderNo"] = (valueInput["orderNo"] === undefined ? null : valueInput["orderNo"])
  manualData["itemNo"] = (valueInput["itemNo"] === undefined ? null : valueInput["itemNo"])
  manualData["refID"] = (valueInput["refID"] === undefined ? null : valueInput["refID"])
  manualData["ref1"] = (valueInput["ref1"] === undefined ? null : valueInput["ref1"])
  manualData["ref2"] = (valueInput["ref2"] === undefined ? null : valueInput["ref2"])
  manualData["ref3"] = (valueInput["ref3"] === undefined ? null : valueInput["ref3"])
  manualData["ref4"] = (valueInput["ref4"] === undefined ? null : valueInput["ref4"])
  manualData["forCustomerID"] = (valueInput["forCustomerID"] === undefined ? null : valueInput["forCustomerID"])
  manualData["options"] = (valueInput["options"] === undefined ? null : valueInput["options"])
  manualData["addQty"] = (parseInt(valueInput["addQty"]) === undefined ? null : parseInt(valueInput["addQty"]))
  manualData["unitTypeCode"] = (valueInput["UnitTypeCode"] === undefined ? null : valueInput["UnitTypeCode"])
  manualData["packUnitTypeCode"] = (valueInput["packUnitTypeCode"] === undefined ? null : valueInput["packUnitTypeCode"])
  manualData["expiryDate"] = (valueInput["expireDate"] === undefined ? null : valueInput["expireDate"])
  manualData["productDate"] = (valueInput["productDate"] === undefined ? null : valueInput["productDate"])
  manualData["shelfLifeDate"] = (valueInput["shelfLifeDate"] === undefined ? null : valueInput["shelfLifeDate"])

  postdata.pstos.push(manualData)
  return postdata
}

function GenMapstosSelected(postdata, mapstosSelected) {
  console.log(mapstosSelected)
  mapstosSelected.forEach(element => {
    console.log(element)
    element.pstoCode = element.code
    element.pstoID = element.id
    element.addQty = parseInt(element.addQty)
    element.unitTypeCode = element.unitCode
    element.packUnitTypeCode = element.baseUnitCode
    postdata.pstos.push(element)
  });
  return postdata
}

export { genDataManual, GenMapstosSelected }

