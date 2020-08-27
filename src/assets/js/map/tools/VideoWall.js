import {Entity, Cartesian3} from 'cesium'
/**
 * 视频墙实现
 */
class VideoWall {
  static initDemo (video) {
    return VideoWall.createVideoWall(video, [
      118.90528343487152, 32.0564011141022, 43,
      118.90528829166061, 32.05647508768486, 43
    ], [35, 35])
  }

  static createVideoWall (video, positions, heights) {
    return new Entity({
      position: Cartesian3.fromDegrees(118.9060, 32.0051, 35),
      wall: {
        positions: Cartesian3.fromDegreesArrayHeights(positions),
        minimumHeights: heights,
        material: video
      }
    })
  }
}

export default VideoWall
