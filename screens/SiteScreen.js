import React, { Component } from "react";
import {
    Platform,
    StyleSheet,
    Text,
    View,
    AsyncStorage,
    SafeAreaView,
    ScrollView,
    FlatList,
    TouchableOpacity,
    Dimensions,
    Animated,
    Modal
} from "react-native";
import { TabView, TabBar, SceneMap } from "react-native-tab-view";
import SiteScreenList from "./SiteScreenList";
import CalendarScreen from "./CalendarScreen";

import ScsmathScreen from "./ScsmathScreen";

import { setLang, setLangInside } from "../actions/lang";
import { connect } from "react-redux";

const ContentRoute = () => <SiteScreenList type="content" />;
const LookRoute = () => <SiteScreenList type="look" />;
const ListenRoute = () => <SiteScreenList type="listen" />;
const ReadRoute = () => <SiteScreenList type="read" />;
const ImportantRoute = () => <SiteScreenList type="important" />;
const CalendarRoute = () => <CalendarScreen />;
import NavigationService from "../NavigationService";
class SiteScreen extends Component {
    static navigationOptions = {
        header: null
    };
    state = {
        index: 0,
        routes: [
            { key: "content", title: "Новости" },
            { key: "look", title: "Смотреть" },
            { key: "listen", title: "Слушать" },
            { key: "read", title: "Читать" },
            { key: "important", title: "Это важно" },
            { key: "calendar", title: "Вайшнавский календарь" }
        ],
        modalShowed: true,
        modalStep: 1
    };
    _handleIndexChange = index => this.setState({ index });

    _renderTabBar = props => (
        <TabBar
            {...props}
            scrollEnabled
            indicatorStyle={styles.indicator}
            style={styles.tabbar}
            tabStyle={styles.tab}
            labelStyle={styles.label}
            renderLabel={this._renderLabel}
        />
    );
    _renderLabel = route => {
        // console.log('route', route.route)
        return (
            <Text
                style={styles.label}
                numberOfLines={
                    route.route.title == "Вайшнавский календарь" ? 2 : 1
                }
                ellipsizeMode="tail"
            >
                {route.route.title}
            </Text>
        );
    };
    _renderScene = SceneMap({
        content: ContentRoute,
        look: LookRoute,
        listen: ListenRoute,
        read: ReadRoute,
        important: ImportantRoute,
        calendar: CalendarRoute
    });

    componentDidMount() {
        // AsyncStorage.clear();
        AsyncStorage.getItem("initial_modal", (err, value) => {
            // console.log("initial_modal", value);
            if (!value) {
                this.setState({
                    modalShowed: false
                });
                AsyncStorage.setItem("initial_modal", "true");
            }
        });
        AsyncStorage.getItem("lang", (err, value) => {
            console.log("lang is ", value);
            if (!value || value == "ru") {
                this.props.setLangInside("ru");
            } else {
                this.props.setLangInside("eng");
            }
        });
    }
    render() {
        console.log("root render state", this.state);
        console.log("root render props", this.props);
        if (this.state.modalShowed) {
            if (this.props.main.lang == "ru") {
                return (
                    <TabView
                        navigationState={this.state}
                        renderScene={this._renderScene}
                        renderTabBar={this._renderTabBar}
                        onIndexChange={this._handleIndexChange}
                    />
                );
            } else {
                return (
                    // <View
                    //     style={{
                    //         flex: 1,
                    //         justifyContent: "center",
                    //         alignItems: "center"
                    //     }}
                    // >
                    //     <Text>http://www.scsmath.com/</Text>
                    // </View>
                    <ScsmathScreen></ScsmathScreen>
                );
            }
        } else {
            return (
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={!this.state.modalShowed}
                    onRequestClose={() => this.setState({ modalShowed: true })}
                >
                    {this.state.modalStep == 1 && (
                        <ScrollView
                            contentContainerStyle={{
                                flex: 1,
                                justifyContent: "center",
                                alignItems: "center",
                                padding: 20
                            }}
                        >
                            <Text
                                style={{
                                    color: "#75644f",
                                    fontSize: 16,
                                    textAlign: "center",
                                    lineHeight: 20
                                }}
                            >
                                Дорогие друзья! Мы рады предложить вашему
                                вниманию приложение
                                {"\n"}
                                <Text style={{ fontWeight: "bold" }}>
                                    «Guru Online»
                                </Text>
                                {"\n"}Оно позволяет:
                                {"\n"}- Слушать и смотреть лекции современных
                                духовных учителей;
                                {"\n"}- Изучать наследие святых прошлого из книг
                                – как в текстовом формате, так и в формате
                                аудиокниги;
                                {"\n"}- Ежедневно получать в виде рассылки
                                жемчужины духовных откровений – цитаты мудрецов
                                древности и современности, с возможностью
                                настраивать их по авторам.
                                {"\n"}Мы искренне надеемся, что наше приложение
                                позволит вам в любом месте и в любое время жить
                                в мире высоких идеалов, красоты, гармонии и
                                любви.
                            </Text>
                            <TouchableOpacity
                                onPress={() => this.setState({ modalStep: 2 })}
                                style={{
                                    margin: 10,
                                    padding: 10,
                                    borderRadius: 10,
                                    borderWidth: 0.5,
                                    borderColor: "#75644f",
                                    width: 100
                                }}
                            >
                                <Text
                                    style={{
                                        textAlign: "center",
                                        color: "#75644f",
                                        fontSize: 16
                                    }}
                                >
                                    Ок
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    )}
                    {this.state.modalStep == 2 && (
                        <ScrollView
                            contentContainerStyle={{
                                flex: 1,
                                justifyContent: "center",
                                alignItems: "center",
                                padding: 20
                            }}
                        >
                            <Text
                                style={{
                                    color: "#75644f",
                                    fontSize: 16,
                                    textAlign: "center",
                                    lineHeight: 20
                                }}
                            >
                                Пожалуйста, выберите Ваш язык, вы сможете
                                изменить его в разделе "настройки"
                                {"\n"}
                                Please select your language, you can change it
                                in the "settings" section
                            </Text>
                            <View style={{ flexDirection: "row" }}>
                                <TouchableOpacity
                                    onPress={() => {
                                        this.setState({
                                            modalShowed:true,
                                        });
                                        setLang("ru")
                                    }}
                                    style={{
                                        margin: 10,
                                        padding: 10,
                                        borderRadius: 10,
                                        borderWidth: 0.5,
                                        borderColor: "#75644f",
                                        width: 100
                                    }}
                                >
                                    <Text
                                        style={{
                                            textAlign: "center",
                                            color: "#75644f",
                                            fontSize: 16
                                        }}
                                    >
                                        Русский
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        console.log('set lang');
                                        this.setState({
                                            modalShowed:true,
                                        });
                                        setLang("en")
                                    }}
                                    style={{
                                        margin: 10,
                                        padding: 10,
                                        borderRadius: 10,
                                        borderWidth: 0.5,
                                        borderColor: "#75644f",
                                        width: 100
                                    }}
                                >
                                    <Text
                                        style={{
                                            textAlign: "center",
                                            color: "#75644f",
                                            fontSize: 16
                                        }}
                                    >
                                        English
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    )}
                </Modal>
            );
        }
    }
}
// const styles = StyleSheet.create({
//     container: {
//         flex: 1
//     },
//     tabBar: {
//         flexDirection: "row",
//         paddingTop: 10,
//         backgroundColor: "#f7f7f7",
//         borderBottomColor: "#CFCFD0",
//         borderBottomWidth: 1
//     },
//     tabItem: {
//         flex: 0,
//         alignItems: "center",
//         padding: 16
//     }
// });
const mapStateToProps = state => {
    return {
        main: state.mainReducer,
    };
};
const mapDispatchToProps = dispatch => {
    return {
        setLangInside: lang => dispatch(setLangInside(lang))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SiteScreen);
const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    tabbar: {
        paddingTop: 0,
        backgroundColor: "#f7f7f7"
    },
    tab: {
        width: 120
        // flex: 1,
    },
    indicator: {
        backgroundColor: "#75644f"
    },
    label: {
        color: "#75644f",
        fontWeight: "400",
        padding: 0,
        textAlign: "center"
        // flex: 1,
    }
});
