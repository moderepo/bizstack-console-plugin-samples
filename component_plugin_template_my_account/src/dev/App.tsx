import { CssBaseline } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Outlet, RouterProvider } from 'react-router-dom';
import { Box } from '@mui/material';
import { BizConsoleThemeProvider, DateLocalizationProvider, DialogProvider, GlobalLoadingScreen } from './providers';
import { bizConsoleRoutes } from './routes/BizConsoleRoutes';
import * as MODE from '@moderepo/bizstack-console-sdk';
import { APIError, ModeAPI, useAuthenticationStore, useProjectProfileStore, LoadingScreen, AuthTokenType } from '@moderepo/bizstack-console-sdk';
import { addLicense } from '@amcharts/amcharts5';
import { ErrorBoundary } from 'react-error-boundary';
import { APIProvider } from '@vis.gl/react-google-maps';

// Configure amcharts library
if (import.meta.env.VITE_AMCHARTS_LICENSE !== undefined) {
    addLicense(import.meta.env.VITE_AMCHARTS_LICENSE);
}

ModeAPI.initialize('https://api-dev.tinkermode.dev');

export const App = () => {
    const authToken = import.meta.env.VITE_USER_AUTH_TOKEN;
    const projectAlias = import.meta.env.VITE_PROJECT_ALIAS;
    const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    // Get the logged in projects from the store
    // loggedInProjects is persisted in the browser's storage.
    const { loggedInProjects } = useProjectProfileStore((store) => {
        return { loggedInProjects: store.loggedInProjects };
    });

    const authActions = useAuthenticationStore((store) => {
        return store.actions;
    });

    // If authInfo are successfully loaded with the authToken which mean it is still valid. Set the token to ModeAPI so that
    // it can start using this token to make API calls from now on
    ModeAPI.getInstance().setAuthToken(authToken);

    const projectProfileAction = MODE.useProjectProfileStore((store) => {
        return store.actions;
    });

    /**
     * We persist the logged in user's authToken in the browser's storage and reload it when the user open the app. However, there is a
     * possibility that the authToken is no longer valid. Therefore, if there is an authToken in the store BUT we have not validated
     * the authToken, we need to validate it and we only need to do it ONCE on app load.
     * Therefore, this state is used for keeping track of whether we validated the authToken.
     */
    const [cachedAuthTokenValidated, setCachedAuthTokenValidated] = useState<boolean>(false);
    const validateAuthToken = useCallback(
        async (token: string) => {
            // Try to get auth info with the auth token to validate the persisted auth token
            const authInfo = await ModeAPI.getInstance().getAuthInfo(token);
            if (authInfo instanceof APIError) {
                throw authInfo;
            }
            if (authInfo.type !== AuthTokenType.USER || authInfo.projectId === undefined || authInfo.userId === undefined) {
                // When the token is expired, the type of authInfo will be 'nobody' and the projectId and userId will be undefined.
                throw new APIError('AUTHORIZATION_REQUIRED', 401);
            }

            // Try to find a project profile to validate the persisted project profile info. If it does not exist in the store and if we have
            // the projectAlias, make API call to fetch it.
            const cachedProjectProfile =
                loggedInProjects.find((profile) => {
                    return profile.id === authInfo.projectId;
                }) ?? (await ModeAPI.getInstance().getProjectProfile(projectAlias));

            if (cachedProjectProfile === undefined || cachedProjectProfile instanceof APIError) {
                throw new Error(
                    `The projectProfile in the browser's storage may be broken: projectId=${authInfo.projectId}, userId=${authInfo.userId}`
                );
            }

            const publicAlias = cachedProjectProfile.publicAlias;

            const user = await ModeAPI.getInstance().getUser(authInfo.userId);
            if (user instanceof APIError) {
                throw user;
            }

            // Project profile is cached in local storage therefore we don't need to load it. However, it is better that we RELOAD at least once
            // when the app loads so that we have a new copy of the project profile in case the project profile changed e.g. project name, alias, etc.
            const projectProfile = await MODE.ModeAPI.getInstance().getProjectProfile(publicAlias);
            if (projectProfile instanceof APIError) {
                throw projectProfile;
            }

            return { authInfo, user, projectProfile };
        },
        [loggedInProjects, projectAlias]
    );

    const [authErrorMessage, setAuthErrorMessage] = useState('');
    useEffect(() => {
        if (authToken !== undefined && !cachedAuthTokenValidated) {
            (async () => {
                try {
                    const { authInfo, user, projectProfile } = await validateAuthToken(authToken);
                    // We have all the data we needed, mark the user as logged in.
                    await authActions.setIsLoggedIn(
                        { token: authToken, userId: user.id },
                        authInfo,
                        user,
                        {} as MODE.AllUserResourceInstancesPermissions
                    );
                    await projectProfileAction.setProjectProfile(projectProfile.publicAlias, projectProfile);
                    // Because we might have made API call to fetch projectProfile directly, we need to add it to the store.
                    await projectProfileAction.addLoggedInProject(projectProfile);
                } catch (reason) {
                    // Unable to fetch authInfo or User object for the logged in user
                    await authActions.clearLoginInfo();

                    // Output error log to monitor login failure
                    if (reason instanceof APIError) {
                        // 401 error is an expected error when the auth token is expired. We don't need to log it.
                        if (reason.statusCode !== 401) {
                            console.error(reason.statusCode, reason.message);
                        } else {
                            setAuthErrorMessage('API returns 401');
                        }
                    } else {
                        console.error(reason);
                    }
                } finally {
                    setCachedAuthTokenValidated(true);
                }
            })();
        } else {
            setCachedAuthTokenValidated(true);
        }
    }, [authActions, authToken, cachedAuthTokenValidated, projectProfileAction, validateAuthToken]);

    const onErrorHandler = useCallback((error: Error, info: React.ErrorInfo) => {
        // We use dynamic import to load pages. When a new version of the app is deployed, the old chunks are deleted from the cloud,
        // and users using older versions will encounter an import module error. We need to reload the page to get new chunks from server.
        // Since this will catch all the same type of import errors, if the error is NOT by a new version deployment (e.g., by incorrect settings),
        // this can cause an infinite loop. Components that use dynamic import should have error handler, and don't throw this type of error.
        if (error.message.includes('Failed to fetch dynamically imported module')) {
            window.location.reload();
        } else {
            console.error(error, info);
        }
    }, []);

    // If we have not validated the cached auth token yet then wait, don't start the app yet
    if (!cachedAuthTokenValidated) {
        return <LoadingScreen open={true} />;
    }

    if (projectAlias === undefined || projectAlias === '') {
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
                <Box>Project Alias is not specified</Box>
                <Box>
                    Please update your <b>VITE_PROJECT_ALIAS</b> in .env.local
                </Box>
            </Box>
        );
    }

    if (authErrorMessage !== '') {
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
                <Box>Auth Error: {authErrorMessage}</Box>
                <Box>
                    Please update your <b>VITE_USER_AUTH_TOKEN</b> in .env.local
                </Box>
            </Box>
        );
    }

    return (
        <ErrorBoundary fallback={<LoadingScreen open={true} />} onError={onErrorHandler}>
            <DateLocalizationProvider>
                <APIProvider apiKey={googleMapsApiKey ?? ''}>
                    <BizConsoleThemeProvider>
                        <RouterProvider router={routesWrapper} fallbackElement={<p>Loading...</p>} />
                    </BizConsoleThemeProvider>
                </APIProvider>
            </DateLocalizationProvider>
        </ErrorBoundary>
    );
};

const routesWrapper = ReactRouterDOM.createBrowserRouter([
    {
        element: (
            <ErrorBoundary
                fallback={<LoadingScreen open={true} />}
                onError={(error: Error, info: React.ErrorInfo) => {
                    if (error.message.includes('Failed to fetch dynamically imported module')) {
                        window.location.reload();
                    } else {
                        console.error(error, info);
                    }
                }}
            >
                <CssBaseline>
                    <GlobalLoadingScreen />
                    <DialogProvider />
                    <Outlet />
                </CssBaseline>
            </ErrorBoundary>
        ),
        children: bizConsoleRoutes,
    },
]);
