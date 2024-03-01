import React, { useState, useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import cx from 'classnames';
import move from 'lodash-move';
import { v4 as uuid } from 'uuid';
import { FormFieldWrapper, Icon } from '@plone/volto/components';
import { injectLazyLibs } from '@plone/volto/helpers/Loadable/Loadable';
import { Grid, Button, Form } from 'semantic-ui-react';
import './data-grid-widget.less';
import Extender from 'volto-data-grid-widget/components/Extender';
import TermWidget from 'volto-data-grid-widget/components/manage/Widgets/TermWidget';
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
    required = false,
    error = [],
    multilingual_options,
    description = null,
    className,
    fieldSet,
    title,
    noForInFieldLabel,
    reactBeautifulDnd,
    allow_delete = true,
    allow_append = true,
    allow_reorder = false,
    // TODO: auto_append (it is true by default in the classic widget)
  } = props;
  const { DragDropContext, Droppable, Draggable } = reactBeautifulDnd;
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
    setValues(
      value?.length > 0
        ? addUuidIfMissing(value)
        : [{ ...defaultItem, __key__: uuid() }],
    );
  }, [value, defaultItem]);

  const handleChangeConfiguration = (v) => {
    onChange(id, v);
  };

  const onChangeTerm = (index, field, value) => {
    let newValues = [...values];
    if (field) {
      newValues[index][field] = value || null;
    } else {
      //change all fields of term
      newValues[index] = value || null;
      newValues[index].__key__ = values[index].__key__; //no change __key__ field
    }

    handleChangeConfiguration(newValues);
  };

  const addTerm = () => {
    let newValues = [...values, { ...defaultItem, __key__: uuid() }];
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
                  {title}
                </label>
                <Extender
                  name="label"
                  field={id}
                  contentType={props.formData?.['@type']}
                  value={value}
                  title={title}
                  onChange={(field, value) => handleChangeConfiguration(value)}
                />
              </div>
              {description && (
                <p className="help">
                  {multilingual_options
                    ? `${intl.formatMessage(messages.language_independent)} `
                    : null}
                  {description}
                </p>
              )}
              <div className="data-grid-widget">
                {schema && (
                  <>
                    <DragDropContext
                      onDragEnd={(result) => {
                        const { source, destination } = result;
                        if (!destination) {
                          return;
                        }
                        moveTerm(source.index, destination.index);
                        return true;
                      }}
                    >
                      <Droppable droppableId={`droppable-field-${id}`}>
                        {(provided, snapshot) => {
                          return (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              style={getListStyle(snapshot.isDraggingOver)}
                            >
                              {values?.map((term, index) => (
                                <Draggable
                                  key={term.__key__}
                                  draggableId={term.__key__}
                                  index={index}
                                  isDragDisabled={!allow_reorder}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      style={getItemStyle(
                                        snapshot.isDragging,
                                        provided.draggableProps.style,
                                      )}
                                    >
                                      <div className="item-wrapper">
                                        <Extender
                                          name="item"
                                          field={id}
                                          contentType={
                                            props.formData?.['@type']
                                          }
                                          value={term}
                                          title={'Riga ' + (index + 1)}
                                          onChange={(field, value) => {
                                            onChangeTerm(index, null, value);
                                          }}
                                        />
                                        <Grid stackable columns="equal">
                                          <Grid.Row stretched>
                                            <div
                                              style={{
                                                display: allow_reorder
                                                  ? 'inline-block'
                                                  : 'none',
                                              }}
                                              {...provided.dragHandleProps}
                                              className="drag handle wrapper"
                                            >
                                              <Icon
                                                name={dragSVG}
                                                size="18px"
                                              />
                                            </div>

                                            <TermWidget
                                              schema={schema}
                                              term={term}
                                              onChangeTerm={onChangeTerm}
                                              index={index}
                                            />
                                            {allow_delete && (
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
                                        </Grid>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          );
                        }}
                      </Droppable>
                    </DragDropContext>
                    {allow_append && (
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

export default injectLazyLibs('reactBeautifulDnd')(DataGridWidget);

const getItemStyle = (isDragging, draggableStyle) => {
  return {
    // some basic styles to make the items look a bit nicer
    width: '100%',
    userSelect: 'none',
    cursor: isDragging ? 'grabbing !important' : undefined,
    // change background colour if dragging
    background: isDragging ? '#f3f3f3' : undefined,
    borderRadius: isDragging ? '4px' : undefined,

    // styles we need to apply on draggables
    ...draggableStyle,
  };
};

const getListStyle = (isDraggingOver) => ({
  border: isDraggingOver ? '1px solid #eee' : undefined,
  borderRadius: isDraggingOver ? '4px' : undefined,
});

const addUuidIfMissing = (value) => {
  if (value?.length > 0) {
    return value.map((item) => {
      if (!item.__key__) {
        item.__key__ = uuid();
      }
      return item;
    });
  }
  return value;
};
