import React from "react";
import PropTypes from "prop-types";

import Epic from "@vkontakte/vkui/dist/components/Epic/Epic";
import Tabbar from "@vkontakte/vkui/dist/components/Tabbar/Tabbar";
import TabbarItem from "@vkontakte/vkui/dist/components/TabbarItem/TabbarItem";

class NTabbar extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			activeStory: props.activeStory
		};

		this.__buildBar = this.__buildBar.bind(this);
		this.goStory = this.goStory.bind(this);
	}

	goStory(e) {
		this.setState({ activeStory: e.currentTarget.dataset.story });
	}

	__buildBar(items) {
		const { goStory } = this;
		const { activeStory } = this.state;

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
	}

	render() {
		const { id, children, showModal, hideModal, goPage, isModalOpen, pageParams } = this.props;
		const { activeStory } = this.state;
		const { __buildBar } = this;

		return (
			<Epic id={id} activeStory={activeStory} tabbar={__buildBar(children)}>
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
}

export default NTabbar;