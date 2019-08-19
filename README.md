# React-Native-Gauge
A gauge in react-native

Modified version of https://github.com/pritishvaidya/react-native-speedometer


```
import Gauge from './gauge';

...

render() {
  settings =
      {
          minValue: 0,
          maxValue: 200,
          tittle: 'pm10 µg/m³',
          range: [
              {color: '#14eb6e', min: 0, max: 39.999, text: 'Normal'},
              {color: '#f2cf1f', min: 40, max: 49.999, text:'High'},
              {color: '#ff2900', min: 50, max: 200, text: 'Very High'},
          ]
      }

  return (
    // Gauge range from 180 to 270
    <Gauge borderMargin={20} gaugeRange={270}
           value= 17
           settings={settings}/>
  ); 
}
```
