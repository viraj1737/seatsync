# SeatSync — design notes

The frontend was rebuilt to be deliberately plain so it is quick to demonstrate and explain.

- One stylesheet: `css/style.css`. No themes, layers or overrides.
- Light background, white cards, simple borders, system fonts, no animations or gradients.
- Five straightforward pages: home, login, register, student portal, admin console.
- AngularJS controllers only make API calls and put the result on `$scope`.
- jQuery shows a small toast; D3.js draws one simple bar chart on the admin page.
- Colour is used only for meaning: green = free, amber = reserved, grey = occupied.
