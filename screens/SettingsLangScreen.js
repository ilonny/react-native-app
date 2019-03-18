import React, { Component } from "react";
import {
    Platform,
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    SectionList,
    Switch,
    ScrollView,
    AsyncStorage,
    TouchableOpacity
} from "react-native";
import { setLang } from "../actions/lang";
import { connect } from "react-redux";
import { listStyles } from "../constants/list_styles";
class SettingsLangScreen extends Component {
    render() {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: "#efefef" }}>
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
                                    ? "Select your language, after selecting the application will restart"
                                    : "Выберите ваш язык, после выбора приложение перезапустится"}
                            </Text>
                            <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20}}>
                                <TouchableOpacity
                                    onPress={() => setLang('ru')}
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
                                    onPress={() => setLang('en')}
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
)(SettingsLangScreen);

const styles = StyleSheet.create({});
