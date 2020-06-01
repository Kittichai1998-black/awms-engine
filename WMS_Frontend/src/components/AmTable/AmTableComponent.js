import React, {useContext, useState, useEffect, useRef, useLayoutEffect, createRef} from 'react';
import {Arrow, 
    Table,
    TableContainer,
    TableRow,
    TableHeaderRow,
    TableHeaderCell,
    TableCell,
    TableFooter,
    TableStickyCell,
    TableHeaderStickyColumnsCell,
    TableCellFooter } from "./AmTableStyle";
import {AmTableContext} from "./AmTableContext";
import Input from "@material-ui/core/Input";
import AmInput from "../AmInput";
import Checkbox from "@material-ui/core/Checkbox";
import Moment from "moment";
import Radio from "@material-ui/core/Radio";
import { withStyles } from "@material-ui/core/styles";
import { IsEmptyObject } from "../function/CoreFunction2";
import _ from "lodash";

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

const useColumns = (Columns, rowNumber, selectionState, dataKey, dataSource, page) => {
    const [columns, setColumns] = useState([]);
    const {selection, pagination} = useContext(AmTableContext);

    useEffect(() => {
      if(selection.selectAllState){
        selection.addAll(dataSource)
        if (dataSource.length > 0) {
          dataSource.forEach(x => {
            let element = document.getElementById(
              "selection_" + x[dataKey]
            );
            if (element !== null || element === undefined) {
              element.checked = true;
            }
          });
        }
      }
      else{
        if (dataSource.length > 0) {
          selection.removeAll()
          dataSource.forEach(x => {
            let element = document.getElementById(
              "selection_" + x[dataKey]
            );
            if (element !== null || element === undefined) {
              element.checked = false;
            }
          });
        }
      }
        
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selection.selectAllState, dataSource, dataKey]);

    useEffect(() => {
        let getColumns = [...Columns];
        if (rowNumber) 
        {
            getColumns.unshift({
                Header: "Row",
                fixWidth: 20,
                filterable: false,
                fixed: "left",
                sortable: false,
                type:"number",
                Cell: ele => {
                    let numrow = 0;
                    if (page !== undefined) {
                      if(!ele.data._footer){
                        if (page > 0) {
                          numrow = ele.viewIndex + 1 + parseInt(page-1) * pagination.pageSize;
                        } else {
                          numrow = ele.viewIndex + 1;
                        }
                        if(ele.original[dataKey] !== undefined)
                          return <div style={{ fontWeight: "bold" , textAlign:"right", paddingRight:"2px"}}>{numrow}</div>;
                      }
                    }
                }
            });
        }

        if (selectionState) {
            if (selectionState === "radio") {
                getColumns.unshift({
                Header: "",
                filterable: false,
                fixed: "left",
                fixWidth: 20,
                sortable: false,
                colStyle:{textAlign:"center"},
                Cell: ele => {
                    if(ele.original[dataKey] !== undefined){
                      return (
                      <input
                          type="radio"
                          name="selection"
                          value={ele.data[dataKey]}
                          onKeyPress={e => {
                              if (e.target.checked) {
                                  selection.set({data:ele.original, uniq:ele.original[dataKey]});
                              }
                          }}
                      />
                      );
                  }
                  else{
                    return <></>
                  }
                }
                });
        } else {
            getColumns.unshift({
            Header: ele => {
                return <input
                id="selectAll"
                checked={selection.selectAllState}
                type="checkbox"
                onChange={e => {selection.selectAll(null)}}
                />
            },
            filterable: false,
            fixed: "left",
            fixWidth: 20,
            colStyle:{textAlign:"center"},
            sortable: false,
            Cell: ele => {
                if(ele.original[dataKey] !== undefined){
                  let chkSel = selection.selectionValue.find(x=> x[dataKey] === ele.original[dataKey])
                  return (
                    <input
                        id={"selection_" + ele.original[dataKey]}
                        type="checkbox"
                        name="selection"
                        checked={chkSel}
                        value={ele.data[dataKey]}
                        onChange={e => {
                          if (!chkSel) {
                            selection.add({data:ele.original, uniq:dataKey});
                          } else {
                            selection.remove({uniq:dataKey, data:ele.original[dataKey]});
                          }
                        }
                      }
                    />
                    );
                }
                else{
                  return <></>
                }
            }
            });
          }
        }
        setColumns([...getColumns]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [Columns, selection.selectionValue, selection.selectAllState, page]);

    return columns
}

const useDataSource = (props, groupBy) => {
  const [dataSource, setDataSource] = useState(props)
  const {pagination, sort} = useContext(AmTableContext);

  useEffect(() => {
    const data = props.slice(0, pagination.pageSize);

    if(groupBy){
      let groups = _.groupBy(data, (data)=> {
        //var findSort = groupItem.find(x => x === sort.sortValue);
        let groupField = "";
        groupBy.field.forEach(x=> groupField += data[x]);
        return groupField;
      });
      
      console.log(groups)
      let groupData = _.orderBy(Object.keys(groups), groupBy.field).map((g) => {
        let grourData = groups[g];
        let sumBy = {};
        groupBy.sumField.forEach(x=> {
          sumBy[x] = _.sumBy(grourData, x)
        });
        if(props.groupFooter){
          //g.push({...props.groupFooter(data), "_footer":true})
          return grourData
        }
        else{
          grourData.push({...sumBy, "_footer":true})
          return grourData
        }
      });
      let groupWithSum = []
      
      console.log(groupData)
      groupData.forEach(x=> groupWithSum = groupWithSum.concat(x))
      setDataSource(groupWithSum)
    }else{
      setDataSource(data)
    }
    
  }, [props, groupBy, pagination.pageSize, sort])

  return dataSource
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
    const containerRef = useRef();
    const dataSource = useDataSource(props.dataSource, props.groupBy)
    
    const tableSize = useWindowSize(containerRef)
    const columns = useColumns(props.columns, props.rowNumber, props.selection, props.dataKey, props.dataSource, props.page)
    return <TableContainer width="100%" ref={containerRef} height={props.height}>
          <Table style={props.tableStyle}>
            {GenerateHeader({columns, props, tableSize})}
            {GenerateRow({columns, props, dataSource})}
            {GenerateFooter({columns, props, dataSource})}
          </Table>
        </TableContainer>
}

const GenerateRow = ({columns,props, dataSource}) => {
  let customDataSource = [...dataSource];
  if(customDataSource.length < props.minRow){
    let rowCount = 0;

    while(rowCount < props.minRow - customDataSource.length){
      customDataSource.push({})
    }
  }
  return <>
    {customDataSource.map((data, idx) => {
        return <TableRow key={idx}>
            <GenerateCell columns={columns} data={data} rowIndex={idx} cellStyle={props.cellStyle}/>
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
                {dataRow !== undefined && Moment(dataRow).isValid()
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
        else{
          return dataRow;
        }
    };

    const renderEmptyData = () => {
      return <div style={{visibility:"hidden"}}>&nbsp;</div>
    }

    return columns.map((column, idx) => {
        let createCellData = {
            original: data,
            data:data,
            column: column,
            accessor: column.accessor,
            value: data[column.accessor],
            viewIndex: rowIndex
          };

        let style={};
        if(cellStyle !== undefined && column.colStyle === undefined){
          cellStyle(column.code, data[column.accessor],data)
        }

        if(column.fixed){
            return <TableCell style={column.colStyle === undefined ? style : column.colStyle} key={idx}>
                {IsEmptyObject(data) ? renderEmptyData() : (column.Cell === undefined || column.Cell === null) ? renderCellText(column, data[column.accessor]) : column.Cell(createCellData)}
            </TableCell>
        }
        else{
            return <TableCell style={column.colStyle === undefined ? style : column.colStyle} key={idx}>
                {IsEmptyObject(data) ? renderEmptyData() : (column.Cell === undefined || column.Cell === null) ? renderCellText(column, data[column.accessor]) : column.Cell(createCellData)}
            </TableCell>
        }
    })
}

const GenerateHeader = ({columns,props, tableSize}) => {
    const {sort, filter} = useContext(AmTableContext);
    const cellRef = useRef([])
    //const [cellSize, setCellSize] = useState([])
    //const [cellResize, setCellResize] = useState([])

    //const arrLength = columns.length;

    // if (cellRef.current.length !== arrLength) {
    //   // add or remove refs
    //     cellRef.current = Array(arrLength).fill().map((_, i) => cellRef.current[i] || createRef());
    // }

    // useLayoutEffect(() => {
    //   function updateSize() {
    //     const arr = [];
    //     cellRef.current.forEach(e => {
    //       arr.push(e.current.offsetWidth);
    //     });
    //     setCellSize([...arr])
    //   }
    //   window.addEventListener('resize', updateSize);
    //   updateSize();
    //   return () => window.removeEventListener('resize', updateSize);
    // }, [cellRef, columns]);

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
                  <Arrow style={{transform: "rotate(-135deg)",WebkitTransform: "rotate(-135deg)"}}/>
                </span>
              ) : (
                <span>
                  <Arrow style={{transform: "rotate(45deg)",WebkitTransform: "rotate(45deg)"}}/>
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

    const onChangeFilter = (field, value, customFilter) => {
      filter.setFilter({field, value, customFilter})
    };

    const calculateWidth = (cols) => {
      let totalWidth = 0;
      let countNotSet = 0;
      cols.forEach((x,idx) => {
        if(x.fixWidth !== undefined){
          totalWidth += x.fixWidth;
        }
        else if(x.width !== undefined){
          totalWidth += x.width;
        }
        else{
          countNotSet++;
        }
      });
      let cellWidth = tableSize[0] - totalWidth;
      totalWidth = Math.round(cellWidth/countNotSet);
      return totalWidth;
    }

    const RenderTableHeader = () => {
      let getWidth = 0;
      const freeWidth = calculateWidth(columns);
      return columns.map((col, idx) => {
        //let fixedStyle = {};
        if (col.fixed) {
          //fixedStyle = { left: getWidth, zIndex: 1000 };
          getWidth = getWidth + (col.width !== undefined ? col.width : col.fixWidth !== undefined ? col.fixWidth : freeWidth);
        }
        return <TableHeaderCell
            id={`th_${idx}`}
            style={{ ...col.style, ...props.headerStyle }}
            key={idx}
            rowData={col}
            ref={cellRef.current[idx]}
            width={col.width === undefined ? freeWidth : col.width}
            fixWidth={col.fixWidth}
          >
            {typeof col.Header === "string" ? (
              <SortHeader row={col}>{col.Header}</SortHeader>
            ) : (
              <SortHeader row={col}>{col.Header(col)}</SortHeader>
            )}
            {props.filterable ? (
              col.filterable === false ? null : typeof col.Filter === "function" ? 
                (<div>{col.Filter(col.accessor, onChangeFilter)}</div>) : (
                <div>
                  <AmInput style={{
                    width:col.fixWidth !== undefined ? col.fixWidth : col.width === undefined ? freeWidth : col.width,
                  }} onKeyPress={(value, e1, e2, event) => {if(event.key === "Enter")onChangeFilter(col.accessor, value)}} />
                </div>)
            ) : null}
          </TableHeaderCell>
      });
    };

    return <TableHeaderRow>{RenderTableHeader()}</TableHeaderRow>;
  };

const GenerateFooter = ({columns,props, dataSource}) => {
  let findFooter = columns.filter(x=> x.Footer !== undefined)
  if(findFooter.length > 0){
    return <TableFooter>
      {columns.map((col,idx) => {return GenerateFooterCell(col, props, dataSource, idx)})}
    </TableFooter>
  }
  else{
    return null;
  }
}

const GenerateFooterCell = (column,props, dataSource, idx) => {
    const dataByField = [];
    let totalField = 0;
    dataSource.forEach((data, rowIndex)=> {
      if(typeof data[column.accessor] === "number")
        totalField += data[column.accessor]

      dataByField.push({value:data[column.accessor], index:rowIndex})
    })
    dataByField.push({value:totalField, index:dataByField.length+1})

    let style = {}
    if(props.footerStyle !== undefined){
      style = props.footerStyle(dataSource, dataByField, column)
    }

    if(column.Footer !== undefined){
      if(typeof column.Footer === "function")
        return <TableCellFooter key={idx} style={style}>{column.Footer(dataSource, dataByField, column)}</TableCellFooter>
      else
        return <TableCellFooter key={idx} style={style}>{totalField}</TableCellFooter>
    }
    else{
      return <TableCellFooter key={idx} style={style}> </TableCellFooter>
    }
}

export default AmTableComponent;