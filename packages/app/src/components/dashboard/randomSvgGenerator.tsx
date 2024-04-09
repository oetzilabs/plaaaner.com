import { createSignal } from "solid-js";

export const RandomSVGBackground = () => {
  const [svgCode, setSvgCode] = createSignal(generateRandomSvg());

  return <div innerHTML={svgCode()} />;
};

const generateRandomSvg = () => {
  const numPolygons = getRandomInt(3, 8); // Random number of polygons between 3 and 8
  let svg = '<svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">';

  for (let i = 0; i < numPolygons; i++) {
    const numSides = getRandomInt(3, 8); // Random number of sides for each polygon between 3 and 8
    const points = generateRandomPolygonPoints(numSides);
    const fillColor = getRandomColor();
    const opacity = Math.random(); // Random opacity between 0 and 1

    svg += `<polygon points="${points}" fill="${fillColor}" fill-opacity="${opacity}" />`;
  }

  svg += "</svg>";
  return svg;
};

const generateRandomPolygonPoints = (numSides: number) => {
  let points = "";

  for (let i = 0; i < numSides; i++) {
    const x = getRandomInt(5, 95); // Random x-coordinate between 5 and 95
    const y = getRandomInt(5, 95); // Random y-coordinate between 5 and 95
    points += `${x},${y} `;
  }

  return points.trim();
};

const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomColor = () => {
  return Math.random() < 0.5 ? "black" : "white"; // Randomly choose between black and white
};

export default RandomSVGBackground;
