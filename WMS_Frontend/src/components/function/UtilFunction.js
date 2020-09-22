import moment from "moment";
import queryString from "query-string";

const QueryGenerate = (queryStr, field, searchValue, dataType, dateField, searchString) => {

    const qrySearch = queryString.parse(searchString);
    let qryArr = [];
    for(let str in qrySearch){
        qryArr.push({f:str,c:'=',v:qrySearch[str]});
    }
    var convertFilter = JSON.parse(queryStr.q)
    var queryFilter = [...qryArr,...convertFilter];
    var searchData = queryFilter.find(x => x.f.toUpperCase() === field.toUpperCase());
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
                searchData = {};
                searchData.f = field;
                searchData.c = searchSign;
                searchData.v = searchValue;
                // searchData = {};
                // searchData.f = field;
                // searchData.c = "LIKE";
                // searchData.v = "%*" + searchValue + "*%";
                queryFilter.push(searchData)
            }
        }
    }
    else {
        queryFilter = [...queryFilter.filter(x => x.f !== field)];
    }

    queryStr.q = JSON.stringify(queryFilter);

    let urlParams = new URLSearchParams();
    queryFilter.filter(x=> x.c === '=').forEach(x => {
        urlParams.set(x.f, x.v)
    })
    queryStr.querySearch = urlParams.toString();
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