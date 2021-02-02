import React from "react";


function DeletePallet(item, itemList, indexName) {
  delete itemList[indexName]
  let newObj = {}
  let i = 1
  for (var item in itemList) {
    newObj[i] = itemList[item]
    i++;
  }
  return null
}

export { DeletePallet }
