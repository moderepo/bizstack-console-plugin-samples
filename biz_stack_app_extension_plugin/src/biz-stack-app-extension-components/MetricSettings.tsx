/* eslint-disable react-refresh/only-export-components */
import React, { useCallback } from 'react';
import { IconButton, ListItemIcon } from '@mui/material';
import {
    Icons,
    isValidObjectValue,
    SubSettingsErrorsLogger,
    isValidNumberValue,
    StyledPanel,
    StyledForm,
    MetricInput,
    EntityMetricInfo,
    useMenuControlStates,
    StyledDropdownMenu,
    EntityMetricValueType,
    BizStackAppExtensionConfigComponentProps,
    isBizStackAppExtensionConfigComponentProps,
} from '@moderepo/bizstack-console-sdk';
import clsx from 'clsx';

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
        !isValidNumberValue(
            settings.projectId,
            true,
            false,
            undefined,
            undefined,
            undefined,
            new SubSettingsErrorsLogger(errorLogger, 'projectId', settings.projectId)
        )
    ) {
        return false;
    }

    return true;
};

export const MetricSettings: React.FC<MetricSettingsProps> = ({ projectId, onConfigCompleted, targetEntityClass }) => {
    const [isEditing, setIsEditing] = React.useState<boolean>(false);
    const { menuAnchorElement, menuOpened, onCloseMenu, onMenuAnchorElementClick } = useMenuControlStates(); // States for the ... menu
    const [selectedMetric, setSelectedMetric] = React.useState<EntityMetricInfo | undefined>(undefined);
    const [previousSelectedMetric, setPreviousSelectedMetric] = React.useState<EntityMetricInfo | undefined>(undefined);

    const onDoneClick = useCallback(() => {
        setIsEditing(false);
        onConfigCompleted?.();
        setPreviousSelectedMetric(selectedMetric);
    }, [onConfigCompleted, selectedMetric]);

    return (
        <StyledPanel.Panel className={clsx(isEditing && 'editing')}>
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
                <MetricInput
                    variant={isEditing ? 'outlined' : 'standard'}
                    readOnly={!isEditing}
                    InputProps={{}}
                    projectId={projectId}
                    noValueText={isEditing ? 'Select a metric' : 'None'}
                    targetEntityClass={targetEntityClass}
                    allowedMetricType={EntityMetricValueType.NUMBER}
                    value={selectedMetric}
                    onChange={setSelectedMetric}
                />
            </StyledPanel.Content>
            {isEditing && (
                <StyledPanel.FooterBar>
                    <StyledForm.ActionsBar>
                        <StyledForm.RightActionsBar>
                            <StyledForm.ActionButton
                                variant="text"
                                color="secondary"
                                onClick={() => {
                                    setIsEditing(false);
                                    setSelectedMetric(previousSelectedMetric);
                                }}
                            >
                                Cancel
                            </StyledForm.ActionButton>
                            <StyledForm.ActionButton variant="contained" onClick={onDoneClick}>
                                Save
                            </StyledForm.ActionButton>
                        </StyledForm.RightActionsBar>
                    </StyledForm.ActionsBar>
                </StyledPanel.FooterBar>
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
                    Edit Metric
                </StyledDropdownMenu.StyledDropdownMenuItem>
            </StyledDropdownMenu.StyledDropdownMenu>
        </StyledPanel.Panel>
    );
};
MetricSettings.displayName = 'MetricSettings';
