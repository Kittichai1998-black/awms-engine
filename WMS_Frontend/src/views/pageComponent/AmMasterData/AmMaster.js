import React, { useState, useEffect, useMemo, useCallback } from "react";
import { apicall, createQueryString } from '../../../components/function/CoreFunction';
import {QueryGenerate} from '../../../components/function/UtilFunction';
import AmTable from "../../../components/AmTable/AmTable";
import AmDialogs from "../../../components/AmDialogs";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import { IsEmptyObject } from "../../../components/function/CoreFunction2";
import AmDropdown from '../../../components/AmDropdown';
import AmDatePicker from '../../../components/AmDate';
import styled from 'styled-components';

import {InputComponent, DropDownComponent, FindPopupComponent, DateTimeComponent} from "./AmMasterComponentType";
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
        if(typeof queryObj === "object"){
            var queryStr = createQueryString(queryObj)
            Axios.get(queryStr).then(res => {
                setDataSource(res.data.datas)
                setCount(res.data.counts)
            });
        }
    }, [queryObj])    
    return {dataSource, count};
}

const viewQuery = (tableQuery, codeInclude) => ({
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: tableQuery,
    q: '[{ "f": "Status", "c":"<", "v": 2}]',
    f: "*",
    g: "",
    s: !codeInclude ? '[{"f":"ID","od":"asc"}]' :'[{"f":"Code","od":"asc"}]',
    sk: 0,
    l: 25,
    all: "",
});

const mstQuery = (tableQuery, codeInclude) => ({
    queryString: window.apipath + "/v2/SelectDataMstAPI/",
    t: tableQuery,
    q: '[{ "f": "Status", "c":"<", "v": 2}]',
    f: "*",
    g: "",
    s: !codeInclude ? '[{"f":"ID","od":"asc"}]' :'[{"f":"Code","od":"asc"}]',
    sk: 0,
    l: 25,
    all: "",
});

const useColumns = (cols) => {
    const [columns, setColumns] = useState(cols);
    const [editData, setEditData] = useState();
    const [removeData, setRemoveData] = useState();

    useEffect(()=> {
        const iniCols = [...cols];

        iniCols.forEach(col => {
            if(col.filterType === "dropdown"){
                let cols = col.filterConfig;
                col.Filter =  (field, onChangeFilter) => {
                    return <AmDropdown
                    id={field}
                    placeholder={col.placeholder}
                    fieldDataKey={cols.fieldDataKey}
                    fieldLabel={cols.fieldLabel} 
                    labelPattern=" : "
                    width={200}
                    ddlMinWidth={200} 
                    zIndex={1000}
                    queryApi={cols.dataDropDow}
                    onChange={(value, dataObject, inputID, fieldDataKey) => onChangeFilter(field, value)}
                    ddlType={cols.typeDropdow}    
                />
                }
            }else if(col.filterType === "datetime"){
                col.width=350;
                col.Filter =  (field, onChangeFilter) => {
                    return <FormInline>
                        <AmDatePicker style={{display:"inline-block"}} onBlur={(e) => {onChangeFilter(field, e.fieldDataObject, {dataType:"dateTime",dateField:"dateFrom"})}} TypeDate={"date"} fieldID="dateFrom"/>
                        <label>-</label>
                        <AmDatePicker style={{display:"inline-block"}} onBlur={(e) => {onChangeFilter(field, e.fieldDataObject, {dataType:"dateTime",dateField:"dateTo"})}} TypeDate={"date"} fieldID="dateTo"/>
                    </FormInline>
                }
            }
        })

        iniCols.push({   
            Header: "",
            fixWidth:63,
            colStyle:{zIndex:-1},
            filterable: false,
            Cell:(e)=> <><IconButton
                size="small"
                aria-label="info"
                style={{ marginLeft: "3px" }}
              >
                <EditIcon
                  fontSize="small"
                  style={{ color: "#f39c12" }}
                  onClick={()=>{setEditData({...e.data})}}
                />
              </IconButton>
              <IconButton
                size="small"
                aria-label="info"
                style={{ marginLeft: "3px" }}>
                <DeleteIcon
                  fontSize="small"
                  style={{ color: "#e74c3c" }}
                  onClick={()=>{setRemoveData(e.data)}}/>
                </IconButton>
            </>,
            sortable:false,
        })
        setColumns(iniCols);
    }, [])

    return {columns, editData, removeData};
}


const AmMasterData = (props) => {
    const [queryObj, setQueryObj] = useState(() => {
        if(props.tableType === "master")
            return mstQuery(props.tableQuery, props.codeInclude)
        else if(props.tableType === "view")
            return viewQuery(props.tableQuery, props.codeInclude)
        else
            return;
    });

    const {columns, editData, removeData} = useColumns(props.columns);
    const [updateData, setUpdateData] = useState();
    const [dialogState, setDialogState] = useState({});
    const [page, setPage] = useState(1);
    const [iniQuery, setIniQuery] = useState(true);

    const {dataSource, count} = useQueryData(queryObj);
    // {
    //     field: "Code",
    //     type: "input",
    //     name: "SKU Type Code",
    //     placeholder: "Code",
    //     required: true
    //   }
    
    const genEditorField = () => {
        const findEditorField = (config, cols, data) => {
            if(config.type === "input"){
                return <InputComponent config={config}/>
            }
            else if(config.type === "dropdow"){
                return <DropDownComponent/>
            }
            else if(config.type === "findpopup"){
                return <DropDownComponent/>
            }
        }

        return props.dataAdd.map(y=>{
            return { 
              "field":y.field,
              "component":(data=null, cols, key)=>{
                return <div key={key}>
                    
                </div>
              }
            }
        });
    }

    const updateRow = () => {
        const updateData = (table, data) => {
            let updJson = {
                "t": table,
                "pk": "ID",
                "datas": data,
                "nr": false,
                "_token": localStorage.getItem("Token")
            };
            console.log(updJson)
            Axios.put(window.apipath + "/v2/InsUpdDataAPI", updJson).then(res => {
                alert(res.data);
            });
        }
        if(!IsEmptyObject(editData) && editData !== undefined)
            updateData(props.tableQuery, editData)
    }

    useEffect(()=> {
        if(typeof(page) === "number" && !iniQuery){
          const queryEdit = JSON.parse(JSON.stringify(queryObj));
          queryEdit.sk = page === 0 ? 0 : (page -1) * parseInt(queryEdit.l, 10);
          setQueryObj(queryEdit)
        }
    }, [page])

    useEffect(()=>{
        setUpdateData(editData)
    },[editData])

    useEffect(()=>{
        console.log(removeData)
    },[removeData])

    const onChangeFilterData = (filterValue) => {
        var res = queryObj;
        filterValue.forEach(fdata => {
            if(fdata.customFilter !== undefined)
                res = QueryGenerate({...queryObj}, fdata.field, fdata.value, fdata.customFilter.dataType, fdata.customFilter.dateField)
            else
                res = QueryGenerate({...queryObj}, fdata.field, fdata.value, )
        });
        setQueryObj(res)
    }

    return <>
            <AmMasterEditorData config={{required:true, title:"Edit"}}
                editColumns={props.dataAdd}
                editData={updateData}
                response={x=>console.log(x)}/>
            <AmDialogs 
                typePopup={dialogState.type} 
                onAccept={(e) => {setDialogState({...dialogState, state:false})}} 
                open={dialogState.state} 
                content={dialogState.content}/>
            <AmTable
                columns={columns}
                dataKey={props.codeInclude ? "Code" : "ID"}
                dataSource={dataSource}
                filterable={true}
                filterData={res=> {onChangeFilterData(res)}}
                rowNumber={true}
                totalSize={count}
                pageSize={props.pageSize}
                height={props.height}
                pagination={true}
                onPageChange={p => {
                    if(page !== p)
                        setPage(p)
                    else
                        setIniQuery(false)
                }}
            />
        </>
}

export default AmMasterData;