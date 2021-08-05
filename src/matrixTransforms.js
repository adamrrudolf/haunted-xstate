export function verticals(matrix) {
  return matrix[0].map((row, index) => matrix.map(row => row[index]));
}

export function diagonals(matrix) {
  return [
    matrix.reduce((diagonal, row, index) => [...diagonal, row[index]], []),
    matrix.reduce(
      (diagonal, row, index) => [...diagonal, row[matrix.length - index - 1]],
      []
    )
  ];
}
