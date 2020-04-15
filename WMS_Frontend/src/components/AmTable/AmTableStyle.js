
import styled from "styled-components";

const Table = styled.div`
    position:relative;
    display: table;
    min-width: ${props => {
        console.log(props.width)
        return props.width ? props.width : "100%"
    }};
    background:${props => props.background ? props.background : "black"};
    -webkit-box-sizing:border-box;
    box-sizing:border-box;
    -moz-box-sizing:border-box;
`
const TableContainer = styled.div`
    position:relative;
    width:${props => props.width}
    overflow:auto;
    max-height:100px;
    padding-right:10px;
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
`
const TableHeaderRow = styled.div`
    display:table-header-group;
`
const TableCell = styled.div`
    display:table-cell;
    background:yellow;
    border:1px solid black;
    box-sizing:border-box;
    align-items:center;
    min-width:${props => props.width ? `${props.width}"px"` : "150px"};
    max-width:${props => props.width ? `${props.width}"px"` : "inherit"};
    white-space:nowrap;
`
const TableHeaderCell = styled(TableCell)`
    text-align:center;
    background:gray;
    padding:5px;
    font-weigth:bold;
    position: -webkit-sticky;
    position:sticky;
    top:0;
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
const TableHeader = styled.div`
    display:table-header-group;
    background:green;
`
const TableFooter = styled.div`
    display:table-footer-group;
    background:green;
`
const Arrow = styled.span`
  border: solid white;
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 3px;
  margin-left: 5px;
`;

export {Table,TableContainer,TableRow,TableHeaderRow,TableHeaderCell,TableCell,TableHeader,TableFooter,TableStickyCell,TableHeaderStickyColumnsCell,Arrow }