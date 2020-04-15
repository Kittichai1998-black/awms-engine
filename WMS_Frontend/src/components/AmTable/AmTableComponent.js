import React, {useContext, useState, useEffect, useRef, useLayoutEffect} from 'react';
import { apicall, Clone } from '../function/CoreFunction2';
import {Arrow, 
    Table,
    TableContainer,
    TableRow,
    TableHeaderRow,
    TableHeaderCell,
    TableCell,
    TableHeader,
    TableFooter,
    TableStickyCell,
    TableHeaderStickyColumnsCell } from "./AmTableStyle";
import {AmTableProvider, AmTableContext} from "./AmTableContext";
import AmInput from "../AmInput";
import Checkbox from "@material-ui/core/Checkbox";
import Moment from "moment";
import Radio from "@material-ui/core/Radio";
import { withStyles } from "@material-ui/core/styles";

const SortDirection = {
    DESC: "desc",
    ASC: "asc"
};

const CheckboxCustom = withStyles({
    root: {
        padding:"0 !important",
        marginRight:"5px"
    },
  })(Checkbox);

  const RadioCustom = withStyles({
    root: {
        padding:"0 !important",
        marginRight:"5px"
    },
  })(Radio);


const useColumns = (Columns, rowNumber, selectionState, key) => {
    const [columns, setColumns] = useState(Columns);
    //const {selection, pagination, setPageSize} = useContext(AmTableContext);

    /**
    useEffect(() => {
        if (selection.selectionValue.length > 0) {
          selection.selectionValue.forEach(x => {
            let element = document.getElementById(
              "selection_" + x[key]
            );
            if (element !== null || element === undefined) {
              element.checked = true;
            }
          });
        }
    }, [selection, key, pagination.pageValue]);*/

    /**
    useEffect(() => {
        let getColumns = [...Columns];

        if (rowNumber) 
        {
            getColumns.unshift({
                Header: "Row",
                width: 40,
                filterable: false,
                fixed: "left",
                sortable: false,
                style:{"maxWidth":"40px"},
                Cell: e => {
                    let numrow = 0;
                    if (pagination.pageValue !== undefined) {
                        if (pagination.pageValue > 0) {
                            numrow = e.viewIndex + 1 + parseInt(pagination.pageValue) * parseInt(pagination.pageSize);
                        } else {
                            numrow = e.viewIndex + 1;
                        }
                    }
                    return <span style={{ fontWeight: "bold" }}>{numrow}</span>;
                }
            });
        }

        if (selectionState) {
            if (selectionState === "radio") {
                getColumns.unshift({
                Header: "",
                filterable: false,
                fixed: "left",
                width: 40,
                sortable: false,
                Cell: ele => {
                    return (
                    <input
                        type="radio"
                        name="selection"
                        value={ele.data[key]}
                        onKeyPress={e => {
                            if (e.target.checked) {
                                selection.add({data:ele.original, uniq:key});
                            }
                        }}
                    />
                    );
                }
                });
        } else {
            getColumns.unshift({
            Header: ele => (
                <input
                id="selectAll"
                checked={selection.selectionAll}
                type="checkbox"
                onChange={e => {
                    if (e.target.checked) {
                    setSelectionAll({ select: true, reset: false });
                    } else {
                    setSelectionAll({ select: false, reset: true });
                    }
                }}
                />
            ),
            filterable: false,
            fixed: "left",
            width: 40,
            sortable: false,
            Cell: ele => {
                return (
                <input
                    id={"selection_" + ele.original[key]}
                    type="checkbox"
                    name="selection"
                    value={ele.data[key]}
                    onChange={e => {
                    if (e.target.checked) {
                        selection(ele.data, true);
                    } else {
                        addSelection(ele.original, false);
                    }
                    }}
                />
                );
            }
            });
        }
        }

        setColumns([...getColumns]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [Columns,]); */

    return columns
}

function useWindowSize(ref) {
    const [size, setSize] = useState([0, 0]);
    useLayoutEffect(() => {
      function updateSize() {
          if(ref !== undefined)
            setSize([ref.current.offsetWidth, ref.current.offsetHeight]);
      }
      window.addEventListener('resize', updateSize);
      updateSize();
      return () => window.removeEventListener('resize', updateSize);
    }, []);
    return size;
}

const AmTableComponent = (props) => {
    const containerRef = useRef()

    const {selection, filter, sort} = useContext(AmTableContext)
    
    const windowSize = useWindowSize(containerRef)
    //const {columns, selectionData} = useColumns(props.columns, props.rowNumber, props.selection, pageNumber)

    useEffect(()=>{
      console.log(selection.add)
      selection.add(10)
    },[])

    return <AmTableProvider>
        <TableContainer width="100%" ref={containerRef}>
            <Table width={(windowSize[0] + 1000)+'px'}>
                <TableHeaderRow>
                    <TableHeaderStickyColumnsCell style={{width:150}}>X1</TableHeaderStickyColumnsCell>
                    <TableHeaderStickyColumnsCell style={{left:150}}>x2</TableHeaderStickyColumnsCell>
                    <TableHeaderCell>x3</TableHeaderCell>
                    <TableHeaderCell>x4</TableHeaderCell>
                </TableHeaderRow>
                <TableRow>
                    <TableStickyCell>X1</TableStickyCell>
                    <TableStickyCell style={{left:150}}>X2</TableStickyCell>
                    <TableCell>x3</TableCell>
                    <TableCell>x4</TableCell>
                </TableRow>
                <TableRow>
                    <TableStickyCell>X1</TableStickyCell>
                    <TableStickyCell style={{left:150}}>X2</TableStickyCell>
                    <TableCell>x3</TableCell>
                    <TableCell>x4</TableCell>
                </TableRow>
                <TableRow>
                    <TableStickyCell>X1</TableStickyCell>
                    <TableStickyCell style={{left:150}}>X2</TableStickyCell>
                    <TableCell>x3</TableCell>
                    <TableCell>x4</TableCell>
                </TableRow>
                <TableRow>
                    <TableStickyCell>X1</TableStickyCell>
                    <TableStickyCell style={{left:150}}>X2</TableStickyCell>
                    <TableCell>x3</TableCell>
                    <TableCell>x4</TableCell>
                </TableRow>
                <TableRow>
                    <TableStickyCell>X1</TableStickyCell>
                    <TableStickyCell style={{left:150}}>X2</TableStickyCell>
                    <TableCell>x3</TableCell>
                    <TableCell>x4</TableCell>
                </TableRow>
                <TableRow>
                    <TableStickyCell>X1</TableStickyCell>
                    <TableStickyCell style={{left:150}}>X2</TableStickyCell>
                    <TableCell>x3</TableCell>
                    <TableCell>x4</TableCell>
                </TableRow>
                <TableRow>
                    <TableStickyCell>X1</TableStickyCell>
                    <TableStickyCell style={{left:150}}>X2</TableStickyCell>
                    <TableCell>x3</TableCell>
                    <TableCell>x4</TableCell>
                </TableRow>
            </Table>
        </TableContainer>
    
        <TableContainer>
          {GenerateHeader(props)}
          {GenerateRow(props)}
        </TableContainer>
    </AmTableProvider>
}

const GenerateRow = (props) => {
    return <>
        {props.dataSource.map((data, idx) => {
            return <TableRow>
                <GenerateCell column={props.columns} data={data} rowIndex={idx} cellStyle={props.cellStyle}/>
            </TableRow>
        })}
        
    </>
}

const GenerateCell = ({columns, data, rowIndex, cellStyle}) => {

    const renderCellText = (columnType, dataRow) => {
        if (columnType.type !== undefined) {
          if (columnType.type === "datetime") {
            return (
              <div>
                {Moment(dataRow).isValid
                  ? Moment(dataRow).format(
                      columnType.dateFormat
                        ? columnType.dateFormat
                        : "DD/MM/YYYY HH:mm"
                    )
                  : ""}
              </div>
            );
          }
          else if (columnType.type === "number"){
            return <div style={{ width: "100%", textAlign: "right" }}>{dataRow}</div>;
          }
        }
        else
            return dataRow;
      };

    return columns.map((column, idx) => {
        let createCellData = {
            original: data,
            column: column.accessor,
            value: data[column.accessor],
            viewIndex: rowIndex
          };
        if(column.fixed){
            return <TableCell style={column.style === undefined ? cellStyle : column.style} key={idx}>
                {column.Cell === undefined || column.Cell === null? renderCellText(column, data[column.accessor]) : column.Cell(createCellData)}
            </TableCell>
        }
        else{
            return <TableCell style={column.style === undefined ? cellStyle : column.style} key={idx}>
                {column.Cell === undefined || column.Cell === null? renderCellText(column, data[column.accessor]) : column.Cell(createCellData)}
            </TableCell>
        }
    })
}

const GenerateHeader = (props) => {
    const {sort, filter} = useContext(AmTableContext);

    const SortHeader = propsChild => {
      const { row, children } = propsChild;
      if (props.sortable) {
        if (row.sortable === undefined || row.sortable === true) {
          let orderBy;
          if (sort !== undefined && sort !== null && sort !== {}) {
            if (row.accessor === sort.id) {
              if (sort.sortDirection === SortDirection.DESC)
                orderBy = {
                  id: row.accessor,
                  sortDirection: SortDirection.ASC
                };
              else
                orderBy = {
                  id: row.accessor,
                  sortDirection: SortDirection.DESC
                };
            }
          }

          return (
            <div
              style={{ width: "100%" }}
              onClick={() => {
                if (sort === undefined || sort === null || sort === {}) {
                  orderBy = {
                    id: row.accessor,
                    sortDirection: SortDirection.DESC
                  };
                }
                if (sort !== undefined && sort !== null && sort !== {}) {
                  if (row.accessor !== sort.id) {
                    orderBy = {
                      id: row.accessor,
                      sortDirection: SortDirection.DESC
                    };
                  }
                }
                sort.setSort(orderBy);
              }}
            >
              {children}
              {orderBy === null || orderBy === undefined ? null : orderBy.sortDirection === SortDirection.DESC ? 
              (
                <span>
                  <Arrow
                    style={{
                      transform: "rotate(-135deg)",
                      WebkitTransform: "rotate(-135deg)"
                    }}
                  />
                </span>
              ) : (
                <span>
                  <Arrow
                    style={{
                      transform: "rotate(45deg)",
                      WebkitTransform: "rotate(45deg)"
                    }}
                  />
                </span>
              )}
            </div>
          );
        } else {
          return <div style={{ width: "100%" }}>{children}</div>;
        }
      } else {
        return <div style={{ width: "100%" }}>{children}</div>;
      }
    };

    const onChangeFilter = (field, value) => {
        filter.setFilter({field, value})
    };

    const RenderTableHeader = () => {
      let getWidth = 0;
      return props.columns.map((row, idx) => {
        let fixedStyle = {};
        if (row.fixed) {
          fixedStyle = { left: getWidth, zIndex: 1000 };
          getWidth = getWidth + row.width;
        }
        return (
          <TableHeaderCell
            id={`th_${idx}`}
            style={{ minWidth: row.width, ...fixedStyle, ...row.style }}
            key={idx}
            rowData={row}
          >
            {typeof row.Header === "string" ? (
              <SortHeader row={row}>{row.Header}</SortHeader>
            ) : (
              <SortHeader row={row}>{row.Header(row)}</SortHeader>
            )}
            {props.filterable ? (
              row.filterable === false ? null : typeof row.Filter ===
                "function" ? (
                <div>{row.Filter(row.accessor, onChangeFilter)}</div>
              ) : (
                <div>
                  <AmInput onBlur={e => onChangeFilter(row.accessor, e)} 
                  />
                </div>
              )
            ) : null}
          </TableHeaderCell>
        );
      });
    };

    return <TableHeaderRow>{RenderTableHeader()}</TableHeaderRow>;
  };

const GenerateFooter = () => {
    return <div></div>
}

export default AmTableComponent;