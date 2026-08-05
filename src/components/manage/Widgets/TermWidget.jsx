import { Grid } from 'semantic-ui-react';
import { Field } from '@plone/volto/components';

export default function TermWidget({ schema, term, onChangeTerm, index }) {
  return schema.fieldsets.map((fieldset) => {
    return fieldset.fields.map((field) => (
      <Grid.Column className="field-column" key={field}>
        <label
          htmlFor={`field-${field}-${index}`}
          className={schema.required.includes(field) ? 'required' : ''}
        >
          {schema.properties[field].title}
        </label>

        <Field
          {...schema.properties[field]}
          id={`${field}-${index}`}
          fieldSet={fieldset.title.toLowerCase()}
          formData={term}
          focus={false}
          value={term[field]}
          required={schema.required.includes(field)}
          onChange={(_id, value) => onChangeTerm(index, field, value)}
          key={field}
          wrapped={false}
          placeholder={schema.properties[field].title}
        />

        <p className="help">{schema.properties[field].description}</p>
      </Grid.Column>
    ));
  });
}
