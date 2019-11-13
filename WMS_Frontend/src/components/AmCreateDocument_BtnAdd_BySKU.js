import CloseIcon from '@material-ui/icons/Close';
import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';

// import InputAdornment from '@material-ui/core/InputAdornment';
import MuiDialogActions from '@material-ui/core/DialogActions';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import PropTypes from 'prop-types';
import React, { useState, useEffect, useRef } from "react";
// import SearchIcon from '@material-ui/icons/Search';
import styled from 'styled-components'
import Typography from '@material-ui/core/Typography';
// import { useTranslation } from 'react-i18next'
import { withStyles } from '@material-ui/core/styles';

import AmAux from './AmAux'
import AmButton from "./AmButton";
import AmInput from "./AmInput";
import AmTable from './table/AmTable';
import { apicall, createQueryString, Clone } from './function/CoreFunction2'
import Pagination from './table/AmPagination';

// import MaterialTable from './AmCreateDocument_TableNew'

const Axios = new apicall()

// const LabelH = styled.label`
// font-weight: bold;
//   width: 200px;
// `;
const DialogActions = withStyles(theme => ({
    root: {
        borderTop: `1px solid ${theme.palette.divider}`,
        margin: 0,
    },
}))(MuiDialogActions);

const SearchInput = withStyles(theme => ({
    root: {
        padding: '2px 10px 2px 0',
        display: 'inline',
        alignItems: 'center',
        width: 'auto',
    },
    input: {
        // paddingRight:100,
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
    const { classes, styleType, onClickSearch, onHandleKeyUp, ...other } = props;
    const keywordRef = useRef(null);
    const onHandleClick = (e) => {


        onClickSearch(keywordRef.current.value);
    }
    const onKeyUp = (value, obj, ele, event) => {
        if (event.key === 'Enter') {
            onClickSearch(keywordRef.current.value);
        }
        onHandleKeyUp(value)
    }
    return (
        <div className={classes.root}>
            <label style={{ padding: "5px 5px 0 0", fontWeight: "bold" }}>{props.labelInput}</label>
            <AmInput type="search" placeholder={props.placeholder ? props.placeholder : "Search..."} styleType={styleType} inputRef={keywordRef} onKeyUp={onKeyUp} {...other}
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
        overflowY: 'hidden'
    },
}))(MuiDialogContent);

const StyledSearch = styled.div`
  position: relative;
  top: 0;
  margin: 10px;
`
const BtnAddSkuByItem = (props) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState({ ...props.queryApi })
    const [data, setData] = useState([]);
    const [sort, setSort] = useState()
    const [dataSelect, setDataSelect] = useState([])
    const [page, setPage] = useState()
    const [keySearch, setKeySearch] = useState({});
    const [searchAction, setSearchAction] = useState(false)
    const [defaultSelect, setDefaultSelect] = useState();
    const [totalSize, setTotalSize] = useState(0);

    useEffect(() => {
        if (open) {
            const dataHeader = props.headerCreate.reduce((arr, el) => arr.concat(el), []).filter(x => x.search)
            if (dataHeader.length) {
                dataHeader.map(x => {
                    props.search.map(y => {
                        if (x.key === y.accessor) {
                            if (y.defaultValue) {
                                let queryQ = JSON.parse(query.q),
                                    ind = queryQ.findIndex(z => z.f === x.key)
                                if (ind !== -1)
                                    queryQ.splice(ind, 1)
                                queryQ.push({
                                    f: x.key,
                                    c: "like",
                                    v: y.defaultValue
                                })
                                query.q = JSON.stringify(queryQ)
                            } else {
                                let queryQ = JSON.parse(query.q),
                                    ind = queryQ.findIndex(z => z.f === x.key)

                                if (ind !== -1)
                                    queryQ.splice(ind, 1)
                                query.q = JSON.stringify(queryQ)
                            }
                        }
                    })
                })
            }
        }
    }, [open])

    useEffect(() => {
        if (open) {
            Axios.get(createQueryString(query)).then(res => {
                // console.log(res.data.datas);
                if (res.data.datas) {
                    setData([...res.data.datas])
                    setTotalSize(res.data.counts)
                    let data = props.dataCheck || []
                    setDefaultSelect([...data])
                }
            })
        }
    }, [query, open])

    useEffect(() => {
        if (typeof (page) === "number") {
            // const queryEdit = JSON.parse(JSON.stringify(query));
            query.sk = page === 0 ? 0 : page * parseInt(query.l, 10);

            setQuery({ ...query })
        }
    }, [page])

    useEffect(() => {
        if (sort) {

            // const queryEdit = JSON.parse(JSON.stringify(query));
            query.s = '[{"f":"' + sort.field + '", "od":"' + sort.order + '"}]';
            setQuery({ ...query })

        }
    }, [sort])

    useEffect(() => {
        if (searchAction) {
            let newSel = JSON.parse(props.queryApi.q)
            Object.keys(keySearch).map((x, idx) => {
                if (keySearch[x]) {
                    newSel.push({
                        "o": "and",
                        "f": x,
                        "c": "like",
                        "v": encodeURIComponent(keySearch[x])
                    })
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
            setQuery({ ...query })
            setSearchAction(false)
        }
    }, [searchAction])

    const search = props.search.map((x, xi) => {
        return (
            <SearchInput
                key={xi}
                placeholder={x.placeholder}
                defaultValue={x.defaultValue ? x.defaultValue : null}
                // labelInput={"Pallet Code"}
                onHandleKeyUp={(val) => setKeySearch({ ...keySearch, [x.accessor]: val })}
                onClickSearch={() => setSearchAction(true)}
            />
        )
    })

    return (
        <AmAux>
            <AmButton className="float-right" styleType="add" style={{ width: "150px", margin: "0 0 0 20px" }} onClick={() => {
                setOpen(true)
            }} >
                {props.textBtn}
            </AmButton>
            <Dialog
                onClose={() => setOpen(false)}
                aria-labelledby="customized-dialog-title"
                open={open}
                maxWidth="xl"
            >
                <DialogTitle
                    id="customized-dialog-title"
                    onClose={() => setOpen(false)}
                >
                    {props.textBtn}
                </DialogTitle>
                <StyledSearch>
                    {search}
                </StyledSearch>

                <DialogContent>
                    <AmTable
                        primaryKey="ID"
                        defaultSelection={defaultSelect}
                        data={data}
                        columns={props.columns}
                        pageSize={20}
                        sort={(sort) => setSort({ field: sort.id, order: sort.sortDirection })}
                        style={{ maxHeight: "390px" }}
                        //397px ^
                        currentPage={page}
                        selection={true}
                        selectionType="checkbox"
                        getSelection={(data) => setDataSelect(data)}
                    // renderCustomButtonBTMRight={
                    //     <div style={{ paddingTop: "10px" }}>
                    //         <AmButton style={{ margin: "5px" }} styleType="add" onClick={() => { props.onSubmit(dataSelect); setOpen(false); }}>OK</AmButton>
                    //     </div>
                    // }
                    />
                </DialogContent>
                <DialogActions>
                    <Pagination
                        //จำนวนข้อมูลทั้งหมด
                        totalSize={totalSize}
                        //จำนวนข้อมูลต่อหน้า
                        pageSize={20}
                        //return หน้าที่ถูกกด : function
                        onPageChange={(page) => setPage(page)}
                    />
                    <AmButton styleType="add" onClick={() => { props.onSubmit(dataSelect); setOpen(false); }}>OK</AmButton>
                </DialogActions>
            </Dialog>
        </AmAux>
    );
}

BtnAddSkuByItem.propTypes = {
    onSubmit: PropTypes.func.isRequired
}

export default BtnAddSkuByItem;