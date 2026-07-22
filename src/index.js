import DataGridWidget from './components/manage/Widgets/DataGridWidget.jsx';
import DataGridWidgetExtender from './components/Extender.jsx';
export { DataGridWidget, DataGridWidgetExtender };

const applyConfig = (config) => {
  config.widgets.widget.data_grid = DataGridWidget;
  return config;
};

export default applyConfig;
