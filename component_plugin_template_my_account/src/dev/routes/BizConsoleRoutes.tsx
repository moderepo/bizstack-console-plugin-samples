import { Suspense } from 'react';
import { Link, Route, RouteObject, Routes, useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { DEFAULT_ROUTE_PATHS, LoadingScreen, useGetParamValueFromRouteParamsAsNumber } from '@moderepo/bizstack-console-sdk';
import { MyCustomAccountPage } from '../../my-account-components/MyCustomAccountPage';

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
            <Box>Please open {'http://localhost:5001/projects/{projectId}/custom/my_custom_route_2/{entityId}'}</Box>
        </Box>
    );
};

const Sidebar = () => {
    const projectId = useGetParamValueFromRouteParamsAsNumber('projectId');

    return (
        <Box sx={{ width: '200px', p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Link to={`/projects/${projectId}/custom/my_custom_route_2/{entityId}`}>my_custom_route_2</Link>
        </Box>
    );
};

const MyCustomAccountPageRoute: React.FC = () => {
    const params = useParams();
    return <MyCustomAccountPage projectId={params.projectId !== undefined ? Number(params.projectId) : Number.NaN} />;
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
                            path={`my_custom_route_2/:entityId`}
                            element={
                                <Suspense fallback={<LoadingScreen open={true} />}>
                                    <MyCustomAccountPageRoute />
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
