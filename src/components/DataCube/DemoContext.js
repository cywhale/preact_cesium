import { useState } from 'preact/hooks'
import { createContext } from 'preact';

const DemoContext = createContext();
const DemoContextProvider = (props) => {
  const [demo, setDemo] = useState({
    selpopu: false
  });

  return (
    <DemoContext.Provider value={{ demo, setDemo }}>
      {props.children}
    </DemoContext.Provider>
  );
};
export { DemoContext, DemoContextProvider };

