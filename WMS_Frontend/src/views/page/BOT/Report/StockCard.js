import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import classnames from 'classnames';
import AmReport from '../../../pageComponent/AmReportV2/AmReport'

import { apicall } from '../../../../components/function/CoreFunction'
import { withStyles } from '@material-ui/core/styles';
import styled from 'styled-components'

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


const StockCard = (props) => {
    const { t } = useTranslation()
    const { classes } = props;

    const [datavalue, setdatavalue] = useState([]);
    const pageSize = 100;
    const [page, setPage] = useState(0);
    const [totalSize, setTotalSize] = useState(0);
    const [valueText, setValueText] = useState({});


    // const MVTQuery = {
    //     queryString: window.apipath + "/v2/SelectDataViwAPI/",
    //     t: "DocumentProcessTypeMap",
    //     q: '[{ "f": "Status", "c":"=", "v": 1},{ "f": "DocumentType_ID", "c":"in", "v": "1001,1002,2004"},{ "f": "ReProcessType_Name", "c":"!=", "v": ""}]',
    //     f: "ID,Code,ReProcessType_Name as Name",
    //     g: "",
    //     s: "[{'f':'ID','od':'asc'}]",
    //     sk: 0,
    //     l: 100,
    //     all: "",
    // }

    const columns = [
        {
            Header: t('Date'), accessor: 'ModifyTime', width: 120, type: "datetime",
            filterType: "datetime",
            filterConfig: {
                filterType: "datetime",
            }
            , customFilter: { field: "ModifyTime" },
            dateFormat: "DD/MM/YYYY HH:mm"
        },
        { Header: t('Doc No.'), accessor: 'DocCode', width: 120, sortable: false, filterable: false, },
        { Header: t('Item Code'), accessor: 'SkuCode', width: 120, sortable: false },
        { Header: t('SKU Type'), accessor: 'SkuTypeName', width: 140, sortable: false },
        {
            Header: t('Issue'), accessor: 'CreditQuantity', width: 70, sortable: false,
            Footer: true, filterable: false,
            //"Cell": (e) => comma(e.value.toString()), filterable: false,
        },
        {
            Header: t('Receive'), accessor: 'DebitQuantity', width: 70, sortable: false,
            Footer: true, filterable: false,
            //"Cell": (e) => comma(e.value.toString()), filterable: false,
        },
        {
            Header: t('Total'), accessor: 'TotalQuantity', width: 70, sortable: false,
            Footer: true, filterable: false,
            //"Cell": (e) => comma(e.value.toString()), filterable: false,
        },
        { Header: t('Unit'), accessor: 'UnitTypeCode', width: 70, sortable: false, filterable: false, },
        {
            Header: t('Process No.'), accessor: 'DocProcessTypeName', width: 220, sortable: false, filterable: false
            //filterType: "DocProcessTypeName",
            // filterConfig: {
            //     filterType: "dropdown",
            //     fieldLabel: ["Code", "Name"],
            //     dataDropDown: MVTQuery,
            //     typeDropDown: "normal",
            //     widthDD: 220,
            // },
        },

    ];

    const comma = (value) => {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    return (
        <>
            <AmReport
                columnTable={columns}
                dataTable={datavalue}
                fileNameTable={"STC"}
                excelFooter={true}
                tableKey={"stoID"}
            ></AmReport>
        </>
    )

}

export default withStyles(styles)(StockCard);
