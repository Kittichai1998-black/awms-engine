import React from "react";
import queryString from "query-string";

function genDataManual(postdata, valueInput, columnsManual) {
  // let manualData = {
  //   pstoCode: valueInput.processType,
  //   batch: valueInput.PalletCode,
  //   lot: valueInput.warehouseID,
  //   orderNo: valueInput.areaID,
  //   itemNo: null,
  //   refID: valueInput.processType,
  //   ref1: valueInput.PalletCode,
  //   ref2: valueInput.warehouseID,
  //   ref3: valueInput.areaID,
  //   cartonNo: null,
  //   options: valueInput.processType,
  //   addQty: valueInput.PalletCode,
  //   unitTypeCode: valueInput.warehouseID,
  //   packUnitTypeCode: valueInput.areaID,
  //   expireDate: null,
  //   incubationDate: null,
  //   productDate: null,
  // };
  let manualData = {}
  columnsManual.forEach(x => {
    console.log(x)
    manualData[x.field] = (valueInput[x.field] === undefined ? null : valueInput[x.field])
  })
  postdata.pstos.push(manualData)
  return postdata
}

function GenMapstosSelected(postdata, mapstosSelected) {
  mapstosSelected.forEach(element => {

    element.pstoCode = element.code
    element.addQty = 25
    element.unitTypeCode = element.unitCode
    element.packUnitTypeCode = element.baseUnitCode
    postdata.pstos.push(element)
  });
  return postdata
}

export { genDataManual, GenMapstosSelected }

