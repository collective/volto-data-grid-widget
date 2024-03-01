import React from 'react';
import config from '@plone/volto/registry';

const Extender = (props) => {
  const { name, field, contentType } = props;
  // console.log(config.widgets.data_grid.extender);
  const extender_id = `${contentType}_${field}_${name}`;

  const extender = config.widgets?.data_grid?.extender?.[extender_id];

  return extender ? (
    <div className={`extender ${extender_id}`}>{extender(props)}</div>
  ) : (
    <></>
  );
};

export default Extender;
