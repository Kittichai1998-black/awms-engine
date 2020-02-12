import React, { useState, useEffect } from "react";
import { apicall, createQueryString, Clone } from '../../../components/function/CoreFunction';
import AmDialogs from '../../../components/AmDialogs';
import {AmTable, AmFilterTable, AmPagination} from '../../../components/table';
import AmDropdown from "../../../components/AmDropdown";
import { useTranslation } from "react-i18next";
import AmDatePicker from "../../../components/AmDate";
import AmButton from "../../../components/AmButton";

const Axios = new apicall();

const StorageObjectLog = (props) => {
    const { t } = useTranslation();

    const [filterData, setFilterData] = useState([]);
    const [dataSource, setDataSource] = useState([]);
    const [datetime, setDatetime] = useState({});
    const [selection, setSelection] = useState();
    
    const [query, setQuery] = useState({
        queryString: window.apipath + "/v2/SelectDataLogAPI",
        t: "StorageObjectEvent",
        q: '',
        f: "*",
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
            createObj.f = 'LogTime';
            createObj.v = datetime["dateFrom"];
            createObj.c = ">=";
            filterDatas.push(createObj);
          }
          if (datetime["dateTo"]) {
            let createObj = {};
            createObj.f = 'LogTime';
            createObj.v = datetime["dateTo"];
            createObj.c = "<=";
            filterDatas.push(createObj);
          }
        }
        getQuery.q = JSON.stringify(filterDatas);
        setQuery(getQuery)
    };

    const filterItem = [{
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
          Header: "Code",
          accessor: "Code",
        },
        {
          Header: "Name",
          accessor: "Name",
        },
        {
          Header: "Area Code",
          accessor: "AreaMaster_Code",
        },
        {
          Header: "Location Code",
          accessor: "AreaLocationMaster_Code",
        },
        {
          Header: "Parent StoObj Code",
          accessor: "ParentStorageObject_Code",
        },
        {
          Header: "Base Code",
          accessor: "BaseMaster_Code",
        },
        {
          Header: "Pack Code",
          accessor: "PackMaster_Code",
        },
        {
          Header: "For Customer",
          accessor: "For_Customer_ID",
        },
        {
          Header: "Object Type",
          accessor: "ObjectType",
        },
        {
          Header: "WeigthKG",
          accessor: "WeigthKG",
        },
        {
          Header: "QTY",
          accessor: "Quantity",
        },
        {
          Header: "Unit",
          accessor: "UnitType_Code",
        },
        {
          Header: "Qty",
          accessor: "Quantity",
        },
        {
          Header: "Unit",
          accessor: "UnitType_Code",
        },
        {
          Header: "Base Qty",
          accessor: "BaseQuantity",
        },
        {
          Header: "Base Unit",
          accessor: "BaseUnitType_Code",
        },
        {
          Header: "Order No",
          accessor: "OrderNo",
        },
        {
          Header: "Batch",
          accessor: "Batch",
        },
        {
          Header: "Lot",
          accessor: "Lot",
        },
        {
          Header: "Expiry Date",
          accessor: "ExpiryDate",
          type:"datetime"
        },
        {
          Header: "Product Date",
          accessor: "ProductDate",
          type:"datetime"
        },
        {
          Header: "RefID",
          accessor: "RefID",
        },

        {
          Header: "Ref1",
          accessor: "Ref1",
        },
        {
          Header: "Ref2",
          accessor: "Ref2",
        },
        {
          Header: "Event Status",
          accessor: "EventStatus",
        },
        {
          Header: "Status",
          accessor: "Status",
        },
        {
          Header: "Create By",
          accessor: "CreateBy_Name",
        },
        {
          Header: "Create Time",
          accessor: "CreateTime",
          type:"datetime"
        },
        {
          Header: "Modify By",
          accessor: "ModifyBy_Name",
        },
        {
          Header: "Modify Time",
          accessor: "ModifyTime",
          type:"datetime"
        },
        {
          Header: "Log Time",
          accessor: "LogTime",
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

export default StorageObjectLog;
