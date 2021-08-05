import { useReducer } from "haunted";
import produce from "immer";

const useIReducer = (reducer, initialState) => {
  return useReducer(
    (state, action) =>
      produce(state, draftState => reducer(draftState, action)),
    initialState
  );
};

export default useIReducer;
