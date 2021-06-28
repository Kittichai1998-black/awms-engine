import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import classnames from 'classnames';
import AmReport from '../../pageComponent/AmReportV2/AmReport'
//import AmReport from '../../../components/AmReport'
import AmButton from '../../../components/AmButton'
import AmFindPopup from '../../../components/AmFindPopup'
import { apicall } from '../../../components/function/CoreFunction'
import { withStyles } from '@material-ui/core/styles';
import AmDropdown from '../../../components/AmDropdown';
import styled from 'styled-components'
import AmInput from "../../../components/AmInput";
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


const CurrentInventory = (props) => {
    const { t } = useTranslation()
    const { classes } = props;

    const [datavalue, setdatavalue] = useState([]);
    const pageSize = 100;
    const [page, setPage] = useState(0);
    const [totalSize, setTotalSize] = useState(0);
    const [valueText, setValueText] = useState({});
    const columns = [
        { Header: 'Customer', accessor: 'Ref4', width: 120, sortable: false },
        { Header: 'Sku', accessor: 'Code', width: 120, sortable: false },
        { Header: '-', accessor: 'Name', width: 150, sortable: false, },
        { Header: 'Grade', accessor: 'Ref1', width: 100, sortable: false },
        { Header: 'Lot', accessor: 'Lot', width: 100, sortable: false },
        { Header: 'UD Code', accessor: 'Ref3', width: 100, sortable: false },
        { Header: 'Qty', accessor: 'qty', width: 70, sortable: false,Footer: false,filterable: false,},
        { Header: 'Unit', accessor: 'unitType', filterable: false, width: 70, sortable: false },
        
    ];

    const comma = (value) => {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    return (
        <>
            <AmReport
                columnTable={columns}
                page={true}
                excelFooter={true}
                fileNameTable={"CURINV"}
                tableKey={"Code"}
                groupBy={false}
            ></AmReport>
        </>
    )

}

export default withStyles(styles)(CurrentInventory);
