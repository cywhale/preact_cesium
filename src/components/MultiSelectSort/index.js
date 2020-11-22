//https://codesandbox.io/s/react-dropdown-tree-select-hook-y8fm8
//import React from 'preact/compat'
//import React, { useState } from 'preact/compat';
//import DropdownTreeSelect from 'react-dropdown-tree-select';
import { MultiSelectContainer } from './MultiSelectContainer';
import { useContext, useMemo} from "preact/hooks";
//For completion, it's possible to make CSS Modules work outside the /components folder?
//https://stackoverflow.com/questions/49118172/preact-cli-css-modules
import { EarthContext } from "../Earth/EarthContext";
import { FlowContext } from "../Layer/FlowContext";
import 'react-dropdown-tree-select/dist/styles.css'
import '../../style/style_dropdown.scss';
import data from './data.json';

const MultiSelectSort = () => {
  const { earth, setEarth } = useContext(EarthContext);
  const { flow, setFlow } = useContext(FlowContext);
/*const [ value, setValue ] = useState({
    leaf: []
  });*/
  const rdata = [...data];
  const onChange = useMemo(() => (_, selectedNodes) => { //async (curNode, selectedNodes) => {
    //console.log('onChange::', curNode, selectedNodes)
    let valx = [];
    selectedNodes.map((item) => {
      if (item.hasOwnProperty('_children')) {
        item._children.map((child) => {
          let nodex = child.substring(6).split("-").reduce(
            (prev, curr) => {
              let leaf = prev[parseInt(curr)];
              if (leaf.hasOwnProperty('children')) {
                return leaf.children;
              } else {
              return leaf.value;
              }
            },
            rdata
          ); //rdts1-0-0-0
          if (typeof nodex !== 'string' && nodex.length>1) {
            nodex.map((item) => {
              valx.push(item.value);
            });
          } else {
            valx.push(nodex);
          }
        });
      } else {
        valx.push(item.value);
      }
    });
    //console.log('Get leaf value: ', valx);
    handleLeafSelect(valx);
  }, []);

  const handleLeafSelect = async (value) => { //useCallback(async () => {
    //if (value.indexOf('wind3d') >= 0) {
      //console.log('Wind3d: ', value.indexOf('wind3d'));
    await setEarth((preState) => ({
        ...preState,
        selwind: value.indexOf('wind3d') >= 0,
    }));
    await setFlow((preState) => ({
        ...preState,
        selcurr: value.indexOf('current') >= 0
    }));
  };//, []);
/*useEffect(() => {
    if (value.leaf && value.leaf.length > 0) { handleLeafSelect(); }
  }, [value.leaf]);

  const onAction = (node, action) => {
    return //console.log('onAction::', action, node)
  }
  const onNodeToggle = curNode => {
    return //console.log('onNodeToggle::', curNode)
  }
  <DropdownTreeSelect data={data} onChange={onChange} onAction={onAction} onNodeToggle={onNodeToggle} inlineSearchInput={tr$
*/
//const MultiSelectSort = () => (
  return(
    <MultiSelectContainer data={data} onChange={onChange} inlineSearchInput={true} />
  );
};
export default MultiSelectSort;
