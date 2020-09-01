import React, { Suspense, lazy } from 'react';
//import Default from "./defaultLayout";
import { LayoutProvider } from '../reducers/context'

const DefaultLayout = lazy(() => import("./defaultLayout"));

const Layout = () => {
    return (
        <Suspense fallback={null}>
            <LayoutProvider>
                <DefaultLayout />
            </LayoutProvider>
        </Suspense>
    )
};

export default Layout;