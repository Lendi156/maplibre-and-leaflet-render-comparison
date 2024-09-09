/* eslint-disable react/prop-types */
import React from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

class StartRender extends React.Component {
  helpDiv;

  createButtonControl() {
    const MapHelp = L.Control.extend({
      onAdd: () => {
        const helpDiv = L.DomUtil.create("button", "");
        this.helpDiv = helpDiv;
        helpDiv.innerHTML = this.props.title;

        helpDiv.addEventListener("click", () => {
            this.props.handleClick()
        });

        //a bit clueless how to add a click event listener to this button and then
        // open a popup div on the map
        return helpDiv;
      }
    });
    return new MapHelp({ position: "bottomright" });
  }

  componentDidMount() {
    const { map } = this.props;
    const control = this.createButtonControl();
    control.addTo(map);
  }

  componentWillUnmount() {
    this.helpDiv.remove();
  }

  render() {
    return null;
  }
}

const withMap = (Component) => {
  return function WrappedComponent(props) {
    const map = useMap();
    return <Component {...props} map={map} />;
  };
}

export default withMap(StartRender);
