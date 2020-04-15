import React, { useContext,useEffect } from "react";
import AmTableComponent from "./AmTableComponent";
import { AmTableProvider,AmTableContext  } from "./AmTableContext";

export default (props) => {
    const value = useContext(AmTableContext)

    useEffect(() => {
        if(props.selection)
            props.selectionData(value.selection);
    }, [value.selection])

    useEffect(() => {
        if(props.sort)
            props.selectionData(value.sort);
    }, [value.sort])

    useEffect(() => {
        if(props.filter)
            props.filterData(value.sort);
    }, [value.sort])

    return <AmTableProvider>
        <AmTableComponent dataSource={props.dataSource} columns={props.columns}/>
    </AmTableProvider>
}
