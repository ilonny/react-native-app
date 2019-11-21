import React, { Component } from "react";
import {
    Platform,
    StyleSheet,
    Text,
    View,
    SectionList,
    Switch,
    ScrollView,
    AsyncStorage,
    TouchableOpacity,
    Linking,
    Picker,
    ActivityIndicator,
    Modal,
    FlatList
} from "react-native";
import { SafeAreaView } from "react-navigation";
import { setLang } from "../actions/lang";
import { connect } from "react-redux";
import { listStyles } from "../constants/list_styles";
import {ecadashCityList} from '../constants/ecadash'
import {API_URL} from '../constants/api'
import Ionicons from "react-native-vector-icons/Ionicons";
import Hyperlink from 'react-native-hyperlink'

class SettingsCityScreen extends Component {
    state = {
        ecadashCityChosen: '',
        ecadashCityList: ecadashCityList,
        token: '',
        ecadashCategory: [],
        city_can_push: 1,
        cityPushAgreement: 1,
        notifications: [],
        notificationsLoading: false,
        isModal: false,
    }
    componentDidMount(){
        AsyncStorage.getItem('ecadash_city_chosen', (err, value) => {
            if (!value) {
                value = 'moscow';
            }
            this.setState({
                ecadashCityChosen: value
            }, this.getCityNotifications);
        })
        AsyncStorage.getItem('agreement_city_push', (err, value) => {
            this.setState({
                cityPushAgreement: value ? value : 0
            });
        })
        AsyncStorage.getItem('Token', (err, token) =>{
            if (token) {
                this.setState({
                    token: token
                });
            } else {
                console.log('lolll')
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
        });
    }
    switchCityPush = (val) => {
        val = val ? '1' : '0';
        console.log('switchCityPush', val)
        this.setState({
            cityPushAgreement: val,
        }, () => {
            AsyncStorage.setItem('agreement_city_push', val);
            AsyncStorage.getItem('Token', (err, token) => {
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
                `/set-token?token=${this.state.token}&settings=old&news_settings=old&version=3&ecadash=old&ecadash=${JSON.stringify(this.state.ecadashCategory)}`
        );
        request.send();
        console.log(
            "updateTokenCity",
            API_URL +
                `/set-token?token=${this.state.token}&settings=old&news_settings=old&version=3&ecadash=old&ecadash=${JSON.stringify(this.state.ecadashCategory)}`
        );
    }
    getCityNotifications() {
        this.setState({
            notificationsLoading: true,
            notifications: [],
        })
        let request = new XMLHttpRequest();
        request.onreadystatechange = e => {
            if (request.readyState !== 4) {
                return;
            }
            if (request.status === 200) {
                try {
                    let res = JSON.parse(request.responseText);
                    console.log('res', res);
                    this.setState({
                        notifications: res,
                        notificationsLoading: false,
                    });
                } catch (e) {
                    console.log('getCityNotifications crash', e)
                }
            }
        };
        request.open(
            "GET",
            API_URL +
                `/get-city-notifications?city=${this.state.ecadashCityChosen}&lang=${this.props.main.lang}`
        );
        request.send();
        console.log(
            "getCityNotifications",
            API_URL +
            `/get-city-notifications?city=${this.state.ecadashCityChosen}&lang=${this.props.main.lang}`
        );
    }
    render() {
        console.log('settings city state', this.state);
        return (
            <SafeAreaView   style={{ flex: 1, backgroundColor: "#efefef" }}>
                <View style={styles.container}>
                    <ScrollView>
                        <View
                            style={[
                                listStyles.quoteItem,
                                {
                                    marginLeft: 10,
                                    marginRight: 10,
                                    marginTop: 10
                                }
                            ]}
                        >
                            <Text
                                style={{
                                    color: "#808080",
                                    textAlign: "center"
                                }}
                            >
                                {this.props.main.lang == "en" ||
                                this.props.main.lang == "eng"
                                    ? "Please select your city and category to receive notifications about Ekadashi and holidays:"
                                    : this.props.main.lang == "es"
                                    ? "Seleccione su ciudad para recibir notificaciones sobre Ekadashi y días festivos:"
                                    : "Пожалуйста, выберите свой город и категории для получения уведомлений об экадаши, праздниках и событиях в ваших центрах:"}
                            </Text>
                            <View
                                style={{
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    marginTop: 20
                                }}
                            >
                                <Picker
                                    selectedValue={this.state.ecadashCityChosen}
                                    style={{height: 250, width: 250}}
                                    onValueChange={itemValue => {
                                        this.setState({ecadashCityChosen: itemValue}, () => {
                                            var currentCity = this.state.ecadashCityList.find(el => el.name_link == this.state.ecadashCityChosen);
                                            console.log('city finded', currentCity)
                                            this.setState({city_can_push: currentCity.can_push ? 1 : 0})
                                            this.getCityNotifications();
                                        });
                                        AsyncStorage.setItem('ecadash_city_chosen', itemValue);
                                        let request = new XMLHttpRequest();
                                        request.onreadystatechange = (e) => {
                                            if (request.readyState !== 4) {
                                                return;
                                            }
                                            if (request.status === 200) {
                                                
                                            }
                                        };
                                        setTimeout(() => {
                                            request.open('GET', API_URL + `/set-ecadash-city?token=${this.state.token}&city=${this.state.ecadashCityChosen}`);
                                            request.send();
                                        }, 250);
                                    }}
                                >
                                    {this.state.ecadashCityList.map(city => (
                                        <Picker.Item key={city.name_link} label={this.props.main.lang == 'ru' ? city.name : city.name_eng} value={city.name_link} />
                                    ))}
                                </Picker>
                                {this.state.notificationsLoading && (
                                    <ActivityIndicator style={{flex: 1, marginBottom: 20}}/>
                                )}
                                {this.state.notifications.length && (
                                    <TouchableOpacity style={{flex: 1, marginBottom: 20}} onPress={() => this.setState({isModal: true})}>
                                        <View style={{padding: 10, flex: 1, flexDirection:'row', alignItems: 'center'}}>
                                            <Ionicons
                                                name="ios-notifications-outline"
                                                size={33}
                                                color="tomato"
                                                style={{marginRight: 10}}
                                                />
                                            <Text style={{marginTop: -3}}>
                                                {this.props.main.lang == 'ru' ? 'Уведомления о событиях' : this.props.main.lang == 'es' ? 'Notificaciones de eventos' : 'City notifications'}
                                                {" "}({this.state.notifications.length})
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            </View>
                                <View style={[listStyles.quoteItem, {marginTop: -5, borderRadius: 0, shadowRadius: 0, flex: 1, flexDirection: 'row', justifyContent: 'space-between'}]}>
                                    <View style={{maxWidth: '80%'}}>
                                        <Text style={{fontWeight: 'bold'}}>{this.props.main.lang == 'ru' ? 'Праздники' : this.props.main.lang == 'es' ? 'Vacaciones' : 'Holydays'}</Text>
                                    </View>
                                    <Switch value={this.state.ecadashCategory.includes('holy') ? true : false}  onValueChange={() => this.switchToggle('holy')} />
                                </View>
                                <View style={[listStyles.quoteItem, {marginTop: -5, borderRadius: 0, shadowRadius: 0, flex: 1, flexDirection: 'row', justifyContent: 'space-between'}]}>
                                    <View style={{maxWidth: '80%'}}>
                                        <Text style={{fontWeight: 'bold'}}>{this.props.main.lang == 'ru' ? 'Экадаши' : this.props.main.lang == 'es' ? 'Ekadashi' : 'Ecadashi'}</Text>
                                    </View>
                                    <Switch value={this.state.ecadashCategory.includes('ecadash') ? true : false}  onValueChange={() => this.switchToggle('ecadash')} />
                                </View>
                                {this.state.city_can_push == '1' ? (
                                    <View style={[listStyles.quoteItem, {marginTop: -5, borderRadius: 0, shadowRadius: 0, flex: 1, flexDirection: 'row', justifyContent: 'space-between'}]}>
                                        <View style={{maxWidth: '80%'}}>
                                            <Text style={{fontWeight: 'bold'}}>{this.props.main.lang == 'ru' ? 'Подписаться на события города' : this.props.main.lang == 'es' ? 'Suscríbase a eventos de la ciudad' : 'Subscribe to city events'}</Text>
                                        </View>
                                        <Switch value={parseInt(this.state.cityPushAgreement) ? true : false}  onValueChange={this.switchCityPush} />
                                    </View>
                                ) : null}
                        </View>
                        <View
                            style={[
                                listStyles.quoteItem,
                                {
                                    marginLeft: 10,
                                    marginRight: 10,
                                    marginTop: 10
                                }
                            ]}
                        >
                            <TouchableOpacity
                                onPress={() =>
                                    Linking.openURL("mailto:7782810@mail.ru")
                                }
                            >
                                <Text
                                    style={{
                                        color: "#808080",
                                        textAlign: "center"
                                    }}
                                >
                                    {this.props.main.lang == "en" ||
                                    this.props.main.lang == "eng"
                                        ? `Contact us: \n 7782810@mail.ru`
                                        : this.props.main.lang == "es" ? "Contáctenos: \n 7782810@mail.ru"
                                        : `Напишите нам: \n 7782810@mail.ru`}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={this.state.isModal}
                    onRequestClose={() => this.setState({ isModal: false })}
                >
                    <SafeAreaView>
                        <View style={{flex: 0, flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 15}}>
                            <TouchableOpacity onPress={() => this.setState({isModal: false})}>
                                <Ionicons name="ios-close" size={33} color="tomato"/>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            style={{paddingLeft: 10, paddingRight: 10, paddingBottom: 5, paddingTop: 5, flex: 0, marginBottom: 50}}
                            data={this.state.notifications}
                            renderItem={({item}) => (
                                <View style={listStyles.quoteItem}>
                                    {item.date && <Text style={{color: '#c5c5c5', fontStyle: 'italic'}}>{item.date}</Text>}
                                    <View>
                                        <Hyperlink linkDefault={ true } linkStyle={{fontWeight: 'bold', color: 'tomato'}}>
                                            <Text style={{color: "#75644f"}}>{this.props.main.lang == 'ru' ? item.payload : this.props.main.lang == 'es' ? item.payload_es : item.payload_eng}</Text>
                                        </Hyperlink>
                                    </View>
                                </View>
                            )}
                            keyExtractor={item => item.id.toString()}
                        />
                    </SafeAreaView>
                </Modal>
            </SafeAreaView>
        );
    }
}
const mapStateToProps = state => {
    return {
        main: state.mainReducer
    };
};
const mapDispatchToProps = dispatch => {
    return {
        setLang: lang => dispatch(setLang(lang))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SettingsCityScreen);

const styles = StyleSheet.create({});
