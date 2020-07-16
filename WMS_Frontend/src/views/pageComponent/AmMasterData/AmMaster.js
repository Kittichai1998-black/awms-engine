import React, { useState, useEffect, useMemo, useCallback } from "react";
import { apicall, createQueryString } from '../../../components/function/CoreFunction';
import { QueryGenerate } from '../../../components/function/UtilFunction';
import AmTable from "../../../components/AmTable/AmTable";
import AmDialogs from "../../../components/AmDialogs";
import AmButton from "../../../components/AmButton";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import { IsEmptyObject } from "../../../components/function/CoreFunction2";
import AmDropdown from '../../../components/AmDropdown';
import AmStorageObjectStatus from "../../../components/AmStorageObjectStatus";
import AmDatePicker from '../../../components/AmDate';
import styled from 'styled-components';

import AmMasterEditorData from "./AmMasterEditorData";

const Axios = new apicall()

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

const useQueryData = (queryObj) => {
    const [dataSource, setDataSource] = useState([])
    const [count, setCount] = useState(0)

    useEffect(() => {
        if (typeof queryObj === "object") {
            var queryStr = createQueryString(queryObj)
            Axios.get(queryStr).then(res => {
                setDataSource(res.data.datas)
                setCount(res.data.counts)
            });
        }
    }, [queryObj])
    return { dataSource, count };
}

const viewQuery = (tableQuery, codeInclude, pageSize) => ({
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: tableQuery,
    q: '[{ "f": "Status", "c":"<", "v": 2}]',
    f: "*",
    g: "",
    s: !codeInclude ? '[{"f":"ID","od":"asc"}]' : '[{"f":"Code","od":"asc"}]',
    sk: 0,
    l: pageSize,
    all: "",
});

const mstQuery = (tableQuery, codeInclude, pageSize) => ({
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: tableQuery,
    q: '[{ "f": "Status", "c":"<", "v": 2}]',
    f: "*",
    g: "",
    s: !codeInclude ? '[{"f":"ID","od":"asc"}]' : '[{"f":"Code","od":"asc"}]',
    sk: 0,
    l: pageSize,
    all: "",
});

const useColumns = (cols) => {
    const [columns, setColumns] = useState(cols);
    const [editData, setEditData] = useState();
    const [removeData, setRemoveData] = useState();


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
                                width={filterConfig.width !== undefined ? filterConfig.width : 150}
                                ddlMinWidth={200}
                                zIndex={1000}
                                data={filterConfig.dataDropDown}
                                onChange={(value, dataObject, inputID, fieldDataKey) => onChangeFilter(field, value)}
                            />
                        }
                        else {
                            return <AmDropdown
                                id={field}
                                placeholder={col.placeholder}
                                fieldDataKey={filterConfig.fieldDataKey === undefined ? "value" : filterConfig.fieldDataKey}
                                fieldLabel={filterConfig.fieldLabel === undefined ? ["label"] : filterConfig.fieldLabel}
                                labelPattern=" : "
                                width={200}
                                ddlMinWidth={200}
                                zIndex={1000}
                                queryApi={filterConfig.dataDropDown}
                                onChange={(value, dataObject, inputID, fieldDataKey) => onChangeFilter(field, value)}
                                ddlType={filterConfig.typeDropDown}
                            />
                        }

                    }
                } else if (filterConfig.filterType === "datetime") {
                    col.width = 350;
                    col.Filter = (field, onChangeFilter) => {
                        return <FormInline>
                            <AmDatePicker style={{ display: "inline-block" }} onBlur={(e) => { if (e !== undefined && e !== null) onChangeFilter(field, e.fieldDataObject, { dataType: "dateTime", dateField: "dateFrom" }) }} TypeDate={"date"} fieldID="dateFrom" />
                            <label>-</label>
                            <AmDatePicker style={{ display: "inline-block" }} onBlur={(e) => { if (e !== undefined && e !== null) onChangeFilter(field, e.fieldDataObject, { dataType: "dateTime", dateField: "dateTo" }) }} TypeDate={"date"} fieldID="dateTo" />
                        </FormInline>
                    }
                }
            }
        })

        iniCols.push({
            Header: "",
            fixWidth: 63,
            colStyle: { zIndex: -1 },
            filterable: false,
            Cell: (e) => <><IconButton
                size="small"
                aria-label="info"
                style={{ marginLeft: "3px" }}
                onClick={() => { setEditData({ ...e.data }) }}
            >
                <EditIcon
                    fontSize="small"
                    style={{ color: "#f39c12" }}
                />
            </IconButton>
                <IconButton
                    size="small"
                    aria-label="info"
                    onClick={() => { setRemoveData({ ...e.data, "Status": 2 }) }}
                    style={{ marginLeft: "3px" }}>
                    <DeleteIcon
                        fontSize="small"
                        style={{ color: "#e74c3c" }} />
                </IconButton>
            </>,
            sortable: false,
        })
        setColumns(iniCols);
    }, [])

    return { columns, editData, removeData };
}


const AmMasterData = (props) => {
    const [queryObj, setQueryObj] = useState(() => {
        if (props.tableType === "master")
            return mstQuery(props.tableQuery, props.codeInclude, props.pageSize)
        else if (props.tableType === "view")
            return viewQuery(props.tableQuery, props.codeInclude, props.pageSize)
        else
            return;
    });

    console.log(props.columnsFilter)

    const { columns, editData, removeData } = useColumns(props.columns);
    const [updateData, setUpdateData] = useState();
    const [dialogState, setDialogState] = useState({});
    const [page, setPage] = useState(1);
    const [iniQuery, setIniQuery] = useState(true);
    const [editorColumns, setEditorColumns] = useState(props.dataEdit);
    const { dataSource, count } = useQueryData(queryObj);
    const [popupTitle, setPopupTitle] = useState();
    const [sort, setSort] = useState({});

    const updateRow = (tableUpd, update, url) => {
        const updateData = (table, data) => {
            let updJson = {
                "t": table,
                "pk": "ID",
                "datas": [data],
                "nr": false,
                "_token": localStorage.getItem("Token")
            };
            Axios.put(url, updJson).then(res => {
                if (res.data._result.status === 1) {
                    setQueryObj({ ...queryObj })
                    setDialogState({ type: "success", content: "Success", state: true })
                }
                else {
                    setDialogState({ type: "error", content: data._result.message, state: true })
                }
            });
        }

        if (update !== null) {
            updateData(tableUpd, update)
        }
    }

    useEffect(() => {
        if(!IsEmptyObject(sort)){
            queryObj.s = '[{"f":"' + sort.id + '","od":"' + sort.sortDirection + '"}]';
            setQueryObj({...queryObj})
        }
    }, [sort])

    useEffect(() => {
        setPopupTitle("Remove")
        setUpdateData(removeData)
        setEditorColumns([{
            field: "Status",
            value: 2
        }])
    }, [removeData])

    useEffect(() => {
        setPopupTitle("Edit")
        setUpdateData(editData)
        setEditorColumns(props.dataEdit)
    }, [editData])

    useEffect(() => {
        if (typeof (page) === "number" && !iniQuery) {
            const queryEdit = JSON.parse(JSON.stringify(queryObj));
            queryEdit.sk = page === 0 ? 0 : (page - 1) * parseInt(queryEdit.l, 10);
            setQueryObj(queryEdit)
        }
    }, [page])

    const onChangeFilterData = (filterValue) => {
        var res = queryObj;
        filterValue.forEach(fdata => {
            if (fdata.customFilter !== undefined){
                if(IsEmptyObject(fdata.customFilter)){
                    res = QueryGenerate({ ...queryObj }, fdata.field, fdata.value)
                }else{
                    res = QueryGenerate({ ...queryObj }, fdata.field, fdata.value, fdata.customFilter.dataType, fdata.customFilter.dateField)
                }
            }
        });
        setQueryObj(res)
    }

    const onClickAdd = () => {
        setEditorColumns(props.dataAdd);
        setUpdateData({ ID: null, status: 1, revision: 1 })
        setPopupTitle("Add")
    }

    return <>
        <AmMasterEditorData config={{ required: true, title: popupTitle }}
            editorColumns={editorColumns}
            editData={updateData}
            response={(status, data) => {
                if (status) {
                    updateRow(props.table, data, props.updateURL);
                }
            }} />
        <AmDialogs
            typePopup={dialogState.type}
            onAccept={(e) => { setDialogState({ ...dialogState, state: false }) }}
            open={dialogState.state}
            content={dialogState.content} />
        <FormInline style={{ float: "right", marginBottom: "10px" }} >
            <AmButton
                style={{ marginRight: "5px", float: "right" }}
                styleType="add"
                onClick={onClickAdd}>{"Add"}
            </AmButton>
        </FormInline>
        <div style={{ clear: "both" }}></div>
        <AmTable
            sortable={props.sortable ? props.sortable : false}
            sortData={(dt) => {
                if(props.sortable)
                    setSort(dt)
            }}
            columns={columns}
            dataKey={props.codeInclude ? "Code" : "ID"}
            dataSource={dataSource}
            filterable={true}
            filterData={res => { onChangeFilterData(res) }}
            rowNumber={true}
            totalSize={count}
            pageSize={props.pageSize}
            height={500}
            pagination={true}
            onPageChange={p => {
                if (page !== p)
                    setPage(p)
                else
                    setIniQuery(false)
            }}
        />
    </>
}

export default AmMasterData;