function ExplodeRangeNum(value) {

    let newvalue = "";
    let newArray = ExplodeRangeNumToIntArray(value);
    newArray.forEach((value, index) => {
        if (index === newArray.length - 1) {
            newvalue = newvalue.concat(value);
        } else {
            newvalue = newvalue.concat(value, ',');
        }
    })
    return newvalue;
}

function ExplodeRangeNumToIntArray(value) {
    let newArray = [];
    let strVal = [];

    if (value) {
        if (Array.isArray(value)) {
            if (value.length > 0) {
                value.forEach(element => {
                    newArray = newArray.concat(ConvertRangeNumToIntArray(element));
                });
            }
        } else {
            if (value.includes(",")) {
                strVal = value.split(",");
                strVal.forEach(element => {
                    if (element != null && element.length > 0)
                        newArray = newArray.concat(ConvertRangeNumToIntArray(element));
                });
            } else {
                newArray = newArray.concat(ConvertRangeNumToIntArray(value))
            }
        }
        newArray.sort((a, b) => a - b);
    }
    return newArray;
}

function ConvertRangeNumToIntArray(element) {
    let newArray = [];
    if (element.includes("-")) {
        let eleArray = element.split("-").map((a) => {
            return a = a ? parseInt(a) : 0;
        });
        let i = eleArray[0];
        let end = eleArray[1];

        if (end === 0) {
            newArray.push(i);
        } else {
            while (i <= end) {
                newArray.push(i);
                i++;
            }
        }
    } else {
        newArray.push(Number(element));
    }
    newArray.sort((a, b) => a - b);
    return newArray;
}

function MergeRangeNum(value) {
    let res = ToRanges(value.split(',').map((a) => {
        return a = a ? parseInt(a) : 0;
    }));
    return res.join();
}

function ConvertToRangeNum(values) { //values type array
    var res = ToRanges(values);
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
const match = (arr, arr2) => {
    var ret = [];
    for (var i in arr) {
        if (arr2.indexOf(arr[i]) > -1) {
            ret.push(arr[i]);
        }
    }
    return ret;
};
export { ExplodeRangeNum, ExplodeRangeNumToIntArray, ConvertToRangeNum, MergeRangeNum, ToRanges, match }