const Arrow = ({ startX, startY, endX, endY }: any) => {
  const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);
  const length = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);

  return (
    <svg
      width={length}
      height="10"
      style={{ position: "absolute", left: startX, top: startY }}
    >
      <line
        x1="0"
        y1="5"
        x2={length}
        y2="5"
        style={{ stroke: "black", strokeWidth: 2 }}
      />
      <polygon
        points={`0,5 ${length - 10},0 ${length - 10},10`}
        transform={`rotate(${angle} 0 5)`}
        fill="black"
      />
    </svg>
  );
};

export default Arrow;
