import React, { FormEvent, useCallback, useEffect, useState } from 'react';
import {
    AccessPermission,
    ALL_RESOURCES_ID,
    ANY_ONE_OF_RESOURCE_ID,
    APIError,
    AssistantChatPlatform,
    BreadcrumbBar,
    BreadcrumbInfo,
    ButtonWithTooltip,
    COMPONENTS_SPACING,
    ComponentWithTooltip,
    ConfirmDeleteDialog,
    downloadFile,
    FetchHomesFilters,
    formatDate,
    FormError,
    GenericIcon,
    GenericMessageBox,
    GenericMultiSelector,
    GenericPageTabsBar,
    GenericSelector,
    GenericSelectorItem,
    Home,
    IconButtonWithTooltip,
    Icons,
    IconSource,
    IPage,
    isDataStateValue,
    ITEMS_PER_PAGE_10,
    ITEMS_PER_PAGE_LIST,
    LoadingComponent,
    LoadingPanel,
    localizeAPIError,
    MainResourceType,
    ModeAPI,
    PageTabSetting,
    PaginationData,
    ReadonlyNonEmptyArray,
    RequiredSome,
    RouteHelper,
    SearchInput,
    SlideOutPanelContainer,
    SlideOutPanelTopBar,
    StringArrayInput,
    StyledDropdownMenu,
    StyledForm,
    StyledPanel,
    StyledSlideOutPanel,
    StyledTable,
    SubResourceType,
    SwitchInput,
    useAuthenticationStore,
    useHasAccessPermission,
    useMenuControlStates,
    User,
    useSnackbar,
    useUIStore,
    useUserLanguage,
} from '@moderepo/bizstack-console-sdk';
import { Button, capitalize, Grid, IconButton, ListItemIcon, styled, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
// import translationConfigJson from '../../biz-console-framework/i18n/translation_config.json';

// This is an example to style a MUI component.
const Paragraph = styled(Typography)(({ theme }) => {
    return {
        lineHeight: 1.5,
        marginBottom: theme.spacing(2),
    };
});

export interface SDKDemoPageProps extends IPage {}

export const SDKDemoPage: React.FC<SDKDemoPageProps> = (props) => {
    // Variables for demo purposes only
    const TEST_HOME_ID = -1;
    const TEST_HOME_NAME = 'Demo Home';
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isNewHome, setIsNewHome] = useState<boolean>(false);
    const [inputValue, setInputValue] = useState<string>(TEST_HOME_NAME);
    const [inputErrorText, setInputErrorText] = useState<string | undefined>();
    const [serverErrorText, setServerErrorText] = useState<string | undefined>();
    const [selectedTab, setSelectedTab] = useState<'tab1' | 'tab2'>('tab1');
    const [tags, setTags] = useState<readonly string[]>();
    const [checked, setChecked] = useState(false);
    const [selectedAssistantChatPlatform, setSelectedAssistantChatPlatform] = useState<AssistantChatPlatform>();
    const [selectedAssistantChatPlatforms, setSelectedAssistantChatPlatforms] = useState<readonly AssistantChatPlatform[]>();
    const GENERIC_SELECTOR_OPTIONS: ReadonlyArray<GenericSelectorItem<AssistantChatPlatform>> = [
        // You can show a group label and a divider '-'
        // {
        //     groupLabelKey: 'Group Header',
        // },
        // '-',
        {
            value: AssistantChatPlatform.DIRECT,
            valueString: AssistantChatPlatform.DIRECT,
            labelKey: 'assistant.chat_platform.direct.label',
        },
        {
            value: AssistantChatPlatform.TEAMS,
            valueString: AssistantChatPlatform.TEAMS,
            labelKey: 'assistant.chat_platform.teams.label',
        },
        {
            value: AssistantChatPlatform.SLACK,
            valueString: AssistantChatPlatform.SLACK,
            labelKey: 'assistant.chat_platform.slack.label',
        },
    ];

    // States used for Table component demo
    const [selectedHome, setSelectedHome] = useState<Home>();
    const [currentPage, setCurrentPage] = useState<number>(0);

    // uiActions provides some global UI actions such as showDialog, setIsLoading, etc.
    const uiActions = useUIStore((store) => {
        return store.actions;
    });

    // BizStack Console uses react-i18next for translation.
    const { t: trans } = useTranslation();

    // BizStack Console uses react-router-dom for page navigation.
    const navigate = useNavigate();

    // userLanguage is used to format date string.
    const userLanguage = useUserLanguage();

    // Show a success message with a snackbar component once users complete either one of the actions of Add/Edit/Delete.
    const { enqueueSnackbar } = useSnackbar();

    // This is how to check if the user has permission to create/read/update/delete a resource.
    // useHasAccessPermission returns true if the user has access permission on the resource.
    // Use `ALL_RESOURCES_ID` if you want to check if the user can create/read/update/delete all homes in the project.
    const canCreateHome = useHasAccessPermission(AccessPermission.CREATE, MainResourceType.HOME, undefined, ALL_RESOURCES_ID);
    // Use `ANY_ONE_OF_RESOURCE_ID` if you want to check if the user can create/read/update/delete at least one home in the project.
    const canReadHome = useHasAccessPermission(AccessPermission.READ, MainResourceType.HOME, undefined, ANY_ONE_OF_RESOURCE_ID);
    // Set the ID of a resource (e.g. homeId) if you want to check if the user can read/update/delete a specific home.
    const canUpdateHome = useHasAccessPermission(AccessPermission.UPDATE, MainResourceType.HOME, undefined, TEST_HOME_ID);
    const canDeleteHome = useHasAccessPermission(AccessPermission.UPDATE, MainResourceType.HOME, undefined, TEST_HOME_ID);

    // useMenuControlStates is a helper hook to provide all the states required for a MUI Menu component.
    const { menuAnchorElement, menuOpened, onCloseMenu, onMenuAnchorElementClick } = useMenuControlStates();

    // This is how to get the current user's information.
    const loggedInUser = useAuthenticationStore((store) => {
        return store.loggedInUser;
    }) as User;
    const projectId = loggedInUser.projectId;

    // This is an example to get data from the back end.
    const [fetchHomesFilters, setFetchHomesFilters] = useState<RequiredSome<FetchHomesFilters, 'limit' | 'skip'>>({
        userId: loggedInUser.id,
        limit: ITEMS_PER_PAGE_10,
        skip: 0,
    });
    const [homesData, setHomesData] = useState<PaginationData<Home> | APIError>();
    useEffect(() => {
        (async () => {
            const response = await ModeAPI.getInstance().getHomes(fetchHomesFilters);
            setHomesData(response);
        })();
    }, [fetchHomesFilters]);

    /**
     * hide the slide out panel
     */
    const hideHomeInfoSlideOutPanel = useCallback(() => {
        uiActions.hideSlideOutPanel();
        setSelectedHome(undefined);
    }, [uiActions]);

    /**
     * Show the slide out panel for showing the provided Home. If no home provided, also show the home info
     * slide out panel which is used for CREATING new home.
     */
    const showHomeInfoSlideOutPanel = useCallback(
        (home: Home | undefined) => {
            uiActions.showSlideOutPanel(
                // Set blockMouseEvents true if you need backdrop
                <SlideOutPanelContainer blockMouseEvents={false}>
                    <SlideOutPanelTopBar onCloseButtonClick={hideHomeInfoSlideOutPanel}>
                        <StyledSlideOutPanel.TopBarPrimaryButtonsContainer>
                            <StyledSlideOutPanel.TopBarPrimaryButton variant="contained" onClick={() => {}}>
                                {trans('common.action.generic.show_more_info.label', { term: trans('term.home') })}
                            </StyledSlideOutPanel.TopBarPrimaryButton>
                        </StyledSlideOutPanel.TopBarPrimaryButtonsContainer>
                    </SlideOutPanelTopBar>
                    <StyledSlideOutPanel.Content>Slide-out panel</StyledSlideOutPanel.Content>
                </SlideOutPanelContainer>
            );
        },
        [hideHomeInfoSlideOutPanel, trans, uiActions]
    );

    /**
     * On home info icon clicked, open the Home slide out panel to show the selected home info.
     */
    const onHomeInfoClicked = useCallback(
        (home: Home) => {
            setSelectedHome(home);
            showHomeInfoSlideOutPanel(home);
        },
        [showHomeInfoSlideOutPanel]
    );

    /**
     * on Search input change
     */
    const onSearchInputChange = useCallback((keywords: string) => {
        setCurrentPage(0);
        setFetchHomesFilters((currentValue) => {
            return {
                ...currentValue,
                skip: 0,
                search: keywords,
            };
        });
    }, []);

    /**
     * On page changed, update the filter's "skip" value
     */
    const onPageChangeHandler = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
        setCurrentPage(newPage);
        setFetchHomesFilters((currentValue) => {
            return {
                ...currentValue,
                skip: newPage * currentValue.limit,
            };
        });
    };

    /**
     * On items per page number changed, update the filter's "limit" value and reset the currentPage
     */
    const onRowsPerPageChangeHandler = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        // Because the items per page number changed, we need to reset the currentPage back to 0
        setCurrentPage(0);
        const itemsPerPage = Number(event.target.value);
        setFetchHomesFilters((currentValue) => {
            return {
                ...currentValue,
                limit: itemsPerPage,
                skip: 0,
            };
        });
    };

    /**
     * On "Edit" button click, enable the edit mode
     */
    const onEditHomeClickHandler = useCallback(() => {
        onCloseMenu();
        setIsEditing(true);
    }, [onCloseMenu]);

    /**
     * Show a confirmation dialog before deletion
     */
    const confirmDeletion = useCallback(
        async (homeId: number, homeName: string, errorMessage?: string) => {
            const onConfirmed = async (): Promise<void> => {
                // // Show a loading spinner before calling the back end
                // await uiActions.setIsLoading(true);
                // const response = await ModeAPI.getInstance().deleteHome(homeId);
                // await uiActions.setIsLoading(false);
                //
                // if (response instanceof APIError) {
                //     // ModeAPI returns APIError if failed. Use `localizeAPIError` to get a user-friendly error message.
                //     await confirmDeletion(homeId, homeName, localizeAPIError(response.errorCode, trans));
                // } else {
                //     // Show a success message with a snackbar component.
                //     setIsEditing(false);
                //     enqueueSnackbar(capitalize(trans('notif.generic_item_deleted_successfully', { item: trans('term.home') })), {
                //         variant: 'success',
                //     });
                // }
                await confirmDeletion(homeId, homeName, 'You cannot delete a home because this is a demo.');
            };

            // ConfirmDeleteDialog is a UI component to show a confirmation dialog for a delete operation.
            // For more general confirmation, use ConfirmDialog or AlertDialog component.
            await uiActions.showDialog(
                <ConfirmDeleteDialog
                    title={trans('dialog.generic_confirm_delete.title', { object_term: trans('term.home') })}
                    message={trans('dialog.generic_confirm_delete.message', {
                        object_term: trans('term.home'),
                        object_name: homeName,
                        object_field: trans('form.input.common.name.label'),
                    })}
                    errorMessage={errorMessage}
                    inputLabel={trans('dialog.generic_confirm_delete.input_label', {
                        object_term: trans('term.home'),
                        object_field: trans('form.input.common.name.label'),
                    })}
                    primaryActionLabel={trans('common.delete')}
                    secondaryActionLabel={trans('common.cancel')}
                    open={true}
                    onClose={function () {
                        uiActions.hideDialog();
                    }}
                    onCancel={function () {
                        uiActions.hideDialog();
                    }}
                    onConfirm={function (inputValue: string | undefined) {
                        uiActions.hideDialog();
                        if (inputValue !== homeName) {
                            confirmDeletion(homeId, homeName, trans('form.input.generic_error.invalid_value'));
                            return;
                        }
                        onConfirmed();
                    }}
                />
            );
        },
        [trans, uiActions]
    );

    /**
     * On "Delete" button click, delete the home.
     */
    const onDeleteHomeClickHandler = useCallback(() => {
        onCloseMenu();
        confirmDeletion(TEST_HOME_ID, TEST_HOME_NAME, undefined);
    }, [TEST_HOME_ID, confirmDeletion, onCloseMenu]);

    /**
     * On "Cancel" edit button clicked, stop editing mode.
     */
    const onCancelEditClickHandler = useCallback(() => {
        setIsEditing(false);
    }, []);

    /**
     * On "Add"/"Update" button clicked, add/update the home.
     */
    const onFormSubmit = useCallback(
        async (event: FormEvent) => {
            event.preventDefault();
            setIsEditing(false);
            enqueueSnackbar(capitalize(trans('notif.generic_item_updated_successfully', { item: trans('term.home') })), {
                variant: 'success',
            });

            // The following is a pseudocode
            //
            // const inputErrors = validate(inputValues);
            // setInputErrorText(inputErrors);
            // if (inputError !== undefined) {
            //     return;
            // }
            //
            // if (isNewHome) {
            //     await uiActions.setIsLoading(true);
            //     const response = await ModeAPI.getInstance().createHome();
            //     await uiActions.setIsLoading(false);
            //     if (response instanceof APIError) {
            //         setServerErrorText(localizeAPIError(response.errorCode, trans));
            //     } else {
            //         setIsEditing(false);
            //         enqueueSnackbar(capitalize(trans('notif.generic_item_added_successfully', { item: trans('term.home') })), {
            //             variant: 'success',
            //         });
            //     }
            // } else {
            //     await uiActions.setIsLoading(true);
            //     const response = await ModeAPI.getInstance().updateHome();
            //     await uiActions.setIsLoading(false);
            //
            //     if (response instanceof APIError) {
            //         setServerErrorText(localizeAPIError(response.errorCode, trans));
            //     } else {
            //         setIsEditing(false);
            //         enqueueSnackbar(capitalize(trans('notif.generic_item_updated_successfully', { item: trans('term.home') })), {
            //             variant: 'success',
            //         });
            //     }
            // }
        },
        [enqueueSnackbar, trans]
    );

    /**
     * Use useEffect to set the page title and breadcrumbs bar
     */
    useEffect(() => {
        // This is how to set the page title.
        uiActions.setPageTitleSettings({
            title: 'UI component demo',
            // subtitle: 'you can set a subtitle if needed',
            actionsComponent: canCreateHome && (
                <Button variant="contained" color="primary" startIcon={<Icons.AddOutlined />} onClick={() => {}}>
                    {trans('common.action.generic.add.label', { term: capitalize(trans('term.home')) })}
                </Button>
            ),
        });

        // This is how to set the breadcrumbs.
        const breadcrumbsInfo: Array<BreadcrumbInfo<number>> = [
            { data: 0, label: 'top' },
            { data: 1, label: 'one' },
            { data: 2, label: 'two' },
            { data: 3, label: 'three' },
        ];
        uiActions.setTopActionBarComponents({
            leftComponents: [
                <BreadcrumbBar
                    key={'breadcrumb'}
                    disableLastBreadcrumb={true}
                    breadcrumbsInfo={breadcrumbsInfo}
                    onBreadcrumbClicked={(index: number) => {
                        if (index === 0) {
                            // This is how to navigate the user to a different page.
                            RouteHelper.getInstance(navigate).gotoManageHomesPage(projectId);
                        }
                    }}
                />,
            ],
            rightComponents: undefined,
        });

        // This is how to set the tabs.
        const tabsList: ReadonlyNonEmptyArray<PageTabSetting<'tab1' | 'tab2'>> = [
            {
                // This tab will be shown for all users since no requiredPermissions
                value: 'tab1',
                label: 'Tab1',
            },
            {
                value: 'tab2',
                label: 'Tab2',
                // Access control sample
                // This tab will be shown only for users who can update the home AND delete devices in the home.
                requiredPermissions: [
                    {
                        accessPermission: AccessPermission.UPDATE,
                        mainResourceType: MainResourceType.HOME,
                        resourceId: TEST_HOME_ID,
                    },
                    {
                        accessPermission: AccessPermission.DELETE,
                        mainResourceType: MainResourceType.HOME,
                        subResourceType: SubResourceType.HOME_DEVICE,
                        resourceId: TEST_HOME_ID,
                    },
                ],
            },
        ];
        uiActions.setTopTabBarComponent(
            <GenericPageTabsBar
                tabs={tabsList}
                selectedTab={selectedTab}
                onTabChange={(selected) => {
                    setSelectedTab(selected);
                }}
            />
        );

        // On component unload, remove the components from the top area
        return () => {
            uiActions.setTopTabBarComponent(undefined);
            uiActions.setTopActionBarComponents(undefined);
            uiActions.setPageTitleSettings(undefined);
        };
    }, [TEST_HOME_ID, canCreateHome, navigate, projectId, selectedTab, trans, uiActions]);

    return (
        // We use MUI Grid component for page layout
        <Grid container spacing={COMPONENTS_SPACING}>
            {/*<Grid item xs={12}>*/}
            {/*    <Typography variant={'h3'}>Translation</Typography>*/}
            {/*    <Paragraph variant={'body1'}>*/}
            {/*        BizStack Console uses <code>react-i18next</code> for translation. You can use the <code>useTranslation</code> hook to access the*/}
            {/*        translation function. Click on the download button below to get the translation config file to see available translations.*/}
            {/*    </Paragraph>*/}
            {/*    <Button*/}
            {/*        variant="text"*/}
            {/*        color="primary"*/}
            {/*        startIcon={<Icons.DownloadOutlined />}*/}
            {/*        onClick={() => {*/}
            {/*            const content = JSON.stringify(translationConfigJson, undefined, 4);*/}
            {/*            const url = window.URL.createObjectURL(new Blob([content], { type: 'application/json;charset=utf-8' }));*/}
            {/*            downloadFile(url, 'translation_config.json');*/}
            {/*        }}*/}
            {/*    >*/}
            {/*        Download translation config*/}
            {/*    </Button>*/}
            {/*</Grid>*/}
            <Grid item xs={12}>
                <Typography variant={'h3'}>StyledPanel</Typography>
                <Paragraph variant={'body1'}>The StyledPanel component is a container for grouping information.</Paragraph>
                <StyledPanel.Panel borderless={false}>
                    <StyledForm.FormContainer>
                        <StyledForm.Form onSubmit={onFormSubmit}>
                            <StyledPanel.HeaderBar>
                                <StyledPanel.HeaderBarLeftContent>
                                    <StyledPanel.HeaderBarIconContainer>
                                        <Icons.HomeOutlined />
                                    </StyledPanel.HeaderBarIconContainer>
                                    {isEditing && isNewHome ? (
                                        <StyledPanel.HeaderBarTitle>
                                            {trans('panel.generic.add.title', { term: trans('term.home') })}
                                        </StyledPanel.HeaderBarTitle>
                                    ) : isEditing ? (
                                        <StyledPanel.HeaderBarTitle>
                                            {trans('panel.generic.edit.title', { term: trans('term.home') })}
                                        </StyledPanel.HeaderBarTitle>
                                    ) : (
                                        <StyledPanel.HeaderBarTitle>
                                            {trans('panel.generic.info.title', { term: trans('term.home') })}
                                        </StyledPanel.HeaderBarTitle>
                                    )}
                                </StyledPanel.HeaderBarLeftContent>
                                {/* This is a StyledDropdownMenu demo. */}
                                {!isEditing && (canDeleteHome || canUpdateHome) && (
                                    <StyledPanel.HeaderBarRightContent>
                                        <IconButton onClick={onMenuAnchorElementClick}>
                                            <Icons.KebabMenu />
                                        </IconButton>
                                        <StyledDropdownMenu.StyledDropdownMenu open={menuOpened} onClose={onCloseMenu} anchorEl={menuAnchorElement}>
                                            {/* Hide the link if the user doesn't have permission */}
                                            {canUpdateHome && (
                                                <StyledDropdownMenu.StyledDropdownMenuItem onClick={onEditHomeClickHandler}>
                                                    <ListItemIcon>
                                                        <Icons.EditOutlined />
                                                    </ListItemIcon>
                                                    {trans('common.action.generic.edit_resource_info.label', { term: trans('term.home') })}
                                                </StyledDropdownMenu.StyledDropdownMenuItem>
                                            )}
                                            {canUpdateHome && canDeleteHome && <StyledDropdownMenu.StyledDropdownMenuDivider />}
                                            {canDeleteHome && (
                                                <StyledDropdownMenu.StyledDangerDropdownMenuItem onClick={onDeleteHomeClickHandler}>
                                                    <ListItemIcon>
                                                        <Icons.TrashOutlined className="icon" />
                                                    </ListItemIcon>
                                                    {trans('common.action.generic.delete.label', { term: trans('term.home') })}
                                                </StyledDropdownMenu.StyledDangerDropdownMenuItem>
                                            )}
                                        </StyledDropdownMenu.StyledDropdownMenu>
                                    </StyledPanel.HeaderBarRightContent>
                                )}
                            </StyledPanel.HeaderBar>
                            {/* FormError is a component to be used to display a server error */}
                            {serverErrorText !== undefined && (
                                <StyledPanel.Content>
                                    <FormError>{serverErrorText}</FormError>
                                </StyledPanel.Content>
                            )}
                            <StyledPanel.Content>
                                <StyledForm.InputGroup>
                                    {/* TextInputField is a customized version of MUI TextField. */}
                                    <StyledForm.TextInputField
                                        label={trans('form.input.common.name.label')}
                                        required={isEditing}
                                        InputProps={{
                                            readOnly: !isEditing,
                                        }}
                                        // When you use an MUI input component, set the 'outlined' style in editing
                                        variant={isEditing ? 'outlined' : undefined}
                                        error={inputErrorText !== undefined}
                                        helperText={inputErrorText}
                                        value={inputValue}
                                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                            setInputValue(event.target.value);
                                        }}
                                    />
                                    {/* Use formatDate to localize date. You can use Intl.DateTimeFormatOptions options */}
                                    <StyledForm.TextInputField
                                        label={trans('form.input.common.created_at.label')}
                                        InputProps={{ readOnly: true, disabled: isEditing }}
                                        value={formatDate('2024-01-02T03:04:05Z', userLanguage, { fractionalSecondDigits: undefined })}
                                    />
                                    {/* StringArrayInput is often used for a tags input field */}
                                    <StringArrayInput
                                        inputProps={{
                                            // When you use an MUI input component, set the 'outlined' style in editing
                                            variant: isEditing ? 'outlined' : undefined,
                                            // placeholder: 'placeholder text',
                                            label: 'StringArrayInput demo',
                                            InputProps: {
                                                readOnly: !isEditing,
                                            },
                                            // error: errorHelperText !== undefined,
                                            // helperText: errorHelperText,
                                        }}
                                        values={tags}
                                        onChange={setTags}
                                    />
                                    <SwitchInput
                                        readOnly={!isEditing}
                                        label={'SwitchInput demo'}
                                        value={checked}
                                        // error={errorText}
                                        onChange={setChecked}
                                    />
                                    {/* GenericSelector shows a drop-down list so users can select one item */}
                                    <GenericSelector<AssistantChatPlatform>
                                        formControlProps={{
                                            variant: isEditing ? 'outlined' : undefined,
                                            required: false,
                                            // error: errorText,
                                        }}
                                        inputCompProps={{
                                            variant: isEditing ? 'outlined' : undefined,
                                            label: trans('GenericSelector demo'),
                                            readOnly: !isEditing,
                                        }}
                                        // helperText={errorText}
                                        options={GENERIC_SELECTOR_OPTIONS}
                                        showNoValueOption={false}
                                        value={selectedAssistantChatPlatform}
                                        onChange={setSelectedAssistantChatPlatform}
                                    />
                                    {/* GenericMultiSelector is similar to GenericSelector but users can select multiple items */}
                                    <GenericMultiSelector<AssistantChatPlatform>
                                        formControlProps={{
                                            variant: isEditing ? 'outlined' : undefined,
                                            required: false,
                                            // error: errorText,
                                        }}
                                        inputCompProps={{
                                            readOnly: !isEditing,
                                            variant: isEditing ? 'outlined' : undefined,
                                            label: trans('GenericMultiSelector demo'),
                                        }}
                                        // helperText={errorText}
                                        options={GENERIC_SELECTOR_OPTIONS}
                                        values={selectedAssistantChatPlatforms}
                                        onChange={setSelectedAssistantChatPlatforms}
                                        // showNoValueOption=true shows noValueText when values is undefined.
                                        // This is often used to allow users to select "All".
                                        showNoValueOption={true}
                                        noValueText={capitalize(trans('common.all'))}
                                    />
                                </StyledForm.InputGroup>
                            </StyledPanel.Content>
                            {isEditing && (
                                <StyledPanel.FooterBar>
                                    <StyledForm.ActionsBar>
                                        <StyledForm.RightActionsBar>
                                            <StyledForm.ActionButton variant="outlined" onClick={onCancelEditClickHandler}>
                                                {trans('common.cancel')}
                                            </StyledForm.ActionButton>
                                            <StyledForm.ActionButton type="submit" variant="contained">
                                                {trans(isNewHome ? 'common.add' : 'common.update')}
                                            </StyledForm.ActionButton>
                                        </StyledForm.RightActionsBar>
                                    </StyledForm.ActionsBar>
                                </StyledPanel.FooterBar>
                            )}
                        </StyledForm.Form>
                    </StyledForm.FormContainer>
                </StyledPanel.Panel>
            </Grid>
            <Grid item xs={12}>
                <Typography variant={'h3'}>StyledTable</Typography>
                <Paragraph variant={'body1'}>The StyledTable is a styled version of MUI Table component.</Paragraph>
                <StyledPanel.Panel>
                    <StyledPanel.HeaderBar>
                        <StyledPanel.HeaderBarLeftContent>
                            <StyledPanel.FilterBar>
                                <StyledPanel.FilterBarFilter>
                                    {/* SearchInput is a TextField component to input search keywords. */}
                                    <SearchInput onChange={onSearchInputChange} value={fetchHomesFilters.search} />
                                </StyledPanel.FilterBarFilter>
                            </StyledPanel.FilterBar>
                        </StyledPanel.HeaderBarLeftContent>
                    </StyledPanel.HeaderBar>
                    <StyledPanel.Content>
                        {homesData instanceof APIError && <GenericMessageBox message={localizeAPIError(homesData.errorCode, trans)} />}
                        {!isDataStateValue(homesData) && <LoadingComponent />}
                        {isDataStateValue(homesData) && (
                            <>
                                <StyledTable.StyledTableContainer>
                                    {homesData.data.length === 0 && (
                                        <GenericMessageBox
                                            title={trans('common.generic_no_data.message', { term: trans('term.home', { count: 2 }) })}
                                        />
                                    )}
                                    {homesData.data.length !== 0 && (
                                        <StyledTable.StyledTable>
                                            <StyledTable.StyledTableHeader borderless>
                                                <StyledTable.StyledHeaderRow>
                                                    <StyledTable.StyledHeaderCell></StyledTable.StyledHeaderCell>
                                                    <StyledTable.StyledHeaderCell>
                                                        {trans('table.column.common.id.label')}
                                                    </StyledTable.StyledHeaderCell>
                                                    <StyledTable.StyledHeaderCell width={'100%'}>
                                                        {trans('table.column.common.name.label')}
                                                    </StyledTable.StyledHeaderCell>
                                                    <StyledTable.StyledHeaderCell align={'center'} width={'100'}>
                                                        {trans('table.column.common.status.label')}
                                                    </StyledTable.StyledHeaderCell>
                                                    <StyledTable.StyledHeaderCell>
                                                        {trans('table.column.common.created_at.label')}
                                                    </StyledTable.StyledHeaderCell>
                                                </StyledTable.StyledHeaderRow>
                                            </StyledTable.StyledTableHeader>
                                            <StyledTable.StyledTableBody>
                                                {homesData.data.map((home) => {
                                                    return (
                                                        <StyledTable.StyledBodyRow
                                                            key={home.id}
                                                            className="clickable"
                                                            selected={selectedHome?.id === home.id}
                                                            onClick={() => {
                                                                setSelectedHome(home);
                                                            }}
                                                        >
                                                            <StyledTable.StyledBodyInfoCell align={'center'}>
                                                                <StyledTable.StyledInfoButton
                                                                    title={trans('common.info')}
                                                                    onClick={(event) => {
                                                                        event.stopPropagation();
                                                                        onHomeInfoClicked(home);
                                                                    }}
                                                                >
                                                                    <Icons.InfoOutlined className="outlined" />
                                                                    <Icons.Info className="solid" />
                                                                </StyledTable.StyledInfoButton>
                                                            </StyledTable.StyledBodyInfoCell>
                                                            <StyledTable.StyledBodyCell>{home.id}</StyledTable.StyledBodyCell>
                                                            <StyledTable.StyledBodyCell wrapContent={true}>{home.name}</StyledTable.StyledBodyCell>
                                                            <StyledTable.StyledBodyCell align={'center'}>
                                                                <StyledTable.StatusChip
                                                                    status={home.deactivated === true ? 'error' : 'info'}
                                                                    label={
                                                                        home.deactivated === true
                                                                            ? trans('common.deactivated')
                                                                            : trans('common.active')
                                                                    }
                                                                />
                                                            </StyledTable.StyledBodyCell>
                                                            <StyledTable.StyledBodyCell>
                                                                {formatDate(home.creationTime, userLanguage, {
                                                                    fractionalSecondDigits: undefined,
                                                                })}
                                                            </StyledTable.StyledBodyCell>
                                                        </StyledTable.StyledBodyRow>
                                                    );
                                                })}
                                            </StyledTable.StyledTableBody>
                                        </StyledTable.StyledTable>
                                    )}
                                </StyledTable.StyledTableContainer>

                                <StyledTable.StyledTablePagination
                                    count={homesData.range?.total ?? -1}
                                    rowsPerPageOptions={ITEMS_PER_PAGE_LIST}
                                    page={currentPage}
                                    rowsPerPage={fetchHomesFilters.limit}
                                    showFirstButton={true}
                                    showLastButton={true}
                                    labelRowsPerPage={trans('pagination.items_per_page.label')}
                                    labelDisplayedRows={({ from, to, count }) => {
                                        if (count === -1) {
                                            return trans('pagination.unknown_total.current_page.label', { from, to, total: count });
                                        }
                                        return trans('pagination.known_total.current_page.label', { from, to, total: count });
                                    }}
                                    onPageChange={onPageChangeHandler}
                                    onRowsPerPageChange={onRowsPerPageChangeHandler}
                                />
                            </>
                        )}
                    </StyledPanel.Content>
                </StyledPanel.Panel>
            </Grid>
            <Grid item xs={12}>
                <Typography variant={'h3'}>Tooltip</Typography>
                <Paragraph variant={'body1'}>
                    ButtonWithTooltip is a helper component to show a MUI Button with tooltip. In general, a Button should have a text label to
                    clarify the action. If there is no enough spase, use this component to show a Button with tooltip. Similarly,
                    IconButtonWithTooltip shows a MUI IconButton with tooltip.
                </Paragraph>
                <ButtonWithTooltip title="Info">
                    <Icons.InfoOutlined />
                </ButtonWithTooltip>
                <IconButtonWithTooltip title="Info">
                    <Icons.InfoOutlined />
                </IconButtonWithTooltip>
                <Paragraph variant={'body1'}>
                    ComponentWithTooltip is a generic reusable component that can be used for adding Tooltip to any component.
                </Paragraph>
                <ComponentWithTooltip title="Unlock the full potential of your IoT data">BizStack</ComponentWithTooltip>
            </Grid>
            <Grid item xs={12}>
                <Typography variant={'h3'}>GenericIcon</Typography>
                <Paragraph variant={'body1'}>GenericIcon is a component used to display icons from any source, MUI or BizStack Console.</Paragraph>
                <GenericIcon source={IconSource.MUI} name="AccountCircle" />
                <GenericIcon source={IconSource.BIZ_CONSOLE} name="Dashboard" />
            </Grid>
            <Grid item xs={12}>
                <Typography variant={'h3'}>Loading</Typography>
                <Paragraph variant={'body1'}>
                    The LoadingComponent/LoadingPanel component is used for showing that a component/panel is loading.
                </Paragraph>
                <LoadingComponent />
                <LoadingPanel />
            </Grid>
            <Grid item xs={12}>
                <Typography variant={'h3'}>GenericMessageBox</Typography>
                <Paragraph variant={'body1'}>GenericMessageBox is a block component to display a message to the users.</Paragraph>
                <GenericMessageBox message={trans('common.generic_no_data.message', { term: trans('common.data') })} />
                <GenericMessageBox icon={<Icons.InfoOutlined />} title={'title'} titleVariant={'h4'} message={'message'} messageVariant={'h4'} />
            </Grid>
        </Grid>
    );
};

export default SDKDemoPage;
