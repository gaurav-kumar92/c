export type Block =
  | {
      kind: "number";
      value: number;
    }
  | {
      kind: "operator";
      op: "+" | "-" | "*" | "/";
    }
  | {
      kind: "bomb";
    };

export type Splash = {
  x: number;
  y: number;
  progress: number;
};
