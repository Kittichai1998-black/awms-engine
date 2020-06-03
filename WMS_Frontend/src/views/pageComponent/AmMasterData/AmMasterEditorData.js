import React, {useState, useEffect} from "react";
import AmEditorTable from '../../../components/table/AmEditorTable';
import { IsEmptyObject } from "../../../components/function/CoreFunction2";

const EditorData = ({config, editColumns, editData, response}) => {
    const [popupState, setPopState] = useState(false);
    const columns = (editColumns) => {
        if(typeof editColumns === "object")
            return editColumns;
        else if(typeof editColumns === "function")
            return editColumns();
    }
    
    useEffect(() => {
        if(editData !== undefined && !IsEmptyObject(editData)){
            setPopState(!popupState)
        }
    }, [editData])

    return <AmEditorTable 
        renderOptionalText={config.required === true ?<span style={{color:"red"}}>* required field  </span> : null}
        open={popupState} 
        onAccept={(status, rowdata)=> {
            //var res = response(status, rowdata)
            //if(res.result === 1){
            //    setPopState(false)
            //}
            setPopState(false)
        }} 
        titleText={config.title} 
        data={editData}
        columns={columns(editColumns)}
    />
}

export default EditorData;