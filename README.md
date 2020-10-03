<div align="center">
  <a href="https://github.com/VKCOM">
    <img src="https://camo.githubusercontent.com/8968dddef792b7ec783137da9cd3779a0ba7dde2/68747470733a2f2f766b2e636f6d2f696d616765732f617070732f6d696e695f617070732f766b5f6d696e695f617070735f6c6f676f2e737667" alt="VK Logo"/>
  </a>
</div>

# VKUI Navigator
Данный модуль позволяет быстро и просто создать базовую логику навигации
для сервиса на платформе VK Mini Apps. Поддерживает все необходимые
функции и инкапсулирует в себе базовое поведение на всех платформах (такое как
свайпы на iOS и кнопка "назад" на Android)

## Демо приложение 📱
* [Открыть ВКонтакте](https://vk.com/app7171285)
* [Исходный код](https://github.com/hit2hat/vkui-navigator-example)

## Установка 📦
Выполните `yarn add vkui-navigator` или `npm i vkui-navigator`

## Быстрый старт 🚀
```javascript
import { Stack, Page } from "vkui-navigator";

// simple usage
<Stack activePage="page1">
    <Page id="page1" activePanel="welcome">
        <Welcome id="welcome"/>
    </Page>
</Stack>
```

## Принцип работы
Вокруг ваших панелей создается View со втроенной базовой логикой.
Каждой панели передается в props объект `navigator`. В нем содержаться
методы и параметры, который вы передали из предыдущей панели. Также
есть поддержка модальных окон и попапов

## API Справочник
### <a id="stack" name="stack"></a>  Stack

▸ Корневой элемент навигации

**Props:**

Название | Тип | Описание |
------ | ------ | ------ |
`activePage` | string, required | Идентификатор активной страницы |
`modals` | array of node | Массив модальных окон |
___
### <a id="page" name="page"></a>  Page

▸ Основная единица модуля. Включает в себя логику навигации между панелями 

**Props:**

Название | Тип | Описание |
------ | ------ | ------ |
`id` | string, required | Идентификатор, который передается View внутри компонента |
`activePanel` | string | Идентификатор начальной панели |
`header` | bool | Показать/скрыть header (эквивалент `header` во View) |
`title` | string | Название пункта в таббаре (при его использовании) |
`icon` | string | Иконка пункта в таббаре (при его использовании) |
___
### <a id="stack" name="stack"></a>  Tabbar

▸ Умный таббар

**Props:**

Название | Тип | Описание |
------ | ------ | ------ |
`id` | string, required | Идентификатор, который передается Epic внутри компонента |
`activeStory` | string, required | Идентификатор начальной страницы (Page) |
___
### <a id="navigator" name="navigator"></a>  Navigator

▸ Объект, передаваемый в props всем панелям и модальным окнам.

**Structure:**

Название | Тип | Описание |
------ | ------ | ------ |
`go(id:String, params={})` | func | Переход на панель с идентификатором `id`|
`goPage(id:String, params={})` | func | Переходит на другу страницу Page (из Stack) |
`goBack` | func | Возвращает на одну панель назад  |
`showModal(id:String, params={})` | func | Показывает модальное окно с идентификатором `id`|
`hideModal` | func | Скрывает все активные модальные окна |
`showPopout(popout:Node)` | func | Показывает переданный попаут |
`hidePopout` | func | Скрывает все активные попауты |
`showLoader` | func | Показывает спиннер загрузки |
`hideLoader` | func | Скрывает спиннер загрузки |
`params` | object | Параметры, которые передаются через `go` или `showModal` |
___

## Примеры 📚
### Пример с панелью
```
const Panel1 = ({ id, navigator }) => (
    <Panel id={id}>
        <PanelHeader>
            Панель 1
        </PanelHeader>
        <Group>
            <Button onClick={() => navigator.go("panel2")}>
                Вперед
            </Button>
        </Group>
    </Panel>
);

const Panel2 = ({ id, navigator }) => (
    <Panel id={id}>
        <PanelHeader>
            Панель 2
        </PanelHeader>
        <Group>
            <Button onClick={() => navigator.goBack()}>
                Назад
            </Button>
        </Group>
    </Panel>
);

<Stack activePage="page1">
    <Page id="page1" activePanel="panel1">
        <Panel1 id="panel1"/>
        <Panel2 id="panel2"/>
    </Page>
</Stack>
```

## Авторы 🎨
*   [Степан Новожилов](https://vk.me/this.state.user)
