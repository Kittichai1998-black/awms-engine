import React, { useState, useEffect, useRef } from "react";
import { withStyles } from "@material-ui/core/styles";
import { apicall, createQueryString } from '../../components/function/CoreFunction'
import AmDialogs from "../../components/AmDialogs";
import AmButton from "../../components/AmButton";
import AmInput from "../../components/AmInput";
import AmEditorTable from "../../components/table/AmEditorTable";
import {
  indigo,
  deepPurple,
  lightBlue,
  red,
  grey,
  green
} from "@material-ui/core/colors";
import moment from "moment";
import AmTable from "../../components/AmTable/AmTable";
import EditIcon from "@material-ui/icons/MoveToInbox";
import IconButton from "@material-ui/core/IconButton";
import Grid from '@material-ui/core/Grid';
const Axios = new apicall();

const styles = theme => ({
  root: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"'
    ].join(",")
  },
  paperContainer: {
    maxWidth: "450px",
    width: "100%",
    minWidth: "300px",
    padding: theme.spacing(2, 1)
  },
  stepperContainer: {
    padding: "10px"
  },
  buttonAuto: {
    margin: theme.spacing(),
    width: "auto",
    lineHeight: 1
  },
  button: {
    marginTop: theme.spacing(),
    marginRight: theme.spacing()
  },


});


// const useQueryData = (queryObj) => {
//   console.log(queryObj)
//   const [dataSource, setDataSource] = useState([])

//   useEffect(() => {
//     if (typeof queryObj === "object") {
//       var queryStr = createQueryString(queryObj)
//       Axios.get(queryStr).then(res => {
//         console.log(res)
//         setDataSource(res.data.datas)
//       });
//     }
//   }, [queryObj])
//   return dataSource;
// }

const AmMoveLocation = props => {
  const iniCols = [
    {
      Header: "Code",
      accessor: "Code",
      fixed: "left"

    }]
  const Query = {
    queryString: window.apipath + "/v2/SelectDataViwAPI/",
    t: "WorkQueueSto",
    q: "[{ 'f': 'EventStatus', 'c':'!=', 'v': 0}]",
    f: "*",
    g: "",
    s: "[{'f':'Pallet','od':'asc'}]",
    sk: 0,
    l: 100,
    all: ""
  };
  const [query, setQuery] = useState(Query);
  useEffect(() => {
    getData(query);
  }, []);

  async function getData(qryString) {
    var queryStr = createQueryString(qryString)
    Axios.get(queryStr).then(res => {
      console.log(res)
      setDataSource(res.data.datas)
    });

  }
  const useColumns = (cols) => {
    const [columns, setColumns] = useState(cols);
    const [editData, setEditData] = useState();
    const [removeData, setRemoveData] = useState();

    useEffect(() => {
      const iniCols = [...cols];
      iniCols.push({
        Header: "",
        fixWidth: 63,
        colStyle: { zIndex: -1 },
        filterable: false,
        Cell: (e) => <IconButton
          size="small"
          aria-label="info"
          style={{ marginLeft: "3px" }}
        >
          <EditIcon
            fontSize="small"
            style={{ color: "#f39c12" }}
            onClick={() => { setDialog(true) }}
          />
        </IconButton>
      })
      setColumns(iniCols);
    }, [])

    return { columns, editData, removeData };
  }
  const { columns, editData, removeData } = useColumns(props.columns);
  const [dataSource, setDataSource] = useState([])
  const [dialog, setDialog] = useState(false);
  //const [columns, setColumns] = useState(FuncgetButton());

  const RanderEle = () => {
    if (props.dataAdd) {
      const x = props.dataAdd;
      return x.map(y => {
        return {
          component: (data = null, cols, key) => {

            return (
              <div key={key}>
                {RanderElePopMove()}
              </div>
            );
          }
        };
      });
    }
  };

  const RanderElePopMove = () => {
    return (

      <div>

        <Grid item xs={6}>
          ghhfhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh
        </Grid>
        <Grid item xs={6}>
          grrh
        </Grid>
      </div>



      // <AmInput
      //   id={"x"}
      //   required={true}
      //   validate={true}
      //   // msgError="Error"
      //   style={{ width: "270px", margin: "0px" }}
      // />
    )
  }

  return (
    <div>
      <AmEditorTable
        open={dialog}
        //onAccept={(status, rowdata, inputError) => onHandleEditConfirm(status, rowdata, inputError, "add")}
        titleText={"Add"}
        //data={editData}
        columns={RanderEle()}
      //objColumnsAndFieldCheck={{ objColumn: props.dataAdd, fieldCheck: "field" }}
      />
      <AmTable
        columns={columns}
        dataKey={"Code"}
        dataSource={dataSource}
        filterable={false}
        //filterData={res => { onChangeFilterData(res) }}
        rowNumber={true}
        pageSize={20}
        height={props.height}
      // pagination={false}
      //onPageChange={setPage}
      />
    </div>
  );
};


export default withStyles(styles)(AmMoveLocation);
