import React, { useState, useEffect} from "react";
import PropTypes from 'prop-types';
import Table from 'react-bootstrap-table-next';

// import LocationLink from '../ComponentCore/LocationLink'

const columns = [{
    dataField: 'id',
    text: 'Product ID'
  }, {
    dataField: 'name',
    text: 'Product Name'
  }, {
    dataField: 'price',
    text: 'Product Price'
  }];

const xx = [{id:1},{id:2}];

const Test3 = (props) => {
    const [data, setData] = useState(xx);

    return (
        <div>
            {/* <LocationLink location={props.history.location.pathname}/> */}
            <button onClick={() => {
                const xx = JSON.parse(JSON.stringify(data));
                xx.push({id:1})
                setData(xx);
            }}>add</button>
            <Table keyField='id' columns={columns} data={data}/>
        </div>
    )
}


export default Test3;