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
    AsyncStorage
} from "react-native";

import { API_URL } from "../constants/api";
import { listStyles } from "../constants/list_styles";
export default class SettingsScreen extends Component {
    constructor() {
        super();
        this.state = {
            settings: [],
            items: [],
            authors: [],
            books: [],
            selectedItems: [],
            testString: "",
            asyncSettings: null,
            apiText: "",
            token: "",
            categories: [
                {
                    title: "Новости",
                    brief: "content"
                },
                {
                    title: "Смотреть",
                    brief: "look"
                },
                {
                    title: "Слушать",
                    brief: "listen"
                },
                {
                    title: "Читать",
                    brief: "read"
                },
                {
                    title: "Это важно",
                    brief: "important"
                },
            ]
        };
        // this.switchToggle(id) = this.switchToggle(id).bind(this)
    }
    static navigationOptions = {
        title: "Настройки"
    };
    switchToggle(id) {
        if (this.state.selectedItems.includes(id)) {
            console.log("need delete item", id);
            let arr = [...this.state.selectedItems];
            let index = arr.indexOf(id);
            arr.splice(index, 1);
            this.setState(state => {
                return {
                    ...state,
                    selectedItems: arr,
                    testString: "delete1",
                    asyncSettings: arr
                };
            });
            AsyncStorage.removeItem("SiteSettings");
            AsyncStorage.setItem("SiteSettings", JSON.stringify(arr));
        } else {
            console.log("need add item", id);
            this.setState(state => {
                return {
                    ...state,
                    selectedItems: state.selectedItems.concat(id),
                    asyncSettings: state.selectedItems.concat(id),
                    testString: JSON.stringify(state.selectedItems),
                    testString: "delete2"
                };
            });
            AsyncStorage.removeItem("SiteSettings");
            AsyncStorage.setItem(
                "SiteSettings",
                JSON.stringify(this.state.selectedItems.concat(id))
            );
        }
        setTimeout(() => {
            this.updateTokenSetting();
        }, 100);
        setTimeout(() => {
            AsyncStorage.getItem("SiteSettings", (err, value) => {
                this.setState(state => {
                    return {
                        ...state,
                        asyncSettings: value
                    };
                });
            });
        }, 3000);
    }
    // shouldComponentUpdate(nextProps, nextState) {
    //     if (this.state.selectedItems == nextState.selectedItems) {
    //         return false;
    //     }
    //     return true;
    // }
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
                `/set-token?token=${this.state.token}&settings=old&news_settings=${JSON.stringify(this.state.selectedItems)}&version=2`
        );
        request.send();
        console.log(
            "updateTokenSetting Site",
            API_URL +
                `/set-token?token=${this.state.token}
                &settings=old
                &news_settings=${JSON.stringify(this.state.selectedItems)}
                &version=2`
        );
    }
    componentDidMount() {
        // AsyncStorage.clear();
        AsyncStorage.getItem("Token", (err, value) => {
            let token = value ? value : "test-token";
            AsyncStorage.getItem("SiteSettings", (err, value) => {
                this.setState(state => {
                    return {
                        ...state,
                        selectedItems: value
                            ? JSON.parse(value)
                            : Array.from(
                                  this.state.categories,
                                  cat => cat.brief
                              ),
                        token: token
                    };
                });
            });
            setTimeout(() => {
                this.updateTokenSetting();
            }, 100);
        });
    }
    render() {
        console.log("site settings render", this.state);
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: "#efefef" }}>
                <View style={styles.container}>
                    <ScrollView style={{flex: 0, height: '100%'}}>
                        <View
                            style={[
                                listStyles.quoteItem,
                                {
                                    marginLeft: 10,
                                    marginRight: 10,
                                    marginTop: 10,
                                    flex: 0,
                                }
                            ]}
                        >
                            <Text
                                style={{
                                    color: "#808080",
                                    textAlign: "center"
                                }}
                            >
                                Выберите интересные Вам разделы сайта
                                harekrishna.ru для получения уведомлений об
                                обновлениях
                            </Text>
                        </View>
                        <SectionList
                            style={{
                                paddingLeft: 10,
                                paddingRight: 10,
                                paddingBottom: 5,
                                paddingTop: 5,
                                flex: 1
                            }}
                            stickySectionHeadersEnabled={true}
                            renderItem={({ item, index, section }) => (
                                <View
                                    key={item.id}
                                    style={[
                                        listStyles.quoteItem,
                                        {
                                            marginTop: -5,
                                            borderRadius: 0,
                                            shadowRadius: 0,
                                            flex: 1,
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            alignItems: "center"
                                        }
                                    ]}
                                >
                                    <View style={{ maxWidth: "80%" }}>
                                        <Text style={{ fontWeight: "bold" }}>
                                            {item.name ? item.name : item.title}
                                        </Text>
                                    </View>
                                    <Switch
                                        value={
                                            this.state.selectedItems.includes(
                                                item.brief
                                            )
                                                ? true
                                                : false
                                        }
                                        onValueChange={() =>
                                            this.switchToggle(item.brief)
                                        }
                                    />
                                </View>
                            )}
                            renderSectionHeader={({ section: { title } }) => (
                                <View
                                    style={[
                                        listStyles.quoteItem,
                                        {
                                            borderBottomLeftRadius: 0,
                                            borderBottomRightRadius: 0
                                        }
                                    ]}
                                >
                                    <Text style={listStyles.quoteTitle}>
                                        {title}
                                    </Text>
                                </View>
                            )}
                            sections={[
                                {
                                    title: "Разделы",
                                    data: this.state.categories
                                }
                            ]}
                            keyExtractor={(item, index) => item + index}
                        />
                    </ScrollView>
                </View>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({});