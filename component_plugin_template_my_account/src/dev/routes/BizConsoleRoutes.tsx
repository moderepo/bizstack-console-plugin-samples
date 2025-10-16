import { Suspense } from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { LoadingScreen } from '@moderepo/bizstack-console-sdk';
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

const MyCustomAccountPageRoute: React.FC = () => {
    const params = useParams();
    return <MyCustomAccountPage projectId={params.projectId !== undefined ? Number(params.projectId) : Number.NaN} />;
};

export const BizConsoleRoutes: React.FC = () => {
    return (
        <Routes>
            <Route
                path={`/projects/:projectId/custom/my_custom_route_2/:entityId`}
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
    );
};
