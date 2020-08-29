import { defined, CustomDataSource, EventHelper, EntityCollection } from 'cesium';
class EntityManager {
  constructor(viewer) {
    const {
      dataSourceDisplay: { defaultDataSource, dataSources },
    } = viewer;
    this.createCustomDataSourceByGroupId = (groupId) => {
      let dataSource = this.groupDatasourceMap.get(groupId);
      if (!dataSource) {
        dataSource = new CustomDataSource(groupId);
        this.groupDatasourceMap.set(groupId, dataSource);
      }
      dataSources.add(dataSource);
      return dataSource;
    };

    let eventHelper = new EventHelper();
    eventHelper.add(
      dataSources.dataSourceAdded,
      (dataSources, dataSourceAdded) => {
        if (dataSourceAdded instanceof CustomDataSource) {
          eventHelper.add(
            dataSourceAdded.entities.collectionChanged,
            (collection, added, removed, changed) => {
              let that = this;
              added.forEach((entity) => {
                that.idEntityMap.set(entity.id, entity);
              });
              removed.forEach((entity) => {
                that.idEntityMap.delete(entity.id);
              });
            },
            this,
          );
          this.customDataSources.add(dataSourceAdded);
        }
      },
      this,
    );
    eventHelper.add(
      dataSources.dataSourceRemoved,
      (dataSources, dataSourceRemoved) => {
        this.customDataSources.delete(dataSourceRemoved);
        let that = this;
        dataSourceRemoved.entities.values().forEach((entity) => {
          that.idEntityMap.delete(entity.id);
        });
      },
      this,
    );

    this.customDataSources = new Set([defaultDataSource]);
    this.defaultGroupDataSource = defaultDataSource;
    this.groupDatasourceMap = new Map(); // K: groupId, V: CustomDataSource
    this.idEntityMap = new Map(); // K: entityId, V: Entity
  }

  getById(id) {
    return this.entityMap.get(id);
  }

  add(entity, groupId) {
    if (defined(groupId)) {
      let datasource = this.groupDatasourceMap.get(groupId);
      return EntityManager.putEntity(datasource || this.createCustomDataSourceByGroupId(groupId), entity);
    } else {
      return EntityManager.putEntity(this.defaultGroupDataSource, entity);
    }
  }

  removeById(entityId) {
    let entity = this.idEntityMap.get(entityId);
    if (entity) {
      entity.entityCollection.removeById(entityId);
    }
  }

  removeByGroupId(groupId) {
    let dataSource = this.groupDatasourceMap.get(groupId);
    if (dataSource) {
      dataSource.entities.removeAll();
    }
  }

  static putEntity(datasource, entity) {
    if (defined(datasource) && defined(datasource.entities)) {
      return datasource.entities.add(entity);
    }
    return null;
  }
}
export default EntityManager;
