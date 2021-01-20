import React, { useState, useEffect, useRef } from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import styled from 'styled-components'
import classNames from 'classnames';
import AmTable from '../../components/table/AmTable';
import Axios from 'axios';
import { apicall, createQueryString, Clone } from '../../components/function/CoreFunction2'
import moment from 'moment';
// const Axios = new apicall()

const datetimeBody = (value, format) => {
    if (value !== null) {
        const date = moment(value);
        if (format === "time") {
            return <div>{date.format('HH:mm:ss')}</div>
        } else if (format === "datelog") {
            return <div>{date.format('DD/MM/YYYY HH:mm:ss')}</div>
        } else if (format === "datetime") {
            return <div>{date.format('DD/MM/YYYY HH:mm')}</div>
        }
    }
}


const updateColumns = (cols) => {
    let columns = Clone(cols);
    const result = columns.map(data => {
        if (data.type) {
            if (data.type === "time" || data.type === "datelog" || data.type === "datetime") {
                return (
                    {
                        ...data,
                        Cell: (e) => e.value ? datetimeBody(e.value, data.type) : ""
                    }
                )
            }
        } else {
            return (
                {
                    ...data
                }
            )
        }
    });

    return result;
}
function useInterval(callback, delay) {
    const savedCallback = useRef();

    // Remember the latest function.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        function tick() {
            savedCallback.current();
        }
        if (delay !== null) {
            let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}
const TableDashboard = (props) => {
    const { queryApi,
        apiType,
        queryApiCheck,
        delay,
        columns,
        pageSize,
        minRows,
        style,
        headerStyle,
        currentPage,
        getTrProps
    } = props;
    const [dataSource, setDataSource] = useState([])
    const [columnTable, setColumnTable] = useState(updateColumns(columns))
    const [isRunning, setIsRunning] = useState(true);
    const [isLoading, setIsLoading] = useState(false)
    const [count, setCount] = useState(0);
    const [oldActualTime, setOldActualTime] = useState(null);
    // const [delay, setDelay] = useState(5000);

    function getUrl(guery) {
        return createQueryString(guery) + "&apikey=FREE01"
    }
    useInterval(() => {
        fetchDataCheck(getUrl(queryApiCheck)).then(res => {
            if (res) {
                if (oldActualTime !== res) {
                    setOldActualTime(res);
                    if (apiType === "normal") {
                        GetQueueData(getUrl(queryApi)).then(resdata => {
                            if (resdata) {
                                setDataSource(resdata)
                            }
                            setIsRunning(true);
                        });
                    } else {
                        GetQueueData(queryApi).then(resdata => {
                            if (resdata) {
                                setDataSource(resdata)
                            }
                            setIsRunning(true);
                        });
                    }
                } else {
                    setIsRunning(true);
                }
            } else {
                setIsRunning(true);
            }
        });
    }, isRunning ? delay : null);

    // useEffect(() => {
    //     console.log(dataSource);
    // }, [dataSource]);
    // useEffect(() => {
    //     console.log(oldActualTime);
    // }, [oldActualTime]);
    // useEffect(() => {
    //     console.log(isRunning)
    // }, [isRunning]);
    async function fetchDataCheck(query) {
        setIsRunning(false);
        return await Axios.get(query).then(res => {
            if (res.data.datas) {
                if (res.data.datas.length > 0) {
                    return res.data.datas[0].ActualTime;
                } else {
                    return null;
                }
            } else {
                return null;
            }
        }).catch(error => {
            console.log(error);
            return null;
        });
    }
    async function GetQueueData(query) {
        setIsRunning(false);
        return await Axios.get(query).then(res => {
            if (res.data.datas) {
                return res.data.datas;
            } else {
                return [];
            }
        }).catch(error => {
            console.log(error);
            return [];
        });
    }

    return (
        <>
            <AmTable
                // primaryKey="ID"
                data={dataSource}
                columns={columnTable}
                pageSize={pageSize}
                minRows={minRows}
                currentPage={currentPage}
                style={style}
                getTrProps={getTrProps}
                headerStyle={headerStyle}
            />
        </>
    );
}
TableDashboard.propTypes = {
    queryApi: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
    ]),
    queryApiCheck: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
    ]),
    apiType: PropTypes.string,
    columns: PropTypes.array.isRequired,
    pageSize: PropTypes.number,
    minRows: PropTypes.number,
    style: PropTypes.object,
    headerStyle: PropTypes.object,
    currentPage: PropTypes.number,
    getTrProps: PropTypes.func,
    delay: PropTypes.number
}
TableDashboard.defaultProps = {
    delay: 3000,
    apiType: "normal"
}
export default TableDashboard;