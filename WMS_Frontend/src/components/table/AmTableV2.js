import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import "./style.css";
import AmInput from "../AmInput";
import Moment from "moment";

const Table = styled.table`
  width: 100%;
  position: relative;
`;
const TableHead = styled.thead``;
const TableHeadCell = styled.th`
  user-select: none;
  position: sticky;
  background: #666ad1;
  outline: 1px solid #c7c7c7;
  outline-offset: -1px;
  top: 0;
  text-align: center;
  cursor: pointer;
  vertical-align: top;
  border: 2px solid #c7c7c7;
  border-collapse: collapse;
  color: white;
  outline: 1px solid #c7c7c7;
  outline-offset: -1px;
`;

const TableBody = styled.tbody`
  & tr:hover td {
    background: #d1d9ff !important;
  }
`;
const TableFoot = styled.tfoot`
  tr td {
    background: #eaeaea;
  }
`;
const TableRowHeader = styled.tr`
  user-select: none;
`;
const TableRow = styled.tr``;
const TableCell = styled.td`
  border-collapse: collapse;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border: 2px solid #c7c7c7;
`;
const FilterInput = styled(AmInput)`
  width: 100%;
`;

const TableCellFix = styled(TableCell)`
  background: white;
  position: sticky;
  top: 0;
  outline: 1px solid #c7c7c7;
  outline-offset: -1px;
`;

const Arrow = styled.span`
  border: solid white;
  border-width: 0 2px 2px 0;
  display: inline-block;
  padding: 3px;
  margin-left: 5px;
`;

const SortDirection = {
  DESC: "desc",
  ASC: "asc"
};

const useColumns = props => {
  const [columns, setColumns] = useState([]);
  const [selection, setSelection] = useState([]);
  const [selectionAll, setSelectionAll] = useState({
    select: false,
    reset: false
  });

  useEffect(() => {
    if (selection.length > 0) {
      selection.forEach(x => {
        let element = document.getElementById(
          "selection_" + x[props.primaryKey]
        );
        if (element !== null || element === undefined) {
          element.checked = true;
        }
      });
    } else {
      props.data.forEach(x => {
        let element = document.getElementById(
          "selection_" + x[props.primaryKey]
        );
        if (element !== null || element === undefined) {
          element.checked = false;
        }
      });
    }
  }, [selection, props.primaryKey, props.data]);

  useEffect(() => {
    if (selectionAll.select) {
      props.data.forEach(x => {
        let findObj = selection.find(obj => {
          return obj[props.primaryKey] === x[props.primaryKey];
        });
        if (findObj === null || findObj === undefined) {
          selection.push(x);
        }
      });

      setSelection([...selection]);
    } else {
      if (selectionAll.reset) {
        setSelection([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionAll, props.data]);

  useEffect(() => {
    let getColumns = [...props.columns];

    if (props.rowNumber) {
      getColumns.unshift({
        Header: "Row",
        width: 40,
        filterable: false,
        fixed: "left",
        sortable: false,
        Cell: e => {
          let numrow = 0;
          if (props.currentPage !== undefined) {
            if (props.currentPage > 0) {
              numrow =
                e.viewIndex +
                1 +
                parseInt(props.currentPage) * parseInt(props.pageSize);
            } else {
              numrow = e.viewIndex + 1;
            }
          }
          return <span style={{ fontWeight: "bold" }}>{numrow}</span>;
        }
      });
    }

    if (props.selection) {
      if (props.selectionType === "radio") {
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
                value={ele.original[props.primaryKey]}
                onKeyPress={e => {
                  if (e.target.checked) {
                    setSelection([ele.original]);
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
              checked={selectionAll.select}
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
                id={"selection_" + ele.original[props.primaryKey]}
                type="checkbox"
                name="selection"
                value={ele.original[props.primaryKey]}
                onChange={e => {
                  if (e.target.checked) {
                    addSelection(ele.original, true);
                  } else {
                    setSelectionAll({ select: false, reset: false });
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
  }, [
    props.columns,
    props.selection,
    props.selectionType,
    props.primaryKey,
    selectionAll,
    selection
  ]);

  const addSelection = (rowData, check) => {
    if (check) {
      setSelection([...selection, rowData]);
    } else {
      let uncheck = selection.filter(
        sel => sel[props.primaryKey] !== rowData[props.primaryKey]
      );
      setSelection([...uncheck]);
    }
  };

  return { columns, selection };
};

const AmTableMaster = props => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState();
  const [sort, setSort] = useState();
  const columnsNselection = useColumns(props);

  const { columns, selection } = columnsNselection;

  useEffect(() => {
    if (props.getSelection !== undefined) props.getSelection(selection);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection]);

  useEffect(() => {
    if (props.filterData !== undefined) props.filterData(filter);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const renderheader = () => {
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
                props.sort(orderBy);
                setSort(orderBy);
              }}
            >
              {children}
              {orderBy === null ||
              orderBy === undefined ? null : orderBy.sortDirection ===
                SortDirection.DESC ? (
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

    const RenderTableHeader = () => {
      let getWidth = 0;
      return columns.map((row, idx) => {
        let fixedStyle = {};
        if (row.fixed) {
          fixedStyle = { left: getWidth, zIndex: 1000 };
          getWidth = getWidth + row.width;
        }
        return (
          <TableHeadCell
            id={`th_${idx}`}
            style={{ minWidth: row.width, ...fixedStyle }}
            key={idx}
            rowData={row}
          >
            {typeof row.Header === "string" ? (
              <SortHeader row={row}>{t(row.Header)}</SortHeader>
            ) : (
              <SortHeader row={row}>{row.Header(row)}</SortHeader>
            )}
            {props.filterable ? (
              row.filterable === false ? null : typeof row.Filter ===
                "function" ? (
                <div>{row.Filter(row.accessor, onChangeFilter)}</div>
              ) : (
                <div>
                  <FilterInput onBlur={e => onChangeFilter(row.accessor, e)} />
                </div>
              )
            ) : null}
          </TableHeadCell>
        );
      });
    };

    return <TableRowHeader>{RenderTableHeader()}</TableRowHeader>;
  };

  const renderBody = () => {
    return (
      <>
        {props.data.map((row, idx) => {
          return (
            <TableRow style={props.rowStyleProps} key={idx}>
              {renderBodyCell(row, idx)}
            </TableRow>
          );
        })}
      </>
    );
  };

  const renderBodyCell = (row, dataIdx) => {
    let getWidth = 0;
    return columns.map((column, idx) => {
      let createCellData = {
        original: row,
        column: column.accessor,
        value: row[column.accessor],
        viewIndex: dataIdx
      };
      if (column.fixed) {
        let fixedStyle = { left: getWidth };
        getWidth = getWidth + column.width;
        return (
          <TableCellFix
            style={
              column.style === undefined
                ? { ...props.cellStyleProps, ...fixedStyle }
                : { ...column.style, ...fixedStyle }
            }
            key={idx}
          >
            {column.Cell === undefined || column.Cell === null
              ? renderCellText(column, row[column.accessor])
              : column.Cell(createCellData)}
          </TableCellFix>
        );
      } else {
        return (
          <TableCell
            style={
              column.style === undefined ? props.cellStyleProps : column.style
            }
            key={idx}
          >
            {column.Cell === undefined || column.Cell === null
              ? renderCellText(column, row[column.accessor])
              : column.Cell(createCellData)}
          </TableCell>
        );
      }
    });
  };

  const renderCellText = (columnType, dataRow) => {
    if (columnType.type !== undefined) {
      if (columnType.type === "datetime") {
        return (
          <div>
            {Moment(dataRow).isValid
              ? Moment(dataRow).format(
                  columnType.dateFormat
                    ? columnType.dateFormat
                    : "DD-MM-YYYY HH:mm"
                )
              : ""}
          </div>
        );
      } else if (columnType.type === "number")
        return (
          <div style={{ width: "100%", textAlign: "right" }}>{dataRow}</div>
        );
    } else return dataRow;
  };

  const renderFooter = () => {
    let footerCell = [];
    if (columns.filter(column => column.Footer === true).length > 0) {
      let getWidth = 0;
      columns.forEach((column, idx) => {
        if (column.fixed) {
          let fixedStyle = { position: "sticky", bottom: 0, zIndex: 1000 };
          fixedStyle.left = getWidth;
          getWidth = getWidth + column.width;
          if (column.Footer)
            footerCell.push(
              <TableCellFix style={fixedStyle} key={idx}>
                {column.sumData === undefined ? "NoData" : column.sumData}
              </TableCellFix>
            );
          else
            footerCell.push(
              <TableCellFix style={fixedStyle} key={idx}></TableCellFix>
            );
        } else {
          if (column.Footer) {
            footerCell.push(
              <TableCellFix style={{ bottom: 0 }} key={idx}>
                {column.sumData === undefined ? "NoData" : column.sumData}
              </TableCellFix>
            );
          } else {
            footerCell.push(
              <TableCellFix style={{ bottom: 0 }} key={idx}></TableCellFix>
            );
          }
        }
      });
    }

    return footerCell.length > 0 ? <TableRow>{footerCell}</TableRow> : null;
  };

  const RenderCustomTopRight = () => {
    return (
      <div style={{ float: "right", marginBottom: "10px" }}>
        {props.renderCustomTopRight}
      </div>
    );
  };

  const RenderCustomTopLeft = () => {
    return (
      <div style={{ float: "left", marginBottom: "10px" }}>
        {props.renderCustomTopLeft}
      </div>
    );
  };

  const RenderCustomBtmLeft = () => {
    return (
      <div style={{ float: "left", marginTop: "10px" }}>
        {props.renderCustomBtmLeft}
      </div>
    );
  };

  ///Function OnChange Filter Input
  const onChangeFilter = (field, value) => {
    if (filter !== undefined || filter !== null) {
      var getFilter = { ...filter };
      getFilter[field] = value;
      setFilter(getFilter);
    } else {
      setFilter({ ...filter, [field]: value });
    }
  };

  return (
    <div style={{ width: "99%" }}>
      <RenderCustomTopLeft />
      <RenderCustomTopRight />
      <div
        style={{ width: "100%", maxHeight: props.maxHeight, overflow: "auto" }}
      >
        <Table>
          <TableHead>{renderheader()}</TableHead>
          <TableBody>{renderBody()}</TableBody>
          <TableFoot>{renderFooter()}</TableFoot>
        </Table>
      </div>
      <RenderCustomBtmLeft />
    </div>
  );
};

AmTableMaster.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  sortable: PropTypes.bool,
  primaryKey: PropTypes.string,
  selection: PropTypes.bool,
  selectionType: PropTypes.string,
  currentPage: PropTypes.number,
  pageSize: PropTypes.number,
  filterable: PropTypes.bool,
  filterData: PropTypes.func,
  renderCustomTopLeft: PropTypes.any,
  renderCustomTopRight: PropTypes.any,
  renderCustomBtmLeft: PropTypes.any,
  maxHeight: PropTypes.string,
  sort: PropTypes.func,
  rowNumber: PropTypes.bool
};

AmTableMaster.defaultProps = {
  sortable: true,
  primaryKey: "ID",
  maxHeight: "500px",
  filterable: false,
  currentPage: 0,
  pageSize: 1000,
  selection: false,
  selectionType: "radio",
  data: [],
  rowNumber: true
};

export default AmTableMaster;
