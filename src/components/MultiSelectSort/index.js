//https://codesandbox.io/s/react-dropdown-tree-select-hook-y8fm8
//import React from 'preact/compat'
//import React, { useState } from 'preact/compat';
//import DropdownTreeSelect from 'react-dropdown-tree-select';
import { MultiSelectContainer } from './MultiSelectContainer';
import { useContext, useMemo } from "preact/hooks"; //useState, useEffect
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
/*const [ toggle, setToggle ] = useState({
    demo1: false
  });*/
//const [ rdata, setRData ] = useState([...data])
  const rdata = [...data];
/*const [ value, setValue ] = useState({
    leaf: []
  });*/
  //const rdata = [...data];
/*const onFocus = useMemo(() => () => {//(node, action) => {
    console.log('onBlur::');//, action, node)
    checkDemoListener();
  },[]);
*/
/*const onNodeToggle = useMemo(() => (curNode) => {
      let elem = document.getElementById("rdts1-2-0");
      console.log("On Node: ", curNode);
      if (elem !== null && curNode._id === "rdts1-2-0" && !toggle.demo1) {
        setToggle((preState) => ({
          ...preState,
          demo1: true,
        }));
      }
  }, []);
*/
  const onChange = useMemo(() => (curNode, selectedNodes) => { //async (curNode, selectedNodes) => {
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
    console.log('Get leaf value: ', valx);
    handleLeafSelect(valx);
  }, []);

  const handleLeafSelect = (value) => { //useCallback(async () => {
    //if (value.indexOf('wind3d') >= 0) {
      //console.log('Wind3d: ', value.indexOf('wind3d'));
    setEarth((preState) => ({
        ...preState,
        selReady: value.indexOf('population') >= 0, //temp used
        selwind: value.indexOf('wind3d') >= 0,
    }));
    setFlow((preState) => ({
        ...preState,
        selcurr: value.indexOf('current') >= 0
    }));
  };//, []);
/*const checkDemoListener = () => {
    //let kelem = document.getElementById("rdts1-2-0-0_button");
    //if (kelem !== null) {
    //kelem.addEventListener('click', function() {
        let ielem = document.getElementById("rdts1-2-0-0");
        if (ielem !== null && ielem.disabled) {
          ielem.disabled = false;
          let jelem = document.querySelector("#rdts1-2-0-0_li > i");
          jelem.style.visibility = "visible";
        }
        //ielem.checked = false;
        //let xelem = document.getElementById("rdts1-2-0-0_tag");
        //if (xelem !== null) { xelem.style.display = "none"; }
      //});
    //}
  } */
/*useEffect(() => {
    if (toggle.demo1) {
      let ielem = document.getElementById("rdts1-2-0-0");
      if (ielem !== null) {
        ielem.disabled = false;
        //elem.removeAttribute('disabled');
        let jelem = document.querySelector("#rdts1-2-0-0_li > i");
        jelem.style.visibility = "visible";

        setEarth((preState) => ({
          ...preState,
          selReady: true,
        }));
      } else {
        setToggle((preState) => ({
          ...preState,
          demo1: false,
        }));
      }
    }
    //addCheckDemoListener();
  }, [toggle]);
*/
//const MultiSelectSort = () => ( //onNodeToggle={onNodeToggle}
  return(
    <MultiSelectContainer data={data} onChange={onChange} inlineSearchInput={true} />
  );
};
export default MultiSelectSort;
