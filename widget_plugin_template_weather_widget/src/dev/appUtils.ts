import {
    AllUserResourceInstancesPermissions,
    API_ERROR_CODES,
    APIError,
    AuthInfo,
    fetchAllPermissionStatements,
    isBizConsoleAppSettings,
    ModeAPI,
    transformUserPermissionStatements,
    transformUserResourcesPermissions,
} from '@moderepo/bizstack-console-sdk';

/**
 * A helper function for getting the user permissions for the logged-in user.
 * @param publicAlias - The project alias
 * @param authInfo - The logged-in user's auth information
 * @remarks We are replacing the permission check with a new async-based check. As of March 2025, it is a WIP feature so this checks the flag.
 */
export const getAllUserResourceInstancesPermissions = async (
    publicAlias: string,
    authInfo: AuthInfo
): Promise<AllUserResourceInstancesPermissions | APIError> => {
    const { projectId, userId, appId } = authInfo;
    if (projectId === undefined || userId === undefined || appId === undefined) {
        return new APIError(API_ERROR_CODES.UNKNOWN, 500);
    }

    // Check the WIP flag
    const appConfig = await ModeAPI.getInstance().getAppConfig(publicAlias, appId);
    if (appConfig instanceof APIError) {
        return appConfig;
    }

    if (isBizConsoleAppSettings(appConfig) && appConfig.wipFeatures?.asyncPermissionCheck === true) {
        // The project uses the async permission check.
        const permissions = await fetchAllPermissionStatements({
            projectId,
            userId,
            resolveUserPermissions: true,
            // If the user has more than 100 permissions, we cannot make a complete "AllUserResourceInstancesPermissions" in here, but it is okay
            // because the permission check function can make an API call to check user permission anyway.
            limit: 100,
        });
        if (permissions instanceof APIError) {
            return permissions;
        }
        return transformUserPermissionStatements(permissions);
    } else {
        // The project uses the legacy permission check.
        const permissions = await ModeAPI.getInstance().getLoggedInUserResourcesPermissions(userId);
        if (permissions instanceof APIError) {
            return permissions;
        }
        return transformUserResourcesPermissions(permissions);
    }
};
