import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Animated,
  Modal,
  StatusBar
} from 'react-native';

import { Epub, Streamer } from "epubjs-rn";


class EpubReader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      flow: "scrolled-continuous", // paginated || scrolled-continuous
      location: 6,
      url: "https://s3.amazonaws.com/epubjs/books/moby-dick.epub",
      src: "",
      origin: "",
      title: "",
      toc: [],
      showBars: true,
      showNav: false,
      sliderDisabled: true
    };

    this.streamer = new Streamer();
  }
  static navigationOptions = {
    title: 'Test Book'
    }
  componentDidMount() {
    this.streamer.start()
      .then((origin) => {
        this.setState({origin})
        return this.streamer.get(this.state.url);
      })
      .then((src) => {
        return this.setState({src});
      });

  }

  componentWillUnmount() {
    this.streamer.kill();
  }

  toggleBars() {
    this.setState({ showBars: !this.state.showBars });
  }


  render() {
    return (
      <View style={styles.container}>
        {/* <StatusBar hidden={!this.state.showBars}/> */}
        <Epub style={styles.reader}
              ref="epub"
              //src={"https://s3.amazonaws.com/epubjs/books/moby-dick.epub"}
              src={this.state.src}
              flow={this.state.flow}
              location={this.state.location}
              onLocationChange={(visibleLocation)=> {
                console.log("locationChanged", visibleLocation)
                this.setState({visibleLocation});
              }}
              onLocationsReady={(locations)=> {
                // console.log("location total", locations.total);
                this.setState({sliderDisabled : false});
              }}
              onReady={(book)=> {
                // console.log("Metadata", book.package.metadata)
                // console.log("Table of Contents", book.toc)
                this.setState({
                  title : book.package.metadata.title,
                  toc: book.navigation.toc
                });
              }}
              onPress={(cfi, position, rendition)=> {
                this.toggleBars();
                console.log("press", cfi);
              }}
              onLongPress={(cfi, rendition)=> {
                console.log("longpress", cfi);
              }}
              onViewAdded={(index) => {
                console.log("added", index)
              }}
              beforeViewRemoved={(index) => {
                console.log("removed", index)
              }}
              onSelected={(cfiRange, rendition) => {
                console.log("selected", cfiRange)
                // Add marker
                rendition.highlight(cfiRange, {});
              }}
              onMarkClicked={(cfiRange) => {
                console.log("mark clicked", cfiRange)
              }}
              // themes={{
              //   tan: {
              //     body: {
              //       "-webkit-user-select": "none",
              //       "user-select": "none",
              //       "background-color": "tan"
              //     }
              //   }
              // }}
              // theme="tan"
              // regenerateLocations={true}
              // generateLocations={true}
              origin={this.state.origin}
              onError={(message) => {
                console.log("EPUBJS-Webview", message);
              }}
            />
      </View>

    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  reader: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: '#3F3F3C'
  },
  bar: {
    position:"absolute",
    left:0,
    right:0,
    height:55
  }
});

export default EpubReader;