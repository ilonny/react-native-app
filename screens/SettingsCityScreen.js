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
    Picker
} from "react-native";
import { SafeAreaView } from "react-navigation";
import { setLang } from "../actions/lang";
import { connect } from "react-redux";
import { listStyles } from "../constants/list_styles";
import {ecadashCityList} from '../constants/ecadash'
import {API_URL} from '../constants/api'

class SettingsCityScreen extends Component {
    state = {
        ecadashCityChosen: '',
        ecadashCityList: ecadashCityList,
        token: '',
    }
    componentDidMount(){
        AsyncStorage.getItem('ecadash_city_chosen', (err, value) => {
            if (!value) {
                value = 'moscow';
            }
            this.setState({
                ecadashCityChosen: value
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
        })
    }
    render() {
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
                                    ? "Please select your city to receive notifications about Ekadashi and holidays:"
                                    : this.props.main.lang == "es"
                                    ? "Please select your city to receive notifications about Ekadashi and holidays:"
                                    : "Пожалуйста, выберите свой город для получения уведомлений об экадаши и праздниках:"}
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
                                    style={{height: 50, width: 250}}
                                    onValueChange={itemValue => {
                                        this.setState({ecadashCityChosen: itemValue});
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
                            </View>
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