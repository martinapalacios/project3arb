/** Configuration for a toggleable map layer */
export default interface LayerDefinition {
  /** Unique key */
  key: string;

  /** Title to display in the toggle interface */
  title: string;

  /** True if layer is currently checked on */
  isChecked: boolean;

  /** Names of Mapbox style layers to toggle with layer */
  controlledLayerIds: string[];
}
