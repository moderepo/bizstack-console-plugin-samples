import { Suspense } from 'react';
import { Route, RouteObject, Routes, useNavigate, useParams } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import {
    DEFAULT_ROUTE_PATHS,
    LoadingScreen,
    useAuthenticationStore,
    useGetParamValueFromRouteParamsAsNumber,
    IEntityViewComponentsManager,
} from '@moderepo/bizstack-console-sdk';
import { TemperatureWidget } from '../../weather-widgets/TemperatureWidget';
import { HumidityWidget } from '../../weather-widgets/HumidityWidget';
import { createInitialTemperatureWidgetSettings } from '../../weather-widgets/models';

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
            <Box>Please open {'http://localhost:5000/projects/{projectId}/custom/widget1'}</Box>
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
                    <ListItemButton onClick={() => navigate(`/projects/${projectId}/custom/widget1`)}>
                        <ListItemText>widget1</ListItemText>
                    </ListItemButton>
                </ListItem>
                <ListItem>
                    <ListItemButton onClick={() => navigate(`/projects/${projectId}/custom/widget2`)}>
                        <ListItemText>widget2</ListItemText>
                    </ListItemButton>
                </ListItem>
            </List>
        </Drawer>
    );
};

const mockComponentsManager: IEntityViewComponentsManager = {
    hasLoadedDataForAllComponents: () => false,
    removeComponent: (compId: string) => {
        void compId;
    },
    loadDataForComponent: (compId: string, timeParams, selectionRange) => {
        void compId;
        void timeParams;
        void selectionRange;
    },
    createComponent: (params) => {
        void params;
        return <></>;
    },
    createComponentForEditMode: (params) => {
        void params;
        return <></>;
    },
};

const Widget1Route: React.FC = () => {
    const params = useParams();
    const loggedInUserId = useAuthenticationStore((state) => state.authInfo?.userId ?? state.loggedInUser?.id ?? 0);

    return (
        <TemperatureWidget
            compSettings={createInitialTemperatureWidgetSettings('TemperatureWidget')}
            componentsManager={mockComponentsManager}
            loggedInUserId={loggedInUserId}
            id="temperature-widget-1"
            projectId={params.projectId !== undefined ? Number(params.projectId) : Number.NaN}
            entityId="test"
            componentSettingsRef={{ componentType: 'SampleWeatherWidgetPlugin.TemperatureWidget' }}
            componentParentSettingsRef={undefined}
        />
    );
};

const Widget2Route: React.FC = () => {
    const params = useParams();
    const loggedInUserId = useAuthenticationStore((state) => state.authInfo?.userId ?? state.loggedInUser?.id ?? 0);

    return (
        <HumidityWidget
            compSettings={createInitialTemperatureWidgetSettings('HumidityWidget')}
            componentsManager={mockComponentsManager}
            loggedInUserId={loggedInUserId}
            id="humidity-widget-1"
            projectId={params.projectId !== undefined ? Number(params.projectId) : Number.NaN}
            entityId="test"
            componentSettingsRef={{ componentType: 'SampleWeatherWidgetPlugin.HumidityWidget' }}
            componentParentSettingsRef={undefined}
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
                            path={'widget1'}
                            element={
                                <Suspense fallback={<LoadingScreen open={true} />}>
                                    <Widget1Route />
                                </Suspense>
                            }
                        />
                        <Route
                            path={'widget2'}
                            element={
                                <Suspense fallback={<LoadingScreen open={true} />}>
                                    <Widget2Route />
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
