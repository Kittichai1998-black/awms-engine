import React, { useReducer, useContext, Suspense } from 'react';
import Header from "./headerLayout";
import Default from "./defaultLayout";
import { headerToggle, initialState, LinkToggle } from "../reducers/menuReducer";
import { HeaderContext, LocationContext, DialogContext } from '../reducers/context'

const Layout = () => {
    const contextValue = useReducer(headerToggle);
    const contextLocation = useReducer(LinkToggle);
    return (
        <Suspense fallback={null}>
            <HeaderContext.Provider value={contextValue}>
                <LocationContext.Provider value={contextLocation}>

                    <Default />

                </LocationContext.Provider>
                {/* <Header/> */}
                {/* <Default/> */}
            </HeaderContext.Provider>
        </Suspense>
    )
};

export default Layout;