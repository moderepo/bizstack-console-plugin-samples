import { Suspense } from 'react';
import { Link, Route, RouteObject, Routes, useParams, useSearchParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { DEFAULT_ROUTE_PATHS, LoadingScreen, useGetParamValueFromRouteParamsAsNumber } from '@moderepo/bizstack-console-sdk';
import { MyCustomAccountPage } from '../../my-account-components/MyCustomAccountPage';
import { MyAccountInfoComponent } from '../../my-account-components/MyAccountInfoComponent';

const PageNotFoundPage: React.FC = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                flexDirection: 'column',
                fontSize: 40,
            }}
        >
            <Box>404 Page Not Found</Box>
            <Box>Please open {'http://localhost:5001/projects/{projectId}/custom/my_custom_page'}</Box>
        </Box>
    );
};

const Sidebar = () => {
    const projectId = useGetParamValueFromRouteParamsAsNumber('projectId');

    return (
        <Box sx={{ width: '200px', p: 2, display: 'flex', flexDirection: 'column', gap: 1, borderRight: '1px solid gray' }}>
            <Link to={`/projects/${projectId}/custom/my_custom_page/`}>my_custom_page</Link>
            <Link to={`/projects/${projectId}/custom/my_custom_page_2/100000?startTime=946684800000`}>my_custom_page_2</Link>
        </Box>
    );
};

const MyCustomPage1Route: React.FC = () => {
    const params = useParams();
    console.log({ params });
    return <MyAccountInfoComponent />;
};

const MyCustomPage2Route: React.FC = () => {
    const params = useParams();
    const [searchParams] = useSearchParams();
    return (
        <MyCustomAccountPage
            projectId={params.projectId !== undefined ? Number(params.projectId) : Number.NaN}
            entityId={params.entityId !== undefined ? Number(params.entityId) : undefined}
            startTime={Number(searchParams.get('startTime'))}
        />
    );
};

export const bizConsoleRoutes: RouteObject[] = [
    {
        path: DEFAULT_ROUTE_PATHS.PROJECT_$projectId_CUSTOM,
        element: (
            <Box sx={{ display: 'flex', height: '100%' }}>
                <Sidebar />
                <Box component="main" sx={{ flex: 1, overflow: 'auto' }}>
                    <Routes>
                        <Route
                            path={`my_custom_page`}
                            element={
                                <Suspense fallback={<LoadingScreen open={true} />}>
                                    <MyCustomPage1Route />
                                </Suspense>
                            }
                        />
                        <Route
                            path={`my_custom_page_2/:entityId`}
                            element={
                                <Suspense fallback={<LoadingScreen open={true} />}>
                                    <MyCustomPage2Route />
                                </Suspense>
                            }
                        />
                        <Route
                            path="*"
                            element={
                                <Suspense fallback={<LoadingScreen open={true} />}>
                                    <PageNotFoundPage />
                                </Suspense>
                            }
                        />
                    </Routes>
                </Box>
            </Box>
        ),
    },
    {
        path: '*',
        element: (
            <Suspense fallback={<LoadingScreen open={true} />}>
                <PageNotFoundPage />
            </Suspense>
        ),
    },
];
