import React, { useState, useEffect, useRef } from "react";
import AmTable from "../../components/AmTable/AmTable";
import {apicall} from "../../components/function/CoreFunction";
import queryString from "query-string";
import { TextField, Grid  } from "@material-ui/core";
import AmInput from '../../components/AmInput';
import AmDropdown from '../../components/AmDropdown';
import styled from 'styled-components'
import AmEditorTable from '../../components/table/AmEditorTable';
import AmDocumentStatus from "../../components/AmDocumentStatus";

var API = new apicall();

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

const Label = styled.label`
    font-weight:bold;
    width: 200px;
`;

const MaintenancePlan = (props) => {
    const [data, setData] = useState({});
    const [open, setOpen] = useState(false);
    
    const statusData = [
        {label:"WORKING", value:11},
        {label:"CLOSED", value:32}
    ];

    const headerColumns = [
        {accessor:"ServiceResult", Header:"Result"},
        {accessor:"ServiceBy", Header:"Service By", width:150},
        {accessor:"EventStatus", Header:"Status", width:100, Cell:(dt) => {
            const evnt = statusData.find(x=> x.value === dt.data.EventStatus);
            return evnt ? <AmDocumentStatus statusCode={evnt.value}/> : null
        }},
    ];

    useEffect(()=> {
        let maintenanceID = queryString.parse(window.location.search).maintenanceID;
        API.get(`${window.apipath}/v2/maintenace_detail?maintenanceID=${maintenanceID}`).then((res) => {
            setData(res.data);
        });
    }, [])

    const customAction = [{
        label: <div style={{ fontSize: "12px" }}>{"ADD"}</div>,
        action: (dt) => {
            setOpen(true)
        }
    }];

    const onClickConfirm = (rowdata) => {
        let maintenanceID = queryString.parse(window.location.search).maintenanceID;
        let postData = {
            MaintenanceResult_ID:maintenanceID,
            ServiceResult:rowdata.desc,
            ServiceBy:rowdata.by,
            EventStatus:rowdata.status
        }
        API.post(`${window.apipath}/v2/add_maintenace_item`, postData).then((res) => {
            setData(res.data);
        });
        
        setOpen(false);
    }
    const onClickCancel = () => {
        setOpen(false);
    }

    const editorCols = [
        {
            "field":"status",
            "component":(data=null, cols, key)=>{
            return <FormInline>
                <label style={{width:100,textAlign:"right"}}>สถานะ : </label>
                <AmDropdown
                    id={"eventstatus"}
                    required={true}
                    placeholder={"สถานะ"}
                    labelPattern=" : "
                    width={200}
                    ddlMinWidth={200}
                    zIndex={10000}
                    defaultValue={11}
                    data={statusData}
                    onChange={(value) => {data.status = value}}
                />
            </FormInline>
        }},
        {
            "field":"desc",
            "component":(data=null, cols, key)=>{
            return <FormInline>
                <label style={{width:100, textAlign:"right"}}>ผลการบริการ : </label>
                <TextField size={"small"} style={{width:400}} multiline rowsMax={4} onChange={(e)=> {data.desc = e.target.value}}/>
            </FormInline>
        }},
        {
            "field":"by",
            "component":(data=null, cols, key)=>{
              return <FormInline>
                <label style={{width:100,textAlign:"right"}}>ผู้ให้บริการ : </label>
                <AmInput style={{width:250}} onChangeV2={(value)=> {data.by = value}}/>
            </FormInline>
          }}
    ]

    return <>
        
        <AmEditorTable open={open} onAccept={(status, rowdata)=>{if(status){onClickConfirm(rowdata)}else{onClickCancel()}}} 
            titleText={"Add"} 
            data={{desc:"", by:"", status:11}} 
            columns={editorCols}
        />
        <Grid container>
            <Grid item xs={12} sm={6}style={{ paddingLeft: "20px", paddingTop: "10px" }}><Label>Code : </Label>{data.Code}</Grid>
            <Grid item xs={12} sm={6}style={{ paddingLeft: "20px", paddingTop: "10px" }}><Label>Name : </Label>{data.Name}</Grid>
            <Grid item xs={12} sm={6}style={{ paddingLeft: "20px", paddingTop: "10px" }}><Label>Description : </Label>{data.Description}</Grid>
            <Grid item xs={12} sm={6}style={{ paddingLeft: "20px", paddingTop: "10px" }}><Label>Warehouse Name : </Label>{data.Warehouse_Name}</Grid>
            <Grid item xs={12} sm={6}style={{ paddingLeft: "20px", paddingTop: "10px" }}><Label>Maintenance Date : </Label>{data.MaintenanceDate}</Grid>
            <Grid item xs={12} sm={6}style={{ paddingLeft: "20px", paddingTop: "10px" }}><Label>Status : </Label>{data.EventStatus}</Grid>
        </Grid>
        <AmTable
            columns={headerColumns}
            dataSource={data.maintenanceItems !== undefined ? data.maintenanceItems : []}
            dataKey={"ID"}
            pageSize={50}
            totalSize={100}
            pagination={false}
            customAction={customAction}
            //onPageSizeChange={(pz) => setPageSize(pz)}
        />
    </>
}

export default MaintenancePlan;