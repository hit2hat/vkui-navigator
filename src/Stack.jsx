import React from "react";
import VKBridge from "@vkontakte/vk-bridge";

import { Root, ModalRoot, ModalPageHeader, PanelHeaderButton, ConfigProvider, ANDROID, IOS, platform } from "@vkontakte/vkui";
import { Icon24Cancel, Icon24Dismiss } from "@vkontakte/icons";

/**
 * @description Корневой элемент навигации
 * @param {string} activePage - Идентификатор активной страницы
 * @param {Array} [modals=[]] - Массив модальных окон
 * @param children
 * @param modal
 * @param disabledConfigProvider
 * @param webviewType
 * @param scheme
 * @param isWebView
 * @param transitionMotionEnabled
 * @param appearance
 */

export function Stack({ activePage: activeStackPage, modals = [], children, modal, disabledConfigProvider, webviewType, scheme, isWebView, transitionMotionEnabled, appearance }) {

    const [{ modalHistory, activeModal, modalParams, activePage, pageParams }, setStack] = React.useReducer((state, updatedState) => {
        return {
            ...state,
            ...updatedState
        };
    }, {
        activePage: activeStackPage,
        activeModal: null,
        modalHistory: [],
        modalParams: {},
        pageParams: {}
    });

    /**
     * @description Функция для перехода между Page (View)
     * @param {string} newPage - Название Page (View)
     * @param params - Дополнительные параматры, кроторые необходимо передать в Page (View)
     */
    const goPage = (newPage, params) => {
        VKBridge.send("VKWebAppDisableSwipeBack", {});

        setStack({
            activePage: newPage,
            pageParams: params
        });
    };

    /**
     * @description Функция, которая показывает модальное окно
     * @param {string} newModal - Название модального окна
     * @param params - Дополнительные параматры, кроторые необходимо передать в Page (View)
     */
    const showModal = (newModal, params) => {
        setStack({
            activeModal: newModal,
            modalHistory: modalHistory.includes(newModal) ?
                modalHistory.splice(0, modalHistory.indexOf(newModal) + 1)
                :
                [
                    ...modalHistory,
                    newModal
                ],
            modalParams: params
        });
    };

    /**
     * @description Функция, которая скрывает все модальные окна
     */
    const hideModal = () => {
        setStack({
            activeModal: null,
            modalHistory: []
        });
    };

    const navigatorObject = {
        goPage,
        showModal,
        hideModal
    };

    const __buildModals = () => {
        if (modals.length === 0) {
            return null;
        }

        return (
            <ModalRoot
                activeModal={activeModal}
                children={
                    React.Children.map(modals, (Child) => (
                        React.cloneElement(Child, {
                            ...Child.props,
                            onClose: window.history.back.bind(window.history),
                            header: (
                                <ModalPageHeader
                                    left={(platform() === ANDROID) && <PanelHeaderButton onClick={window.history.back.bind(window.history)} children={<Icon24Cancel/>}/>}
                                    right={(platform() === IOS)  && <PanelHeaderButton onClick={window.history.back.bind(window.history)} children={<Icon24Dismiss/>}/>}
                                    children={Child.props.title || ""}
                                />
                            ),
                            navigator: {
                                ...navigatorObject,
                                params: Child.props.id === activeModal ? modalParams : {}
                            }
                        })
                    ))
                }
            />
        );
    };

    const root = (
        <Root activeView={activePage} modal={__buildModals(modal)}>
            {React.Children.map(children, (Child) =>
                React.cloneElement(Child, {
                    id: Child.props.id,
                    showModal,
                    hideModal,
                    goPage,
                    isModalOpen: activeModal !== null,
                    pageParams
                })
            )}
        </Root>
    );

    if (disabledConfigProvider) {
        return root;
    }

    return (
        <ConfigProvider
            webviewType={webviewType}
            isWebView={isWebView}
            scheme={scheme}
            transitionMotionEnabled={transitionMotionEnabled}
            appearance={appearance}
        >
            {root}
        </ConfigProvider>
    );
}