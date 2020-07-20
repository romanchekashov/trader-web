# Trader Web

## Updates in external npm packages

### react-financial-charts

- Fix Trendline And InteractiveYCoordinate:
```bash
node_modules/react-financial-charts/lib/interactive/TrendLine.js
node_modules/react-financial-charts/lib/interactive/InteractiveYCoordinate.js

constructor(props) {
    ...
    this.nodes = [];
}
```

```bash
node_modules/react-financial-charts/lib/interactive/wrapper/EachTrendLine.js
node_modules/react-financial-charts/lib/interactive/wrapper/EachInteractiveYCoordinate.js

constructor(props) {
    ...
    this.nodes = {};
}
```

