import React, { useEffect } from "react";
import VKBridge from "@vkontakte/vk-bridge";

import { View, ScreenSpinner, Alert } from "@vkontakte/vkui";

/**
 * @description Основная единица модуля. Включает в себя логику навигации между панелями
 * @param {string} activePanel - Идентификатор начальной панели
 * @param {boolean} header=true - Показыть PanelHeader
 * @param children
 */
export function Page({ activePanel: activePagePanel, header: visiblePageHeader = true, goPage, isModalOpen, showModal: showPageModal, hideModal: hidePageModal, id, children = [], pageParams }) {

	const [{ activePanel, homePanel, history, popout, params, header }, setPage] = useReducer((state, updatedState) => {
		return {
			...state,
			...updatedState
		};
	}, {
		activePanel: activePagePanel,
		homePanel: activePagePanel,
		history: [ activePagePanel ],
		popout: null,
		params: {},
		header: visiblePageHeader
	});

	/**
	 * @description Функция для перехода на нужную панель
	 * @param {string} panel - ID-панели для перехода
	 * @param params={} - Дополнительные параметры, которые передаются в панель в качестве prop-параметра `params`
	 */
	const go = (panel, params = {}) => {
		if (activePanel === homePanel) {
			VKBridge.send("VKWebAppEnableSwipeBack", {});
		}

		window.history.pushState({
			panel,
			modal: null
		}, panel);

		setPage({
			activePanel: panel,
			history: [...history, panel],
			popout: null,
			params
		});
	};

	/**
	 * @description Функция возврата на предыдущую панель
	 */
	const popBack = () => {
		if (popout !== null) {
			return setPage({
				popout: null
			});
		}

		if (isModalOpen) {
			return hideModal();
		}

		if (history.length === 1) {
			return null;
		}

		const newPanel = history[history.length - 2];
		if (newPanel === homePanel) {
			VKBridge.send("VKWebAppDisableSwipeBack", {});
		}

		setPage({
			activePanel: newPanel,
			history: history.slice(0, history.length - 1),
			popout: null,
			activeModal: null,
			modalHistory: [],
			modalParams: {},
		});
	};

	/**
	 * @description Функция установки popout
	 * @param popout - Объект popout
	 */
	const showPopout = (popout) => {
		setPage({
			popout
		});
	};

	// Заготовки popout'ов

	const showLoader = () => {
		showPopout(<ScreenSpinner/>);
	};
	const hideLoader = () => {
		showPopout(null);
	};
	const showDialog = ({ title, description, buttonText, action }) => {
		showPopout(
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
				onClose={() => showPopout(null)}
			>
				<h2>{title}</h2>
				<p>{description}</p>
			</Alert>
		);
	};
	const showAlert = ({ title, description }) => {
		showPopout(
			<Alert
				actions={[
					{
						title: "Закрыть",
						autoclose: true,
						style: "cancel"
					}
				]}
				onClose={() => showPopout(null)}
			>
				<h2>{title}</h2>
				<p>{description}</p>
			</Alert>
		);
	};

	/**
	 * @description Функция, которая показывает модальное окно
	 * @param modal - Название модального окна
	 * @param params={} - Дополнительные параметры, которые передаются в модальное окно в качестве prop-параметра `params`
	 */
	const showModal = (modal, params = {}) => {
		VKBridge.send("VKWebAppDisableSwipeBack", {});
		window.history.pushState({
			panel: activePanel,
			modal
		}, activePanel);

		showPageModal(modal, params);
	};

	/**
	 * @description Функция, которая скрывает все модальные окна
	 */
	const hideModal = () => {
		if (activePanel !== homePanel) {
			VKBridge.send("VKWebAppEnableSwipeBack", {});
		}

		hidePageModal();
	};

	/**
	 * @description Функция для скрытия PanelHeader
	 * @param {boolean} header - Скрыть панель
	 */
	const headerVisible = (header) => {
		setPage({
			header
		});
	};

	useEffect(() => {
		VKBridge.send("VKWebAppDisableSwipeBack", {});
		window.addEventListener("popstate", popBack);
		window.history.replaceState({
			panel: homePanel
		}, homePanel);

		return () => {
			window.removeEventListener("popstate", popBack);

			for (let i = 0; i < history.length - 1; i++) {
				window.history.back()
			}
		};
	}, []);

	const navigatorObject = {
		go,
		goPage,
		goBack: window.history.back.bind(window.history),
		showModal,
		hideModal: () => window.history.back,
		showPopout,
		showLoader,
		hideLoader,
		showDialog,
		showAlert,
		headerVisible
	};

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
