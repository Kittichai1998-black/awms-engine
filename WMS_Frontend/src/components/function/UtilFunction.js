
import moment from "moment";

const QueryGenerate = (queryStr, field, searchValue, dataType, dateField) => {
    var convertFilter = JSON.parse(queryStr.q)
    var queryFilter = [...convertFilter];
    var searchData = queryFilter.find(x => x.f === field);
    var searchSign = "=";
    searchValue = searchValue === null ? "" : searchValue.toString();
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

        if (searchData !== undefined) {
            if (dataType === "datetime") {
                if (dateField["dateFrom"]) {
                    searchData.v = dateField["dateFrom"];
                    searchData.c = ">=";
                }
                if (dateField["dateTo"]) {
                    searchData.v = dateField["dateTo"];
                    searchData.c = "<=";
                }
            } else {
                searchData.c = searchSign;
                searchData.v = searchValue;
            }
        } else {
            if (dataType === "datetime") {
                if (dateField["dateFrom"]) {
                    let createObj = {};
                    createObj.f = field;
                    createObj.v = dateField["dateFrom"];
                    createObj.c = ">=";
                }
                if (dateField["dateTo"]) {
                    let createObj = {};
                    createObj.f = field;
                    createObj.v = dateField["dateTo"];
                    createObj.c = "<=";
                }
            } else {
                searchData = {};
                searchData.f = field;
                searchData.c = searchSign;
                searchData.v = searchValue;
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

export { QueryGenerate }