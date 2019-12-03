const makeSVGComponent = component =>
  class CustomElement extends SVGElement {
    constructor() {
      super();

      const shadow = this.attachShadow({mode: 'open'});

      var svg = document.createElement('svg');

      component(svg);

      shadow.appendChild(div);
    }
  }