
import moment from "moment";

const QueryGenerate = (queryStr, field, searchValue, dataType, dateField) => {
    console.log(searchValue)
    var convertFilter = JSON.parse(queryStr.q)
    var queryFilter = [...convertFilter];
    var searchData = queryFilter.find(x => x.f === field);
    var searchSign = "=";
    searchValue = searchValue === null ? "" : searchValue.toString();
    console.log(searchValue)
    if (searchValue !== "") {
        if (searchValue.startsWith(">=")) {
            searchSign = ">=";
            searchValue = searchValue.substr(2, searchValue.length - 1)
        }
        else if (searchValue.startsWith("<=")) {
            searchSign = "<=";
            searchValue = searchValue.substr(2, searchValue.length - 1)

        }
        else if (searchValue.startsWith(">")) {
            searchSign = ">";
            searchValue = searchValue.substr(1, searchValue.length - 1)

        }
        else if (searchValue.startsWith("<")) {
            searchSign = "<";
            searchValue = searchValue.substr(1, searchValue.length - 1)

        }
        else if (searchValue.startsWith("%") || searchValue.endsWith("%") || searchValue.startsWith("*") || searchValue.endsWith("*")) {
            searchSign = "LIKE";

        }
        else if (searchValue.includes(",")) {
            searchSign = "IN";
        }
        else if (searchValue.startsWith("=")) {
            searchSign = "=";
        }
        else{
            if(dataType !== "datetime"){
                searchValue = `%${searchValue}%`
                searchSign = "LIKE";
            }
        }

        if (searchData !== undefined) {
            if (dataType === "datetime") {
                let findDateType = queryFilter.filter(x => x.f === field);

                if (dateField === "dateFrom") {
                    let findFrom = findDateType.find(x => x.c === ">=");
                    if (findFrom === undefined) {
                        let resDateTime = customDateTime(dateField, field, searchValue);
                        queryFilter.push(resDateTime);
                    }
                    else
                        findFrom.v = searchValue;
                }
                else if (dateField === "dateTo") {
                    let findFrom = findDateType.find(x => x.c === "<=");
                    if (findFrom === undefined) {
                        let resDateTime = customDateTime(dateField, field, searchValue);
                        queryFilter.push(resDateTime);
                    }
                    else
                        findFrom.v = searchValue;
                }
            } else {
                console.log(searchSign)
                searchData.c = searchSign;
                searchData.v = searchValue;
            }
        } else {
            if (dataType === "datetime") {
                let resDateTime = customDateTime(dateField, field, searchValue);
                queryFilter.push(resDateTime);
            } else {
                // console.log(field)
                // console.log(searchSign)
                // console.log(searchValue)
                //searchData = {};
                // searchData.f = field;
                // searchData.c = searchSign;
                // searchData.v = searchValue;
                searchData = {};
                searchData.f = field;
                searchData.c = "LIKE";
                searchData.v = "%*" + searchValue + "*%";
                queryFilter.push(searchData)
            }
        }
    }
    else {
        queryFilter = [...queryFilter.filter(x => x.f !== field)];
    }

    queryStr.q = JSON.stringify(queryFilter);
    return queryStr;
}

const customDateTime = (dateField, field, searchValue) => {
    if (dateField === "dateFrom") {
        let createObj = {};
        createObj.f = field;
        createObj.v = searchValue;
        createObj.c = ">=";
        return createObj;
    }
    if (dateField === "dateTo") {
        let createObj = {};
        createObj.f = field;
        createObj.v = searchValue;
        createObj.c = "<=";
        return createObj;
    }
}

export { QueryGenerate }