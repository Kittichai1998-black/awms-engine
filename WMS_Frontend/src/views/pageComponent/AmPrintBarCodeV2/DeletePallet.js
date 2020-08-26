import React from "react";


function DeletePallet(item, itemList, indexName) {

  console.log(item)
  console.log(itemList)
  console.log(indexName)

  delete itemList[indexName]
  let newObj = {}
  let i = 1
  for (var item in itemList) {
    newObj[i] = itemList[item]
    i++;
  }
  console.log(newObj)
  return null
}

export { DeletePallet }
