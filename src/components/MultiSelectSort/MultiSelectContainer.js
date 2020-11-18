//https://github.com/dowjones/react-dropdown-tree-select/issues/313
//https://codesandbox.io/s/aged-field-uxkrf?fontsize=14&hidenavigation=1&theme=dark&file=/src/dropdownTree.container.js

import React from "preact/compat";
import DropdownTreeSelect from "react-dropdown-tree-select";

export const MultiSelectContainer = React.memo((props) => {
  return <DropdownTreeSelect {...props} />;
});

