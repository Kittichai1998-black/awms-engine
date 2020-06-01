import React, {useState, useEffect} from "react";
import AmEditorTable from '../../../components/table/AmEditorTable';

const EditorData = (config, editColumns, editData, response) => {
    const [popupState, setPopState] = useState(false);
    const columns = function(editColumns){
        if(typeof editColumns === "object")
            return editColumns;
        else if(typeof editColumns === "function")
            return editColumns();
    }

    return <AmEditorTable 
        renderOptionalText={config.required === true ?<span style={{color:"red"}}>* required field  </span> : null}
        open={popupState} 
        onAccept={(status, rowdata)=> {
            var res = response(status, rowdata)
            if(res.result === 1){
                setPopState(!popupState)
            }
        }} 
        titleText={config.title} 
        data={editData} 
        columns={columns()}
    />
}

export default EditorData;