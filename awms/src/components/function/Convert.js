// import React, { Component } from 'react';
// import Axios from 'axios';

function ConvertRangeNumToString(value) {

    let newvalue = "";
    let newArray = [];
    let strVal = [];

    if (value) {
        if (Array.isArray(value)) {
            if (value.length > 0) {
                value.forEach(element => {
                    // console.log(element)
                    newArray = newArray.concat(TransferToArray(element));
                });
            }
        } else {
            if (value.includes(",")) {
                strVal = value.split(",");
                strVal.forEach(element => {
                    // console.log(element)
                    newArray = newArray.concat(TransferToArray(element));
                });
            } else {
                newArray = newArray.concat(TransferToArray(value))
            }
        }
    }
    // console.log(newArray)

    newArray.forEach((value, index) => {
        if (index === newArray.length - 1) {
            newvalue = newvalue.concat(value);
        } else {
            newvalue = newvalue.concat(value, ',');
        }
    })
    // console.log(newvalue)

    return newvalue;
}
function TransferToArray(element) {
    let newArray = [];
    if (element.includes("-")) {
        let eleArray = element.split("-");
        let i = Number(eleArray[0]);
        let end = Number(eleArray[1]);
        while (i <= end) {
            newArray.push(i);
            i++;
        }
    } else {
        newArray.push(Number(element));
    }
    return newArray;
}

function ConvertStringToRangeNum(value) {
    let res = ToRanges(value.split(',').map((number) => {
        return Number(number)
    }));
    console.log(res)
    return res.join();
}

function ToRanges(value) {
    if (value.length < 1) return [];
    value.sort((a, b) => a - b);
    let lng = value.length;
    let fromnums = [];
    let tonums = [];
    for (var i = 0; i < lng - 1; i++) {
        if (i == 0)
            fromnums.push(value[0]);
        if (value[i + 1] > value[i] + 1) {
            tonums.push(value[i]);
            fromnums.push(value[i + 1]);
        }
    }
    tonums.push(value[lng - 1]);
    return fromnums.map((x, i) => x.toString() + (tonums[i] === x ? "" : "-" + tonums[i].toString()));
}

export { ConvertRangeNumToString, ConvertStringToRangeNum, ToRanges }