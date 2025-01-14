import React, { PropsWithChildren } from 'react';
import * as StyledGaugeWidget from './styled';
import { IComponent, IconSettings, StyledPanel, WidgetViewContainerType } from '@moderepo/bizstack-console-sdk';

export interface GaugeWidgetContainerProps extends IComponent {
    readonly icon?: IconSettings;
    readonly title: string;
    readonly containerType?: WidgetViewContainerType;
    readonly hideTitle?: boolean;
}

export const GaugeWidgetContainer: React.FC<GaugeWidgetContainerProps & PropsWithChildren> = ({
    sx,
    icon,
    title,
    containerType,
    hideTitle,
    children,
}) => {
    return (
        <>
            {containerType === WidgetViewContainerType.CARD ? (
                <StyledGaugeWidget.StyledCardContainer sx={sx}>
                    <StyledGaugeWidget.StyledCardContent className="content">
                        {hideTitle !== true && (
                            <StyledGaugeWidget.StyledCardTitleAndIcon className="title-and-icon">
                                {icon && <StyledGaugeWidget.StyledCardIcon className="icon" source={icon.source} name={icon.name} />}
                                <StyledGaugeWidget.StyledTitleDisplay className="title">{title}</StyledGaugeWidget.StyledTitleDisplay>
                            </StyledGaugeWidget.StyledCardTitleAndIcon>
                        )}
                        {children}
                    </StyledGaugeWidget.StyledCardContent>
                </StyledGaugeWidget.StyledCardContainer>
            ) : containerType === WidgetViewContainerType.PANEL ? (
                <StyledGaugeWidget.StyledPanelContainer sx={sx}>
                    {hideTitle !== true && (
                        <StyledPanel.HeaderBar className="header-bar">
                            <StyledPanel.HeaderBarLeftContent className="header-bar-left-content">
                                {icon && <StyledGaugeWidget.StyledCardIcon className="icon" source={icon.source} name={icon.name} />}
                                <StyledGaugeWidget.StyledTitleDisplay className="title">{title}</StyledGaugeWidget.StyledTitleDisplay>
                            </StyledPanel.HeaderBarLeftContent>
                        </StyledPanel.HeaderBar>
                    )}
                    <StyledGaugeWidget.StyledPanelContent className="content">{children}</StyledGaugeWidget.StyledPanelContent>
                </StyledGaugeWidget.StyledPanelContainer>
            ) : (
                <StyledGaugeWidget.StyledDefaultContainer sx={sx}>
                    <StyledGaugeWidget.StyledCardContent className="content">
                        {hideTitle !== true && (
                            <StyledGaugeWidget.StyledCardTitleAndIcon className="title-and-icon">
                                {icon && <StyledGaugeWidget.StyledCardIcon className="icon" source={icon.source} name={icon.name} />}
                                <StyledGaugeWidget.StyledTitleDisplay className="title">{title}</StyledGaugeWidget.StyledTitleDisplay>
                            </StyledGaugeWidget.StyledCardTitleAndIcon>
                        )}
                        {children}
                    </StyledGaugeWidget.StyledCardContent>
                </StyledGaugeWidget.StyledDefaultContainer>
            )}
        </>
    );
};
