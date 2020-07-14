import React, { useContext } from "react";
import PropTypes from "prop-types"
import { PutandPickProvider } from './PutandPickContext';
import AmHeaderputandpick from './AmHeaderputandpick';
import AmTBputandpick from './AmTBputAndpick';
import AmputAndpickManage from './AmputAndpickManage';
import { PutandPickContext } from './PutandPickContext';
import queryString from "query-string";


const AmputAndpick = (props) => {

    return <PutandPickProvider>
        <div>
            <AmHeaderputandpick
                docheaderCreate={props.docheaderCreate}
                docItemQuery={props.docItemQuery}
                doccolumnEditItem={props.doccolumnEditItem}
                doccolumnEditItemSet={props.doccolumnEditItemSet}
                onChangeDoument={props.onChangeDoument}
                doctypeDocNo={props.doctypeDocNo}
        >
            </AmHeaderputandpick>
        </div>
        <div>
            <AmTBputandpick
                doccolumnEdit={props.doccolumnEdit}
                doccolumnEditItem={props.doccolumnEditItem}
                doccolumns={props.doccolumns}
            ></AmTBputandpick>
        </div>
        <AmputAndpickManage
            doccreateDocType={props.doccreateDocType}
            dochistory={props.dochistory}
            docapiRes={props.docapiRes}
            docapicreate={props.docapicreate}
        >
        </AmputAndpickManage>
        
    </PutandPickProvider>


}

AmputAndpick.propTypes = {

}

AmputAndpick.defaultProps = {

}

export default AmputAndpick;