import React, { useState, useEffect } from "react";

import {
    apicall,
    createQueryString
} from "../../../../components/function/CoreFunction";
import AmDocumentSearch from "../../../pageComponent/AmDocumentSearch";
import AmDocumentStatus from "../../../../components/AmDocumentStatus";
import AmRediRectInfo from "../../../../components/AmRedirectInfo";
import AmDate from "../../../../components/AmDate";
import AmButton from "../../../../components/AmButton";
import AmDialogs from "../../../../components/AmDialogs"
import styled from 'styled-components'
import moment from "moment";
import DocView from "../../../pageComponent/DocumentView"; //css

const Axios = new apicall();

const FormInline = styled.div`
display: flex;
flex-flow: row wrap;
align-items: center;
label {
    margin: 5px 5px 5px 0;
}
input {
    vertical-align: middle;
}
@media (max-width: 800px) {
    flex-direction: column;
    align-items: stretch;
    
  }
`;


export default props => {
    useEffect(() => { 
        Axios.get(createQueryString(Customer)).then((row) => {
             setDataCustomer(row.data.datas)
         })
        Axios.get(createQueryString(Warehouse)).then(row => {
            setDataWarehouse(row.data.datas);
        });
    }, []);

    const [dataCustomer, setDataCustomer] = useState();
    const [dataWarehouse, setDataWarehouse] = useState();
    const [dates, setdates] = useState();
    const [stateDialogSuc, setStateDialogSuc] = useState(false);
    const [msgDialogSuc, setMsgDialogSuc] = useState("");
    const [stateDialogErr, setStateDialogErr] = useState(false);
    const [msgDialogErr, setMsgDialogErr] = useState("");


    const Warehouse = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "Warehouse",
        q: '[{ "f": "Status", "c":"<", "v": 2}]',
        f: "Name AS value,concat(Code, ' : ' ,Name) AS label",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: ""
    };

    const Customer  = {
        queryString: window.apipath + "/v2/SelectDataMstAPI/",
        t: "Customer",
        q: '[{ "f": "Status", "c":"<", "v": 2}]',
        f: "Name AS value,concat(Code, ' : ' ,Name) AS label",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: ""
    };

    const getStatusCode = statusCode => {
        const DocumentEventStatus = [
            { status: "NEW", code: 10 },
            { status: "WORKING", code: 11 },
            { status: "WORKED", code: 12 },
            { status: "REMOVING", code: 21 },
            { status: "REMOVED", code: 22 },
            { status: "REJECTING", code: 23 },
            { status: "REJECTED", code: 24 },
            { status: "CLOSING", code: 31 },
            { status: "CLOSED", code: 32 },
            { status: "WAIT_FOR_WORKED", code: 812 }
        ];
        let status = DocumentEventStatus.find(x => x.code === statusCode).code;
        return <AmDocumentStatus key={status} statusCode={status} />;
    };

    const DocumentEventStatusSearch = [
        { label: "NEW", value: 10 },
        { label: "WORKING", value: 11 },
        { label: "WORKED", value: 12 },
        { label: "REJECTED", value: 24 },
        { label: "CLOSING", value: 31 },
        { label: "CLOSED", value: 32 },
        { label: "WAIT_FOR_WORKED", value: 812 }
    ];

    const iniCols = [
        {
            Header: "Code",
            accessor: "Code",
            width: 150,
            sortable: false,
            Cell: dataRow => getRedirect(dataRow.original)
        },
        {
            Header: "Customer",
            accessor: "DesCustomerName",
            width: 150,
               
        },
        {
            Header: "Warehouse",
            accessor: "SouWarehouseName",
            width: 150
        },
        {
            Header: "Action Time",
            accessor: "ActionTime",
            width: 150,
            type: "datetime",
            dateFormat: "DD/MM/YYYY HH:mm"
        },
        {
            Header: "Document Date",
            accessor: "DocumentDate",
            width: 150,
            type: "datetime",
            dateFormat: "DD/MM/YYYY"
        },

        {
            Header: "EventStatus",
            accessor: "EventStatus",
            width: 50,
            fixed: "left",
            Cell: dataRow => getStatusCode(dataRow.value)
        },

        {
            Header: "CreateBy",
            accessor: "Created",
            width: 200
        },
      
    ];

    const search = [
        {
            label: "Warehouse",
            field: "SouWarehouseName",
            searchType: "dropdown",
            dropdownData: dataWarehouse,
            fieldDataKey: "Name",
            fieldLabel: "Name"
        },
        {
            label: "Customer",
            field: "DesCustomerName",
            searchType: "dropdown",
            dropdownData: dataCustomer,
            fieldDataKey: "Name",
            fieldLabel: "Name"
        },
         
    ];

    const primarySearch = [
        {
            label: "Code",
            field: "Code",
            searchType: "input"
        },
        {
            label: "EventStatus",
            field: "EventStatus",
            searchType: "dropdown",
            dropdownData: DocumentEventStatusSearch,
            fieldDataKey: "Name",
            fieldLabel: "Name"
        },
          
    ];

    const getRedirect = data => {
        return (
            <div style={{ display: "flex", padding: "0px", paddingLeft: "10px" }}>
                {data.Code}
                <AmRediRectInfo
                    api={"/issue/detail?docID=" + data.ID}
                    history={props.history}
                    docID={""}
                />
            </div>
        );
    };

    const BtnexportCSV = () => {
        return (<div>
            <FormInline>
                <div style={{ marginLeft: "20px" }}>
                    <AmDate
                        TypeDate={"date"}
                        defaultValue={true}
                        onChange={(ele) => { onChangeEditorDate(ele) }}
                    />
                </div>
                <AmButton styleType="info"
                    onClick={() => { OnclickExportData() }}
                >{"Export Data"}</AmButton>
                <AmButton styleType="add"
                    onClick={() => { CreateDoc() }}
                >{"Create Document"}</AmButton>
            </FormInline>

        </div>)
    }

    const onChangeEditorDate = (e) => {
        setdates(e.fieldDataObject)

    }
    const CreateDoc = () => {
        props.history.push("/loading/create");
    }

    const OnclickExportData = () => {
        let dateExports = moment(dates).format("YYMMDD");
        let dataExport = {
            "exportName": "DocumentIssuedToCD",
            "whereValues": [dates, dateExports],
        }
        Axios.post(window.apipath + "/v2/ExportQueryToFileServerAPI", dataExport).then((res) => {
            console.log(res)
            if (res.data._result.status === 1) {
                console.log(res.data._result.status )
                setMsgDialogSuc(res.data.fileExport)
                setStateDialogSuc(true)
            } else {
                setStateDialogErr(true)
                setMsgDialogErr("Export Data Fail")

            }

        })


    }


    return (
        <div>

            <AmDialogs
                typePopup={"success"}
                content={msgDialogSuc}
                onAccept={e => {
                    setStateDialogSuc(e);
                }}
                open={stateDialogSuc}
            ></AmDialogs>
            <AmDialogs
                typePopup={"error"}
                content={msgDialogErr}
                onAccept={e => {
                    setStateDialogErr(e);
                }}
                open={stateDialogErr}
            ></AmDialogs>

        <AmDocumentSearch
                columns={iniCols}
                primarySearch={primarySearch}
                expensionSearch={search}
                docTypeCode="1012"
                customButton={BtnexportCSV()}
                buttonClose={true}
                buttonReject={true}
                buttonWorking={true}
            />
        </div>
    );
};
