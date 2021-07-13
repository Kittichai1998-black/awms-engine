import React, { useState, useEffect } from "react";
// import PropTypes from 'prop-types';
// import classnames from 'classnames';
import AmReport from '../../pageComponent/AmReportV2/AmReport'
//import AmReport from '../../../components/AmReport'
// import AmButton from '../../../components/AmButton'
// import AmFindPopup from '../../../components/AmFindPopup'
import { apicall } from '../../../components/function/CoreFunction'
import { withStyles } from '@material-ui/core/styles';
// import AmDropdown from '../../../components/AmDropdown';
import styled from 'styled-components'
// import AmInput from "../../../components/AmInput";
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


const WCS_Log = (props) => {
    const { t } = useTranslation()
    const { classes } = props;

    const [datavalue, setdatavalue] = useState([]);
    const pageSize = 100;
    const [page, setPage] = useState(0);
    const [totalSize, setTotalSize] = useState(0);
    const [valueText, setValueText] = useState({});

    const onGetDocument = () => {
        let pathGetAPI = window.apipath + "/v2/WCS_QueueLog_Front?";

        Axios.get(pathGetAPI,true).then((rowselect1) => {
            if (rowselect1) {
                if (rowselect1.data._result.status !== 0) {
                    setdatavalue(rowselect1.data.datas)
                    setTotalSize(rowselect1.data.datas[0] ? rowselect1.data.datas[0].totalRecord : 0)
                }
            }
            
            setTimeout(() => {
                onGetDocument();
            }, 10000);
        });
    }

    useEffect(() => {
        onGetDocument();
    }, [true])

    const columns = [
        {
            Header: 'Date', accessor: 'createDate', type: 'datetime', width: 130, sortable: false,
            filterType: "datetime",
            filterConfig: {
                filterType: "datetime",
            }
            , customFilter: { field: "CreateTime" },
            dateFormat: "DD/MM/YYYY"
        },
        { Header: 'Page', accessor: 'page', width: 70, sortable: false, },
        { Header: 'Limit', accessor: 'limit', width: 120, sortable: false },
        { Header: 'Werehouse', accessor: 'Warehouse_name', width: 70,sortable: false },
        { Header: 'StationName', accessor: 'Station_name', width: 70,sortable: false },
        { Header: 'BAY', accessor: 'BAY', width: 70, sortable: false, },
        { Header: 'FLOORs', accessor: 'FLOORs', width: 120, sortable: false },
        { Header: 'Shuttle', accessor: 'code_shu', width: 100, sortable: false },
        { Header: 'SRM', accessor: 'code_srm', width: 100, sortable: false },
        { Header: 'TypeNameWork', accessor: 'TypeNameWork', width: 70, sortable: false},
        { Header: 'QueueStatus', accessor: 'QueueStatusname', filterable: false, width: 70, sortable: false,Footer: false },
        { Header: 'BC_Pallet', accessor: 'BC_PALLET', filterable: false, width: 70, sortable: false,Footer: false },
        { Header: 'Remark', accessor: 'Remark', filterable: false, width: 70, sortable: false },
        
    ];

    // const comma = (value) => {
    //     return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    // }

    return (
        <>
            <AmReport
                columnTable={columns}
                page={true}
                excelFooter={true}
                fileNameTable={"CURINV"}
                tableKey={"Warehouse_name"}
                groupBy={false}
            ></AmReport>
        </>
    )

}

export default withStyles(styles)(WCS_Log);
