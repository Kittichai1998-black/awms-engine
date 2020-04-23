
import styled from "styled-components";

const Table = styled.div`
    position:relative;
    display: table;
    min-width: ${props => {
        return props.width ? props.width : "100%"
    }};
    background:${props => props.background ? props.background : "black"};
    -webkit-box-sizing:border-box;
    box-sizing:border-box;
    -moz-box-sizing:border-box;
    border-collapse: collapse;
    border: 1px solid #ddd;
`
const TableContainer = styled.div`
    position:relative;
    width:${props => `${props.width}px`}
    overflow:auto;
    min-height:200px;
    height:${props => `${props.height}px`}
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
    :hover div{
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
    border:1px solid #ddd;
    box-sizing:border-box;
    align-items:center;
    white-space:nowrap;
`
const TableHeaderCell = styled(TableCell)`
    width:${props => `${props.fixWidth ? props.fixWidth : props.width}px`};
    ${props => props.fixWidth ? `min-width:${props.fixWidth}px` : "min-width:150px"}
    text-align:center;
    background:rgb(248,249,250);
    padding:5px;
    font-weigth:bold;
    position: -webkit-sticky;
    position:sticky;
    top:0;
    :after, :before{
        content: '';
        position: absolute;
        left: 0;
        width: 100%;

    }
    :after{
        bottom: -1px;
        border-bottom: 1px solid #ddd;
    }
    :before{
        top: -1px;
        border-top: 1px solid #ddd;
    }
`

const TableHeaderStickyColumnsCell = styled(TableHeaderCell)`
    z-index:1000;
    left:0;
`
const TableStickyCell = styled(TableCell)`
    position: -webkit-sticky;
    position:sticky;
    left:0;
`
const TableFooter = styled.div`
    display:table-footer-group;
    background:green;
`
const TableCellFooter = styled(TableCell)`
    font-weigth:bold;
    position: -webkit-sticky;
    position:sticky;
    text-align:right;
    bottom:0;
    :after, :before{
        content: '';
        position: absolute;
        left: 0;
        width: 100%;
    }
    :after{
        top: -1px;
        border-top: 1px solid #ddd;
    }
    :before{
        bottom: 0px;
        border-bottom: 1px solid #ddd;
    }
`
const Arrow = styled.span`
  border: solid white;
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 3px;
  margin-left: 5px;
`;

export {Table,TableContainer,TableRow,TableHeaderRow,TableHeaderCell,TableCell,TableFooter,TableStickyCell,TableHeaderStickyColumnsCell,Arrow,TableCellFooter }