import React, { useState, useEffect, useRef } from "react";
import AmTable from "../../components/AmTable/AmTable";
import {
    apicall,
    createQueryString
  } from "../../components/function/CoreFunction";
import AmRediRectInfo from "../../components/AmRedirectInfo";

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

    useEffect(()=> {
        console.log(page)
        const getData = async () => {
            if(QueryHeader.l === pageSize)
                QueryHeader.l = pageSize;
            
            const pageRow = page === 1 ? 0 : page * parseInt(QueryHeader.l, 10);
            QueryHeader.sk = pageRow;

            const res = await API.get(createQueryString(QueryHeader));
            setDataSource(res.data.datas);
        }
        getData();
        //return () => {console.log("unmount")}
    },[pageSize, page]);

    return dataSource;
}


const MaintenancePlan = (props) => {
    const [pageSize, setPageSize] = useState(50);
    const [page, setPage] = useState(1);
    const dataSource = useGetData(pageSize, page);

    const headerColumns = [
        {accessor:"Code", Header:"Code", Cell:(row)=> <div style={{ display: "flex", padding: "0px", paddingLeft: "10px"}}>
            <label>{`${row.data.Code}`}</label>
            <AmRediRectInfo api={"/issue/detail?docID=" + row.data.ID} history={props.history}/></div>
        },
        {accessor:"Name", Header:"Name"},
        {accessor:"Warehouse_Name", Header:"Warehouse"},
        {accessor:"Description", Header:"Description"},
        {accessor:"MaintenanceDate", Header:"Date"},
        {accessor:"Create", Header:"CreateTime"},
        {accessor:"Modify", Header:"ModifyTime"},
    ];
    return <AmTable
        columns={headerColumns}
        dataSource={dataSource}
        dataKey={"ID"}
        pageSize={50}
        totalSize={100}
        pagination={true}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(pz) => setPageSize(pz)}
    />
}

export default MaintenancePlan;