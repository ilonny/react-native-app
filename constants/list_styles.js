import React, { Component } from 'react';
import { StyleSheet } from 'react-native'
export const listStyles = StyleSheet.create({
    quoteItem: {
        backgroundColor: "#fff",
        marginTop: 5,
        marginBottom: 5,
        padding: 20,
        borderRadius: 10,
        shadowColor: "#000",
        shadowRadius: 5,
        // shadowOffset:{  width: 10,  height: 10,  },
        shadowOpacity: 0.1,
        flex: 1,
    },
    quoteTitle: {
        color: "#75644f",
        fontSize: 16,
        fontWeight: 'bold'
    },
    quoteBottom:{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    quoteBottomText: {
        flex: 1,
    },
    arrowCircle: {
        // flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        height: 40,
        borderRadius: 60,
        flex: 0,
        backgroundColor: '#c1ae97',
        marginLeft: 5,
    },
    arrowCircleInside: {
        marginRight: 0,
        // marginTop:
    },
    bookTop:{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        marginTop: 10,
    }
})