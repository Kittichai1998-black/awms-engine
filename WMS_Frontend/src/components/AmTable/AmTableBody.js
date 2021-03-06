import React, { useContext, useState, useEffect, useRef, useLayoutEffect } from 'react';
import {
  Table,
  TableContainer,
  TableRow,
  TableHeaderRow,
  TableHeaderCell,
  TableCell,
  TableFooter,
  TableStickyCell,
  TableHeaderStickyColumnsCell,
  TableCellFooter,
  TableStickyCellFooter
} from "./AmTableStyle";
import { AmTableContext } from "./AmTableContext";
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
//import Input from "@material-ui/core/Input";
import TextField from "@material-ui/core/TextField";
//import Checkbox from "@material-ui/core/Checkbox";
import Moment from "moment";
//import Radio from "@material-ui/core/Radio";
//import { withStyles } from "@material-ui/core/styles";
import _ from "lodash";

const IsEmptyObject = (obj) => {
  if (typeof (obj) === "object")
    return Object.keys(obj).length === 0 && obj.constructor === Object
  else
    return false;
}

const SortDirection = {
  DESC: "desc",
  ASC: "asc"
};

// const CheckboxCustom = withStyles({
//   root: {
//       padding:"0 !important",
//       marginRight:"5px"
//   },
// })(Checkbox);

// const RadioCustom = withStyles({
//   root: {
//       padding:"0 !important",
//       marginRight:"5px"
//   },
// })(Radio);

const useColumns = (Columns, rowNumber, selectionState, dataKey, page, selectionCustom, dataSource) => {
  const [columns, setColumns] = useState([]);
  const { selection, pagination } = useContext(AmTableContext);
  // useEffect(() => {
  //   console.log("Columns")
  // }, [Columns])
  // useEffect(() => {
  //   console.log("selection.selectAllState")
  // }, [selection.selectAllState])
  // useEffect(() => {
  //   console.log("dataSource")
  // }, [dataSource])

  const ref = useRef([]);

  useEffect(() => {
    let getColumns = [...Columns];
    if (rowNumber) {
      getColumns.unshift({
        Header: "Row",
        fixWidth: 45,
        filterable: false,
        fixed: "left",
        sortable: false,
        type: "number",
        Cell: ele => {
          let numrow = 0;
          if (page !== undefined) {
            if (!ele.data._footer && ele.original["_groupFooter"] === undefined) {
              if (page > 0) {
                numrow = ele.viewIndex + 1 + parseInt(page - 1) * pagination.pageSize;
              } else {
                numrow = ele.viewIndex + 1;
              }

              return <div style={{ fontWeight: "bold", textAlign: "right", paddingRight: "2px" }}>{numrow}</div>;
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
          colStyle: { textAlign: "center" },
          Cell: ele => {
            if (ele.original[dataKey] !== undefined) {
              return (
                <input
                  type="radio"
                  id={"selection_" + ele.original[dataKey]}
                  name="selection"
                  value={ele.data[dataKey]}
                  onChange={e => {
                    selection.set({ data: ele.original, uniq: ele.original[dataKey] });
                  }}
                  disabled={selectionCustom ? selectionCustom(ele.data) : false}
                />
              );
            }
            else {
              return <></>
            }
          }
        });
      } else {
        getColumns.unshift({
          Header: ele => {
            if (selectionCustom) {
              return null;
            } else {
              return <input
                id="selectAll"
                checked={selection.selectAllState}
                type="checkbox"
                onChange={e => {
                  if (e.target.checked) {
                    selection.addAll(dataSource)
                  } else {
                    selection.removeAll([]);
                  }
                  selection.selectAll(null)

                }}
              />
            }
          },
          filterable: false,
          fixed: "left",
          fixWidth: 20,
          colStyle: { textAlign: "center", },
          sortable: false,
          Cell: ele => {
            if (ele.original[dataKey] !== undefined) {
              ref.current[ele.viewIndex] = React.createRef();
              return (
                <input ref={ref.current[ele.viewIndex]}
                  id={"selection_" + ele.original[dataKey]}
                  type="checkbox"
                  name="selection"
                  value={ele.data[dataKey]}
                  onChange={e => {
                    if (!ele.data.disabled) {
                      if (e.target.checked) {
                        selection.add({ data: ele.original, uniq: dataKey });
                      } else {
                        selection.remove({ uniq: dataKey, data: ele.original[dataKey] });
                        ref.current[ele.viewIndex].current.checked = false;
                      }
                    }
                  }}
                  disabled={selectionCustom ? selectionCustom(ele.data) : false}
                />
              );
            }
            else {
              return <></>
            }
          }
        });
      }
    }
    setColumns([...getColumns]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Columns, selection.selectAllState, dataSource]);

  return columns
}

const useDataSource = (props, groupBy) => {
  const [dataSource, setDataSource] = useState(props)
  const { pagination, sort } = useContext(AmTableContext);

  useEffect(() => {
    if (typeof props === "object") {
      const data = props.slice(0, pagination.pageSize);
      let keyObj = [];
      if (groupBy) {
        let groups = _.groupBy(data, (dt) => {
          //var findSort = groupItem.find(x => x === sort.sortValue);
          let groupField = "";
          groupBy.field.forEach(x => groupField += dt[x]);
          keyObj.push(groupField)
          return groupField;
        });
        keyObj = [...new Set(keyObj)];
        let groupObj = keyObj.map(x => groups[x])
        let groupAllData = _.orderBy(Object.keys(groupObj), groupBy.field).map((g) => {
          let groupData = groupObj[g];
          let sumBy = {};
          groupBy.sumField.forEach(x => {
            sumBy[x] = _.sumBy(groupData, x)
          });
          if (props.groupFooter) {
            //g.push({...props.groupFooter(data), "_footer":true})
            return groupData
          }
          else {
            groupData.push({ ...sumBy, "_footer": true, "_groupFooter":true })
            return groupData
          }
        });
        let groupWithSum = []
        groupAllData.forEach(x => groupWithSum = groupWithSum.concat(x))
        setDataSource(groupWithSum)
      } else {
        setDataSource(data)
      }
    } else {
      setDataSource([])
    }
  }, [props, groupBy, pagination.pageSize, sort])

  return dataSource
}

function useWindowSize(ref) {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    function updateSize() {
      if (ref.current !== undefined){
        setSize([ref.current.offsetWidth, ref.current.offsetHeight]);
      }
    }if(size[0] === 0&& size[1] === 0){
      updateSize()
    }
    window.addEventListener('resize', updateSize);
    return () => {
      window.removeEventListener('resize', updateSize);
    }
  }, []);
  
  return size;
}

const AmTableBody = (props) => {
  const containerRef = useRef();
  const dataSource = useDataSource(props.dataSource, props.groupBy)

  const { selection } = useContext(AmTableContext);

  const tableSize = useWindowSize(containerRef)
  const columns = useColumns(
    props.columns,
    props.rowNumber,
    props.selection,
    props.dataKey,
    props.page,
    props.selectionDisabledCustom,
    props.dataSource
  )

  useEffect(() => {
    selection.selectionValue.forEach(x=> {
      if(document.getElementById("selection_"+ x[props.dataKey]) !== null)
        document.getElementById("selection_"+ x[props.dataKey]).checked = true;
    });
    if(!selection.selectAllState && selection.selectionValue.length === 0){
      let getDataKey = dataSource.map(res => {return res[props.dataKey]});
      getDataKey.forEach(dk => {
        if(document.getElementById("selection_"+ dk) !== null)
          document.getElementById("selection_"+ dk).checked = false;
      });
    }
    props.dataSource.forEach(x=> {
      let findX = selection.selectionValue.find(y => y[props.dataKey] == x[props.dataKey])
      if(findX !== undefined){
        if(document.getElementById("selection_"+ x[props.dataKey]) !== null)
          document.getElementById("selection_"+ x[props.dataKey]).checked = true;
      }      
      else{
        if(document.getElementById("selection_"+ x[props.dataKey]) !== null)
          document.getElementById("selection_"+ x[props.dataKey]).checked = false;
      }
        
    });
  },[columns, selection.selectAllState, props.dataSource, selection.selectionValue])


  return <TableContainer style={props.style} width={props.width} height={props.height} ref={containerRef}>
    <Table style={props.tableStyle}>
      <GenerateHeader columns={columns} props={props} tableSize={tableSize} />
      {GenerateRow({ columns, props, dataSource })}
      {GenerateFooter({ columns, props, dataSource })}
    </Table>
  </TableContainer>
}

const GenerateRow = ({ columns, props, dataSource }) => {
  let customDataSource = [...dataSource];
  if (customDataSource.length < props.minRows) {
    let rowCount = 0;

    while (rowCount < props.minRows - customDataSource.length) {
      customDataSource.push({})
    }
  }

  let getIdx = -1

  return <>
    {customDataSource.map((data, idx) => {
      if(!data._footer && data["_groupFooter"] === undefined)
        getIdx += 1;
      return <TableRow key={idx}>
        <GenerateCell columns={columns} data={data} rowIndex={getIdx} cellStyle={props.cellStyle} rowStyle={props.rowStyle ? props.rowStyle(data) : null}/>
      </TableRow>
    })}
  </>
}

const GenerateCell = React.memo(({ columns, data, rowIndex, cellStyle, rowStyle }) => {
  const renderCellText = (columnType, dataRow) => {
    if (columnType.type !== undefined) {
      if (columnType.type === "datetime") {
        return (
          <div style={{ marginLeft: "2px" }}>
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
      else if (columnType.type === "number") {
        return <div style={{ width: "100%", paddingRight: "2px", textAlign: "right" }}>{dataRow}</div>;
      }
    }
    else {
      return <div style={{ marginLeft: "2px" }}>{dataRow}</div>;
    }
  };

  const renderEmptyData = () => {
    return <div style={{ visibility: "hidden" }}>&nbsp;</div>
  }
  let getWidth = 0;
  return columns.map((column, idx) => {
    let createCellData = {
      original: data,
      data: data,
      column: column,
      accessor: column.accessor,
      value: data[column.accessor],
      viewIndex: rowIndex
    };

    let style = {};

    if(rowStyle !== undefined && rowStyle !== null){
      style = rowStyle;
    }

    if ((cellStyle !== undefined && cellStyle !== null) && column.colStyle === undefined) {
      const customCellStyle = cellStyle(column.code, data[column.accessor], data);
      style = {...style, ...customCellStyle}
    }

    if (column.fixed) {
      let fixedStyle = {};
      fixedStyle.left = getWidth;
      getWidth = getWidth + column.fixWidth;
      return <TableStickyCell className="tableCell" style={column.colStyle === undefined ? { ...style, ...fixedStyle } : { ...column.colStyle, ...fixedStyle }} key={idx}>
        {IsEmptyObject(data) ? renderEmptyData() : (column.Cell === undefined || column.Cell === null) ? renderCellText(column, data[column.accessor]) : column.Cell(createCellData)}
      </TableStickyCell>
    }
    else {
      return <TableCell className="tableCell" style={column.colStyle === undefined ? style : column.colStyle} key={idx}>
        {IsEmptyObject(data) ? renderEmptyData() : (column.Cell === undefined || column.Cell === null) ? renderCellText(column, data[column.accessor]) : column.Cell(createCellData)}
      </TableCell>
    }
  })
});

const GenerateFooter = ({ columns, props, dataSource }) => {
  let findFooter = columns.filter(x => x.Footer !== undefined)
  if (findFooter.length > 0) {
    return <TableFooter>
      {columns.map((col, idx) => { return GenerateFooterCell(col, props, dataSource, idx) })}
    </TableFooter>
  }
  else {
    return null;
  }
}

const GenerateFooterCell = (column, props, dataSource, idx) => {
  const dataByField = [];
  let totalField = 0;
  dataSource.filter(x => !x["_footer"]).forEach((data, rowIndex) => {
    if (typeof data[column.accessor] === "number")
      totalField += data[column.accessor]

    dataByField.push({ value: data[column.accessor], index: rowIndex })
  })
  dataByField.push({ value: totalField, index: dataByField.length + 1 })

  let style = {}
  if (props.footerStyle !== undefined) {
    style = props.footerStyle(dataSource, dataByField, column)
  }


  let getWidth = 0;
  let fixedStyle = {};
  fixedStyle.left = getWidth;
  getWidth = getWidth + column.fixWidth;
  if (column.Footer !== undefined) {
    if (typeof column.Footer === "function") {

      if (column.fixed)
        return <TableStickyCellFooter key={idx} style={{ ...style, ...fixedStyle }}>{column.Footer(dataSource, dataByField, column)}</TableStickyCellFooter>
      else
        return <TableCellFooter key={idx} style={{ ...style }}>{column.Footer(dataSource, dataByField, column)}</TableCellFooter>
    }
    else {
      if (column.fixed)
        return <TableStickyCellFooter key={idx} style={{ ...style, ...fixedStyle }}>{totalField}</TableStickyCellFooter>
      else
        return <TableCellFooter key={idx} style={{ ...style }}>{totalField}</TableCellFooter>
    }
  }
  else {
    if (column.fixed)
      return <TableStickyCellFooter key={idx} style={{ ...style, ...fixedStyle }}></TableStickyCellFooter>
    else
      return <TableCellFooter key={idx} style={{ ...style }}></TableCellFooter>
  }
}


const GenerateHeader = React.memo(({ columns, props, tableSize }) => {
  const { sort, filter } = useContext(AmTableContext);
  const cellRef = useRef([])

  const SortHeader = propsChild => {
    const { row, children } = propsChild;
    const { sortValue, setSort } = sort;
    if (props.sortable) {
      if (row.sortable === undefined || row.sortable === true) {
        let orderBy;
        var sortValueOwn = sortValue.id === row.accessor ? sortValue : null;
        return (
          <div
            style={{ width: "100%" }}
            onClick={() => {
              if (sortValue === undefined || sortValue === null || IsEmptyObject(sortValue)) {
                orderBy = {
                  id: row.accessor,
                  sortDirection: SortDirection.DESC,
                  send: false
                };
              }
              if (sortValue !== undefined && sortValue !== null && !IsEmptyObject(sortValue)) {
                if (row.accessor === sortValue.id) {
                  orderBy = {
                    id: row.accessor,
                    sortDirection: sortValue.sortDirection === SortDirection.ASC ? SortDirection.DESC : SortDirection.ASC,
                    send: false
                  };
                } else {
                  orderBy = {
                    id: row.accessor,
                    sortDirection: SortDirection.DESC,
                    send: false
                  };
                }
              }
              setSort(orderBy);
            }}
          >
            {children}
            {sortValueOwn === null || sortValueOwn === undefined ? null : sortValueOwn.sortDirection === SortDirection.DESC ?
              (
                <span>
                  <ArrowDropUpIcon style={{ transition: "transform 2s", transform: "rotate(0deg)" }} />
                </span>
              ) : (
                <span>
                  <ArrowDropUpIcon style={{ transition: "transform 2s", transform: "rotate(180deg)" }} />
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
    if (customFilter === undefined || IsEmptyObject(customFilter))
      filter.setFilter({ field, value })
    else
      filter.setFilter({ field, value, customFilter })
  };

  const calculateWidth = (cols) => {
    let totalWidth = 0;
    let countNotSet = 0;
    cols.forEach((x, idx) => {
      if (x.fixWidth !== undefined) {
        totalWidth += x.fixWidth;
      }
      else if (x.width !== undefined) {
        totalWidth += x.width;
      }
      else {
        countNotSet++;
      }
    });
    let cellWidth = tableSize[0] - totalWidth;
    totalWidth = Math.floor(cellWidth / countNotSet);
    return totalWidth;
  }

  const RenderTableHeader = () => {
    let getWidth = 0;
    return columns.map((col, idx) => {
      if (col.fixed) {
        let fixedStyle = {};
        fixedStyle.left = getWidth;
        getWidth = getWidth + col.fixWidth;
        return <TableHeaderStickyColumnsCell
          id={`th_${idx}`}
          style={{ ...col.style, ...props.headerStyle, ...fixedStyle }}
          key={idx}
          rowData={col}
          ref={cellRef.current[idx]}
          fixWidth={col.fixWidth}
        >
          {col.Header === undefined ? (
            <SortHeader row={col}></SortHeader>
          ) :
            typeof col.Header === "string" ? (
              <SortHeader row={col}>{col.Header}</SortHeader>
            ) : (
                <SortHeader row={col}>{col.Header(col)}</SortHeader>
              )}
          {props.filterable ? (
            col.filterable === false ? null : typeof col.Filter === "function" ?
              (<div>{col.Filter(col.accessor, onChangeFilter)}</div>) : (
                <div>
                  <TextField size="small" id={`filter_${idx}`} style={{ width: "100%", background: "white" }}
                    onKeyPress={(event) => {
                      if (event.key === "Enter") {
                        document.getElementById(`filter_${idx}`).blur();
                      }
                    }}
                    onBlur={(event) => { onChangeFilter(col.accessor, event.target.value, col.customFilter === undefined ? {} : col.customFilter) }} />
                </div>)
          ) : null}
        </TableHeaderStickyColumnsCell>
      }
      else {
        return <TableHeaderCell
          id={`th_${idx}`}
          style={{ ...col.style, ...props.headerStyle }}
          key={idx}
          rowData={col}
          ref={cellRef.current[idx]}
          width={col.width === undefined ? 'auto' : col.width}
          fixWidth={col.fixWidth}
        >
          {col.Header === undefined ? (
            <SortHeader row={col}></SortHeader>
          ) :
            typeof col.Header === "string" ? (
              <SortHeader row={col}>{col.Header}</SortHeader>
            ) : (
                <SortHeader row={col}>{col.Header(col)}</SortHeader>
              )}
          {props.filterable ? (
            col.filterable === false ? null : typeof col.Filter === "function" ?
              (<div>{col.Filter(col.accessor, onChangeFilter)}</div>) : (
                <div>
                  <TextField size="small" id={`filter_${idx}`} style={{ width: "100%", background: "white" }}
                    onKeyPress={(event) => {
                      if (event.key === "Enter") {
                        document.getElementById(`filter_${idx}`).blur();
                      }
                    }}
                    onBlur={(event) => {
                      onChangeFilter(col.accessor, event.target.value, col.customFilter === undefined ? {} : col.customFilter)
                    }
                    }
                  />
                </div>)
          ) : null}
        </TableHeaderCell>
      }
    });
  };

  return <TableHeaderRow>{RenderTableHeader()}</TableHeaderRow>;
});

export default AmTableBody;