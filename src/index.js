import DataGridWidget from './components/manage/Widgets/DataGridWidget.jsx';
export { DataGridWidget };

const applyConfig = (config) => {
  config.widgets.widget.data_grid = DataGridWidget;
  return config;
};

export default applyConfig;
