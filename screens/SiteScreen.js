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
import SiteScreenEs from "./SiteScreenEs";

import { setLang, setLangInside } from "../actions/lang";
import { connect } from "react-redux";

const ContentRoute = () => <SiteScreenList type="content" />;
const LookRoute = () => <SiteScreenList type="look" />;
const ListenRoute = () => <SiteScreenList type="listen" />;
const ReadRoute = () => <SiteScreenList type="read" />;
const ImportantRoute = () => <SiteScreenList type="important" />;
const CalendarRoute = () => <CalendarScreen />;

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
        modalStep: 1,
        langChosen: false
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
        // console.log("component did moung props", this.props);
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
            }
            if (value == "eng" || value == "en") {
                this.props.setLangInside("eng");
            }
            if (value == "es") {
                this.props.setLangInside("es");
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
            } else if (
                this.props.main.lang == "en" ||
                this.props.main.lang == "eng"
            ) {
                return (
                    // <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    //     <Text>http://www.scsmath.com/</Text>
                    // </View>
                    <ScsmathScreen />
                );
            } else {
                return (
                    <SiteScreenEs/>
                );
            }
        } else
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
                                Пожалуйста, выберите Ваш язык, вы сможете
                                изменить его в разделе "настройки"
                                {"\n"}
                                {"\n"}
                                Please select your language, you can change it
                                in the "settings" section
                                {"\n"}
                                {"\n"}
                                Por favor seleccione su idioma, puede cambiarlo
                                en la sección "configuración"
                                {"\n"}
                            </Text>
                            <View style={{ flexDirection: "column" }}>
                                <TouchableOpacity
                                    onPress={() =>
                                        this.setState({
                                            langChosen: "ru",
                                            modalStep: 2
                                        })
                                    }
                                    style={{
                                        margin: 10,
                                        padding: 10,
                                        borderRadius: 10,
                                        borderWidth: 0.5,
                                        borderColor: "#75644f",
                                        width: 300
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
                                    onPress={() =>
                                        this.setState({
                                            langChosen: "en",
                                            modalStep: 2
                                        })
                                    }
                                    style={{
                                        margin: 10,
                                        padding: 10,
                                        borderRadius: 10,
                                        borderWidth: 0.5,
                                        borderColor: "#75644f",
                                        width: 300
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
                                <TouchableOpacity
                                    onPress={() =>
                                        this.setState({
                                            langChosen: "es",
                                            modalStep: 2
                                        })
                                    }
                                    style={{
                                        margin: 10,
                                        padding: 10,
                                        borderRadius: 10,
                                        borderWidth: 0.5,
                                        borderColor: "#75644f",
                                        width: 300
                                    }}
                                >
                                    <Text
                                        style={{
                                            textAlign: "center",
                                            color: "#75644f",
                                            fontSize: 16
                                        }}
                                    >
                                        Español
                                    </Text>
                                </TouchableOpacity>
                            </View>
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
                            {this.state.langChosen == "ru" && (
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
                                    {"\n"}- Слушать и смотреть лекции
                                    современных духовных учителей;
                                    {"\n"}- Изучать наследие святых прошлого из
                                    книг – как в текстовом формате, так и в
                                    формате аудиокниги;
                                    {"\n"}- Ежедневно получать в виде рассылки
                                    жемчужины духовных откровений – цитаты
                                    мудрецов древности и современности, с
                                    возможностью настраивать их по авторам.
                                    {"\n"}Мы искренне надеемся, что наше
                                    приложение позволит вам в любом месте и в
                                    любое время жить в мире высоких идеалов,
                                    красоты, гармонии и любви.
                                </Text>
                            )}
                            {this.state.langChosen == "en" && (
                                <Text
                                    style={{
                                        color: "#75644f",
                                        fontSize: 16,
                                        textAlign: "center",
                                        lineHeight: 20
                                    }}
                                >
                                    Dear Friends!
                                    {"\n"}We are happy to present our app
                                    {"\n"}
                                    <Text style={{ fontWeight: "bold" }}>
                                        «Guru Online»
                                    </Text>
                                    {"\n"}It allows you to:
                                    {"\n"}- Listen and read lectures of modern gurus;
                                    {"\n"}- Explore the heritage of gurus through electronic/audio books;
                                    {"\n"}- Receive a daily newsteller - quotations of gurus of the past and present with an option of sorting them by author.
                                    {"\n"}We hope our app will enable you to live in a world of high ideals, beauty, harmony and love at any place and any time.
                                </Text>
                            )}
                            {this.state.langChosen == "es" && (
                                <Text
                                    style={{
                                        color: "#75644f",
                                        fontSize: 16,
                                        textAlign: "center",
                                        lineHeight: 20
                                    }}
                                >
                                    ¡Queridos amigos!
                                    {"\n"}Estamos encantados de presentar nuestra aplicación
                                    {"\n"}
                                    <Text style={{ fontWeight: "bold" }}>
                                        «Guru Online»
                                    </Text>
                                    {"\n"}Te permite:
                                    {"\n"}- Escuchar y leer conferencias de gurús modernos.
                                    {"\n"}- Explorar el patrimonio de los gurús a través de libros de audio / electrónicos.
                                    {"\n"}- Recibir un vendedor nuevo diario: citas de gurús del pasado y del presente con la opción de clasificarlos por autor.
                                    {"\n"}Esperamos que nuestra aplicación te permita vivir en un mundo de altos ideales, belleza, armonía y amor en cualquier lugar y en cualquier momento.
                                </Text>
                            )}
                            <TouchableOpacity
                                onPress={() => setLang(this.state.langChosen)}
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
                </Modal>
            );
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
        main: state.mainReducer
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
        paddingTop: 13,
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
