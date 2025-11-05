import { Suspense } from 'react';
import { Route, RouteObject, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
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

const drawerWidth = 200;

const CustomDrawer = () => {
    const projectId = useGetParamValueFromRouteParamsAsNumber('projectId');
    const navigate = useNavigate();

    return (
        <Drawer
            variant="permanent"
            open={true}
            sx={{
                flexShrink: 0,
                width: drawerWidth,
            }}
        >
            <List>
                <ListItem>
                    <ListItemButton onClick={() => navigate(`/projects/${projectId}/custom/my_custom_page`)}>
                        <ListItemText>my_custom_page</ListItemText>
                    </ListItemButton>
                </ListItem>
                <ListItem>
                    <ListItemButton onClick={() => navigate(`/projects/${projectId}/custom/my_custom_page_2/100000?startTime=946684800000`)}>
                        <ListItemText>my_custom_page2</ListItemText>
                    </ListItemButton>
                </ListItem>
            </List>
        </Drawer>
    );
};

const MyCustomPage1Route: React.FC = () => {
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
                <CustomDrawer />

                <Box>
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
