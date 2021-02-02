import CloseIcon from "@material-ui/icons/Close";
import Dialog from "@material-ui/core/Dialog";
import IconButton from "@material-ui/core/IconButton";

// import InputAdornment from '@material-ui/core/InputAdornment';
import MuiDialogActions from "@material-ui/core/DialogActions";
import MuiDialogContent from "@material-ui/core/DialogContent";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import PropTypes from "prop-types";
import React, { useState, useEffect, useRef } from "react";
// import SearchIcon from '@material-ui/icons/Search';
import styled from "styled-components";
import Typography from "@material-ui/core/Typography";
// import { useTranslation } from 'react-i18next'
import { withStyles } from "@material-ui/core/styles";
import { QueryGenerate } from './function/UtilFunction';
import AmDropdown from './AmDropdown'
import AmAux from "./AmAux";
import AmButton from "./AmButton";
import AmInput from "./AmInput";
import AmDatePicker from "./AmDatePicker";
// import AmTable from "./table/AmTable";
import AmTable from "./AmTable/AmTable";
import { apicall, createQueryString, Clone } from "./function/CoreFunction";
import Pagination from "./table/AmPagination";
import queryString from "query-string";
import moment from "moment";

// import MaterialTable from './AmCreateDocument_TableNew'

const Axios = new apicall();

// const LabelH = styled.label`
// font-weight: bold;
//   width: 200px;
// `;
const DialogActions = withStyles(theme => ({
    root: {
        borderTop: `1px solid ${theme.palette.divider}`,
        margin: 0
    }
}))(MuiDialogActions);

const FormInline = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  label {
    margin: 5px 0 5px 0;
  }
  input {
    vertical-align: middle;
  }
  @media (max-width: 800px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchInput = withStyles(theme => ({
    root: {
        padding: "2px 10px 2px 0",
        display: "inline",
        alignItems: "center",
        width: "auto"
    },
    input: {
        // paddingRight:100,
        marginLeft: 0, //8
        flex: 1
    },
    iconButton: {
        padding: 4
    },
    divider: {
        width: 1,
        height: 28,
        margin: 4
    }
}))(props => {
    const { classes, styleType, onClickSearch, onHandleKeyUp, ...other } = props;
    const keywordRef = useRef(null);
    const onHandleClick = e => {
        onClickSearch(keywordRef.current.value);
    };
    const onKeyUp = (value, obj, ele, event) => {
        if (event.key === "Enter") {
            onClickSearch(keywordRef.current.value);
        }
        onHandleKeyUp(value);
    };
    return (
        <div className={classes.root}>
            <label style={{ padding: "5px 5px 0 0", fontWeight: "bold" }}>
                {props.labelInput}
            </label>
            <AmInput
                style={{ width: "170px" }}
                type="search"
                placeholder={props.placeholder ? props.placeholder : "Search..."}
                styleType={styleType}
                inputRef={keywordRef}
                onKeyUp={onKeyUp}
                {...other}
            // InputProps={{
            //     inputProps: {
            //         className: classes.input,
            //     },
            //     endAdornment: (
            //         <InputAdornment position="end">
            //             <IconButton className={classes.iconButton} size="small" aria-label="Search" onClick={onHandleClick}>
            //                 <SearchIcon fontSize="small" />
            //             </IconButton>
            //         </InputAdornment>
            //     ),
            // }}
            />
        </div>
    );
});

const DialogTitle = withStyles(theme => ({
    root: {
        borderBottom: `1px solid ${theme.palette.divider}`,
        margin: 0,
        padding: theme.spacing(1)
    },
    closeButton: {
        position: "absolute",
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
        padding: "3px"
    }
}))(props => {
    const { children, classes, onClose } = props;
    return (
        <MuiDialogTitle disableTypography className={classes.root}>
            <Typography variant="h6">{children}</Typography>
            {onClose ? (
                <IconButton
                    aria-label="Close"
                    size="small"
                    className={classes.closeButton}
                    onClick={onClose}
                >
                    <CloseIcon fontSize="inherit" />
                </IconButton>
            ) : null}
        </MuiDialogTitle>
    );
});

const DialogContent = withStyles(theme => ({
    root: {
        margin: 0,
        padding: "0 5px 0 5px",
        overflowY: "hidden"
    }
}))(MuiDialogContent);

const StyledSearch = styled.div`
  position: relative;
  top: 0;
  margin: 10px;
`;
const BtnAddList = props => {
    const [open, setOpen] = useState(false);
    const [pageSize, setPageSize] = useState(20);
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState();
    const [dataSource, setDataSource] = useState([]);
    const [sort, setSort] = useState();
    const [iniQuery, setIniQuery] = useState(true);
    const [dataSelect, setDataSelect] = useState([]);
    const [keySearch, setKeySearch] = useState({});
    const [searchAction, setSearchAction] = useState(false);
    const [defaultSelect, setDefaultSelect] = useState();
    const [totalSize, setTotalSize] = useState(0);
    const [status, setstatus] = useState(true);
    const [inputErr, setinputErr] = useState([]);
    const [columns, setColumns] = useState();


    useEffect(() => {
        const iniCols = [...props.columns];
        console.log(iniCols)
        iniCols.forEach(col => {
            let filterConfig = col.filterConfig;
            if (filterConfig !== undefined) {
                if (filterConfig.filterType === "dropdown") {
                    col.Filter = (field, onChangeFilter) => {
                        var checkType = Array.isArray(filterConfig.dataDropDown);
                        if (checkType) {
                            console.log(filterConfig.dataDropDown)
                            return <AmDropdown
                                id={field}
                                placeholder={col.placeholder}
                                fieldDataKey={filterConfig.fieldDataKey === undefined ? "value" : filterConfig.fieldDataKey}
                                fieldLabel={filterConfig.fieldLabel === undefined ? ["label"] : filterConfig.fieldLabel}
                                labelPattern=" : "
                                width={filterConfig.widthDD !== undefined ? filterConfig.widthDD : 150}
                                ddlMinWidth={200}

                                defaultValue={(props.actionAuditStatus === true ? (field !== "auditStatus" ? null : "QUARANTINE") : null)}
                      
                                data={filterConfig.dataDropDown}
                                onChange={(value, dataObject, inputID, fieldDataKey) => onChangeFilter(field, value)}
                            />
                        }
                        else {
                            return <AmDropdown
                                id={field}
                                placeholder={col.placeholder}
                                fieldDataKey={filterConfig.fieldDataKey === undefined ? "value" : filterConfig.fieldDataKey}
                                fieldLabel={filterConfig.fieldLabel === undefined ? ["label"] : filterConfig.fieldLabel}
                                labelPattern=" : "
                                width={filterConfig.widthDD !== undefined ? filterConfig.widthDD : 150}
                                ddlMinWidth={200}
                                defaultValue={(props.actionAuditStatus === true ? (field !== "auditStatus" ? null : "QUARANTINE") : null)}
                                zIndex={1000}
                                queryApi={filterConfig.dataDropDown}
                                onChange={(value, dataObject, inputID, fieldDataKey) => onChangeFilter(field, value)}
                                ddlType={filterConfig.typeDropDown}
                            />
                        }
                    }
                } else if (filterConfig.filterType === "datetime") {
                    col.width = 420;
                    col.Filter = (field, onChangeFilter) => {
                        return <FormInline>
                            <AmDatePicker style={{ display: "inline-block" }} onBlur={(e) => { if (e !== undefined && e !== null) onChangeFilter(field, e.fieldDataObject, { ...col.customFilter, dataType: "datetime", dateField: "dateFrom" }) }} TypeDate={"date"} fieldID="dateFrom" />
                            <label>-</label>
                            <AmDatePicker style={{ display: "inline-block" }} onBlur={(e) => { if (e !== undefined && e !== null) onChangeFilter(field, e.fieldDataObject, { ...col.customFilter, dataType: "datetime", dateField: "dateTo" }) }} TypeDate={"date"} fieldID="dateTo" />
                        </FormInline>
                    }
                }
            }
        })
        setColumns(iniCols);
    }, [])








    useEffect(() => {
        setDataSelect([])
        if (open) {
            const dataHeader = props.headerCreate
                .reduce((arr, el) => arr.concat(el), [])
                .filter(x => x.search);
            if (dataHeader.length) {
                dataHeader.map(x => {
                    props.search.map(y => {
                        if (x.key === y.accessor) {
                            if (y.defaultValue) {
                                let queryQ = JSON.parse(query.q),
                                    ind = queryQ.findIndex(z => z.f === x.key);
                                if (ind !== -1) queryQ.splice(ind, 1);
                                queryQ.push({
                                    f: x.key,
                                    c: "like",
                                    v: y.defaultValue
                                });
                                query.q = JSON.stringify(queryQ);
                            } else {
                                let queryQ = JSON.parse(query.q),
                                    ind = queryQ.findIndex(z => z.f === x.key);

                                if (ind !== -1) queryQ.splice(ind, 1);
                                query.q = JSON.stringify(queryQ);
                            }
                        }
                    });
                });
            }
        } else {
            setQuery({ ...props.queryApi })
            setKeySearch({})
        }
    }, [open]);

    useEffect(() => {
        if (props.queryApi) {
            Axios.get(createQueryString(props.queryApi)).then(res => {
                if (res.data.datas) {
                    SetFormaatdata(res.data.datas)
                    setTotalSize(res.data.counts);
                    //setDefaultSelect([...props.dataCheck]);
                }
            });
        }
        setQuery(props.queryApi)
    }, [props.queryApi]);


    useEffect(() => {
        if (query) {
            Axios.get(createQueryString(query)).then(res => {
                if (res.data.datas) {
                    SetFormaatdata(res.data.datas)
                    setTotalSize(res.data.counts);
                   // setDefaultSelect([...props.dataCheck]);
                }
            });
        }
    }, [query]);


    useEffect(() => {
        if (typeof (page) === "number" && !iniQuery) {
            const queryEdit = JSON.parse(JSON.stringify(query));
            queryEdit.sk = page === 0 ? 0 : (page - 1) * parseInt(pageSize, 10);
            setQuery(queryEdit)
        }
    }, [page])

   const SetFormaatdata = (datas) => {
        let dataSet = datas.map(x => {
            let query = queryString.parse(x.Options)
            let obj = {
                ...x,
                quantity: x.Quantity,
                lot: x.Lot,
                expireDates: x.expireDate ? x.expireDate : null,
                productionDates: x.productionDate ? x.productionDate : null,
                eventstatus : 10,
                //expireDate: x.expireDate ? moment(x.expireDate).format('DD/MM/YYYY') : null,
                //productionDate: x.productionDate ? moment(x.productionDate).format('DD/MM/YYYY') : null,
                auditStatus: x.AuditStatus.toString(),
                ShelfLifePercent: x.ShelfLifeRemainPercent ? x.ShelfLifeRemainPercent + '%' : null,
                remark: query.remark != null ? query.remark : null
            }
            return obj
        })
        setDataSource(dataSet)

    }

    //const GetAuditStatus = (value) => {
    //    if (value === 0) {
    //        return "QUARANTINE"
    //    } else if (value === 1) {
    //        return "PASSED"
    //    } else if (value === 2) {
    //        return "NOTPASS"
    //    } else if (value === 9) {
    //        return "HOLD"
    //    }
    //};

    //useEffect(() => {
    //    if (typeof page === "number") {
    //        // const queryEdit = JSON.parse(JSON.stringify(query));
    //        query.sk = page === 0 ? 0 : page * parseInt(query.l, 10);
    //        setQuery({ ...query });
    //    }
    //}, [page]);

    useEffect(() => {
        if (sort) {
            // const queryEdit = JSON.parse(JSON.stringify(query));
            query.s = '[{"f":"' + sort.field + '", "od":"' + sort.order + '"}]';
            setQuery({ ...query });
        }
    }, [sort]);

    useEffect(() => {
        if (searchAction) {
            let newSel = props.queryApi.q ? JSON.parse(props.queryApi.q) : [];
            Object.keys(keySearch).map((x, idx) => {
 
                if (keySearch[x]) {
                    newSel.push({
                        o: "and",
                        f: x,
                        c: "like",
                        v: keySearch[x]
                    });
                    // if (idx === 0) {
                    //     newSel.push({
                    //         "o": "and",
                    //         "f": x,
                    //         "c": "like",
                    //         "v": encodeURIComponent(keySearch[x])
                    //     })
                    // } else {
                    //     newSel.push({
                    //         "o": "and",
                    //         "f": x,
                    //         "c": "like",
                    //         "v": encodeURIComponent(keySearch[x])
                    //     })
                    // }
                }
            });
            query.q = JSON.stringify(newSel);
            setQuery({ ...query });
            setSearchAction(false);
        }
    }, [searchAction]);


    const onChangeFilterData = (filterValue) => {
        var res = query;
        filterValue.forEach(fdata => {
            if (fdata.customFilter !== undefined) {
                if (IsEmptyObject(fdata.customFilter)) {
                    res = QueryGenerate({ ...query }, fdata.field, fdata.value, window.location.search)
                } else {
                    res = QueryGenerate({ ...query }, fdata.customFilter.field === undefined ? fdata.field : fdata.customFilter.field, fdata.value, fdata.customFilter.dataType, fdata.customFilter.dateField, window.location.search)
                }
            }
            else {
                res = QueryGenerate({ ...query }, fdata.field, fdata.value, window.location.search)
            }
            props.history.push(window.location.pathname + "?" + res.querySearch.toString());

        });
        setQuery(res)
    }


    const IsEmptyObject = (obj) => {
        if (typeof (obj) === "object")
            return Object.keys(obj).length === 0 && obj.constructor === Object
        else
            return false;
    }

    const onSubmit = () => {
        if (dataSelect.length > 0 && props.dataCheck.length > 0) {
            let datasOnsub = []
            dataSelect.forEach((a, i) => {
                let checks = props.dataCheck.find(b => b.ID === dataSelect[i].ID);
                if (checks === undefined) {
                  
                    //console.log(check)
                    //let datas = dataSelect.find(c => c.ID === undefined)
                    //console.log(props.dataCheck)
                    console.log(a)
        
                    //if (datas) {
                    datasOnsub.push({ ...a })
               
                        setOpen(false);
                    //}
                    } else {
                        setOpen(false);
                    }
                })
            props.onSubmit(datasOnsub);
           
        } else {
            console.log(dataSelect)
            props.onSubmit(dataSelect);
            setOpen(false);
        }


    }

    const selectionDisabledCustoms = (data) => {
        let check = props.dataCheck.find(x => x.packID === data.packID);
        if (check === undefined)
            return false
        else
            return true
    }


    //const search = props.search.map((x, xi) => {
    //    return (
    //        { /* <SearchInput
    //            key={xi}
    //            placeholder={x.placeholder}
    //            defaultValue={x.defaultValue ? x.defaultValue : null}
    //            // labelInput={"Pallet Code"}
    //            onHandleKeyUp={val => setKeySearch({ ...keySearch, [x.accessor]: val })}
    //            onClickSearch={() => setSearchAction(true)}
    //        />*/
    //        }
    //    );
    //});

    return (
        <AmAux>
            <AmButton
                className="float-right"
                styleType="add"
                style={{ width: "150px", margin: "0 0 0 20px" }}
                onClick={() => {
                    setOpen(true);
                }}
            >
                {props.textBtn}
            </AmButton>
            <Dialog
                onClose={() => setOpen(false)}
                aria-labelledby="customized-dialog-title"
                open={open}
                maxWidth="xl"
                maxHight='xl'
               
            >
                <DialogTitle
                    id="customized-dialog-title"
                    onClose={() => setOpen(false)}
                >
                    {props.textBtn}
                </DialogTitle>
                {//<StyledSearch>{search}</StyledSearch>
                }

                <DialogContent>
                    <AmTable
                        clearSelectionChangePage={false}
                        dataKey={props.primaryKeyTable}
                        columns={columns}
                        height={450}
                        filterable={true}
                        filterData={res => { onChangeFilterData(res) }}
                        pageSize={20}
                        totalSize={totalSize}
                        pagination={true}
                        onPageSizeChange={(pg) => { setPageSize(pg) }}
                        onPageChange={p => {
                            if (page !== p)
                                setPage(p)
                            else
                                setIniQuery(false)
                        }}
                        dataSource={dataSource}
                        rowNumber={true}
                        tableConfig={true}                                        
                        sortable
                        sortData={sort => setSort({ field: sort.id, order: sort.sortDirection })}
                        selectionDisabledCustom={(e) => { return selectionDisabledCustoms(e) }}
                        selectionDefault={props.dataCheck}
                        selection="checkbox"
                        selectionData={(data) => setDataSelect(data)}
                    />

                    {/* <AmTable
            primaryKey={props.primaryKeyTable}
            defaultSelection={defaultSelect}
            data={data}
            columns={props.columns}
            pageSize={props.queryApi.l || 20}
            sort={sort =>
              setSort({ field: sort.id, order: sort.sortDirection })
            }
            style={{ maxHeight: "390px" }}
            //397px ^
            currentPage={page}
            selection={true}
            selectionType="checkbox"
            getSelection={data => setDataSelect(data)}
          // renderCustomButtonBTMRight={
          //     <div style={{ paddingTop: "10px" }}>
          //         <AmButton style={{ margin: "5px" }} styleType="add" onClick={() => { props.onSubmit(dataSelect); setOpen(false); }}>OK</AmButton>
          //     </div>
          // }
          /> */}
                </DialogContent>
                <DialogActions>
                    {/*<Pagination
                        //จำนวนข้อมูลทั้งหมด
                        totalSize={totalSize}
                        //จำนวนข้อมูลต่อหน้า
                        pageSize={props.queryApi.l || 20}
                        //return หน้าที่ถูกกด : function
                        onPageChange={page => setPage(page)}
                    />*/ }
                    <AmButton
                        styleType="add"
                        onClick={() => {
                            onSubmit()
                        }}
                    >Add</AmButton>
                </DialogActions>
            </Dialog>
        </AmAux>
    );
};

BtnAddList.propTypes = {
    onSubmit: PropTypes.func.isRequired
};

export default BtnAddList;