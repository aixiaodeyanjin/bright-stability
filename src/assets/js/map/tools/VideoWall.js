// var sphere = viewer.entities.add({
//     position: Cesium.Cartesian3.fromDegrees( 121.643521, 31.247417, 0),
//     wall: {
//       positions: Cesium.Cartesian3.fromDegreesArrayHeights([
//          121.643521, 31.247417, 3000.0,
//         121.643521, 31.235685, 3000.0,

//       ]),
//       maximumHeights: [3000, 3000],
//      // minimumHeights: [2000.0, 2000.0],
//       material: videoElement
//     }
//   })
/**
 * 视频墙实现
 */
import {Entity, Cartesian3} from 'cesium'
class VideoWall {
  static initDemo (video) {
    return VideoWall.createVideoWall(video, [
      118.94578470, 32.055222128, 30,
      118.90590489, 32.055222128, 30
    ], [3000, 3000])
  }

  static createVideoWall (video, positions, heights) {
    return new Entity({
      position: Cartesian3.fromDegrees(118.9060, 32.0051, 0),
      wall: {
        positions: Cartesian3.fromDegreesArrayHeights(positions),
        maximumHeights: heights,
        material: video
      }
    })
  }
}
