import React, { useState, useEffect } from "react";
import AmReport from '../../../pageComponent/AmReportV2/AmReport'
import { apicall } from '../../../../components/function/CoreFunction'
import { withStyles } from '@material-ui/core/styles';
import styled from 'styled-components'
import AmRediRectInfo from '../../../../components/AmRedirectInfo'
import { useTranslation } from 'react-i18next'
const Axios = new apicall();
const styles = theme => ({
    root: {
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(','),
    },
    textNowrap: { overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', whiteSpace: 'nowrap' },
});

const FormInline = styled.div`

display: inline-flex;
flex-flow: row wrap;
align-items: center;
margin-right: 20px;

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

const LabelH = styled.label`
    // font-weight: bold;
    width: 100px; 
`;


const DailySTOSumAudit = (props) => {
    const { t } = useTranslation()
    const { classes } = props;

    const [datavalue, setdatavalue] = useState([]);
    const pageSize = 100;
    const [page, setPage] = useState(0);
    const [totalSize, setTotalSize] = useState(0);
    const [valueText, setValueText] = useState({});

    const MVTQuery = {
        queryString: window.apipath + "/v2/SelectDataViwAPI/",
        t: "DocumentProcessTypeMap",
        q: '[{ "f": "Status", "c":"=", "v": 1},{ "f": "DocumentType_ID", "c":"=", "v": 2003}]',
        f: "ID,Code,ReProcessType_Name as Name",
        g: "",
        s: "[{'f':'ID','od':'asc'}]",
        sk: 0,
        l: 100,
        all: "",
    }

    const columns = [
        {
            Header: t('Date'), accessor: 'createTime', type: 'datetime', width: 130, sortable: false,
            filterType: "datetime",
            filterConfig: {
                filterType: "datetime",
            }
            , customFilter: { field: "CreateTime" },
            dateFormat: "DD/MM/YYYY HH:mm"
        },
        { Header: t('Pallet'), accessor: 'bstoCode', width: 120, sortable: false, filterable: false, },
        { Header: t('Doc No.'), accessor: 'docCode', width: 130, sortable: false },
        {
            Header: t('Process No.'), accessor: 'DocProcessName', width: 220, sortable: false, filterType: "dropdown",
            filterConfig: {
                filterType: "dropdown",
                fieldLabel: ["Code", "Name"],
                dataDropDown: MVTQuery,
                typeDropDown: "normal",
                widthDD: 320,
            },
        },
        { Header: t('Item Code'), accessor: 'pstoCode', width: 120, sortable: false },
        {
            Header: t('Qty'), accessor: 'qty', width: 100, sortable: false,
            Footer: true, filterable: false,
            "Cell": (e) => comma(e.value.toString())
        },
        { Header: t('Unit'), accessor: 'unitType', width: 100, sortable: false, filterable: false, },
        // {
        //     Header: t('Base Qty'), accessor: 'baseQty', width: 100, sortable: false,
        //     Footer: true, filterable: false

        // },
        // { Header: t('Base Unit'), accessor: 'baseUnitType', width: 100, sortable: false, filterable: false, },

    ];
    const getRedirect = (data) => {
        if (data.indexOf(',') > 0) {
            var datashow = data.split(",").map((x) => {
                return <div>{x}<br /></div>
            });
            return (
                <div style={{ display: "flex", maxWidth: '160px' }}><label className={classes.textNowrap}>{data}</label>
                    <AmRediRectInfo type={"dialog"} bodyDialog={datashow} titleDialog="List of Document No." />
                </div>
            )
        } else {
            return data;
        }
    }
    const comma = (value) => {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    return (
        <>
            <AmReport
                columnTable={columns}
                dataTable={datavalue}
                excelFooter={true}
                fileNameTable={"DAILYSTO_SUM_AUDIT"}
                typeDoc={2003}
                page={true}
                tableKey={"docID"}
            ></AmReport>
        </>
    )

}

export default withStyles(styles)(DailySTOSumAudit);