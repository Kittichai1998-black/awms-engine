
import styled from "styled-components";

const Table = styled.div`
    position:relative;
    display: table;
    min-width: ${props => {
        return props.width ? props.width : "100%"
    }};
    background:${props => props.background ? props.background : "white"};
    -webkit-box-sizing:border-box;
    box-sizing:border-box;
    -moz-box-sizing:border-box;
    border-collapse: separate;
`
const TableContainer = styled.div`
    position:relative;
    width:${props => `${typeof props.width === "number" ? props.width + 'px' : props.width}`}
    overflow:auto;
    max-height:${props => `${typeof props.height === "number" ? props.height + 'px' : props.height}`}
    padding-right:1px;
    &&::-webkit-scrollbar{
        width: 0.5em;
        height:0.5em;
    }
    -webkit-box-sizing:border-box;
    box-sizing:border-box;
    -moz-box-sizing:border-box;
`
const TableRow = styled.div`
    display:table-row;
    :hover div.tableCell{
        background:#cccccc;
        ${props => props.hover}
    }
`
const TableHeaderRow = styled.div`
    display:table-header-group;
`
const TableCell = styled.div`
    display:table-cell;
    background:#ffffff;
    box-sizing:border-box;
    align-items:center;
    white-space:nowrap;

    border-bottom: 1px solid #ddd;
    border-right: 1px solid #ddd;
    :first-child{
        border-left: 1px solid #ddd;
    }
`
const TableHeaderCell = styled(TableCell)`
    width:${props => `${props.fixWidth ? props.fixWidth : props.width}px`};
    ${props => props.fixWidth ? `min-width:${props.fixWidth}px` : props.width ? `min-width:${props.width}px` : "min-width:150px"}
    ${props => props.fixWidth ? `max-width:${props.fixWidth}px` : ""}
    text-align:center;
    z-index:500;
    background:rgb(248,249,250);
    padding:5px;
    font-weigth:bold;
    position: -webkit-sticky;
    position:sticky;
    top:0;
    border-top: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
    border-right: 1px solid #ddd;
    :first-child{
        border-left: 1px solid #ddd;
    }
`

const TableHeaderStickyColumnsCell = styled(TableHeaderCell)`
    z-index:600;
    left:0;
`
const TableStickyCell = styled(TableCell)`
    position: -webkit-sticky;
    position:sticky;
    left:0;
`
const TableFooter = styled.div`
    display:table-footer-group;
`
const TableCellFooter = styled(TableCell)`
    z-index:500;
    background:rgb(248,249,250);
    padding:5px;
    font-weigth:bold;
    position: -webkit-sticky;
    position:sticky;
    bottom:0;
    border-top: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
    border-right: 1px solid #ddd;
    :first-child{
        border-left: 1px solid #ddd;
    }
`

const TableStickyCellFooter = styled(TableCellFooter)`
    position: -webkit-sticky;
    position:sticky;
    left:0;
`

export {Table,TableContainer,
    TableRow,TableHeaderRow,
    TableHeaderCell,TableCell,
    TableFooter,TableStickyCell,
    TableHeaderStickyColumnsCell
    ,TableCellFooter,TableStickyCellFooter }