import React, { useContext, useEffect, useState, useLayoutEffect } from "react";
import AmTableBody from "./AmTableBody";
import { AmTableProvider, AmTableContext } from "./AmTableContext";
import AmPagination from "./AmPagination";
import AmTablePropTypes from "./AmTablePropTypes";
import Grid from "@material-ui/core/Grid";
import _ from "lodash";

const IsEmptyObject = (obj) => {
    if(typeof(obj) === "object")
        return Object.keys(obj).length === 0 && obj.constructor === Object
    else
        return false;
}

const Topbar = React.memo((propsTopbar) => {
    // console.log(propsTopbar.dataSource)
    if(propsTopbar.customTopControl){
        return <>
            <div style={{display:"inline-block", verticalAlign: "middle"}}>{propsTopbar.customTopControl}</div>
            <div id="pagination" style={{display:"inline-block", verticalAlign: "middle"}}>
                {propsTopbar.pagination ? <AmPagination
                    totalSize={propsTopbar.totalSize ? propsTopbar.totalSize : propsTopbar.dataSource.length}
                    pageSize={propsTopbar.pageSize}
                    resetPage={propsTopbar.resetPage}
                    onPageChange={page => {
                        propsTopbar.page(page + 1)
                    }}
                /> : null}
            </div>
        </>
    }
    else{
        if(propsTopbar.customTopLeftControl || propsTopbar.customTopRightControl){
            return <Grid container direction="row" justify="space-between" alignItems="flex-end" style={{marginBottom:5}}>
                <Grid item xs={6}>
                    <div style={{display:"inline-block", verticalAlign: "middle"}}>{propsTopbar.customTopLeftControl ? propsTopbar.customTopLeftControl : null}</div>
                </Grid>
                <Grid item xs={6} style={{textAlign:"right"}}>
                    <div style={{display:"inline-block", verticalAlign: "middle"}}>{propsTopbar.customTopRightControl ? propsTopbar.customTopRightControl : null}</div>
                    <div style={{display:"inline-block", verticalAlign: "middle"}}>
                        {propsTopbar.pagination ? <AmPagination
                            totalSize={propsTopbar.totalSize ? propsTopbar.totalSize : propsTopbar.dataSource.length}
                            pageSize={propsTopbar.pageSize}
                            resetPage={propsTopbar.resetPage}
                            onPageChange={page => {
                                propsTopbar.page(page + 1)
                            }}
                        /> : null}
                    </div>
                </Grid>
            </Grid>
        }
        else{
            
            // console.log(propsTopbar.dataSource)
            return propsTopbar.pagination ? <AmPagination
                totalSize={propsTopbar.totalSize ? propsTopbar.totalSize : propsTopbar.dataSource.length}
                pageSize={propsTopbar.pageSize}
                resetPage={propsTopbar.resetPage}
                onPageChange={page => {
                    propsTopbar.page(page + 1)
                }}
            /> : null
        }
    }
});

const Bottombar = React.memo((propsBtmbar) => {
    if(propsBtmbar.customBtmControl){
        return <>
            <div style={{display:"inline-block", verticalAlign: "middle"}}>{propsBtmbar.customBtmControl}</div>
        </>
    }
    else{
        if(propsBtmbar.customBtmLeftControl || propsBtmbar.customBtmRightControl){
            return <Grid container direction="row" justify="space-between" alignItems="flex-end" style={{marginBottom:5}}>
                <Grid item xs={6}>
                    <div style={{display:"inline-block", verticalAlign: "middle"}}>{propsBtmbar.customBtmLeftControl ? propsBtmbar.customBtmLeftControl : null}</div>
                </Grid>
                <Grid item xs={6} style={{textAlign:"right"}}>
                    <div style={{display:"inline-block", verticalAlign: "middle"}}>{propsBtmbar.customBtmRightControl ? propsBtmbar.customBtmRightControl : null}</div>
                </Grid>
            </Grid>
        }
        else
            return null;
    }
});

const AmTableComponent = (props) => {
    return <AmTableProvider>
        <AmTableSetup
            dataSource={props.dataSource}
            style={props.style}
            width={props.width}
            columns={props.columns}
            cellStyle={props.cellStyle}
            dataKey={props.dataKey}
            rowNumber={props.rowNumber}
            height={props.height}
            tableStyle={props.tableStyle}
            footerStyle={props.footerStyle}
            headerStyle={props.headerStyle}
            groupBy={props.groupBy}
            filterable={props.filterable}
            filterData={props.filterData}
            pageSize={props.pageSize}
            minRows={props.minRows}
            pagination={props.pagination}
            onPageChange={props.onPageChange}
            totalSize={props.totalSize}
            selection={props.selection}
            selectionData={props.selectionData}
            selectionDefault={props.selectionDefault}
            clearSelectionChangePage={props.clearSelectionChangePage}
            customTopControl={props.customTopControl}
            customTopLeftControl={props.customTopLeftControl}
            customTopRightControl={props.customTopRightControl}
            customBtmControl={props.customBtmControl}
            customBtmLeftControl={props.customBtmLeftControl}
            customBtmRightControl={props.customBtmRightControl}
            sortable={props.sortable}
            sortData={props.sortData}
            selectionDisabledCustom={props.selectionDisabledCustom}
            clearSelectionChangeData={props.clearSelectionChangeData}
        />
    </AmTableProvider>
}

const AmTableSetup = (props) => {
    const { pagination, filter, selection, sort } = useContext(AmTableContext);
    const [page, setPage] = useState(1)
    const [dataSource, setDataSource] = useState([])
    const [resetPage, setResetPage] = useState(props.resetPage)

    const { selectionData, sortData, sortable } = props;
    console.log(props.customTopLeftControl)
    useEffect(() => {
        if(resetPage)
            setResetPage(false)
    }, [resetPage])

    useEffect(() => {
        if (props.pageSize)
            pagination.setPageSize(props.pageSize)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.pageSize])

    useEffect(() => {
        if (sortData !== undefined && sortable && !IsEmptyObject(sort.sortValue)){
            if(sort.sortValue.send === false){
                let sortDT = sort.sortValue
                sortData({id:sortDT.id, sortDirection:sortDT.sortDirection})
                sortDT.send = true;
            }
        }
        else if(sortData === undefined && sortable && !IsEmptyObject(sort.sortValue)){
            if(sort.sortValue["sortDirection"] !== undefined){
                if(sort.sortValue["sortDirection"] === "asc"){
                    let sortLocalData = _.orderBy([...props.dataSource], sort.sortValue["id"], "asc")
                    setDataSource(sortLocalData);
                }
                else{
                    let sortLocalData = _.orderBy([...props.dataSource], sort.sortValue["id"], "desc")
                    setDataSource(sortLocalData);
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sort.sortValue,  sortData])

    useEffect(() => {
        if (props.filterable){
            props.filterData(filter.filterValue)
            setResetPage(true)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter.filterValue])

    useEffect(() => {
        if (props.selectionDefault !== undefined){
            if(props.selectionDefault.length > 0 && dataSource.length > 0){
                if(page > 1 && props.clearSelectionChangeData){
                    selection.removeAll();
                }else{
                    selection.addAll(props.selectionDefault)
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataSource])
    
    useEffect(() => {
        if (selectionData !== undefined && !IsEmptyObject(selection.selectionValue)) {
            selectionData(selection.selectionValue)
        }
    }, [selection.selectionValue, selectionData])

    useEffect(() => {
        if(props.clearSelectionChangeData){
            selection.removeAll();
        }
        if (props.onPageChange === undefined) {
            let dataSlice = props.dataSource.slice(((page - 1) * (props.pageSize)), ((page - 1) * (props.pageSize)) + props.pageSize);
            setDataSource(dataSlice);
        } else {
            setDataSource(props.dataSource);
        }
    }, [page, props.dataSource])

    useEffect(() => {
        if(props.clearSelectionChangePage){
            selection.removeAll();
        }
        if(typeof props.onPageChange === "function")
            props.onPageChange(page)
    }, [page])

    return <div style={{maxHeight:props.height}}>
        <Topbar 
            customTopControl={props.customTopControl} 
            customTopLeftControl={props.customTopLeftControl} 
            customTopRightControl={props.customTopRightControl}
            totalSize={props.totalSize}
            resetPage={resetPage}
            pageSize={props.pageSize}
            dataSource={dataSource}
            pagination={props.pagination}
            page={(e) => setPage(e)}
        />
        <AmTableBody
            dataSource={dataSource}
            width={props.width}
            height={props.height}
            columns={props.columns}
            cellStyle={props.cellStyle}
            dataKey={props.dataKey}
            rowNumber={props.rowNumber}
            footerStyle={props.footerStyle}
            tableStyle={props.tableStyle}
            headerStyle={props.headerStyle}
            groupBy={props.groupBy}
            selection={props.selection}
            filterable={props.filterable}
            minRows={props.minRows}
            page={page}
            clearSelectionChangePage={props.clearSelectionChangePage}
            sortable={props.sortable}
            selectionDisabledCustom={props.selectionDisabledCustom}
            clearSelectionChangeData={props.clearSelectionChangeData}
            style={props.style}
        />
        <Bottombar 
            customBtmControl={props.customBtmControl} 
            customBtmLeftControl={props.customBtmLeftControl} 
            customBtmRightControl={props.customBtmRightControl}
            totalSize={props.totalSize}
            resetPage={resetPage}
            pageSize={props.pageSize}
            dataSource={dataSource}
            pagination={props.pagination}
            page={(e) => setPage(e)}
        />
    </div>
}

export default AmTableComponent;

AmTableComponent.propTypes = AmTablePropTypes;

AmTableComponent.defaultProps = {
    minRows: 5,
    height: 500,
    pageSize: 25,
    clearSelectionChangePage: true,
    width: "100%",
    sortable: false,
    filterable:false,
    dataSource:[]
}
