import React, { Component } from "react";
import {
    Platform,
    StyleSheet,
    Text,
    View,
    AsyncStorage,
    ScrollView,
    FlatList,
    TouchableOpacity,
    Dimensions,
    Animated,
    Modal,
    Picker,
    ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-navigation";
import { TabView, TabBar, SceneMap } from "react-native-tab-view";
import SiteScreenList from "./SiteScreenList";
import CalendarScreen from "./CalendarScreen";

import ScsmathScreen from "./ScsmathScreen";
import SiteScreenEs from "./SiteScreenEs";

import { setLang, setLangInside } from "../actions/lang";
import { connect } from "react-redux";

const ContentRoute = (sceneProps) => <SiteScreenList type="content" sceneProps={sceneProps} />;
const LookRoute = (sceneProps) => <SiteScreenList type="look" sceneProps={sceneProps} />;
const ListenRoute = (sceneProps) => <SiteScreenList type="listen" sceneProps={sceneProps} />;
const ReadRoute = (sceneProps) => <SiteScreenList type="read" sceneProps={sceneProps} />;
const ImportantRoute = (sceneProps) => <SiteScreenList type="important" sceneProps={sceneProps}/>;
const CalendarRoute = (sceneProps) => <CalendarScreen sceneProps={sceneProps} />;
const ScsRoute = (sceneProps) => <ScsmathScreen sceneProps={sceneProps} />;
import {ecadashCityList} from '../constants/ecadash'
import {API_URL} from '../constants/api'

class SiteScreen extends Component {
    static navigationOptions = {
        header: null
    };
    state = {
        index: 0,
        redirectCount: 0,
        routes: [],
        modalShowed: true,
        modalStep: 1,
        langChosen: false,
        ecadashCityList: ecadashCityList,
        ecadashCityChosen: 'moscow',
        needRedirectCalendar: this.props.navigation.getParam('c_date', '') ? true : false,
    };
    _handleIndexChange = index => this.setState({ index });

    _renderTabBar = props => (
        <TabBar
            {...props}
            scrollEnabled
            indicatorStyle={styles.indicator}
            style={styles.tabbar}
            tabStyle={this.props.main.lang == 'ru' ? styles.tab : {width: 200}}
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
        scs: ScsRoute,
        calendar: CalendarRoute,
    });
    componentDidUpdate(prevProps) {
        console.log('componentDidUpdate')
        AsyncStorage.getItem('c_date', (err, c_date) => {
            if (c_date && c_date != ''){
                this.setState({
                    index: this.props.main.lang == 'ru' ? 5 : 1
                })
                AsyncStorage.setItem('c_date', '');        
            }
        });
    }
    willFocusSubscription = this.props.navigation.addListener(
        'willFocus',
        payload => {
            console.log('will focus state', this.state)
            AsyncStorage.getItem('c_date', (err, c_date) => {
                if (c_date && c_date != ''){
                    this.setState({
                        index: this.props.main.lang == 'ru' ? 5 : 1
                    })
                    AsyncStorage.setItem('c_date', '');        
                }
            });
        }
    );
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
        AsyncStorage.getItem("ecadash_city_chosen", (err, city) => {
            console.log('ecadash city is', city);
            if (!city) {
                city = "moscow";
            }
            AsyncStorage.getItem('Token', (err, token) =>{
                if (token) {
                    let request = new XMLHttpRequest();
                    request.onreadystatechange = (e) => {
                        if (request.readyState !== 4) {
                            return;
                        }
                        if (request.status === 200) {

                        }
                    };
                    request.open('GET', API_URL + `/set-ecadash-city?token=${token}&city=${city}`);
                    request.send();
                    console.log('sent request to', API_URL + `/set-ecadash-city?token=${token}&city=${city}`)
                } else {
                    console.log('lolll')
                }
            })
        })
        AsyncStorage.getItem("lang", (err, value) => {
            // console.log("lang is ", value);
            if (!value || value == "ru") {
                this.props.setLangInside("ru");
            }
            if (value == "eng" || value == "en") {
                this.props.setLangInside("eng");
            }
            if (value == "es") {
                this.props.setLangInside("es");
            }
            console.log("CDM LANG?", value)
                if (value == 'ru') {
                    this.setState({
                        routes: [
                            { key: "content", title: "Новости", lang: 'ru' },
                            { key: "look", title: "Смотреть", lang: 'ru' },
                            { key: "listen", title: "Слушать", lang: 'ru' },
                            { key: "read", title: "Читать", lang: 'ru' },
                            { key: "important", title: "Это важно", lang: 'ru' },
                            { key: "calendar", title: "Вайшнавский календарь", lang: 'ru', needRedirectCalendar: this.state.needRedirectCalendar },
                        ]
                    })
                } else {
                    this.setState({
                        routes: [
                            { key: "scs", title: "scsmath.com", lang: 'en' },
                            { key: "calendar", title: "Vaishnava calendar", lang: 'en', needRedirectCalendar: this.state.needRedirectCalendar },
                        ]
                    })
                }
        });
    }
    render() {
        console.log("root render state", this.state);
        console.log("root render props", this.props);
        if (this.state.modalShowed) {
            if (this.props.main.lang == "ru" || this.props.main.lang == "en" || this.props.main.lang == "eng") {
                if (this.state.routes.length){
                    return (
                        <SafeAreaView  style={{flex: 1, backgroundColor: '#f7f7f7'}}>
                        <TabView
                            navigationState={this.state}
                            renderScene={this._renderScene}
                            renderTabBar={this._renderTabBar}
                            onIndexChange={this._handleIndexChange}
                            />
                    </SafeAreaView>
                );
                } else {
                    return (
                        <SafeAreaView  style={{flex: 1, backgroundColor: '#f7f7f7', alignItems: 'center', justifyContent: 'center'}}>
                            <ActivityIndicator/>
                        </SafeAreaView>
                    )
                }
            } else {
                return (
                    <SafeAreaView style={{flex: 1, backgroundColor: '#f7f7f7'}}>
                        <SiteScreenEs/>
                    </SafeAreaView>
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
                                            modalStep: 2,
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
                                            modalStep: 2,
                                            ecadashCityList: this.state.ecadashCityList.sort((prev, next) => {
                                                if (prev.name_eng > next.name_eng) {
                                                    return 1;
                                                }
                                                if (prev.name_eng < next.name_eng) {
                                                    return -1;
                                                }
                                                // a должно быть равным b
                                                return 0;
                                            })
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
                                onPress={() => {
                                    this.props.main.lang == 'es' ?
                                    setLang(this.state.langChosen)
                                    : this.setState({modalStep: 3})
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
                                    Ок
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    )}
                    {this.state.modalStep == 3 && (
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
                            }}>
                                {this.state.langChosen == 'ru' ? 'Пожалуйста, выберите свой город для получения уведомлений об экадаши и праздниках:' : 'Please select your city to receive notifications about Ekadashi and holidays:'}
                            </Text>
                            <Picker
                                selectedValue={this.state.ecadashCityChosen}
                                style={{height: 250, width: 250}}
                                onValueChange={itemValue => {
                                    this.setState({ecadashCityChosen: itemValue});
                                    AsyncStorage.setItem('ecadash_city_chosen', itemValue);
                                }}
                            >
                                {this.state.ecadashCityList.map(city => (
                                    <Picker.Item key={city.name_link} label={this.state.langChosen == 'ru' ? city.name : city.name_eng} value={city.name_link} />
                                ))}
                            </Picker>
                            <TouchableOpacity
                                onPress={() => {
                                    setLang(this.state.langChosen)}
                                    // AsyncStorage.getItem('ecadash_city_chosen', (err, value) => {
                                    //     console.log('ecadash_city_chosen', value)
                                    // })
                                }
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
