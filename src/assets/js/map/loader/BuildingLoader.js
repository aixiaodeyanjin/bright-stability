import axios from 'axios'
import * as Cesium from 'cesium'
const INSTACNE = axios.create({})
const URL = '/xlgc/data/mockerData/wending2.txt.json'
const PARTY_ACTIVE_URL = '/xlgc/data/mockerData/wending.partyActive.json'
const RESIDENT_ACTIVE_URL = '/xlgc/data/mockerData/wending.residentActive.json'
const [MODEL_URL_BUILDING, MODEL_URL_COMMUNITY_CENTER, MODEL_URL_PARTY_CENTER] = ['/static/models/building.glb', '/static/models/community_center.glb', '/static/models/party_center.glb']
export default function loadBuildingInfo (viewer) {
  INSTACNE.get(URL).then(resp => resp.data).then(({code, data}) => {
    data.forEach(element => {
      let x = element.local.split(',')[0] * 1
      let y = element.local.split(',')[1] * 1
      let h = 60
      viewer.entities.add({
        id: element.id,
        name: element.name,
        buildingMaster: element.buildingMaster,
        gridMater: element.gridMater,
        unitInfo: element.unitInfo,
        totalInfo: element.totalInfo,
        focusLst: element.focusLst,
        partyLst: element.partyLst,
        tenantLst: element.tenantLst,
        residentLst: element.residentLst,
        position: Cesium.Cartesian3.fromDegrees(x, y, h),
        model: {
          uri: MODEL_URL_BUILDING,
          scale: 1
        },
        label: {
          text: element.name,
          font: '12px Microsoft YaHei',
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          fillColor: Cesium.Color.fromCssColorString(
            '#ffffff'
          ).withAlpha(1),
          outlineWidth: 3,
          horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(15, -2), // 偏移量
          disableDepthTestDistance: 1000000000
        },
        attrInfo: '',
        description: ''
      })
    })
  })
  INSTACNE.get(PARTY_ACTIVE_URL).then(resp => resp.data).then(element => {
    let x = element.local.split(',')[0] * 1
    let y = element.local.split(',')[1] * 1
    let h = 38
    viewer.entities.add({
      id: element.id,
      code: element.id,
      name: element.name,
      position: Cesium.Cartesian3.fromDegrees(x, y, h),
      label: {
        text: element.name,
        font: '12px Microsoft YaHei',
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        fillColor: Cesium.Color.fromCssColorString(
          '#ffffff'
        ).withAlpha(1),
        outlineWidth: 3,
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(15, -2), // 偏移量
        disableDepthTestDistance: 1000000000
      },
      model: {
        uri: MODEL_URL_COMMUNITY_CENTER,
        scale: 1
      },
      attrInfo: '',
      description: element.desc
    })
  })
  INSTACNE.get(RESIDENT_ACTIVE_URL).then(resp => resp.data).then(element => {
    let x = element.local.split(',')[0] * 1
    let y = element.local.split(',')[1] * 1
    let h = 38
    viewer.entities.add({
      id: element.id,
      code: element.id,
      name: element.name,
      position: Cesium.Cartesian3.fromDegrees(x, y, h),
      label: {
        text: element.name,
        font: '12px Microsoft YaHei',
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        fillColor: Cesium.Color.fromCssColorString(
          '#ffffff'
        ).withAlpha(1),
        outlineWidth: 3,
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(15, -2), // 偏移量
        disableDepthTestDistance: 1000000000
      },
      model: {
        uri: MODEL_URL_PARTY_CENTER,
        scale: 1
      },
      attrInfo: '',
      description: element.desc
    })
  })
}
