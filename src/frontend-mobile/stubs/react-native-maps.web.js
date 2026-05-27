const React = require("react");
const { View } = require("react-native");

function MapView(props) {
  return React.createElement(View, props, props.children);
}

function MapSubComponent() {
  return null;
}

module.exports = MapView;
module.exports.default = MapView;
module.exports.Marker = MapSubComponent;
module.exports.Polyline = MapSubComponent;
module.exports.PROVIDER_GOOGLE = "google";
module.exports.PROVIDER_DEFAULT = "default";
