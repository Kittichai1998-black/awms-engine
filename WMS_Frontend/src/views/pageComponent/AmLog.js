import React, { useState, useEffect } from "react";
import { apicall, createQueryString, Clone } from '../../components/function/CoreFunction';
import { withStyles } from '@material-ui/core/styles';
import AmDropdown from "../../components/AmDropdown";
import AmTable from "../../components/AmTable/AmTable";
import { useTranslation } from "react-i18next";
import AmButton from "../../components/AmButton";
import { IsEmptyObject } from "../../components/function/CoreFunction2";
import { QueryGenerate } from '../../components/function/UtilFunction';
import AmDatePicker from '../../components/AmDatePicker';
import styled from 'styled-components';
import moment from "moment";
import queryString from "query-string";

const Axios = new apicall();
const styles = theme => ({
    textNowrap: { overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', whiteSpace: 'nowrap' },
});
const FormInline = styled.div`
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    label {
    margin: 5px 0 5px 0;
    }
    input {
        vertical-align: middle;
    }
    @media (max-width: 800px) {
        flex-direction: column;
        align-items: stretch;
        
    }
`;
const useQueryData = (queryObj, historySearch) => {
    const [dataSource, setDataSource] = useState([])
    const [count, setCount] = useState(0)

    useEffect(() => {
        if (typeof queryObj === "object") {
            if (historySearch && historySearch.length > 0) {
                let searchValue = queryString.parse(historySearch);
                var getQuery = {};

                Object.entries(searchValue).forEach(([key, value], index) => {
                    getQuery = QueryGenerate({ ...queryObj }, key, value)
                });
                var queryStr = createQueryString(getQuery)
                Axios.get(queryStr).then(res => {
                    setDataSource(res.data.datas)
                    setCount(res.data.counts)
                });
            } else {
                var queryStr = createQueryString(queryObj)
                Axios.get(queryStr).then(res => {
                    setDataSource(res.data.datas)
                    setCount(res.data.counts)
                });
            }
        }
    }, [queryObj, historySearch])

    return { dataSource, count };
}

const queryLog = (tableQuery, pageSize, historySearch) => {
    let q = '[]';
    if (historySearch && historySearch.length > 0) {
        q = '[]';
    } else {
        let now = moment().format("YYYY-MM-DDT00:00:00");
        q = '[{ "f": "LogTime", "c":">=", "v": "' + now + '"}]';
    }
    //let nowAdd1Day = moment().add(1, 'days').format("YYYY-MM-DDT00:00:00");
    return (
        {
            queryString: window.apipath + "/v2/SelectDataLogAPI/",
            t: tableQuery,
            q: q,
            f: "*",
            g: "",
            s: "[{'f':'LogTime','od':'desc'}]",
            sk: 0,
            l: pageSize,
            all: "",
        })
};


const APIServiceLog = (props) => {
    const {
        classes,
        tableQuery,
        dataKey = "LogRow",
        historySearch,
        sortable,
        pageSize
    } = props;
    const { t } = useTranslation();

    const [queryObj, setQueryObj] = useState(() => {
        return queryLog(tableQuery, pageSize, historySearch)
    });
    const [page, setPage] = useState(1);
    const { dataSource, count } = useQueryData(queryObj, historySearch);
    const [iniQuery, setIniQuery] = useState(true);
    const [sort, setSort] = useState({});

    useEffect(() => {
        if (typeof (page) === "number" && !iniQuery) {
            const queryEdit = JSON.parse(JSON.stringify(queryObj));
            queryEdit.sk = page === 0 ? 0 : (page - 1) * parseInt(queryEdit.l, 10);
            setQueryObj(queryEdit)
        }
    }, [page])
    useEffect(() => {
        if (!IsEmptyObject(sort)) {
            queryObj.s = '[{"f":"' + sort.id + '","od":"' + sort.sortDirection + '"}]';
            setQueryObj({ ...queryObj })
        }
    }, [sort])
    const onChangeFilterData = (filterValue) => {
        var res = {};
        console.log(filterValue)
        filterValue.forEach(fdata => {
            if (fdata.customFilter !== undefined) {
                if (IsEmptyObject(fdata.customFilter)) {
                    res = QueryGenerate({ ...queryObj }, fdata.field, fdata.value)
                } else {
                    res = QueryGenerate({ ...queryObj }, fdata.customFilter.field,
                        (fdata.customFilter.dateField === "dateTo" ?
                            fdata.customFilter.dateType === "date" ? fdata.value + "T23:59:59" : fdata.value
                            : fdata.value),
                        fdata.customFilter.dataType, fdata.customFilter.dateField)
                }
            } else {
                res = QueryGenerate({ ...queryObj }, fdata.field, fdata.value)
            }

        });
        if (!IsEmptyObject(res))
            setQueryObj(res)

    }

    const useColumns = (cols) => {
        const [columns, setColumns] = useState(cols);

        useEffect(() => {
            const iniCols = [...cols];

            iniCols.forEach(col => {
                let filterConfig = col.filterConfig;
                if (filterConfig !== undefined) {
                    if (filterConfig.filterType === "dropdown") {
                        col.Filter = (field, onChangeFilter) => {
                            var checkType = Array.isArray(filterConfig.dataDropDown);
                            if (checkType) {
                                return <AmDropdown
                                    id={field}
                                    placeholder={col.placeholder}
                                    fieldDataKey={filterConfig.fieldDataKey === undefined ? "value" : filterConfig.fieldDataKey}
                                    fieldLabel={filterConfig.fieldLabel === undefined ? ["label"] : filterConfig.fieldLabel}
                                    labelPattern=" : "
                                    width={filterConfig.widthDD !== undefined ? filterConfig.widthDD : 170}
                                    ddlMinWidth={170}
                                    zIndex={1000}
                                    data={filterConfig.dataDropDown}
                                    onChange={(value, dataObject, inputID, fieldDataKey) => onChangeFilter(field, value, col.customFilter)}
                                />
                            }
                            else {
                                return <AmDropdown
                                    id={field}
                                    placeholder={col.placeholder}
                                    fieldDataKey={filterConfig.fieldDataKey === undefined ? "value" : filterConfig.fieldDataKey}
                                    fieldLabel={filterConfig.fieldLabel === undefined ? ["label"] : filterConfig.fieldLabel}
                                    labelPattern=" : "
                                    width={filterConfig.widthDD !== undefined ? filterConfig.widthDD : 170}
                                    ddlMinWidth={170}
                                    zIndex={1000}
                                    queryApi={filterConfig.dataDropDown}
                                    onChange={(value, dataObject, inputID, fieldDataKey) => onChangeFilter(field, value, col.customFilter)}
                                    ddlType={filterConfig.typeDropDown}
                                />
                            }

                        }
                    } else if (filterConfig.filterType === "date") {
                        col.width = 250;
                        col.Filter = (field, onChangeFilter) => {
                            return <FormInline>
                                <AmDatePicker defaultValue={true} style={{ display: "inline-block" }}
                                    onChange={(ele) => { }}
                                    onBlur={(e) => {
                                        if (e !== undefined && e !== null)
                                            onChangeFilter(field, e.fieldDataObject, { ...col.customFilter, dataType: "datetime", dateField: "dateFrom", dateType: "date" })
                                    }} TypeDate={"date"} fieldID="dateFrom" />
                                <label>-</label>
                                <AmDatePicker defaultValue={true} style={{ display: "inline-block" }}
                                    onChange={(ele) => { }}
                                    onBlur={(e) => {
                                        if (e !== undefined && e !== null)
                                            onChangeFilter(field, e.fieldDataObject, { ...col.customFilter, dataType: "datetime", dateField: "dateTo", dateType: "date" })
                                    }} TypeDate={"date"} fieldID="dateTo" />
                            </FormInline>
                        }
                    } else if (filterConfig.filterType === "datetime") {
                        col.width = 250;
                        col.Filter = (field, onChangeFilter) => {
                            return <FormInline>
                                <AmDatePicker defaultValue={true} style={{ display: "inline-block" }}
                                    // onChange={(ele) => { }}
                                    onBlur={(e) => {
                                        if (e !== undefined && e !== null)
                                        {
                                            console.log(e)
                                            onChangeFilter(field, e.fieldDataObject, { ...col.customFilter, dataType: "datetime", dateField: "dateFrom", dateType: "datetime-local" })
                                        }
                                    }} TypeDate={"datetime-local"} setTimeZero={true} fieldID="dateFrom" />
                                <label>-</label>
                                <AmDatePicker defaultValue={true} style={{ display: "inline-block" }}
                                    // onChange={(ele) => { }}
                                    onBlur={(e) => {
                                        if (e !== undefined && e !== null)
                                        {
                                            console.log(e)
                                            onChangeFilter(field, e.fieldDataObject, { ...col.customFilter, dataType: "datetime", dateField: "dateTo", dateType: "datetime-local" })
                                        }   
                                    }} TypeDate={"datetime-local"} setTimeZero={true} fieldID="dateTo" />
                            </FormInline>
                        }
                    }
                }
            })
            setColumns(iniCols);
        }, [])

        return { columns };
    }
    const { columns } = useColumns(props.columns);

    return (
        <>
            <AmTable
                sortable={sortable ? sortable : false}
                sortData={(dt) => {
                    if (sortable)
                        setSort(dt)
                }}
                columns={columns}
                dataKey={dataKey}
                dataSource={dataSource} //
                filterable={true}
                filterData={res => { 
                    console.log(res)
                    onChangeFilterData(res);
                }}
                rowNumber={true}
                totalSize={count}//
                pageSize={pageSize}
                height={500}
                pagination={true}
                onPageChange={p => {
                    if (page !== p) //
                        setPage(p)
                    else
                        setIniQuery(false)
                }}
            />
        </>
    )
}
export default withStyles(styles)(APIServiceLog);