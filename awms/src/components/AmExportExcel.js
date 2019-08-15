import React, { useState, useEffect } from 'react';
import _ from 'lodash'
import Workbook from 'react-excel-workbook'
import moment from 'moment';
import PropTypes from 'prop-types';

//�Ը����¡��
//��С��   false �����Ŵ��ѧ�ҡ����������� , true �����Ŵ�຺auto �������Ŵ��˹�ҷ���ա�����¡��component
// const [isLoad, setIsLoad] = useState(false);  
//���ҧ�ѧ���蹻�����Ŵ ����Ѻ button 
// const onHandleLoadFile = (e) => setIsLoad(true);
//���¡�� Component 
// <LoadExcel data={data} fileName={"Pack"} columns={cols}  isLoading={isLoad} onToggleLoad={value => setIsLoad(value) } />
// 

const LoadWorkbook = (props) => {
    const {
        data,
        isLoading,
        fileName,
        columns,
        onToggleLoad,
        headerItemNo = "#",
        defaultNumRows = true
    } = props;

    const [dataSrc, setDataSrc] = useState([]);
    // const [isLoading, setIsLoading] = useState(false);
    const [newfileName, setFileName] = useState(fileName + "_" + moment().format('DDMMYYYY_HHmm') + ".xlsx");


    useEffect(() => {
        if (data) {
            getData(data);
        } else {
            setDataSrc([]);
        }
        // return () => console.log("unmounting...");
    }, [data]);
    useEffect(() => {
        if (dataSrc.length > 0) {
            if (isLoading === true) {
                document.getElementById("btnLoad").click();
            }
        }
    }, [dataSrc, isLoading]);

    const getData = (datas) => {
        var datass = datas.map((datarow, index) => {
            for (var xfield in datarow) {
                if (!isNaN(datarow[xfield])) {
                    if (datarow[xfield] != null)
                        datarow[xfield] = datarow[xfield].toString();
                }
                if (headerItemNo) {
                    datarow[headerItemNo] = (index + 1).toString();
                }

            }
            return datarow
        })
        setDataSrc(datass)
    }

    const onHandleClick = (event) => {
        event.preventDefault();
        onToggleLoad(false);
    }
    const getColums = () => {
        var newColumn = null;
        if (defaultNumRows && columns.length > 0) {
            let header = { Header: headerItemNo }
            newColumn = _.uniqBy([header,...columns], "Header");
        } else {
            newColumn = columns;
        }

        var newCols = newColumn.map((item, idx) => {
            return <Workbook.Column
                key={idx}
                label={typeof (item.Header) === "function" ? item.accessor : item.Header === "" ? item.accessor : item.Header}
                value={item.accessor === undefined ? item.Header : item.accessor} />
        })
        return newCols;
    }
    return (
        <div>
            <Workbook filename={newfileName} element={<div id='btnLoad' onClick={onHandleClick} ></div>}>
                <Workbook.Sheet data={dataSrc} name="Sheet 1">
                    {getColums()}
                </Workbook.Sheet>
            </Workbook>

        </div>
    );
}

LoadWorkbook.propTypes = {
    data: PropTypes.array.isRequired,
    isLoading: PropTypes.bool.isRequired,
    fileName: PropTypes.string,
    columns: PropTypes.array.isRequired,
    onToggleLoad: PropTypes.func.isRequired
}
export default LoadWorkbook;