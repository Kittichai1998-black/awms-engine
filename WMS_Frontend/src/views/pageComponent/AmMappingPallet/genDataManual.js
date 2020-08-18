import React from "react";
import queryString from "query-string";

function genDataManual(postdata, valueInput, columnsManual) {
  let manualData = {}
  columnsManual.forEach(x => {
    manualData[x.field] = (valueInput[x.field] === undefined ? null : valueInput[x.field])
  })
  postdata.pstos.push(manualData)
  return postdata
}

function GenMapstosSelected(postdata, mapstosSelected) {
  console.log(mapstosSelected)
  mapstosSelected.forEach(element => {
    console.log(element)
    element.pstoCode = element.code
    element.addQty = element.addQty
    element.unitTypeCode = element.unitCode
    element.packUnitTypeCode = element.baseUnitCode
    postdata.pstos.push(element)
  });
  return postdata
}

export { genDataManual, GenMapstosSelected }

