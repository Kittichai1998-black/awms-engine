import React, { useState, useEffect, lazy, Suspense, useRef } from "react";
import PropTypes from "prop-types"
import AmTablePropTypes from "./AmTablePropTypes";
import AmDropDownMenu from "../AmDropDownMenu";
import SettingsIcon from '@material-ui/icons/Settings';
import {IconButton, Button} from '@material-ui/core';
import {Dropdown} from "react-bootstrap";
import AmExportExcel from "../AmExportExcel";
import {
    Clone
} from "../function/CoreFunction";

const pageSize = [{label:"20", value:20},{label:"50", value:50},{label:"100", value:100}]

const AmTableComponent = lazy(() => import("./AmTableComponent"));

const CustomTopLeft = React.memo(({customToggleBTN, customTopLeftControl, items, selection}) => {
    if(items && customTopLeftControl){
        return <>
            <AmDropDownMenu customToggle={customToggleBTN} style={{display:"inline-block", borderRight:customTopLeftControl ? "2px solid #ddd" : "", paddingRight:"4px"}} items={items} datas={selection} title="Action"/>
            <div style={{display:"inline-block", paddingLeft:"4px"}} >{customTopLeftControl}</div>
        </>;
    }
    else if(items){
        return <>
            <AmDropDownMenu customToggle={customToggleBTN} style={{display:"inline-block", borderRight:customTopLeftControl ? "2px solid #ddd" : "", paddingRight:"4px"}} items={items} datas={selection} title="Action"/>
        </>;
    }
    else if(customTopLeftControl){
        return <>
            <div style={{display:"inline-block", paddingLeft:"4px"}} >{customTopLeftControl}</div>
        </>;
    }
});

const CustomTopRight = React.memo(({customSettingBTN, customSettingMenu, customTopRightControl, items, selection, tableConfig, pagination}) => {
    if(tableConfig && customTopRightControl){
        return <>
        <div style={{display:"inline-block", paddingLeft:"4px"}} >{customTopRightControl}</div>
        <AmDropDownMenu customToggle={customSettingBTN} customItems={customSettingMenu} 
        style={{display:"inline-block", paddingLeft:"4px"}} 
        items={items} datas={selection} title=""/>
    </>;
    }
    else if(tableConfig){
        return <>
            <AmDropDownMenu customToggle={customSettingBTN} customItems={customSettingMenu} 
            style={{display:"inline-block", paddingLeft:"4px"}} 
            items={items} datas={selection} title=""/>
        </>;
    }
    else if(customTopRightControl){
        return <>
            <div style={{display:"inline-block", paddingLeft:"4px"}} >{customTopRightControl}</div>
        </>;
    }
    
    
});

const customToggleBTN = React.forwardRef(({ children, onClick }, ref) => (
    <Button
    ref={ref}
    onClick={(e) => {
        e.preventDefault();
        onClick(e);
    }}
    >
    {children}
    &nbsp; &#x25bc;
    </Button>
));

const customSettingBTN = React.forwardRef(({ children, onClick }, ref) => (
    <IconButton disableRipple
        ref={ref}
        onClick={(e) => {
            e.preventDefault();
            onClick(e);
    }}>
        <SettingsIcon/>
    </IconButton>
));


const AmTable = (props) => {
    const [selection, setSelection] = useState([])
    const [pgSize, setPgSize] = useState(props.pageSize ? 20 : props.pageSize);
    const [exportExcel, setExportExcel] = useState(false);

    useEffect(() => {
        if(props.onPageSizeChange)
            props.onPageSizeChange(props.pageSize)
    }, [])

    const customPageSizeBtn = React.forwardRef(({ children, onClick }, ref) => (
        <Button disableRipple
            ref={ref}
            onClick={(e) => {
                e.preventDefault();
                onClick(e);
            }}
            >
            {children}
            &nbsp; &#x25bc;
        </Button>
    ));

    const customSettingMenu = React.forwardRef(({ children, style, className }, ref) => {
        return <div ref={ref}
                style={style}
                className={className}>
                <div style={{marginLeft:"10px",width:'160px'}}>
                    <label style={{ marginRight:"10px"}}>Page Size : </label>
                    <Dropdown style={{display:"inline-block"}}>
                        <Dropdown.Toggle id={'pageSizeSelect'} as={customPageSizeBtn}>
                            {pgSize}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                        {pageSize.map(item => {
                            return <Dropdown.Item as="button" onClick={() => {
                                setPgSize(item.value)
                                props.onPageSizeChange(item.value)
                            }}>{item.label}</Dropdown.Item>
                        })}
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
                {children}
        </div>
    });

    useEffect(() => {
        if(props.selectionData !== undefined)
        props.selectionData(selection)
    }, [selection, props])

    const configItems = [
        {label:"ExportExcel", action:(data) => {setExportExcel(true);}},
    ];

    const FilterColumns = () => {
        return props.columns.map(x=> {
            if(x.accessor)
                return {Header:typeof(x.Header) === "function" ? x.accessor : x.Header, accessor:x.accessor}
            else return {}
        }).filter(x=> x.accessor !== undefined);
    }

    return <>
        <Suspense fallback="">
            <AmTableComponent
                style={props.style}
                dataSource={props.dataSource}
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
                pageSize={pgSize}
                minRows={props.minRows}
                pagination={props.pagination}
                onPageChange={props.onPageChange}
                totalSize={props.totalSize}
                selection={props.selection}
                selectionData={(sel) => {if(props.selectionData !== undefined)setSelection(sel)}}
                selectionDefault={props.selectionDefault}
                clearSelectionChangePage={props.clearSelectionChangePage}
                customTopControl={props.customTopControl}
                customTopLeftControl={
                    props.customTopLeftControl || props.customAction ? 
                    <CustomTopLeft 
                        customToggleBTN={customToggleBTN} 
                        customTopLeftControl={props.customTopLeftControl} 
                        items={props.customAction} 
                        selection={selection}/> : null
                }
                customTopRightControl={
                    props.customTopRightControl || props.tableConfig ? <CustomTopRight 
                        customSettingBTN={customSettingBTN} 
                        customSettingMenu={customSettingMenu} 
                        customTopRightControl={props.customTopRightControl} 
                        items={configItems} tableConfig={props.tableConfig} 
                        selection={selection} 
                        pagination={props.pagination}/> : null
                }
                customBtmControl={props.customBtmControl}
                customBtmLeftControl={props.customBtmLeftControl}
                customBtmRightControl={props.customBtmRightControl}
                sortable={props.sortable}
                sortData={props.sortData}
                selectionDisabledCustom={props.selectionDisabledCustom}
                clearSelectionChangeData={props.clearSelectionChangeData}
            />
            {
                props.tableConfig ? 
                <AmExportExcel 
                    fileName="ExcelExport" 
                    columns={FilterColumns()} 
                    data={Clone(props.dataSource)} 
                    isLoading={exportExcel} 
                    onToggleLoad={(value)=> {setExportExcel(value)}}
                />
                : null
            }
        </Suspense>
    </>
}

AmTable.propTypes = {...AmTablePropTypes,
    /**
     * เปิดปิดตั้งค่าตาราง
     ** value? : true | false
    */
    tableConfig:PropTypes.bool,
    /**
     * เปิดปิดตั้งค่าตาราง
     ** value? : true | false
    */
    customAction:PropTypes.object,
    /**
     * ฟังก์ชั่นสำหรับรับค่า PageSize
     ** value? : (pagesize) => {}
    */
    onPageSizeChange:PropTypes.func
};
AmTable.defaultProps ={
    pageSize:50,
    tableConfig:true
}
export default AmTable;