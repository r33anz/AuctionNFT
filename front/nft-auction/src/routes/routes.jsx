import React, { Suspense } from "react";

const NFTCreationPage = React.lazy(() => import("../components/NFTCreationPage"));
const SettingNFTAuction = React.lazy(() => import("../components/SettingNFTAuction"));

export const routes = [
    {
        path: "/",
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <NFTCreationPage />
            </Suspense>
        ),
    },
    {
        path:"/setNFTAuction",
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <SettingNFTAuction />
            </Suspense>
        ),
    }
];