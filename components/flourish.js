const React = require('react');

class Flourish extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      markup: ''
    };
  }

  componentDidMount() {
    let url = `https://public.flourish.studio`;

    if (this.props.story) {
      url = `${url}/story/${this.props.story}/`;
    } else if (this.props.visualisation) {
      url = `${url}/visualisation/${this.props.visualisation}/`;
    } else {
      throw new Error('Please provide the id of a story or a visualisation.');
    }


    console.log(url);
    const provider = "https://app.flourish.studio/api/v1/oembed";

    fetch(`${provider.replace('{format}', 'json')}?format=json&url=${encodeURIComponent(url)}`)
      .then((response) => response.json())
      .then((json) => {
        console.log(json);
        this.setState({
          markup: json.html
        });


      })
  }

  componentWillReceiveProps(props) {
    if (this.iframe && props.slide !== this.props.slide) {
      const oldUrl = this.iframe.src;
      console.log('new slide: ' + props.slide);
      if (oldUrl.indexOf('slide-') > -1) {
        this.iframe.src = this.iframe.src.replace(/slide-\d+/g, `slide-${props.slide}`)
      } else {
        this.iframe.src = this.iframe.src + '#slide-' + props.slide;
      }
      console.log('new source: ' + this.iframe.src);
    }
  }

  handleIframeUpdate(obj) {
    this.iframe.height = window.innerHeight;
  }

  render() {
    const { idyll, hasError, updateProps, ...props } = this.props;
    if (this.state.markup) {
      return (
        <div ref={(el) => {
          if (el) {
            this.iframe = el.querySelector('iframe');
            this.iframe.onload = this.handleIframeUpdate.bind(this);
          }
        }} dangerouslySetInnerHTML={{ __html: this.state.markup }}  />
      );
    }
    return null;
  }
}

module.exports = Flourish;