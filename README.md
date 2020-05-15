# Trader Web

## Updates in external npm packages

### react-financial-charts

- Fix Trendline:
```bash
node_modules/react-financial-charts/lib/interactive/TrendLine.js

constructor(props) {
    ...
    this.nodes = [];
}
```

```bash
node_modules/react-financial-charts/lib/interactive/wrapper/EachTrendLine.js

constructor(props) {
    ...
    this.nodes = {};
}
```

