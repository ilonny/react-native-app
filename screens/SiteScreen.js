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
    ActivityIndicator,
    Switch
} from "react-native";
import { SafeAreaView } from "react-navigation";
import { TabView, TabBar, SceneMap } from "react-native-tab-view";
import SiteScreenList from "./SiteScreenList";
import CalendarScreen from "./CalendarScreen";

import ScsmathScreen from "./ScsmathScreen";
import SiteScreenEs from "./SiteScreenEs";

import { setLang, setLangInside } from "../actions/lang";
import { connect } from "react-redux";
import { listStyles } from "../constants/list_styles";
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
        ecadashCategory: [],
        token: '',
        city_can_push: 1,
        cityPushAgreement: 1
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
                AsyncStorage.setItem("agreement_city_push", "1");
            }
        });
        AsyncStorage.getItem("ecadash_city_chosen", (err, city) => {
            console.log('ecadash city is', city);
            if (!city) {
                city = "moscow";
            }
            AsyncStorage.getItem('Token', (err, token) =>{
                if (token) {
                    this.setState({token})
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
                    AsyncStorage.getItem('agreement_city_push', (err, val) => {
                        let request = new XMLHttpRequest();
                        request.onreadystatechange = e => {
                            if (request.readyState !== 4) {
                                return;
                            }
                            if (request.status === 200) {
                            }
                        };
                        request.open(
                            "GET",
                            API_URL +
                                `/set-city-push?token=${token}&agreement=${val}`
                        );
                        request.send();
                        console.log(API_URL +`/set-city-push?token=${token}&agreement=${val}`)
                    })
                } else {
                    console.log('lolll')
                }
            })
        });
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
                if (value == 'ru' || value == null || value == undefined) {
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
        AsyncStorage.getItem('ecadash_category', (err, value) => {
            if (!value) {
                value = '["holy", "ecadash"]';
            }
            try {
                this.setState({
                    ecadashCategory: JSON.parse(value),
                })
            } catch (e) {
                console.log('crash', e)
            }
        })
    }
    switchCityPush = (val) => {
        val = val ? '1' : '0';
        console.log('switchCityPush', val)
        this.setState({
            cityPushAgreement: val,
        }, () => {
            AsyncStorage.setItem('agreement_city_push', val);
            AsyncStorage.getItem('token', (err, token) => {
                let request = new XMLHttpRequest();
                request.onreadystatechange = e => {
                    if (request.readyState !== 4) {
                        return;
                    }
                    if (request.status === 200) {
                    }
                };
                request.open(
                    "GET",
                    API_URL +
                        `/set-city-push?token=${token}&agreement=${val}`
                );
                request.send();
                console.log(API_URL +`/set-city-push?token=${token}&agreement=${val}`)
            })
        })
    }
    switchToggle(name){
        if (this.state.ecadashCategory.includes(name)) {
            let arr = [...this.state.ecadashCategory];
            let index = arr.indexOf(name);
            arr.splice(index, 1);
            this.setState({
                ecadashCategory: arr
            });
        } else {
            this.setState({
                ecadashCategory: this.state.ecadashCategory.concat(name)
            });
        }
        console.log('swittch', name)
        setTimeout(() => {
            this.updateTokenSetting();
            AsyncStorage.setItem('ecadash_category', JSON.stringify(this.state.ecadashCategory));
        }, 150);
    }
    updateTokenSetting() {
        console.log('start get token');
        AsyncStorage.getItem('Token', (err, token) =>{
            console.log('end get token', token)
            if (token) {
                let request = new XMLHttpRequest();
                request.onreadystatechange = e => {
                    if (request.readyState !== 4) {
                        return;
                    }
                    if (request.status === 200) {
                    }
                };
                request.open(
                    "GET",
                    API_URL +
                        `/set-token?token=${token}&settings=old&news_settings=old&version=3&ecadash=old&ecadash=${JSON.stringify(this.state.ecadashCategory)}`
                );
                request.send();
                console.log(
                    "updateTokenCity",
                    API_URL +
                        `/set-token?token=${token}&settings=old&news_settings=old&version=3&ecadash=old&ecadash=${JSON.stringify(this.state.ecadashCategory)}`
                );
            }
        })
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
                        <SiteScreenEs navigation={this.props.navigation}/>
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
                                    Дорогие друзья!{"\n"}
                                    Мы рады предложить вашему вниманию приложение <Text style={{ fontWeight: "bold" }}>«Guru Online»</Text>
                                    {"\n"}Оно позволяет:
                                    {"\n"}• Слушать и смотреть лекции духовных учителей
                                    {"\n"}• Изучать наследие индийских святых и подвижников из книг — как в текстовом формате, так и в формате аудиокниги
                                    {"\n"}• Ежедневно получать в виде рассылки жемчужины духовных откровений — цитаты мудрецов древности и современности, с возможностью настраивать их по авторам
                                    {"\n"}• Знакомиться с новостями Миссии "Шри Чайтанья Сарасват Матх"
                                    {"\n"}• Получать рассылку о вайшнавских праздниках, а также о днях Экадаши
                                    {"\n"}Мы искренне надеемся, что наше приложение позволит вам в любом месте и в любое время жить в мире высоких идеалов, красоты, гармонии и любви.                                    
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
                                    {"\n"}We are pleased to offer you the application <Text style={{ fontWeight: "bold" }}>«Guru Online»</Text>
                                    {"\n"}It allows:
                                    {"\n"}• Listen and watch the lectures of spiritual masters.
                                    {"\n"}• Explore the heritage of Indian saints and ascetics from books — both in text and audiobook format.
                                    {"\n"}• Receive daily broadcast pearls of spiritual revelations, quotes of the sages of ancient and modern times, with the ability to configure themaccording to the authors.
                                    {"\n"}• Get acquainted with the news of the Mission Sri Chaitanya Saraswat Math.
                                    {"\n"}• To receive emails about Vaishnava holidays and on the days of Ekadashi.
                                    {"\n"}We sincerely hope that our application will allow you anywhere and at any time live in a world of high ideals, beauty, harmony and love.
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
                                    {"\n"}Nos complace ofreceros la aplicación {"\n"}<Text style={{ fontWeight: "bold" }}>«Guru Online»</Text>
                                    {"\n"}Os permite:
                                    {"\n"}• Escuchar y mirar las conferencias de los maestros espirituales
                                    {"\n"}• Explorar la herencia de los santos y ascetas indios de los libros, tanto en formato de texto como de audiolibro.
                                    {"\n"}• Recibir a diario la difusión de perlas de las revelaciones espirituales, citas de los sabios de los tiempos antiguos y modernos, con la capacidad de configurar en el acorde a los autores.
                                    {"\n"}• Conocer las noticias de la Misión Sri Chaitanya Saraswat Math.
                                    {"\n"}• Recibir correos electrónicos sobre las vacaciones de Vaishnava y los días de Ekadasi.
                                    {"\n"}Esperamos sinceramente que nuestra aplicación os permitirá vivir en cualquier lugar y en cualquier momento en un mundo de altos ideales, belleza, armonía y amor.
                                </Text>
                            )}
                            <TouchableOpacity
                                onPress={() => {
                                    // this.props.main.lang == 'es' ?
                                    // setLang(this.state.langChosen)
                                    // : 
                                    this.setState({modalStep: 3})
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
                                {this.state.langChosen == 'ru' ? 'Пожалуйста, выберите свой город для получения уведомлений об экадаши и праздниках:' : this.state.langChosen == 'en' ? 'Please select your city to receive notifications about Ekadashi and Holidays:' : 'Seleccione su ciudad para recibir notificaciones sobre Ekadashi y días festivos:'}
                            </Text>
                                <Picker
                                    selectedValue={this.state.ecadashCityChosen}
                                    style={{height: 250, width: 250}}
                                    onValueChange={itemValue => {
                                        this.setState({ecadashCityChosen: itemValue}, () => {
                                            var currentCity = this.state.ecadashCityList.find(el => el.name_link == this.state.ecadashCityChosen);
                                            console.log('city finded', currentCity)
                                            this.setState({city_can_push: currentCity.can_push ? 1 : 0})
                                        });
                                        AsyncStorage.setItem('ecadash_city_chosen', itemValue);
                                    }}
                                    >
                                    {this.state.ecadashCityList.map(city => (
                                        <Picker.Item key={city.name_link} label={this.state.langChosen == 'ru' ? city.name : city.name_eng} value={city.name_link} />
                                        ))}
                                </Picker>
                                <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', maxHeight: 20, width: 200}}>
                                    <View style={{maxWidth: '80%'}}>
                                        <Text style={{fontWeight: 'bold'}}>{this.state.langChosen == 'ru' ? 'Праздники' : this.state.langChosen == 'en' ? 'Holydays' : 'Vacaciones'}</Text>
                                    </View>
                                    <Switch value={this.state.ecadashCategory.includes('holy') ? true : false}  onValueChange={() => this.switchToggle('holy')} />
                                </View>
                                <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', maxHeight: 20, width: 200, marginTop: 20, marginBottom: 20}}>
                                    <View style={{maxWidth: '80%'}}>
                                        <Text style={{fontWeight: 'bold'}}>{this.state.langChosen == 'ru' ? 'Экадаши' : this.state.langChosen == 'en' ? 'Ecadashi' : 'Ekadashi'}</Text>
                                    </View>
                                    <Switch value={this.state.ecadashCategory.includes('ecadash') ? true : false}  onValueChange={() => this.switchToggle('ecadash')} />
                                </View>
                                {this.state.city_can_push == '1' ? (
                                    <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', maxHeight: 20, width: 290, marginTop: 20, marginBottom: 20}}>
                                        <View style={{maxWidth: '80%'}}>
                                            <Text style={{fontWeight: 'bold'}}>{this.state.langChosen == 'ru' ? 'Подписаться на события города' : this.state.langChosen == 'en' ? 'Subscribe to city events' : 'Suscríbase a eventos de la ciudad'}</Text>
                                        </View>
                                        <Switch value={parseInt(this.state.cityPushAgreement) ? true : false}  onValueChange={this.switchCityPush} />
                                    </View>
                                ) : null}
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
