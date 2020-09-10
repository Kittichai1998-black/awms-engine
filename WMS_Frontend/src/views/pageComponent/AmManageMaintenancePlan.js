import React, { useState, useEffect, useRef } from "react";
import AmTable from "../../components/AmTable/AmTable";
import {apicall} from "../../components/function/CoreFunction";
import queryString from "query-string";
  import { Grid  } from "@material-ui/core";

var API = new apicall();

const MaintenancePlan = (props) => {
    const [pageSize, setPageSize] = useState(50);
    const [data, setData] = useState({});

    const headerColumns = [
        {accessor:"ServiceResult", Header:"Result"},
        {accessor:"ServiceBy", Header:"Service By", width:150},
        {accessor:"EventStatus", Header:"Status", width:100},
    ];

    useEffect(()=> {
        let maintenanceID = queryString.parse(window.location.search).maintenanceID;
        API.get(`${window.apipath}/v2/maintenace_detail?maintenanceID=${maintenanceID}`).then((res) => {
            setData(res.data);
        });
    }, [])

    return <>
        <AmTable
            columns={headerColumns}
            dataSource={data.maintenanceItems !== undefined ? data.maintenanceItems : []}
            dataKey={"ID"}
            pageSize={50}
            totalSize={100}
            pagination={false}
            onPageSizeChange={(pz) => setPageSize(pz)}
        />
    </>
}

export default MaintenancePlan;