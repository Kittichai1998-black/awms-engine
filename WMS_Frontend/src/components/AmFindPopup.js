import React, { useState, useEffect, useRef } from "react";
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Pagination from './table/AmPagination';
import Table from './table/AmTable';
import AmButton from "./AmButton";
import AmInput from "./AmInput";
import { withStyles } from '@material-ui/core/styles';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import SearchIcon from '@material-ui/icons/Search';
import InputBase from '@material-ui/core/InputBase';
import styled from 'styled-components'
import InputAdornment from '@material-ui/core/InputAdornment';
import { grey, red } from '@material-ui/core/colors';
import { apicall, createQueryString, Clone } from './function/CoreFunction2'
import { useTranslation } from 'react-i18next'
const Axios = new apicall()
const SearchInput = withStyles(theme => ({
    root: {
        padding: '2px 0px',
        display: 'flex',
        alignItems: 'center',
        width: 'auto',
    },
    input: {
        marginLeft: 0, //8
        flex: 1,
    },
    iconButton: {
        padding: 4,
    },
    divider: {
        width: 1,
        height: 28,
        margin: 4,
    },
}))(props => {
    const { classes, styleType, onClickSearch, onKeypress, ...other } = props;
    const keywordRef = useRef(null);
    const onHandleClick = () => {
        onClickSearch(keywordRef.current.value);
    }
    const onHandleKeypress = (value, obj, ele, event) => {
        if (event.key === 'Enter') {
            onClickSearch(keywordRef.current.value);
        }
    }
    return (
        // <Paper className={classes.root} elevation={1} style={{ width: inputWidth }}>
        //     <InputBase name="input_search" className={classes.input} placeholder="Search..." inputRef={keywordRef} onChange={onChangeInput} onKeyPress={onHandleKeypress} {...other} />
        //     <IconButton className={classes.iconButton} size="small" aria-label="Search" onClick={onHandleClick}>
        //         <SearchIcon fontSize="small" />
        //     </IconButton>
        // </Paper>
        <div className={classes.root}>
            <AmInput type="search" placeholder="Search..." styleType={styleType} inputRef={keywordRef} onKeyPress={onHandleKeypress} {...other}
                InputProps={{
                    inputProps: {
                        className: classes.input,
                    },
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton className={classes.iconButton} size="small" aria-label="Search" onClick={onHandleClick}>
                                <SearchIcon fontSize="small" />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />
        </div>
    );
});

const SearchText = withStyles(theme => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        width: 'auto',
    },
    input: {
        marginLeft: 0, //8
        flex: 1,
        '&:hover': {
            cursor: 'pointer'
        },
    },
    iconButton: {
        padding: 4,
    },
    iconCloseButton: {
        // display: 'none',
        padding: 0,
        color: grey[400],
        fontSize: 16,
        '&:hover': {
            color: grey[800],
            cursor: 'pointer'
        },
    },
    divider: {
        width: 1,
        height: 28,
        margin: 4,
    },
}))(props => {
    const { id, classes, styleType, required, value, onClickOpen, onClickClear, inputWidth, ...other } = props;
    const onHandleClick = (e) => {
        var idicon = "closeicon" + id;
        if (e.target.id !== idicon) {
            onClickOpen()
        } else {
            onClickClear()
        }
    }

    return (
        <div className={classes.root} >
            <AmInput id={id} inputRef={props.popupref} required={required} readOnly={true} styleType={styleType} autoComplete="off" value={value}
                onFocus={value ? null : (val, obj, element, event) => element.blur()}
                // onFocus={onClickOpen}
                onClick={(val, obj, element, event) => onHandleClick(event)}
                // (val, obj, element, event)=> event.cancelBubble = true
                style={{ width: inputWidth }}
                InputProps={{
                    inputProps: {
                        className: classes.input,
                    },
                    endAdornment: (
                        <InputAdornment position="end">
                            {value ?
                                <CloseIcon id={"closeicon" + id} className={classes.iconCloseButton}

                                    size="small" aria-label="Close" onClick={onHandleClick} />
                                : null}
                            <IconButton className={classes.iconButton} size="small" aria-label="Search" onClick={onClickOpen}>
                                <SearchIcon fontSize="small" />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
                {...other}
            />
        </div>
    );
});

const DialogTitle = withStyles(theme => ({
    root: {
        borderBottom: `1px solid ${theme.palette.divider}`,
        margin: 0,
        padding: theme.spacing(1),
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
        color: theme.palette.grey[500],
        padding: '3px'
    },
}))(props => {
    const { children, classes, onClose } = props;
    return (
        <MuiDialogTitle disableTypography className={classes.root}>
            <Typography variant="h6">{children}</Typography>
            {onClose ? (
                <IconButton aria-label="Close" size="small" className={classes.closeButton} onClick={onClose}>
                    <CloseIcon fontSize="inherit" />
                </IconButton>
            ) : null}
        </MuiDialogTitle>
    );
});

const DialogContent = withStyles(theme => ({
    root: {
        margin: 0,
        padding: '0 5px 0 5px',
        overflowY: 'auto'
    },
}))(MuiDialogContent);

const DialogActions = withStyles(theme => ({
    root: {
        borderTop: `1px solid ${theme.palette.divider}`,
        margin: 0,
    },
}))(MuiDialogActions);

const StyledSearch = styled.div`
  position: relative;
  top: 0;
  margin: 10px;
`
const FindPopup = (props) => {
    const { t } = useTranslation()
    const {
        id,
        value,
        disabled,
        styleType,
        required,
        labelTitle,
        fieldLabel,
        labelPattern,
        queryApi,
        fieldDataKey,
        defaultValue,
        columns,
        width,
        placeholder,
        onChange,
        popupref
    } = props;

    const [open, setOpen] = useState(false);
    // const [keywordMain, setKeywordMain] = useState(null);
    const [keywordSub, setKeywordSub] = useState(null);
    //Query Select from Main Page
    const [query, setQuery] = useState(null);
    const [data, setData] = useState([]);
    const [valueKey, setValueKey] = useState("");
    const [defaultVal, setDefaultVal] = useState(null);
    const [dataObjects, setDataObjects] = useState(null);

    //table
    const [totalSize, setTotalSize] = useState(0);
    const [page, setPage] = useState();
    const [sort, setSort] = useState(0);

    useEffect(() => {
        if (defaultValue) {
            setDefaultVal(defaultValue);
            setValueKey(defaultValue)
        }
    }, [defaultValue]);
    useEffect(() => {
        if (value) {
            if (dataObjects) {
                getValueKey(dataObjects)
            } else {
                getDefaultByQuery(value);
            }
        } else if (defaultVal) {
            getDefaultByQuery(defaultVal);
        }

    }, [value, defaultVal]);

    useEffect(() => {
        if (typeof (page) === "number") {
            const queryEdit = JSON.parse(JSON.stringify(query));
            queryEdit.sk = page === 0 ? 0 : page * parseInt(queryEdit.l, 10);
            setQuery(queryEdit)
            getData(createQueryString(queryEdit));
        }
    }, [page])
    //อัพเดทข้อมูลเมื่อมีคำสั่ง sort เข้ามา
    useEffect(() => {
        if (sort) {
            if (sort !== 0) {
                const queryEdit = query;
                queryEdit.s = '[{"f":"' + sort.field + '", "od":"' + sort.order + '"}]';
                setQuery(queryEdit)
                getData(createQueryString(queryEdit));
            }
        }
    }, [sort])

    useEffect(() => {
        if (open) {
            setSort(0);
            if (queryApi) {
                queryApi.l = 10;
                // queryApi.q = '[{ "f": "Status", "c":"<", "v": 2}]';
            }
            if (query === null) {
                if (keywordSub !== null) {
                    if (keywordSub === "") {
                        setQuery(queryApi)
                        getData(createQueryString(queryApi));
                    } else {
                        modifySelect();
                    }
                } else {
                    setQuery(queryApi)
                    getData(createQueryString(queryApi));
                }

            } else {
                if (keywordSub !== null) {
                    if (keywordSub === "") {
                        setQuery(queryApi)
                        getData(createQueryString(queryApi));
                    } else {
                        modifySelect();
                    }
                }
            }
        }
        return () => {
            setKeywordSub(null)
        };
    }, [open, keywordSub]);

    const getDefaultByQuery = (val) => {
        if (queryApi) {
            let newQueryStr = Clone(queryApi);
            let sel = [];
            if (newQueryStr.q) {
                sel = JSON.parse(newQueryStr.q)
            }
            sel.push({ "f": fieldDataKey, "c": "=", "v": val })
            newQueryStr.q = JSON.stringify(sel);
            getDataDefault(createQueryString(newQueryStr));
        }
    }
    async function getDataDefault(qryString) {
        const res = await Axios.get(qryString).then(res => res)
        if (res.data.datas) {
            getValueKey(res.data.datas[0])
        }
    }
    function getValueKey(showValueData) {
        let str = "";
        if (!isEmpty(showValueData)) {
            if (fieldLabel) {
                if (labelPattern) {
                    fieldLabel.forEach((value, index) => {
                        if (index === fieldLabel.length - 1) {
                            str = str.concat(showValueData[value])
                        } else {
                            str = str.concat(showValueData[value], labelPattern)
                        }
                    })

                } else {
                    fieldLabel.forEach((value) => {
                        str = str.concat(showValueData[value])
                    })
                }

            } else {
                str = showValueData[fieldDataKey];
            }
        }
        setValueKey(str)
    }
    function isEmpty(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }


    async function getData(qryString) {
        const res = await Axios.get(qryString).then(res => res)
        if (res.data.datas) {
            setData(res.data.datas)
            setTotalSize(res.data.counts)
        } else {
            setData([])
            setTotalSize(0)
        }
    }
    const modifySelect = () => {
        let queryStrEdit = Clone(queryApi);
        let newSel = [];
        if (queryStrEdit.q) {
            newSel = JSON.parse(queryStrEdit.q)
        }

        columns.map((item, index) => {
            if (item.accessor !== "") {
                if (index === 0) {
                    newSel.push({
                        "o": "and", "f": item.accessor,
                        "c": "like", "v": encodeURIComponent(keywordSub)
                    })
                } else {
                    newSel.push({
                        "o": "or", "f": item.accessor,
                        "c": "like", "v": encodeURIComponent(keywordSub)
                    })
                }
            }
        })
        queryStrEdit.q = JSON.stringify(newSel);
        setQuery(queryStrEdit)
        getData(createQueryString(queryStrEdit));
    }


    const onHandleClick = (e) => {
        setKeywordSub(e)
    }
    const onHandleClickChange = (dataObject) => {
        setOpen(false);
        setKeywordSub(null);
        setDefaultVal(null);
        setQuery(null);
        //ค่าที่ส่งกลับไป id,datakey,fieldDataKey,dataObject
        // let value = dataObject[fieldDataKey];
        getValueKey(dataObject)

        setDataObjects(dataObject)

        onChange(dataObject[fieldDataKey], dataObject, id, fieldDataKey);

    }
    const onHandleClickOpen = () => {
        setOpen(true);
    }
    const onHandleClickClose = (e) => {
        setOpen(false);
        setKeywordSub(null);
        setQuery(null);
    }
    const onHandleClickClear = () => {
        setValueKey("");
        setDataObjects(null);
        setDefaultVal(null);
        onChange(null, null, id, fieldDataKey)
    }
    const calWidth = (columsList) => {
        let tableWidth = 0;
        columsList.forEach((row) => tableWidth = tableWidth + row.width);
        return tableWidth
    }
    return (
        <div>
            <SearchText id={id} popupref={popupref} placeholder={placeholder} styleType={styleType} required={required} value={valueKey} disabled={disabled}
                onClickOpen={onHandleClickOpen} inputWidth={width} onClickClear={onHandleClickClear} />
            <Dialog
                onClose={onHandleClickClose}
                aria-labelledby="customized-dialog-title"
                open={open}
                maxWidth="xl"
            >
                <DialogTitle id="customized-dialog-title" onClose={onHandleClickClose}>
                    {t(labelTitle)}
                </DialogTitle>
                <StyledSearch>
                    <SearchInput name="searchSub" styleType={styleType} onClickSearch={onHandleClick} />
                </StyledSearch>
                <DialogContent>
                    <Table
                        //ข้อมูลตาราง
                        data={data}
                        //ข้อมูลหัวตาราง
                        columns={columns}
                        //จำนวนข้อมูลต่อหน้า
                        pageSize={10}
                        //func sort argument = Obj
                        sort={(sort) => setSort({ field: sort.id, order: sort.sortDirection })}
                        onRowClick={onHandleClickChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Pagination
                        //จำนวนข้อมูลทั้งหมด
                        totalSize={totalSize}
                        //จำนวนข้อมูลต่อหน้า
                        pageSize={10}
                        //return หน้าที่ถูกกด : function
                        onPageChange={(page) => setPage(page)} />
                </DialogActions>
            </Dialog>
        </div>
    );

}

FindPopup.propTypes = {
    queryApi: PropTypes.object.isRequired,
    width: PropTypes.number,
    id: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    defaultValue: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    labelTitle: PropTypes.string,
    fieldDataKey: PropTypes.string,
    fieldLabel: PropTypes.array.isRequired,
    disabled: PropTypes.bool,
    onChange: PropTypes.func.isRequired
}
export default FindPopup;