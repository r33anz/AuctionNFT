import React, { Suspense } from "react";

const NFTCreationPage = React.lazy(() => import("../components/NFTCreationPage"));
const SettingNFTAuction = React.lazy(() => import("../components/SettingNFTAuction"));
const AuctionViewer = React.lazy(() => import("../components/AuctionViewer"));
const StateAuctionViewer = React.lazy(() => import("../components/StateContracts"));

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
    },
    {
        path:"/acutionViewer",
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <AuctionViewer />
            </Suspense>
        ),
    },
    {
        path:"/stateAuctionViewer",
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <StateAuctionViewer />
            </Suspense>
        ),
    }
];