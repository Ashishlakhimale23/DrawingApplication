export const GetSelectedShape = (shape: Shape, mouseX: number, mouseY: number) => {
    const tolerance = 10;

    const minX = Math.min(shape.x, shape.x + shape.width);
    const maxX = Math.max(shape.x, shape.x + shape.width);
    const minY = Math.min(shape.y, shape.y + shape.height);
    const maxY = Math.max(shape.y, shape.y + shape.height);
    return (
      (Math.abs(mouseX - minX) <= tolerance &&
        minY <= mouseY &&
        mouseY <= maxY) ||
      (Math.abs(mouseY - minY) <= tolerance &&
        minX <= mouseX &&
        mouseX <= maxX) ||
      (Math.abs(mouseX - maxX) <= tolerance &&
        minY <= mouseY &&
        mouseY <= maxY) ||
      (Math.abs(mouseY - maxY) <= tolerance && minX <= mouseX && mouseX <= maxX)
    );
  };