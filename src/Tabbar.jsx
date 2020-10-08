import React from "react";

import { Epic, Tabbar, TabbarItem } from "@vkontakte/vkui";

/**
 * @description Умный таббар
 * @param {string} id - Идентификатор, который передается Epic внутри компонента
 * @param {string} activeStory - Идентификатор начальной страницы (Page)
 * @param {boolean} show=true - Показывать таббар
 */
export default function NTabbar({ activeStory: activeTabbarStory, id, children, showModal, hideModal, goPage, isModalOpen, pageParams, show = true }) {

	const [{ activeStory }, setTabbar] = React.useReducer((state, updatedState) => {
		return {
			...state,
			...updatedState
		};
	}, {
		activeStory: activeTabbarStory
	});

	const goStory = ({ currentTarget }) => {
		setTabbar({
			activeStory: currentTarget.dataset.story
		});
	};

	const __buildBar = (items) => {
		return (
			<Tabbar>
				{React.Children.map(items, (Child, key) => (
					<TabbarItem
						key={key}
						onClick={goStory}
						selected={activeStory === Child.props.id}
						data-story={Child.props.id}
						text={Child.props.title || ""}
						children={Child.props.icon || null}
						label={Child.props.label || ""}
					/>
				))}
			</Tabbar>
		);
	};

	const tabbar = __buildBar(children);

	return (
		<Epic id={id} activeStory={activeStory} tabbar={show ? tabbar : null}>
			{React.Children.map(children, (Child) =>
				React.cloneElement(Child, {
					...Child.props,
					goPage,
					showModal,
					hideModal,
					isModalOpen,
					pageParams
				})
			)}
		</Epic>
	);
}