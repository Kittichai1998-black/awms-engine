import _ from "lodash";
import queryString from "query-string";
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import {
  apicall,
  createQueryString
} from "../../../components/function/CoreFunction";
import AmTable from "../../../components/AmTable/AmTable";
import { DataGenerateMulti } from "../AmStorageObjectV2/SetMulti";
import { QueryGenerate } from '../../../components/function/UtilFunction';
import AmDropdown from '../../../components/AmDropdown';
import AmDatePicker from '../../../components/AmDate';
import AmButton from "../../../components/AmButton";
import AmEditorTable from "../../../components/table/AmEditorTable";
import AmInput from "../../../components/AmInput";
import AmDialogs from "../../../components/AmDialogs";
const Axios = new apicall();

const LabelH = styled.label`
  font-weight: bold;
  width: 200px;
`;

const InputDiv = styled.div``;
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

const AmStorageObjectMulti = props => {
  const { t } = useTranslation();


  const [dataSource, setDataSource] = useState([])
  const [count, setCount] = useState(0)
  const [queryViewData, setQueryViewData] = useState();
  const [page, setPage] = useState(1);
  const [iniQuery, setIniQuery] = useState(true);
  const [selection, setSelection] = useState();
  const [dialog, setDialog] = useState(false);
  const [remark, setRemark] = useState("");
  const [dialogState, setDialogState] = useState({});

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (typeof (page) === "number" && !iniQuery) {
      const queryEdit = JSON.parse(JSON.stringify(queryViewData));
      queryEdit.sk = page === 0 ? 0 : (page - 1) * parseInt(queryEdit.l, 10);
      getData(queryEdit)
    }
  }, [page])

  function getData(data) {
    const Query = {
      queryString: window.apipath + "/v2/SelectDataViwAPI/",
      t: "r_StorageObject",
      q: '[{ "f": "Status", "c":"!=", "v": 0}]',
      f: "*",
      g: "",
      s: "[{'f':'Pallet','od':'asc'}]",
      sk: 0,
      l: 100,
      all: ""
    };
    setQueryViewData(Query)
    var queryStr = createQueryString(data != undefined ? data : Query)
    Axios.get(queryStr).then(res => {

      var respone = DataGenerateMulti(res.data.datas)
      setDataSource(respone)
      setCount(res.data.counts)
    });
  }
  const onChangeFilterData = (filterValue) => {
    var res = queryViewData;
    filterValue.forEach(fdata => {
      res = QueryGenerate({ ...queryViewData }, fdata.field, fdata.value)
    });
    getData(res)

  }

  const useColumns = (cols) => {
    const [columns, setColumns] = useState(cols);

    useEffect(() => {
      const iniCols = [...cols];

      iniCols.forEach(col => {
        let filterConfig = col.filterConfig;
        if (filterConfig !== undefined) {
          if (filterConfig.filterType === "dropdown") {
            col.Filter = (field, onChangeFilter) => {
              var checkType = Array.isArray(filterConfig.dataDropDown);
              if (checkType) {
                return <AmDropdown
                  id={field}
                  placeholder={col.placeholder}
                  fieldDataKey={filterConfig.fieldDataKey === undefined ? "label" : filterConfig.fieldDataKey}
                  fieldLabel={filterConfig.fieldLabel === undefined ? ["label"] : filterConfig.fieldLabel}
                  labelPattern=" : "
                  width={filterConfig.width !== undefined ? filterConfig.width : 150}
                  ddlMinWidth={200}
                  zIndex={1000}
                  data={filterConfig.dataDropDown}
                  onChange={(value, dataObject, inputID, fieldDataKey) => onChangeFilter(field, value)}
                />
              }
              else {
                return <AmDropdown
                  id={field}
                  placeholder={col.placeholder}
                  fieldDataKey={filterConfig.fieldDataKey === undefined ? "label" : filterConfig.fieldDataKey}
                  fieldLabel={filterConfig.fieldLabel === undefined ? ["label"] : filterConfig.fieldLabel}
                  labelPattern=" : "
                  width={200}
                  ddlMinWidth={200}
                  zIndex={1000}
                  queryApi={filterConfig.dataDropDown}
                  onChange={(value, dataObject, inputID, fieldDataKey) => onChangeFilter(field, value)}
                  ddlType={filterConfig.typeDropDown}
                />
              }

            }
          } else if (filterConfig.filterType === "datetime") {
            col.width = 350;
            col.Filter = (field, onChangeFilter) => {
              return <FormInline>
                <AmDatePicker style={{ display: "inline-block" }} onBlur={(e) => { if (e !== undefined && e !== null) onChangeFilter(field, e.fieldDataObject, { dataType: "dateTime", dateField: "dateFrom" }) }} TypeDate={"date"} fieldID="dateFrom" />
                <label>-</label>
                <AmDatePicker style={{ display: "inline-block" }} onBlur={(e) => { if (e !== undefined && e !== null) onChangeFilter(field, e.fieldDataObject, { dataType: "dateTime", dateField: "dateTo" }) }} TypeDate={"date"} fieldID="dateTo" />
              </FormInline>
            }
          }
        }
      })
      setColumns(iniCols);
    }, [])

    return { columns };
  }
  const { columns } = useColumns(props.iniCols);

  const onHandleEditConfirm = (status) => {

    //var x = onChangeEditor()
    //console.log(remark)
    if (status) {
      onUpdateHold()
    }

    setDialog(false);
    setSelection([]);
  };


  const DataGenerateRemark = () => {
    const columns = [
      {
        field: "Option",
        type: "input",
        name: "Remark",
        placeholder: "Remark",
        required: true
      }
    ];
    return columns.map(y => {
      return {
        field: y.field,
        component: (data = null, cols, key) => {
          return (
            <div key={key}>
              <FormInline>
                {" "}
                <LabelH>{"Remark"} : </LabelH>
                <InputDiv>
                  <AmInput
                    id={cols.field}
                    style={{ width: "270px", margin: "0px" }}
                    //placeholder={placeholder}
                    type="input"
                    //value={data ? data[cols.field]:""}
                    onChange={val => {
                      onChangeEditor(val);
                    }}
                  />
                </InputDiv>
              </FormInline>

            </div>
          );
        }
      };
    });
  };
  const onChangeEditor = (value) => {
    setRemark(value)
    console.log(selection)
    if (selection.length === 0) {
      //setOpenWarning(true);
    } else {
      //let cloneData = selection;
      setRemark(value);
      //setDataSentToAPI(cloneData);
    }
  };
  const onUpdateHold = () => {
    console.log(remark)
    let bstosID = [];

    if (selection.length > 0) {
      selection.forEach(rowdata => {
        bstosID.push(rowdata.ID);
      });
      let postdata = {
        bstosID: bstosID,
        IsHold: 1,
        remark: remark

      };

      Axios.post(window.apipath + "/v2/HoldStorageObjectAPI", postdata).then(
        res => {
          if (res.data._result !== undefined) {
            if (res.data._result.status === 1) {
              setDialogState({ type: "success", content: "Success", state: true })
              getData();
              Clear();
            } else {
              setDialogState({ type: "error", content: res.data._result.message, state: true })
              getData();
              Clear();
            }
          }
        }
      );
    }

  }
  const Clear = () => {
    setSelection([]);
    setRemark("");
  };
  //===========================================================
  return (
    <div>
      <AmDialogs
        typePopup={dialogState.type}
        onAccept={(e) => { setDialogState({ ...dialogState, state: false }) }}
        open={dialogState.state}
        content={dialogState.content} />
      <AmEditorTable
        open={dialog}
        onAccept={(status, rowdata) => onHandleEditConfirm(status)}
        titleText={"Remark"}
        data={"text"}
        //columns={randerRemark()}
        columns={DataGenerateRemark()}
      />
      <AmTable
        columns={columns}
        dataKey={"ID"}
        dataSource={dataSource}
        rowNumber={true}
        totalSize={count}
        pageSize={100}
        filterable={true}
        filterData={res => { onChangeFilterData(res) }}
        pagination={true}
        selection={"checkbox"}
        selectionData={(data) => {
          console.log(data)
          setSelection(data);
        }}
        onPageChange={p => {
          if (page !== p)
            setPage(p)
          else
            setIniQuery(false)
        }}
        customTopLeftControl={<AmButton
          style={{ marginRight: "5px" }}
          styleType="confirm"
          onClick={() => {
            setDialog(true)
            //onUpdateHold()
          }}
        >
          HOLD
        </AmButton>}
      />

    </div>
  );
};
export default AmStorageObjectMulti;
