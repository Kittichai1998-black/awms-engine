import React, { useContext } from "react";
import PropTypes from "prop-types"
import { PutandPickProvider } from './PutandPickContext'
import AmHeaderputandpick from './AmHeaderputandpick'



const AmputAndpick = (props) => {
    return <PutandPickProvider>
        <div>
            <AmHeaderputandpick
                docheaderCreate={props.docheaderCreate}
                docItemQuery={props.docItemQuery}
                doccolumnEditItem={props.doccolumnEditItem}
            >
            </AmHeaderputandpick>

        </div>
    </PutandPickProvider>


}

AmputAndpick.propTypes = {

}

AmputAndpick.defaultProps = {

}

export default AmputAndpick;