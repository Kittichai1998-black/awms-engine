import Checkbox from "@material-ui/core/Checkbox";
import classNames from "classnames";
import Moment from "moment";
import PropTypes from "prop-types";
import Radio from "@material-ui/core/Radio";
import ReactTable from "react-table";
import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import "react-table/react-table.css";
import withFixedColumns from "react-table-hoc-fixed-columns";
import "react-table-hoc-fixed-columns/lib/styles.css";

import AmExportDataTable from "./AmExportDataTable";

import "./style.css";

const ReactTableFixedColumns = withFixedColumns(ReactTable);

const AmTable = props => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(props.data);
  const [selection, setSelection] = useState([]);

  // props.defaultSelection ? props.defaultSelection : []
  const [selectAll, setSelectAll] = useState(false);
  const tableRef = useRef();
  useEffect(() => {
    if (props.defaultSelection) {
      setSelection(props.defaultSelection);
    } else {
      setSelection([]);
    }
  }, [props.defaultSelection]);
  const createColumn = () => {
    let cols = [...props.columns];

    cols.forEach(x => {
      if (!x.Cell)
        x.Cell = e => (
          <pre
            style={{
              fontSize: "inherit",
              fontFamily: "inherit",
              overflow: "hidden",
              color: "inherit",
              textOverflow: "inherit",
              padding: 0,
              margin: 0
            }}
            title={e.original[x.accessor]}
          >
            {e.original[x.accessor]}
          </pre>
        );
    });

    if (props.selection) {
      if (props.selectionType === "radio") {
        cols.unshift({
          mode: "selection",
          fixed: "left",
          width: 31,
          sortable: false,
          Cell: e => {
            let checked =
              checkSelection(e.original[props.primaryKey]).length > 0;
            return (
              <Radio
                type="radio"
                checked={checked}
                style={{ padding: 0}}
                name="selection"
                onChange={ele =>
                  onHandleSelection(e, "radio", ele.target.checked)
                }
              />
            );
          }
        });
      } else {
        const obj = {
          mode: "selection",
          fixed: "left",
          Header: e => {
            return (
              <Checkbox
                style={{ padding: 0 }}
                checked={selectAll}
                onClick={ele => {
                  onHandleSelection(
                    null,
                    "selectAll",
                    ele.target.checked,
                    e.data
                  );
                }}
              />
            );
          },
          width: 31,
          sortable: false,
          Cell: e => {
            let checked =
              checkSelection(e.original[props.primaryKey]).length > 0;
            return (
              <Checkbox
                checked={checked}
                style={{ padding: 0}}
                onChange={ele =>
                  onHandleSelection(e, "checkbox", ele.target.checked)
                }
              />
            );
          }
        };
        cols.unshift(obj);
      }
    }
    if (props.currentPage !== undefined) {
      cols.unshift({
        fixed: "left",
        width: 50,
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

    const sortCols = cols.map(x => {
      const { Header, type, ...row } = x;
      let column;
      if (
        (x.sortable || x.sortable === undefined) &&
        (props.sortable || props.sortable === undefined)
      ) {
        const header = typeof x.Header === "string" ? t(x.Header) : x.Header();
        column = {
          Header: () => <div className="sortable">{header}</div>,
          ...row
        };
      } else {
        column = {
          ...x,
          Header: typeof Header === "string" ? t(Header) : Header
        };
      }

      if (type === "datetime") {
        column.Cell = data => {
          if (
            data.original[x.accessor] === "" ||
            data.original[x.accessor] === null
          ) {
            return "";
          } else {
            return (
              <span>
                {Moment(data.original[x.accessor]).isValid
                  ? Moment(data.original[x.accessor]).format(
                      x.dateFormat ? x.dateFormat : "DD-MM-YYYY HH:mm"
                    )
                  : ""}
              </span>
            );
          }
        };
      }

      return column;
    });

    const sumCols = sortCols.map(x => {
      const { Footer, ...row } = x;
      if (x.Footer) {
        const findFooter = props.sumFooter.find(
          footer => x.accessor === footer.accessor
        );

        return {
          Footer: () => <span>{findFooter.sumData}</span>,
          ...row,
          getFooterProps: () => ({
            style: {
              backgroundColor: "#c8ced3"
            }
          })
        };
      } else {
        return x;
      }
    });
    return sumCols;
  };

  const [columns, setColumns] = useState(createColumn());
  useEffect(() => {
    setLoading(true);
  }, []);

  useEffect(() => {
    if (data !== props.data) {
      setLoading(true);
      setData(props.data);
      setSelection([]);
      setSelectAll(false);
      /* if (selectAll) {
                onHandleSelection(null, "selectAll", selectAll, props.data)
            } */
    }
  }, [props.data, props.reload]);

  useEffect(() => {
    if (props.selection) {
      let cols = createColumn(selectAll);
      setColumns(cols);
      props.getSelection(selection);
    }
  }, [selectAll, selection]);

  useEffect(() => {
    setLoading(false);
  }, [data]);

  useEffect(() => {
    let cols = createColumn();
    setColumns(cols);
  }, [props.currentPage, props.sumFooter, localStorage.getItem("Lang")]);

  const checkSelection = id => {
    return selection.filter(x => x[props.primaryKey] === id);
  };

  const onHandleSelection = (rowdata, type, status, tableData) => {
    let selectionData = selection;
    if (type === "checkbox") {
      if (selectionData.length > 0) {
        selectionData.forEach((row, index) => {
          if (row[props.primaryKey] === rowdata.original[props.primaryKey])
            selectionData.splice(index, 1);
        });
        if (status) selectionData.push(rowdata.original);
      } else {
        if (status) selectionData.push(rowdata.original);
      }
      setSelection([...selectionData]);
    } else if (type === "selectAll") {
      if (status) {
        let getData = tableData.map(row =>
          row._original ? row._original : row
        );
        selectionData.forEach((x, idx) => {
          getData.forEach(row => {
            if (x[props.primaryKey] === row[props.primaryKey]) {
              selectionData.splice(idx, 1);
            }
          });
        });
        selectionData.push(...getData);
        setSelection(selectionData);
      } else {
        selectionData.splice(0, selectionData.length);
        setSelection([]);
      }
      setSelectAll(status);
    } else {
      selectionData.splice(0, selectionData.length);
      selectionData.push(rowdata.original);
      setSelection(selectionData);
    }
  };

  const exportColumns = () => {
    return props.columns.filter(x => {
      return x.accessor;
    });
  };

  return (
    <div>
      <div style={{ display: "inline-flex", float: "right" }}>
        {props.renderCustomButtonB4}
        {props.exportData ? (
          <AmExportDataTable
            data={props.excelData ? props.excelData : []}
            fileName={"Table"}
            cols={exportColumns()}
          />
        ) : null}
        {props.renderCustomButtonAF}
      </div>
      <div style={{ clear: "both" }} />
      <ReactTableFixedColumns
        ref={tableRef}
        loading={loading}
        sortable={props.sortable}
        editable={false}
        filterable={false}
        defaultPageSize={props.pageSize}
        data={data}
        resizable={false}
        columns={columns}
        showPagination={false}
        multiSort={false}
        minRows={props.minRows ? props.minRows : 5}
        headerStyle={{ background: "red" }}
        style={{
          marginTop: "3px",
          backgroundColor: "white",
          maxHeight: "550px",
          border: "0.5px solid #eceff1",
          zIndex: 0,
          fontSize: "14px",
          ...props.style
        }}
        onSortedChange={sorted => {
          setData([]);
          props.sort({
            id: sorted[0].id,
            sortDirection: sorted[0].desc ? "desc" : "asc"
          });
        }}
        getTdProps={(state, row, col, instance) => {
          if (col.type === "number") {
            return { style: { textAlign: "right" } };
          } else return {};
        }}
        getTrProps={(state, rowInfo) => {
          if (props.getTrProps) {
            return props.getTrProps(state, rowInfo);
          } else {
            if (rowInfo && rowInfo.row) {
              if (rowInfo.original[props.editFlag]) {
                return {
                  onClick: () =>
                    props.onRowClick
                      ? props.onRowClick(rowInfo.original)
                      : null,
                  className: "editData"
                };
              } else {
                return {
                  onClick: () =>
                    props.onRowClick ? props.onRowClick(rowInfo.original) : null
                };
              }
            } else {
              return {
                onClick: () =>
                  props.onRowClick ? props.onRowClick(rowInfo.original) : null
              };
            }
          }
        }}
      />

      <div style={{ display: "inline-flex", float: "left" }}>
        {props.renderCustomButtonBTMLeft}
      </div>
      <div style={{ display: "inline-flex", float: "right" }}>
        {props.renderCustomButtonBTMRight}
      </div>
    </div>
  );
};

AmTable.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  pageSize: PropTypes.number,
  sort: PropTypes.func,
  sortable: PropTypes.bool,
  selection: PropTypes.bool,
  selectionType: PropTypes.string,
  getSelection: PropTypes.func,
  style: PropTypes.object,
  onRowClick: PropTypes.func,
  sumFooter: PropTypes.object,
  currentPage: PropTypes.number,
  editFlag: PropTypes.string,
  exportData: PropTypes.bool
};

export default AmTable;
