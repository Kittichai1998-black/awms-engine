import React, { Component, useState, useEffect } from "react";
import AmRediRectInfo from '../../components/AmRedirectInfo'

const TestAmRedirectInfo = (props) => {

    return (
        <div>
            <AmRediRectInfo api="/wm/sto/DocumentSearchSTA" history={props.history} docID=""> </ AmRediRectInfo> 
        </div>

    )

}
export default TestAmRedirectInfo;