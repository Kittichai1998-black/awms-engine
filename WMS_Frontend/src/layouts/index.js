import React, { useReducer, useContext, Suspense } from 'react';
import Header from "./headerLayout";
import Default from "./defaultLayout";
import { headerToggle, LinkToggle } from "../reducers/menuReducer";
import { LayoutProvider } from '../reducers/context'

const Layout = () => {
    return (
        <Suspense fallback={null}>
            <LayoutProvider>
                <Default />
                {/* <Header/> */}
                {/* <Default/> */}
            </LayoutProvider>
        </Suspense>
    )
};

export default Layout;