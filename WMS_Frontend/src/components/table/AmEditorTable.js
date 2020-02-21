import React, { useState, useEffect } from 'react';
// import { useTranslation } from 'react-i18next'

import AmButton from "../AmButton";
import AmDialogConfirm from '../../components/AmDialogConfirm';

const AmEditiorTable = (props) => {
    // const { t } = useTranslation()
    const [open, setOpen] = useState(props.open);
    const [component, setComponent] = useState(null);

    useEffect(() => {
        setOpen(props.open)
    }, [props.open])

    useEffect(() => {
        setComponent(createDialog())
    }, [props.reload])

    const checkStr = () => {

        if (props.titleText == "Edit") {
            return 'Save';

        } else {

            return 'Add';
        }

    }
    const generateComponent = (cols) => {
        let comp = cols.map((row, idx) => {
            if (row.component) {
                let comp2 = row.component(props.data ? props.data.original : {}, row, idx)
                return comp2
            }
            else
                return null;
        })
        return comp;
    }

    const createComponent = () => {
        return <div>
            {open ? generateComponent(props.columns) : null}
        </div>
    }

    const createDialog = () => {
        setComponent(<AmDialogConfirm open={open} close={() => { setOpen(!open); onHandleClick(false, props.data) }}
            titleDialog={props.titleText}
            bodyDialog={createComponent()}
            dataDialog={props.data}
            maxWidth={props.maxWidth}
            customAcceptBtn={<AmButton id={props.titleText} onClick={() => onHandleClick(true)} styleType="confirm_clear">{checkStr()}</AmButton>}
            customCancelBtn={<AmButton id="Editor_Cancel" onClick={() => onHandleClick(false)} styleType="delete_clear">Cancel</AmButton>}
            styleDialog={props.style} />)
    }

    const onHandleClick = (status) => {
        props.onAccept(status, props.data ? props.data.original ? props.data.original : props.data : {});
        setOpen(!open)
    }


    return (
        <div>
            {
                component ? component : <AmDialogConfirm open={open} close={() => { setOpen(!open); onHandleClick(false, props.data) }}
                    titleDialog={props.titleText}
                    bodyDialog={createComponent()}
                    dataDialog={props.data}
                    maxWidth={props.maxWidth}
                    customAcceptBtn={<AmButton id={props.titleText} onClick={() => onHandleClick(true)} styleType="confirm_clear">{checkStr()}</AmButton>}
                    customCancelBtn={<AmButton id="Editor_Cancel" onClick={() => onHandleClick(false)} styleType="delete_clear">Cancel</AmButton>}
                    styleDialog={props.style} />
            }
        </div>
    )
}

export default AmEditiorTable;

