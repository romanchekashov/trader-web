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

### CSS Modules usage with React example

- create Component.module.css
- add to Component.tsx:

```tsx
const styles = require("./Component.module.css");
// and use like
<div className={styles.cssClassName}></div>;
```
