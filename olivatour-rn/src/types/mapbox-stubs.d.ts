// Stub para resolver el error de tipos de mapbox-gl
declare module '@mapbox/point-geometry' {
  export default class Point {
    x: number;
    y: number;
    constructor(x: number, y: number);
  }
}

declare module 'mapbox__point-geometry' {
  export default class Point {
    x: number;
    y: number;
    constructor(x: number, y: number);
  }
}
