import React from "react";
import PropTypes from "prop-types";
import vkConnect from "@vkontakte/vk-connect";

import View from "@vkontakte/vkui/dist/components/View/View";
import ScreenSpinner from "@vkontakte/vkui/dist/components/ScreenSpinner/ScreenSpinner";
import Alert from "@vkontakte/vkui/dist/components/Alert/Alert";

import ModalRoot from "@vkontakte/vkui/dist/components/ModalRoot/ModalRoot";
import ModalPageHeader from "@vkontakte/vkui/dist/components/ModalPageHeader/ModalPageHeader";
import HeaderButton from "@vkontakte/vkui/dist/components/HeaderButton/HeaderButton";

import { withPlatform, ANDROID, IOS } from "@vkontakte/vkui";
import Icon24Cancel from "@vkontakte/icons/dist/24/cancel";
import Icon24Dismiss from "@vkontakte/icons/dist/24/dismiss";

class Page extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			activePanel: props.homePanel,
			homePanel: props.homePanel,
			history: [ props.homePanel ],
			popout: null,
			activeModal: null,
			modalHistory: [],
			params: {},
			modalParams: {}
		};

		this.popBack = this.popBack.bind(this);

		this.go = this.go.bind(this);
		this.goView = this.props.goView;
		this.goBack = this.goBack.bind(this);
		this.showModal = this.showModal.bind(this);
		this.hideModal = this.hideModal.bind(this);
		this.showPopout = this.showPopout.bind(this);
		this.showLoader = this.showLoader.bind(this);
		this.hideLoader = this.hideLoader.bind(this);
		this.showDialog = this.showDialog.bind(this);

		this.navigatorObject = {
			go: this.go,
			goView: this.goView,
			goBack: this.goBack,
			showModal: this.showModal,
			hideModal: this.hideModal,
			showPopout: this.showPopout,
			showLoader: this.showLoader,
			hideLoader: this.hideLoader,
			showDialog: this.showDialog
		};
	}

	/*
		Функция перехода на следующую панель
		params:
			@newPanel - id новой панели
			@params - параметры, которые передаются в новую панель
					  в качестве prop-параметра `params`
	 */
	go(newPanel, params={}) {
		const { activePanel, homePanel, history } = this.state;

		if (activePanel === homePanel) {
			vkConnect.send("VKWebAppEnableSwipeBack", {});
		}

		window.history.pushState({ panel: newPanel }, newPanel);
		this.setState({
			activePanel: newPanel,
			history: [ ...history, newPanel ],
			popout: null,
			activeModal: null,
			modalParams: {},
			params
		});
	}

	/*
		Функция возврата на предыдущую панель
	 */
	goBack(isPop) {
		const { history, popout, homePanel } = this.state;

		if (history.length === 1) return null;
		if (popout !== null) {
			if (isPop) {
				return this.setState({
					popout: null
				});
			}
		}

		const newPanel = history[history.length - 2];
		if (newPanel === homePanel) {
			vkConnect.send("VKWebAppDisableSwipeBack", {});
		}

		window.history.pushState({ panel: newPanel  }, newPanel);
		this.setState({
			activePanel: newPanel,
			history: history.slice(0, history.length - 1),
			popout: null,
			activeModal: null,
			modalParams: {},
		});
	}

	/*
		Функция установки popout
		params:
			@obj - объект popout
	 */
	showPopout(obj) {
		this.setState({ popout: obj });
	}

	/*
		Заготовки popout'ов
	 */
	showLoader() {
		this.showPopout(<ScreenSpinner/>);
	}
	hideLoader() {
		this.showPopout(null);
	}
	showDialog({ title, description, buttonText, action }) {
		this.showPopout(
			<Alert
				actionsLayout="vertical"
				actions={[
					{
						title: buttonText || "Удалить",
						action,
						style: "destructive"
					},
					{
						title: "Отмена",
						autoclose: true,
						style: "cancel"
					}
				]}
				onClose={() => this.showPopout(null)}
			>
				<h2>{title}</h2>
				<p>{description}</p>
			</Alert>
		);
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
		const { hideModal, navigatorObject } = this;
		const { platform } = this.props;

		return (
			<ModalRoot
				activeModal={activeModal}
				children={
					React.Children.map(modals, (Child) => (
						React.cloneElement(Child, {
							...Child.props,
							onClose: hideModal,
							header: (
								<ModalPageHeader
									left={(platform === ANDROID) && <HeaderButton onClick={hideModal} children={<Icon24Cancel/>}/>}
									right={(platform === IOS)  && <HeaderButton onClick={hideModal} children={<Icon24Dismiss/>}/>}
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

	popBack() {
		this.goBack(true);
	}

	componentDidMount() {
		const { homePanel } = this.state;

		vkConnect.send("VKWebAppDisableSwipeBack", {});
		window.addEventListener("popstate", this.popBack);
		window.history.replaceState({ panel: homePanel }, homePanel);
	}

	componentWillUnmount() {
		window.removeEventListener("popstate", this.popBack);
	}

	render() {
		const { id, children } = this.props;
		const { activePanel, history, popout, params } = this.state;
		const { goBack, navigatorObject } = this;
		const modal = this.__buildModals();

		return (
			<View
				id={id}
				activePanel={activePanel}
				history={history}
				popout={popout}
				modal={modal}
				onSwipeBack={goBack}
			>
				{React.Children.map(children, (Child) =>
					React.cloneElement(Child, {
						id: Child.props.id,
						navigator: {
							...navigatorObject,
							params: Child.props.id === activePanel ? params : {}
						}
					})
				)}
			</View>
		);
	}
}

Page.propTypes = {
	id: PropTypes.string.isRequired,
	homePanel: PropTypes.string.isRequired,
	children: PropTypes.any
};

PropTypes.defaultProps = {
	children: []
};

export default withPlatform(Page);