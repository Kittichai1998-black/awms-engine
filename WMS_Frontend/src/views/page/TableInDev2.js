import React, { useContext, useEffect, useState } from "react";
import AmTable from "../../components/AmTable/AmTable";
import Bottom from "@material-ui/core/Button";
import Button from "@material-ui/core/Button";

const columns = [
  {
    Header: () => <div>TEST ID</div>,
    accessor: 'ID',
    code: 'ID',
    //width:200,
    //fixed: 'left',
    style: {},
    //colStyle:{color:"black"},
    sortable: false,
    filterable: false,
    Filter: () => { return <div>XXX</div> },
    type: "number",
    Footer: (data, datafield, col) => { return <div>Total : {datafield[datafield.length - 1].value}</div> }
  },
  {
    Header: 'Name',
    accessor: 'Name',
    code: 'Name',
    //width:300,
    sortable: false,
    //colStyle:{marginLeft:"10px"},
    //style:{background:"blue"}
  },
  {
    Header: 'Name2',
    accessor: 'Name2',
    code: 'Name2',
    width: 200,
    filterable: true,
    Cell: (e) => { return <div>{e.value}</div> },
    Footer: (data, datafield, col) => { return <div>Total : {datafield[datafield.length - 1].value}</div> }
  },
  {
    Header: 'Quantity',
    accessor: 'Quantity',
    code: 'Quantity',
    width: 200,
    filterable: true,
    type: "number"
  },
  {
    Header: 'Quantity2',
    accessor: 'Quantity2',
    code: 'Quantity2',
    width: 200,
    filterable: true,
    sortable: true,
    Filter: (field, functionUpdate) => {
      //onChange(field, "xxx")
      return <input type="input" onKeyPress={(e) => { if (e.key === "Enter") functionUpdate(field, e.target.value) }}></input>
    },
    type: "number"
  },
  {
    Header: 'Name2',
    accessor: 'Name2',
    code: 'Name2',
    width: 200,
    filterable: true,
  },
  {
    Header: 'Name2',
    accessor: 'Name2',
    code: 'Name2',
    //width:200,
    filterable: true,
  }];

const TableDev = (props) => {

  const [ds, setDs] = useState([])

  useEffect(() => {
    const data = [{
      "ID": 1,
      "Name": "12",
      "Name2": "Name2",
      "Quantity": 10,
      "Quantity2": 20,
      "subComponent": {
        "subData": () => { },
        "subComponent": () => { }
      }
    }, {
      "ID": 2,
      "Name": "12",
      "Name2": "Name3",
      "Quantity": 10,
      "Quantity2": 20,
      "subComponent": {
        "subData": () => { },
        "subComponent": () => { }
      }
    }, {
      "ID": 3,
      "Name": "12",
      "Name2": "Name3",
      "Quantity": 10,
      "Quantity2": 20,
      "subComponent": {
        "subData": () => { },
        "subComponent": () => { }
      }
    }, {
      "ID": 4,
      "Name": "12",
      "Name2": "10",
      "Quantity": 10,
      "Quantity2": 20,
      "subComponent": {
        "subData": () => { },
        "subComponent": () => { }
      }
    }, {
      "ID": 5,
      "Name": "12",
      "Name2": "10",
      "Quantity": 10,
      "Quantity2": 20,
      "subComponent": {
        "subData": () => { },
        "subComponent": () => { }
      }
    }, {
      "ID": 6,
      "Name": "12",
      "Name2": "10",
      "Quantity": 10,
      "Quantity2": 20,
      "subComponent": {
        "subData": () => { },
        "subComponent": () => { }
      }
    }, {
      "ID": 7,
      "Name": "12",
      "Name2": "10",
      "Quantity": 10,
      "Quantity2": 20,
      "subComponent": {
        "subData": () => { },
        "subComponent": () => { }
      }
    }, {
      "ID": 8,
      "Name": "12",
      "Name2": "10",
      "Quantity": 10,
      "Quantity2": 20,
      "subComponent": {
        "subData": () => { },
        "subComponent": () => { }
      }
    }, {
      "ID": 9,
      "Name": "12",
      "Name2": "10",
      "Quantity": 10,
      "Quantity2": 20,
      "subComponent": {
        "subData": () => { },
        "subComponent": () => { }
      }
    }, {
      "ID": 10,
      "Name": "12",
      "Name2": "10",
      "Quantity": 10,
      "Quantity2": 20,
      "subComponent": {
        "subData": () => { },
        "subComponent": () => { }
      }
    }, {
      "ID": 11,
      "Name": "12",
      "Name2": "10",
      "Quantity": 10,
      "Quantity2": 20,
      "subComponent": {
        "subData": () => { },
        "subComponent": () => { }
      }
    }, {
      "ID": 12,
      "Name": "12",
      "Name2": "10",
      "Quantity": 10,
      "Quantity2": 20,
      "subComponent": {
        "subData": () => { },
        "subComponent": () => { }
      }
    }, {
      "ID": 13,
      "Name": "12",
      "Name2": "10",
      "Quantity": 10,
      "Quantity2": 20,
      "subComponent": {
        "subData": () => { },
        "subComponent": () => { }
      }
    }, {
      "ID": 14,
      "Name": "12",
      "Name2": "10",
      "Quantity": 10,
      "Quantity2": 20,
      "subComponent": {
        "subData": () => { },
        "subComponent": () => { }
      }
    }, {
      "ID": 15,
      "Name": "12",
      "Name2": "10",
      "Quantity": 10,
      "Quantity2": 20,
      "subComponent": {
        "subData": () => { },
        "subComponent": () => { }
      }
    }, {
      "ID": 16,
      "Name": "12",
      "Name2": "10",
      "Quantity": 10,
      "Quantity2": 20,
      "subComponent": {
        "subData": () => { },
        "subComponent": () => { }
      }
    }, {
      "ID": 17,
      "Name": "12",
      "Name2": "10",
      "Quantity": 10,
      "Quantity2": 20,
      "subComponent": {
        "subData": () => { },
        "subComponent": () => { }
      }
    }, {
      "ID": 18,
      "Name": "12",
      "Name2": "10",
      "Quantity": 10,
      "Quantity2": 20,
      "subComponent": {
        "subData": () => { },
        "subComponent": () => { }
      }
    }, {
      "ID": 19,
      "Name": "12",
      "Name2": "10",
      "Quantity": 10,
      "Quantity2": 20,
      "subComponent": {
        "subData": () => { },
        "subComponent": () => { }
      }
    }, {
      "ID": 20,
      "Name": "12",
      "Name2": "10",
      "Quantity": 10,
      "Quantity2": 20,
      "subComponent": {
        "subData": () => { },
        "subComponent": () => { }
      },
    }];

    setDs(data)
  }, [])

  return <>
    <AmTable
      container={props}
      columns={columns}
      rowNumber={true}
      height={500}
      selectionData={(seldata) => { console.log(seldata) }}
      //selectionDisabledCustom={(data) => {return true}}
      dataSource={ds}
      selection="checkbox"
      dataKey="ID"
      sortable={true}
      sortData={(e) => console.log(e)}
      selectionDefault={[{ "ID": 1 }]}
      subComponent={true}
      filterable={true}
      filter={true}
      pagination={true}
      filterData={(filter) => { console.log(filter) }}
      customTopLeftControl={<Button>YYY</Button>}
      customTopRightControl={<Button>XXX</Button>}
      customBtmLeftControl={<Button>YYY</Button>}
      customBtmRightControl={<Button>XXX</Button>}
      //tableStyle={{color:"black"}}
      footerStyle={(data, datafield, col) => {
        const style = {}
        if (datafield[datafield.length - 1].value > 0)
          //style.background="red"

          return style;
      }}
      //headerStyle={{color:"red"}}
      groupBy={{ "field": ["Name", "Name2"], "sumField": ["Quantity", "Quantity2"] }}
    />
  </>
}

export default TableDev;