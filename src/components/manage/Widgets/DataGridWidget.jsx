import React, { useState, useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import cx from 'classnames';
import move from 'lodash-move';
import { FormFieldWrapper, Field } from '@plone/volto/components';
import DragDropList from '@plone/volto/components/manage/DragDropList/DragDropList';
import { Grid, Button, Form, Icon } from 'semantic-ui-react';
import './data-grid-widget.less';
import dragSVG from '@plone/volto/icons/drag.svg';

const messages = defineMessages({
  addTerm: {
    id: 'data_grid_widget_add_term',
    defaultMessage: 'Add term',
  },
  deleteTerm: {
    id: 'data_grid_widget_remove_term',
    defaultMessage: 'Remove term',
  },
});

const defaultSchema = {
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: [],
    },
  ],
  properties: {},
  required: [],
};

const DataGridWidget = (props) => {
  const intl = useIntl();
  const {
    value,
    id,
    onChange,
    items = defaultSchema,
    widgetOptions,
    required = false,
    error = [],
    multilingual_options,
    description = null,
    className,
    fieldSet,
    title,
    noForInFieldLabel,
  } = props; //, required, title, description
  const schema = items;
  const [values, setValues] = useState([]);
  const [defaultItem, setDefaultItem] = useState({});

  useEffect(() => {
    let default_item = {};
    if (schema.properties && Object.keys(defaultItem).length === 0) {
      Object.keys(schema?.properties ?? {}).forEach((field) => {
        default_item[field] = null;
      });
      setDefaultItem(default_item);
    }
  }, [schema, defaultItem]);

  useEffect(() => {
    setValues(value?.length > 0 ? value : [{ ...defaultItem }]);
  }, [value, defaultItem]);

  const handleChangeConfiguration = (v) => {
    onChange(id, v);
  };

  const onChangeTerm = (index, field, value) => {
    let newValues = [...values];
    newValues[index][field] = value || null;

    handleChangeConfiguration(newValues);
  };

  const addTerm = () => {
    let newValues = [...values, { ...defaultItem }];
    setValues(newValues);
  };

  const deleteTerm = (index) => {
    let newValues = [...values];
    newValues.splice(index, 1);

    handleChangeConfiguration(newValues);
  };

  const moveTerm = (source, destination) => {
    const newValues = move([...values], source, destination);

    handleChangeConfiguration(newValues);
  };

  const allowDelete = widgetOptions?.allow_delete ?? true;
  const allowAppend = widgetOptions?.allow_insert ?? true;
  const allowReorder = widgetOptions?.allow_insert ?? true;
  // TODO: auto_append

  return (
    <FormFieldWrapper {...props} wrapped={false}>
      <Form.Field
        inline
        required={required}
        error={error.length > 0}
        className={cx(
          description ? 'help' : '',
          className,
          `field-wrapper-${id}`,
          multilingual_options?.language_independent
            ? 'language-independent-field'
            : null,
        )}
      >
        <Grid>
          <Grid.Row stretched>
            <Grid.Column width="12">
              <div className="wrapper">
                <label
                  id={`fieldset-${fieldSet}-field-label-${id}`}
                  htmlFor={noForInFieldLabel ? null : `field-${id}`}
                >
                  {/* <i
                    aria-hidden="true"
                    className="grey bars icon drag handle"
                  /> */}
                  {title}
                </label>
              </div>
              {/* {onEdit && !isDisabled && (
                <div className="toolbar" style={{ zIndex: '2' }}>
                  <button
                    aria-label={intl.formatMessage(messages.edit)}
                    className="item ui noborder button"
                    onClick={(evt) => {
                      evt.preventDefault();
                      onEdit(id);
                    }}
                  >
                    <IconOld name="write square" size="large" color="blue" />
                  </button>
                  <button
                    aria-label={intl.formatMessage(messages.delete)}
                    className="item ui noborder button"
                    onClick={(evt) => {
                      evt.preventDefault();
                      onDelete(id);
                    }}
                  >
                    <IconOld name="close" size="large" color="red" />
                  </button>
                </div>
              )} */}
              {description && (
                <Grid.Row stretched>
                  <Grid.Column stretched width="12">
                    <p className="help">
                      {multilingual_options
                        ? `${intl.formatMessage(
                            messages.language_independent,
                          )} `
                        : null}
                      {description}
                    </p>
                  </Grid.Column>
                </Grid.Row>
              )}
              <div className="data-grid-widget">
                {schema && (
                  <>
                    <DragDropList
                      childList={values.map((term, index) => [
                        index.toString(),
                        term,
                      ])}
                      onMoveItem={(result) => {
                        const { source, destination } = result;
                        if (!destination) {
                          return;
                        }
                        moveTerm(source.index, destination.index);
                        return true;
                      }}
                      as={(props) => (
                        <Grid {...props} stackable columns="equal" />
                      )}
                    >
                      {({ child: term, childId, index, draginfo }) => {
                        return (
                          <Grid.Row key={childId} stretched>
                            {allowReorder && (
                              <div
                                style={{
                                  display: 'inline-block',
                                }}
                                {...draginfo.dragHandleProps}
                                className="drag handle wrapper"
                              >
                                <Icon name={dragSVG} size="18px" />
                              </div>
                            )}
                            {schema.fieldsets.map((fieldset) => {
                              return fieldset.fields.map((field) => (
                                <Grid.Column
                                  className="field-column"
                                  key={field}
                                >
                                  <label
                                    htmlFor={'field-' + field}
                                    className={
                                      schema.required.includes(field)
                                        ? 'required'
                                        : ''
                                    }
                                  >
                                    {schema.properties[field].title}
                                  </label>

                                  <Field
                                    {...schema.properties[field]}
                                    id={field}
                                    fieldSet={fieldset.title.toLowerCase()}
                                    formData={term}
                                    focus={false}
                                    value={term[field]}
                                    required={schema.required.includes(field)}
                                    onChange={(id, value) =>
                                      onChangeTerm(index, id, value)
                                    }
                                    key={field}
                                    wrapped={false}
                                    placeholder={schema.properties[field].title}
                                  />

                                  <p className="help">
                                    {schema.properties[field].description}
                                  </p>
                                </Grid.Column>
                              ));
                            })}
                            {allowDelete && (
                              <Grid.Column
                                width={1}
                                className="term-actions"
                                verticalAlign="middle"
                              >
                                <Button
                                  icon="trash"
                                  negative
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    deleteTerm(index);
                                  }}
                                  className="delete-term"
                                  title={intl.formatMessage(
                                    messages.deleteTerm,
                                  )}
                                  size="mini"
                                />
                              </Grid.Column>
                            )}
                          </Grid.Row>
                        );
                      }}
                    </DragDropList>
                    {allowAppend && (
                      <div className="bottom-buttons">
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addTerm();
                          }}
                          primary
                          size="mini"
                        >
                          {intl.formatMessage(messages.addTerm)}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Form.Field>
    </FormFieldWrapper>
  );
};

export default DataGridWidget;
