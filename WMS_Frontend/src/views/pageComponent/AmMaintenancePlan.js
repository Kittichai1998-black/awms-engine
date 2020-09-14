import React, { useState, useEffect, useRef } from "react";
import AmTable from "../../components/AmTable/AmTable";
import {
    apicall,
    createQueryString
  } from "../../components/function/CoreFunction";
import AmRediRectInfo from "../../components/AmRedirectInfo";
import moment from "moment";
import AmDocumentStatus from "../../components/AmDocumentStatus";

var API = new apicall();


const QueryHeader = {
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: "MaintenanceResult",
    q:'[{ "f": "Status", "c":"!=", "v": 2}]',
    f: "*",
    g: "",
    s: "[{'f':'ID','od':'desc'}]",
    sk: 0,
    l: 50,
    all: ""
};

const useGetData = (pageSize, page) => {
    const [dataSource, setDataSource] = useState([]);
    const [count, setCount] = useState(0);

    useEffect(()=> {
        console.log(page)
        const getData = async () => {
            if(QueryHeader.l === pageSize)
                QueryHeader.l = pageSize;
            
            const pageRow = page === 1 ? 0 : page * parseInt(QueryHeader.l, 10);
            QueryHeader.sk = pageRow;

            const res = await API.get(createQueryString(QueryHeader));
            setDataSource(res.data.datas);
            setCount(res.data.count)
        }
        getData();
        //return () => {console.log("unmount")}
    },[pageSize, page]);

    return {dataSource:dataSource, count:count};
}


const MaintenancePlan = (props) => {
    const [pageSize, setPageSize] = useState(50);
    const [page, setPage] = useState(1);
    const {dataSource, count} = useGetData(pageSize, page);

    const statusData = [
        {label:"WORKING", value:11},
        {label:"CLOSED", value:32}
    ];

    const headerColumns = [
        {accessor:"EventStatus", Header:"Status", width:100, Cell:(dt) => {
            const evnt = statusData.find(x=> x.value === dt.data.EventStatus);
            return evnt ? <AmDocumentStatus statusCode={evnt.value}/> : null
        }},
        {accessor:"Code", Header:"Code", Cell:(row)=> <div style={{ display: "flex", padding: "0px", paddingLeft: "10px"}}>
            <label>{`${row.data.Code}`}</label>
            <AmRediRectInfo api={"/warehouse/managemtnplan?maintenanceID=" + row.data.ID} history={props.history}/></div>
        },
        {accessor:"Name", Header:"Name"},
        {accessor:"Warehouse_Name", Header:"Warehouse"},
        {accessor:"Description", Header:"Description"},
        {accessor:"MaintenanceDate", Header:"Date", Cell:(dt)=>{
            if(moment(dt.data["MaintenanceDate"]).isValid()){
                return <label>{moment(dt.data["MaintenanceDate"]).format("DD/MM/YYYY")}</label>
            }
            else{
                return ""
            }
        }},
        {accessor:"CreateTime", Header:"Create", Cell:(dt)=>{
            if(moment(dt.data["CreateTime"]).isValid()){
                return <label>{moment(dt.data["CreateTime"]).format("DD/MM/YYYY")}</label>
            }
            else{
                return ""
            }
        }},
        {accessor:"ModifyTime", Header:"Modify", Cell:(dt)=>{
            if(moment(dt.data["ModifyTime"]).isValid()){
                return <label>{moment(dt.data["ModifyTime"]).format("DD/MM/YYYY")}</label>
            }
            else{
                return ""
            }
        }},
    ];
    return <AmTable
        rowNumber={true}
        columns={headerColumns}
        dataSource={dataSource}
        dataKey={"ID"}
        pageSize={50}
        totalSize={count}
        pagination={true}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(pz) => setPageSize(pz)}
    />
}

export default MaintenancePlan;