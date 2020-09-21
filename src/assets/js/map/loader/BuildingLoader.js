import axios from 'axios';
import * as Cesium from 'cesium';
const INSTACNE = axios.create({});
const URL = '/xlgc/data/mockerData/wending2.txt.json';
const PARTY_ACTIVE_URL = '/xlgc/data/mockerData/wending.partyActive.json';
const RESIDENT_ACTIVE_URL = '/xlgc/data/mockerData/wending.residentActive.json';
const [MODEL_URL_BUILDING, MODEL_URL_COMMUNITY_CENTER, MODEL_URL_PARTY_CENTER] = ['/static/models/building.glb', '/static/models/community_center.glb', '/static/models/party_center.glb'];
export default function loadBuildingInfo(viewer) {
  /**
   * 楼栋信息标注
   */
  INSTACNE.get(URL)
    .then((resp) => resp.data)
    .then(({ code, data }) => {
      data.forEach((element) => {
        let x = element.local.split(',')[0] * 1;
        let y = element.local.split(',')[1] * 1;
        let h = 56;
        var position = Cesium.Cartesian3.fromDegrees(x, y, h);
        var heading = Cesium.Math.toRadians(90);
        var pitch = 0;
        var roll = 0;
        var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
        var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
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
          orientation,
          model: {
            uri: MODEL_URL_BUILDING,
            scale: 12,
          },
          // label: {
          //   text: element.name,
          //   font: '15px Microsoft YaHei',
          //   style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          //   fillColor: Cesium.Color.fromCssColorString('#ffffff').withAlpha(1),
          //   outlineWidth: 3,
          //   horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          //   verticalOrigin: Cesium.VerticalOrigin.TOP,
          //   // pixelOffset: new Cesium.Cartesian2(-40, -65), // 偏移量
          //   eyeOffset: Cesium.Cartesian3.fromElements(0, 7, -50),
          // },
          attrInfo: '',
          description: '',
        });
        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(x, y, h + 6),
          label: {
            text: element.name,
            font: '15px Microsoft YaHei',
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            fillColor: Cesium.Color.fromCssColorString('#ffffff').withAlpha(1),
            outlineWidth: 3,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.TOP,
            // pixelOffset: new Cesium.Cartesian2(-40, -65), // 偏移量
            // eyeOffset: Cesium.Cartesian3.fromElements(0, 7, -50),
          },
        });
      });
    });
  /**
   * 党群中心
   */
  INSTACNE.get(PARTY_ACTIVE_URL)
    .then((resp) => resp.data)
    .then((element) => {
      let x = element.local.split(',')[0] * 1 - 0.0001;
      let y = element.local.split(',')[1] * 1 - 0.000225;
      let h = 45;
      var position = Cesium.Cartesian3.fromDegrees(x, y, h);
      var heading = Cesium.Math.toRadians(90);
      var pitch = 0;
      var roll = 0;
      var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
      var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
      viewer.entities.add({
        id: element.id,
        code: element.id,
        name: element.name,
        position: position,
        orientation,
        model: {
          uri: MODEL_URL_PARTY_CENTER,
          scale: 12,
        },
        attrInfo: '',
        description: element.desc,
      });
    });

  /**
   * 社区中心
   */
  INSTACNE.get(RESIDENT_ACTIVE_URL)
    .then((resp) => resp.data)
    .then((element) => {
      let x = element.local.split(',')[0] * 1 - 0.0001;
      let y = element.local.split(',')[1] * 1 + 0.0001;
      let h = 45;
      var position = Cesium.Cartesian3.fromDegrees(x, y, h);
      var heading = Cesium.Math.toRadians(90);
      var pitch = 0;
      var roll = 0;
      var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
      var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
      viewer.entities.add({
        id: element.id,
        code: element.id,
        name: element.name,
        orientation,
        position,
        model: {
          uri: MODEL_URL_COMMUNITY_CENTER,
          scale: 12,
        },
        attrInfo: '',
        description: element.desc,
      });
    });
}
