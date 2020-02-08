import React, { useState, useEffect } from "react";
import { apicall, createQueryString, Clone } from '../../../components/function/CoreFunction';
import AmDialogs from '../../../components/AmDialogs';
import {AmTable, AmFilterTable, AmPagination} from '../../../components/table';
import AmDropdown from "../../../components/AmDropdown";
import { useTranslation } from "react-i18next";
import AmDatePicker from "../../../components/AmDate";
import AmButton from "../../../components/AmButton";

const Axios = new apicall();

const APIServiceLog = (props) => {
    const { t } = useTranslation();

    const [filterData, setFilterData] = useState([]);
    const [dataSource, setDataSource] = useState([]);
    const [datetime, setDatetime] = useState({});
    const [selection, setSelection] = useState();
    
    const [query, setQuery] = useState({
        queryString: window.apipath + "/v2/SelectDataLogAPI",
        t: "APIServiceEvent",
        q: '',
        f: "LogRefID, APIService_Name, ResultMessage,StartTime",
        g: "",
        s: "[{'f':'ID','od':'desc'}]",
        sk: 0,
        l: 100,
        all: ""
      });

    const onChangeFilter = (condition, field, value) => {
        let obj = [...filterData];
        if(value === ""){
            obj  = obj.filter(x=> x.f !== field);
        }else{
            let row = obj.find(x=> x.f === field);
            if(row === null || row === undefined){
                obj.push(
                    {
                        f:field,c:"=",v:value
                    }
                )
            }
            else{
                row.v = value
            }
        }
        setFilterData(obj)
    };

    const onChangeFilterDateTime = (value, field, type) => {
        //console.log(value + field + type)
        let datetimeRange = datetime;
        if (value === null || value === undefined) {
        delete datetimeRange[type];
        } else {
        datetimeRange["field"] = field;
        if (type === "dateFrom") datetimeRange[type] = value.fieldDataKey + ":00";
        if (type === "dateTo")
            datetimeRange[type] = value.fieldDataKey + ":00";
        }
        setDatetime(datetimeRange);
      };

    const onHandleFilterConfirm = () => {
        let getQuery = {...query}
        let filterDatas = [...filterData];
        if (datetime) {
          if (datetime["dateFrom"]) {
            let createObj = {};
            createObj.f = 'StartTime';
            createObj.v = datetime["dateFrom"];
            createObj.c = ">=";
            filterDatas.push(createObj);
          }
          if (datetime["dateTo"]) {
            let createObj = {};
            createObj.f = 'StartTime';
            createObj.v = datetime["dateTo"];
            createObj.c = "<=";
            filterDatas.push(createObj);
          }
        }
        getQuery.q = JSON.stringify(filterDatas);
        setQuery(getQuery)
    };

    const filterItem = [{
        field: "APIService_ID",
        component: (condition, rowC, idx) => {
            return (
              <div key={idx} style={{ display: "inline-flex" }}>
                <label
                  style={{
                    padding: "0 0 0 20px",
                    width: "200px",
                    paddingTop: "10px"
                  }}
                >
                  {t("Service")} :{" "}
                </label>
                <AmDropdown
                    width="200px"
                    zIndex={1000}
                    placeholder={"Select Service"}
                    value={selection}
                    data={[
                        {"label":"RegisterQueue", "value":20},
                        {"label":"DoneQueue", "value":16},
                        {"label":"WorkingQueue", "value":26},
                        {"label":"ProcessQueue", "value":92},
                        {"label":"ProcessQueue", "value":93},
                        ]}
                    ddlType="normal"
                    onChange={value =>
                        {onChangeFilter(condition, rowC.field, value)
                        setSelection(value)}
                    }
                />
              </div>
            );
          }
    },{
        field: "dateFrom",
        component: (condition, rowC, idx) => {
            return (
                <div key={idx} style={{ display: "inline-flex" }}>
                <label style={{ padding: "10px 0 0 20px", width: "200px" }}>
                  {t("From Date")} :{" "}
                </label>
                <AmDatePicker
                  width="200px"
                  TypeDate={"datetime-local"}
                  onChange={value =>
                    onChangeFilterDateTime(value,rowC.field,"dateFrom")
                  }
                  defaultValue={true}
                />
              </div>
            );
          }
    },{
        field: "dateTo",
        component: (condition, rowC, idx) => {
            return (
                <div key={idx} style={{ display: "inline-flex" }}>
                <label style={{ padding: "10px 0 0 20px", width: "200px" }}>
                  {t("To Date")} :{" "}
                </label>
                <AmDatePicker
                  width="200px"
                  TypeDate={"datetime-local"}
                  onChange={value =>
                    onChangeFilterDateTime(value,rowC.field,"dateTo")
                  }
                  defaultValue={true}
                />
              </div>
            );
          }
    }];

    const columns = [
        {
          Header: "LogRef",
          accessor: "LogRefID",
          width: 150,
        },
        {
          Header: "APIService",
          accessor: "APIService_Name",
          width: 150,
        },
        {
          Header: "Result",
          accessor: "ResultMessage",
        },
        {
          Header: "Start Time",
          accessor: "StartTime",
          width: 200,
          type:"datetime"
        },
    ]

    useEffect(()=>{
        Axios.get(createQueryString(query)).then(res => {
            setDataSource(res.data.datas)
        });
    }, [query]);

    return <>
        <AmFilterTable
            primarySearch={filterItem}
            onAccept={onHandleFilterConfirm}
        />
        <AmTable data={dataSource} columns={columns} sortable={false} pageSize={100}/>
    </>
}

export default APIServiceLog;