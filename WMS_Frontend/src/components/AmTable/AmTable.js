import React, { useContext,useEffect } from "react";
import AmTableComponent from "./AmTableComponent";
import { AmTableProvider,AmTableContext  } from "./AmTableContext";

export default (props) => {
    console.log(props.height)
    return <AmTableProvider>
        <AmTableComponent 
            dataSource={props.dataSource} 
            columns={props.columns} 
            cellStyle={props.cellStyle} 
            key={props.key}
            rowNumber={true}
            height={props.height}
        />
    </AmTableProvider>
}
