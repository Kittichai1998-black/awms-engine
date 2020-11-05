import React, { useState, useEffect } from 'react';

// import { useTranslation } from 'react-i18next'

import AmButton from "../AmButton";
import AmDialogConfirm from '../../components/AmDialogConfirm';
import ValidateInput from "../function/ValidateInput"

const AmEditiorTable = (props) => {
    // const { t } = useTranslation()
    // const [open, setOpen] = useState(props.open);
    const [component, setComponent] = useState(null);

    // useEffect(() => {
    //     setOpen(props.open)
    // }, [props.open])

    useEffect(() => {
        setComponent(createDialog())
    }, [props.reload])

    const checkStr = () => {
        if (props.titleText === "Edit") {
            return 'Save';
        }else if (props.titleText === "Remove") {
            return 'OK';
        } else {
            if (props.textConfirm) {
                return props.textConfirm;
            } else {
                return 'Add';
            }
        }
    }
    const generateComponent = (cols) => {
        let comp = cols.map((row, idx) => {
            if (row.component) {
                let comp2 = row.component(props.data ? props.data.original ? props.data.original : props.data : {}, row, idx)
                return comp2
            }
            else
                return null;
        })
        return comp;
    }

    const createComponent = () => {
        return <div>
            {props.open ? generateComponent(props.columns) : null}
        </div>
    }

    const createDialog = () => {
        setComponent(<AmDialogConfirm open={props.open} close={() => { onHandleClick(props.open, props.data) }}
            titleDialog={props.titleText}
            bodyDialog={createComponent()}
            dataDialog={props.data}
            maxWidth={props.maxWidth}
            customAcceptBtn={<AmButton id={props.titleText} onClick={() => onHandleClick(true)} styleType="confirm_clear">{checkStr()}</AmButton>}
            customCancelBtn={<AmButton id="Editor_Cancel" onClick={() => onHandleClick(false)} styleType="delete_clear">Cancel</AmButton>}
            styleDialog={props.style} />)
    }

    const onHandleClick = (status, objColumnsAndFieldCheck, data) => {
        if (status) {
            if (objColumnsAndFieldCheck) {
                let resultValidate = ValidateInput(objColumnsAndFieldCheck.objColumn, data, objColumnsAndFieldCheck.fieldCheck)
                props.onAccept(status, props.data ? props.data.original ? props.data.original : props.data : {}, resultValidate);
            } else {
                props.onAccept(status, props.data ? props.data.original ? props.data.original : props.data : {}, []);
            }
        } else {
            props.onAccept(status)
        }

        // 
        // setOpen(!open)
    }


    return (
        <div>
            {
                component ? component : <AmDialogConfirm open={props.open} close={(e) => onHandleClick(e)}
                    titleDialog={props.titleText}
                    bodyDialog={createComponent()}
                    dataDialog={props.data}
                    maxWidth={props.maxWidth}
                    customAcceptBtn={<AmButton id={props.titleText} onClick={() => onHandleClick(true, props.objColumnsAndFieldCheck, props.data)} styleType="confirm_clear">{checkStr()}</AmButton>}
                    customCancelBtn={<AmButton id="Editor_Cancel" onClick={() => onHandleClick(false)} styleType="delete_clear">Cancel</AmButton>}
                    styleDialog={props.style} />
            }
        </div>
    )
}

export default AmEditiorTable;

