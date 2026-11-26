/* eslint-disable react-refresh/only-export-components */
import React, { Fragment, useCallback, useEffect } from 'react';
import { Box, IconButton, ListItemIcon } from '@mui/material';
import {
    Icons,
    isValidObjectValue,
    SubSettingsErrorsLogger,
    StyledPanel,
    StyledForm,
    MetricInput,
    EntityMetricInfo,
    useMenuControlStates,
    StyledDropdownMenu,
    EntityMetricValueType,
    BizStackAppExtensionConfigComponentProps,
    isBizStackAppExtensionConfigComponentProps,
    isValidStringValue,
    EntityInput,
    Entity,
    useAuthenticationStore,
    User,
    GenericMessageBox,
} from '@moderepo/bizstack-console-sdk';
import clsx from 'clsx';
import * as StyledBizStackAppExtensionPlugin from './styledBizStackAppExtensionPlugin';

export interface MetricSettingsProps extends BizStackAppExtensionConfigComponentProps {
    readonly targetEntityClass?: string;
}

/**
 * Type guard function to check if the given obj is an instance of MetricSettingsProps.
 */
export const isMetricSettingsProps = (obj: unknown, errorLogger?: SubSettingsErrorsLogger | undefined): obj is MetricSettingsProps => {
    const settings = obj as MetricSettingsProps;

    if (!isValidObjectValue(settings, true, errorLogger)) {
        return false;
    }

    if (!isBizStackAppExtensionConfigComponentProps(settings, errorLogger)) {
        return false;
    }

    if (
        !isValidStringValue(
            settings.targetEntityClass,
            false,
            false,
            undefined,
            new SubSettingsErrorsLogger(errorLogger, 'targetEntityClass', settings.targetEntityClass)
        )
    ) {
        return false;
    }

    return true;
};

export const MetricSettings: React.FC<MetricSettingsProps> = ({ projectId, onConfigCompleted, appProxyAPIs }) => {
    const loggedInUser = useAuthenticationStore((store) => {
        return store.loggedInUser;
    }) as User;
    const [isEditing, setIsEditing] = React.useState<boolean>(false);
    const { menuAnchorElement, menuOpened, onCloseMenu, onMenuAnchorElementClick } = useMenuControlStates(); // States for the ... menu
    const [selectedEntity, setSelectedEntity] = React.useState<Entity | undefined>(undefined);
    const [selectedMetric, setSelectedMetric] = React.useState<EntityMetricInfo | undefined>(undefined);
    const [previousSelectedMetric, setPreviousSelectedMetric] = React.useState<EntityMetricInfo | undefined>(undefined);
    const [previousSelectedEntity, setPreviousSelectedEntity] = React.useState<Entity | undefined>(undefined);

    const onDoneClick = useCallback(() => {
        setIsEditing(false);
        onConfigCompleted?.();
        setPreviousSelectedMetric(selectedMetric);
        setPreviousSelectedEntity(selectedEntity);
    }, [onConfigCompleted, selectedMetric, selectedEntity]);

    useEffect(() => {
        appProxyAPIs.get('/some/path').then((response) => {
            console.log('response', response);
        });
    }, [isEditing, previousSelectedMetric, previousSelectedEntity, appProxyAPIs]);

    return (
        <StyledBizStackAppExtensionPlugin.Root className={clsx(isEditing && 'editing')}>
            {isEditing && (
                <StyledBizStackAppExtensionPlugin.ProgressComponent>
                    <GenericMessageBox
                        sx={{ padding: `50px 0` }}
                        title="Progress Component"
                        message="This is for apps that have many configs and need to show the progress. Not all apps ave to use this."
                    />
                </StyledBizStackAppExtensionPlugin.ProgressComponent>
            )}
            <StyledPanel.Panel>
                <StyledPanel.HeaderBar>
                    <StyledPanel.HeaderBarLeftContent>
                        <StyledPanel.HeaderBarIconContainer>
                            <Icons.LineGraphOutlined />
                        </StyledPanel.HeaderBarIconContainer>
                        <StyledPanel.HeaderBarTitle>Metric Settings</StyledPanel.HeaderBarTitle>
                    </StyledPanel.HeaderBarLeftContent>
                    {!isEditing && (
                        <StyledPanel.HeaderBarRightContent>
                            <IconButton onClick={onMenuAnchorElementClick}>
                                <Icons.KebabMenu />
                            </IconButton>
                        </StyledPanel.HeaderBarRightContent>
                    )}
                </StyledPanel.HeaderBar>
                <StyledPanel.Content>
                    <EntityInput
                        label="Entity"
                        variant={isEditing ? 'outlined' : 'standard'}
                        readOnly={!isEditing}
                        InputProps={{}}
                        projectId={projectId}
                        userId={loggedInUser.id}
                        noValueText={isEditing ? 'Select an entity' : 'None'}
                        value={selectedEntity}
                        onChange={setSelectedEntity}
                    />
                    <MetricInput
                        label="Metric"
                        variant={isEditing ? 'outlined' : 'standard'}
                        readOnly={!isEditing}
                        InputProps={{ disabled: isEditing && !selectedEntity }}
                        projectId={projectId}
                        noValueText={isEditing ? 'Select a metric' : 'None'}
                        targetEntityClass={selectedEntity?.entityClass}
                        allowedMetricType={EntityMetricValueType.NUMBER}
                        value={selectedMetric}
                        onChange={setSelectedMetric}
                    />
                </StyledPanel.Content>
            </StyledPanel.Panel>
            <StyledPanel.Panel>
                <StyledPanel.HeaderBar>
                    <StyledPanel.HeaderBarLeftContent>
                        <StyledPanel.HeaderBarIconContainer>
                            <Icons.SettingOutlined />
                        </StyledPanel.HeaderBarIconContainer>
                        <StyledPanel.HeaderBarTitle>Other Settings</StyledPanel.HeaderBarTitle>
                    </StyledPanel.HeaderBarLeftContent>
                    {!isEditing && (
                        <StyledPanel.HeaderBarRightContent>
                            <IconButton onClick={onMenuAnchorElementClick}>
                                <Icons.KebabMenu />
                            </IconButton>
                        </StyledPanel.HeaderBarRightContent>
                    )}
                </StyledPanel.HeaderBar>
                <StyledPanel.Content>
                    <GenericMessageBox sx={{ margin: `50px 0` }} message="Other App Settings Content" />
                </StyledPanel.Content>
            </StyledPanel.Panel>
            {isEditing && (
                <StyledBizStackAppExtensionPlugin.FooterBar>
                    <StyledForm.ActionsBar>
                        <StyledForm.RightActionsBar>
                            <StyledForm.ActionButton
                                variant="outlined"
                                color="primary"
                                onClick={() => {
                                    setIsEditing(false);
                                    setSelectedMetric(previousSelectedMetric);
                                    setSelectedEntity(previousSelectedEntity);
                                }}
                            >
                                Cancel
                            </StyledForm.ActionButton>
                            <StyledForm.ActionButton variant="contained" onClick={onDoneClick}>
                                Save
                            </StyledForm.ActionButton>
                        </StyledForm.RightActionsBar>
                    </StyledForm.ActionsBar>
                </StyledBizStackAppExtensionPlugin.FooterBar>
            )}
            <StyledDropdownMenu.StyledDropdownMenu open={menuOpened} onClose={onCloseMenu} anchorEl={menuAnchorElement}>
                <StyledDropdownMenu.StyledDropdownMenuItem
                    onClick={() => {
                        onCloseMenu();
                        setIsEditing(true);
                    }}
                >
                    <ListItemIcon>
                        <Icons.EditOutlined />
                    </ListItemIcon>
                    Edit
                </StyledDropdownMenu.StyledDropdownMenuItem>
            </StyledDropdownMenu.StyledDropdownMenu>
        </StyledBizStackAppExtensionPlugin.Root>
    );
};
MetricSettings.displayName = 'MetricSettings';
