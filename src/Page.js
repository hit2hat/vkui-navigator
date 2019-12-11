import React from "react";
import PropTypes from "prop-types";
import vkConnect from "@vkontakte/vk-connect";

import View from "@vkontakte/vkui/dist/components/View/View";
import ScreenSpinner from "@vkontakte/vkui/dist/components/ScreenSpinner/ScreenSpinner";
import Alert from "@vkontakte/vkui/dist/components/Alert/Alert";

class Page extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			activePanel: props.activePanel,
			homePanel: props.activePanel,
			history: [ props.activePanel ],
			popout: null,
			params: {},
			header: props.header
		};


		this.go = this.go.bind(this);
		this.goPage = this.props.goPage;
		this.popBack = this.popBack.bind(this);
		this.showModal = this.showModal.bind(this);
		this.hideModal = this.hideModal.bind(this);
		this.showPopout = this.showPopout.bind(this);
		this.showLoader = this.showLoader.bind(this);
		this.hideLoader = this.hideLoader.bind(this);
		this.showDialog = this.showDialog.bind(this);
		this.showAlert = this.showAlert.bind(this);
		this.headerVisible = this.headerVisible.bind(this);

		this.navigatorObject = {
			go: this.go,
			goPage: this.goPage,
			goBack: window.history.back.bind(window.history),
			showModal: this.showModal,
			hideModal: () => window.history.back,
			showPopout: this.showPopout,
			showLoader: this.showLoader,
			hideLoader: this.hideLoader,
			showDialog: this.showDialog,
			showAlert: this.showAlert,
			headerVisible: this.headerVisible
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

		window.history.pushState({ panel: newPanel, modal: null }, newPanel);
		this.setState({
			activePanel: newPanel,
			history: [ ...history, newPanel ],
			popout: null,
			params
		});
	}

	/*
		Функция возврата на предыдущую панель
	 */
	popBack() {
		const { history, popout, homePanel } = this.state;
		const { isModalOpen } = this.props;
		const { hideModal } = this;

		if (popout !== null) {
			this.setState({
				popout: null
			});
			return;
		}

		if (isModalOpen) {
			hideModal();
			return;
		}

		if (history.length === 1) return null;

		const newPanel = history[history.length - 2];
		if (newPanel === homePanel) {
			vkConnect.send("VKWebAppDisableSwipeBack", {});
		}

		this.setState({
			activePanel: newPanel,
			history: history.slice(0, history.length - 1),
			popout: null,
			activeModal: null,
			modalHistory: [],
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
	showAlert({ title, description }) {
		this.showPopout(
			<Alert
				actions={[{
					title: 'Закрыть',
					autoclose: true,
					style: 'cancel'
				}]}
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
		const { showModal } = this.props;
		const { activePanel } = this.state;

		vkConnect.send("VKWebAppDisableSwipeBack", {});
		window.history.pushState({ panel: activePanel, modal: newModal }, activePanel);

		showModal(newModal, params);
	}

	/*
		Функция, которая скрывает все модальные окна
	 */
	hideModal() {
		const { hideModal } = this.props;
		const { activePanel, homePanel } = this.state;

		if (activePanel !== homePanel) {
			vkConnect.send("VKWebAppEnableSwipeBack", {});
		}

		hideModal();
	}

	headerVisible(newValue) {
		this.setState({ header: newValue });
	}

	componentDidMount() {
		const { homePanel } = this.state;

		vkConnect.send("VKWebAppDisableSwipeBack", {});
		window.addEventListener("popstate", this.popBack);
		window.history.replaceState({ panel: homePanel }, homePanel);
	}

	componentWillUnmount() {
		const { history } = this.state;
		window.removeEventListener("popstate", this.popBack);
		for(let i = 0; i < history.length - 1; i++) {
			window.history.back()
		}
	}

	render() {
		const { id, children, pageParams } = this.props;
		const { activePanel, history, popout, params, header } = this.state;
		const { navigatorObject } = this;

		return (
			<View
				id={id}
				activePanel={activePanel}
				history={history}
				popout={popout}
				header={header}
				onSwipeBack={window.history.back.bind(window.history)}
			>
				{React.Children.map(children, (Child) =>
					React.cloneElement(Child, {
						id: Child.props.id,
						navigator: {
							...navigatorObject,
							params: Child.props.id === activePanel ? { ...params, pageParams } : {}
						}
					})
				)}
			</View>
		);
	}
}

Page.propTypes = {
	id: PropTypes.string.isRequired,
	activePanel: PropTypes.string.isRequired,
	children: PropTypes.any,
	header: PropTypes.bool
};

PropTypes.defaultProps = {
	children: []
};

export default Page;
