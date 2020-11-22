import { useState } from 'preact/hooks'
import { createContext } from 'preact';

const FlowContext = createContext();
const FlowContextProvider = (props) => {
  const [flow, setFlow] = useState({
    selcurr: false
  });

  return (
    <FlowContext.Provider value={{ flow, setFlow }}>
      {props.children}
    </FlowContext.Provider>
  );
};
export { FlowContext, FlowContextProvider };

