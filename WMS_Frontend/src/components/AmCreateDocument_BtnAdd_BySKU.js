import CloseIcon from "@material-ui/icons/Close";
import Dialog from "@material-ui/core/Dialog";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import MuiDialogActions from "@material-ui/core/DialogActions";
import MuiDialogContent from "@material-ui/core/DialogContent";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import PropTypes from "prop-types";
import React, { useState, useEffect, useRef } from "react";
import SearchIcon from "@material-ui/icons/Search";
import styled from "styled-components";
import Typography from "@material-ui/core/Typography";
import { useTranslation } from "react-i18next";
import { withStyles } from "@material-ui/core/styles";

import AmAux from "./AmAux";
import AmButton from "./AmButton";
import AmInput from "./AmInput";
import AmTable from "./table/AmTable";
import { apicall, createQueryString, Clone } from "./function/CoreFunction2";
import Pagination from "./table/AmPagination";

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
        type="search"
        placeholder="Search..."
        styleType={styleType}
        inputRef={keywordRef}
        onKeyUp={onKeyUp}
        {...other}
        InputProps={{
          inputProps: {
            className: classes.input
          },
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                className={classes.iconButton}
                size="small"
                aria-label="Search"
                onClick={onHandleClick}
              >
                <SearchIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          )
        }}
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
const BtnAddSkuByItem = props => {
  const [open, setOpen] = useState(false);
  const conditionDefault = '[{ "f": "EventStatus", "c":"=", "v": "12"}]';
  const [query, setQuery] = useState({
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: "PalletSto",
    q: conditionDefault, //เงื่อนไข '[{ "f": "Status", "c":"<", "v": 2}]'
    f:
      "ID,palletcode,Code,Batch,Name,Quantity,UnitCode,BaseUnitCode,LocationCode,LocationName,SKUItems,srmLine",
    g: "",
    s: "[{'f':'ID','od':'ASC'}]",
    sk: 0,
    l: 20,
    all: ""
  });
  const [data, setData] = useState([]);
  const [sort, setSort] = useState();
  const [dataSelect, setDataSelect] = useState([]);
  const [page, setPage] = useState();
  const [keySearch, setKeySearch] = useState({});
  const [searchAction, setSearchAction] = useState(false);
  const [defaultSelect, setDefaultSelect] = useState();
  const [totalSize, setTotalSize] = useState(0);

  const columns = [
    {
      Header: "Pallet Code",
      accessor: "palletcode",
      width: 110,
      Cell: e => <div style={{ textAlign: "center" }}>{e.value}</div>
    },
    {
      Header: "SRM Line",
      accessor: "srmLine",
      width: 95,
      Cell: e => <div style={{ textAlign: "center" }}>{e.value}</div>
    },
    { Header: "SKU Items", accessor: "SKUItems" },
    // { Header: "SKU Code", accessor: 'Code', width: 110 },
    // { Header: "SKU Name", accessor: 'Name', width: 170 },
    {
      Header: "Location",
      accessor: "LocationCode",
      width: 90,
      Cell: e => <div style={{ textAlign: "center" }}>{e.value}</div>
    },
    {
      Header: "Batch",
      accessor: "Batch",
      width: 100,
      Cell: e => <div style={{ textAlign: "center" }}>{e.value}</div>
    },
    // { Header: 'Batch', accessor: 'Batch' },

    { Header: "Quantity", accessor: "Quantity", width: 90 },
    { Header: "Unit", accessor: "UnitCode", width: 70 }
  ];

  useEffect(() => {
    if (open) {
      Axios.get(createQueryString(query)).then(res => {
        setData([...res.data.datas]);
        setTotalSize(res.data.counts);
        let data = props.dataCheck || [];
        setDefaultSelect([...data]);
      });
    }
  }, [query, open]);

  useEffect(() => {
    if (typeof page === "number") {
      // const queryEdit = JSON.parse(JSON.stringify(query));
      query.sk = page === 0 ? 0 : page * parseInt(query.l, 10);

      setQuery({ ...query });
    }
  }, [page]);

  useEffect(() => {
    if (sort) {
      // const queryEdit = JSON.parse(JSON.stringify(query));
      query.s = '[{"f":"' + sort.field + '", "od":"' + sort.order + '"}]';
      setQuery({ ...query });
    }
  }, [sort]);

  useEffect(() => {
    if (searchAction) {
      let newSel = [];
      // if (conditionDefault) {
      newSel = JSON.parse(conditionDefault);
      // }
      Object.keys(keySearch).map((x, idx) => {
        if (keySearch[x]) {
          if (idx === 0) {
            newSel.push({
              o: "and",
              f: x,
              c: "like",
              v: encodeURIComponent(keySearch[x])
            });
          } else {
            newSel.push({
              o: "and",
              f: x,
              c: "like",
              v: encodeURIComponent(keySearch[x])
            });
          }
        }
      });

      query.q = JSON.stringify(newSel);
      setQuery({ ...query });
      setSearchAction(false);
    }
  }, [searchAction]);

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
        {props.text}
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
          {props.text}
        </DialogTitle>
        <StyledSearch>
          <SearchInput
            defaultValue={keySearch ? keySearch.palletcode : null}
            labelInput={"Pallet Code"}
            onHandleKeyUp={val =>
              setKeySearch({ ...keySearch, palletcode: val })
            }
            onClickSearch={() => setSearchAction(true)}
          />
          <SearchInput
            defaultValue={keySearch ? keySearch.Code : null}
            labelInput={"SKU Code"}
            onHandleKeyUp={val => setKeySearch({ ...keySearch, Code: val })}
            onClickSearch={() => setSearchAction(true)}
          />
          <SearchInput
            defaultValue={keySearch ? keySearch.LocationCode : null}
            labelInput={"Location"}
            onHandleKeyUp={val =>
              setKeySearch({ ...keySearch, LocationCode: val })
            }
            onClickSearch={() => setSearchAction(true)}
          />
        </StyledSearch>

        <DialogContent>
          <AmTable
            primaryKey="ID"
            defaultSelection={defaultSelect}
            data={data}
            columns={columns}
            pageSize={20}
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
          />
        </DialogContent>
        <DialogActions>
          <Pagination
            //จำนวนข้อมูลทั้งหมด
            totalSize={totalSize}
            //จำนวนข้อมูลต่อหน้า
            pageSize={20}
            //return หน้าที่ถูกกด : function
            onPageChange={page => setPage(page)}
          />
          <AmButton
            styleType="add"
            onClick={() => {
              props.onSubmit(dataSelect);
              setOpen(false);
            }}
          >
            OK
          </AmButton>
        </DialogActions>
      </Dialog>
    </AmAux>
  );
};

BtnAddSkuByItem.propTypes = {
  onSubmit: PropTypes.func.isRequired
};

export default BtnAddSkuByItem;
