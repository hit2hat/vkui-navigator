import React from "react";
import PropTypes from "prop-types";
import VKBridge from "@vkontakte/vk-bridge";

import {
    Root,
    ModalRoot,
    ModalPageHeader,
    PanelHeaderButton,
    ConfigProvider,
    withPlatform,
    ANDROID,
    IOS
} from "@vkontakte/vkui";

import Icon24Cancel from "@vkontakte/icons/dist/24/cancel";
import Icon24Dismiss from "@vkontakte/icons/dist/24/dismiss";

class Stack extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            activePage: props.activePage,
            activeModal: null,
            modalHistory: [],
            modalParams: {},
            pageParams: {}
        };

        this.goPage = this.goPage.bind(this);
        this.showModal = this.showModal.bind(this);
        this.hideModal = this.hideModal.bind(this);

        this.navigatorObject = {
            goPage: this.goPage,
            showModal: this.showModal,
            hideModal: window.history.back.bind(window.history)
        };
    }

    /*
        Функция для перехода между Page (View)
     */
    goPage(newPage, params={}) {
        VKBridge.send("VKWebAppDisableSwipeBack", {});
        this.setState({
            activePage: newPage,
            pageParams: params
        });
    }

    /*
        Функция, которая показывает модальное окно
        params:
            @newModal - название нового модального окна
     */
    showModal(newModal, params={}) {
        const { modalHistory } = this.state;

        this.setState({
            activeModal: newModal,
            modalHistory: modalHistory.indexOf(newModal) !== -1
                ? modalHistory.splice(0, modalHistory.indexOf(newModal) + 1)
                : [ ...modalHistory, newModal ],
            modalParams: params
        });
    }

    /*
        Функция, которая скрывает все модальные окна
     */
    hideModal() {
        this.setState({
            activeModal: null,
            modalHistory: []
        });
    }

    __buildModals() {
        const modals = this.props.modals || [];
        if (modals.length === 0) return null;

        const { activeModal, modalParams } = this.state;
        const { navigatorObject } = this;
        const { platform } = this.props;

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
                                    left={(platform === ANDROID) && <PanelHeaderButton onClick={window.history.back.bind(window.history)} children={<Icon24Cancel/>}/>}
                                    right={(platform === IOS)  && <PanelHeaderButton onClick={window.history.back.bind(window.history)} children={<Icon24Dismiss/>}/>}
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

    render() {
        const { activePage, activeModal, pageParams } = this.state;
        const { showModal, hideModal, goPage } = this;
        const { children, modal, disabledConfigProvider, webviewType, scheme, isWebView, transitionMotionEnabled, appearance } = this.props;

        const modals = this.__buildModals(modal);
        const root = (
            <Root activeView={activePage} modal={modals}>
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
}

Stack.propTypes = {
    activePage: PropTypes.string.isRequired,
    scheme: PropTypes.string.isRequired
};

Stack.defaultProps = {
    scheme: "bright_light"
};

export default withPlatform(Stack);
