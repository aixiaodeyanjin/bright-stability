<template>
  <div class="content">
    <div id="cesiumContainer"></div>
    <CesiumToolBox></CesiumToolBox>
    <Progress :value="tileLoadProgress" :radius="8" :transitionDuration="300" strokeColor="#2499d6">
      <div class="content" v-text="tileLoadProgress + '%'"></div>
    </Progress>
    <div class="main wending-main">
      <div class="menus_search" v-show="showSearchDom">
        <div class="tabbar">
          <div class="switch">
            <div class="item" :class="{ item_choose: searchChooseIndex == index }" v-for="(item, index) in searchList" @click="changeSearchTab(index)" :key="index">
              <div class="value" v-text="item.title"></div>
              <div class="bar"></div>
            </div>
          </div>
        </div>

        <div class="search_room" :class="{ first: index == 0, second: index == 1 }" v-show="searchChooseIndex == index" v-for="(item, index) in searchList" :key="index">
          <template v-if="searchChooseIndex == 0">
            <div class="select" :class="{ selected: item.focusIndex == selectIndex }" v-for="(selectItem, selectIndex) in item.itemList" @click.stop="openSelect(selectIndex)" :key="selectIndex">
              <div class="value" v-text="selectItem.title ? selectItem.title : selectItem.defaultTitle"></div>

              <div class="direction" :class="{ up: item.focusIndex == selectIndex }">
                <div class="point"></div>
                <div class="bar left-bar"></div>
                <div class="bar right-bar"></div>
              </div>

              <div class="bottom-direction"></div>
              <div class="bottom-left-bar"></div>

              <div class="options" v-show="item.focusIndex == selectIndex">
                <div class="item" :class="{ item_choose: idx == selectItem.chooseIndex }" v-for="(option, idx) in selectItem.list" @click.stop="chooseSelectOptions(selectIndex, idx)" :key="idx">
                  <div class="text" v-text="option.name"></div>
                  <div class="point"></div>
                </div>
              </div>
            </div>
          </template>
          <template v-if="searchChooseIndex == 1">
            <div class="select input" v-for="(inputItem, inputIndex) in item.itemList" :key="inputIndex">
              <!-- <div class="input_title" v-text="inputItem.title"></div> -->
              <input :type="inputItem.type" :placeholder="inputItem.placeholder" :value="inputItem.value" @input="searchInput($event, inputIndex)" />
              <div class="bottom-direction"></div>
              <div class="bottom-left-bar"></div>
            </div>
          </template>
        </div>

        <div class="button" @click="searchInfo(searchChooseIndex == 0 ? 1 : 4)">检索</div>

        <!-- <div class="close_btn" @click="changeSearchDomShow">
                    <div class="line"></div>
                    <div class="line"></div>
        </div>-->
      </div>

      <div class="icon_tip_room">
        <div class="item">
          <!-- <img class="image" src="@/assets/img/stability/people/dangyuan @2x.png" alt /> -->
          <div class="iconfont icondanghui image red"></div>
          <div class="info-item">
            <div class="num red" v-text="buildingAllInfo.party_number"></div>
            <div class="text">党员</div>
          </div>
        </div>

        <div class="item">
          <!-- <img class="image" src="@/assets/img/stability/people/zhongdianrenyuan@2x.png" alt /> -->
          <div class="iconfont iconzhongdianrenyuan image yellow"></div>
          <div class="info-item">
            <div class="num yellow" v-text="buildingAllInfo.safe_people_attention"></div>
            <div class="text">重点人员</div>
          </div>
        </div>

        <div class="item">
          <!-- <img class="image" src="@/assets/img/stability/people/changzhurenkou @2x.png" alt /> -->
          <div class="iconfont iconwo image blue"></div>
          <div class="info-item">
            <div class="num blue" v-text="buildingAllInfo.safe_people_live"></div>
            <div class="text">常住入口</div>
          </div>
        </div>

        <div class="item">
          <!-- <img class="image" src="@/assets/img/stability/people/chuzuhu@2x.png" alt /> -->
          <div class="iconfont iconzufang image orange"></div>
          <div class="info-item">
            <div class="num orange" v-text="buildingAllInfo.safe_people_floating"></div>
            <div class="text">出租户</div>
          </div>
        </div>
      </div>

      <div class="build_info" v-if="showTableDom">
        <div class="close_all_btn" @click="closeAllInfoTable" v-if="searchChooseIndex == 1">
          <div class="line"></div>
          <div class="line"></div>
        </div>
        <div class="tabbar" v-if="searchChooseIndex != 1">
          <div class="switch">
            <div class="item" :class="{ item_choose: nowTabIndex == index }" v-for="(item, index) in tabList" @click="changeInfoTable(index)" :key="index">
              <div class="item_title" v-text="item.title"></div>
              <div class="bar">
                <div class="close" v-show="nowTabIndex == index" @click.stop="closeInfoTable(index)">
                  <div class="line"></div>
                  <div class="line"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="table first" v-if="nowTabIndex == 0">
          <div class="all_info">
            <div class="left">
              <div class="text" v-text="'楼栋长：' + buildInfo.buildMaster.name"></div>
              <div class="text" v-text="'网络长：' + buildInfo.gridMaster.name"></div>
            </div>
            <div class="right">
              <div class="item">
                <div class="iconfont icondanghui image red"></div>
                <div class="num" v-text="buildInfo.summaryInfo.partyCot + '人'"></div>
              </div>

              <div class="item">
                <div class="iconfont iconzhongdianrenyuan image yellow"></div>
                <div class="num" v-text="buildInfo.summaryInfo.speciCot + '人'"></div>
              </div>

              <div class="item">
                <div class="iconfont iconwo image blue"></div>
                <div class="num" v-text="buildInfo.summaryInfo.resdtCot + '人'"></div>
              </div>

              <div class="item">
                <div class="iconfont iconzufang image orange"></div>
                <div class="num" v-text="buildInfo.summaryInfo.tanetCot + '人'"></div>
              </div>
            </div>
          </div>

          <div class="list" v-if="buildInfo.cellInfo.length > 0">
            <div class="item" :class="{ choose_item: buildChooseIndex === index }" v-for="(item, index) in buildInfo.cellInfo" @click="changeBuild(index)" :key="index">
              <div class="title_room">
                <div class="title_text" v-text="item.cellName"></div>
                <div class="item_info">
                  <div class="text" v-text="'户数: ' + item.totalHouse"></div>
                  <div class="text" v-text="'人口总数: ' + item.totalPopulation"></div>
                </div>
              </div>

              <div class="item_line"></div>

              <div class="btn_room">
                <div class="btn">
                  <div class="iconfont icondanghui red"></div>
                  <div class="num" v-text="item.partyCot + '人'"></div>
                </div>

                <div class="btn">
                  <div class="iconfont iconzhongdianrenyuan yellow"></div>
                  <div class="num" v-text="item.speciCot + '人'"></div>
                </div>

                <div class="btn">
                  <div class="iconfont iconwo blue"></div>
                  <div class="num" v-text="item.resdtCot + '人'"></div>
                </div>

                <div class="btn">
                  <div class="iconfont iconzufang orange"></div>
                  <div class="num" v-text="item.tanetCot + '人'"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="no_data_tip" v-if="buildInfo.cellInfo.length == 0">
            <div class="text">暂无数据</div>
          </div>
        </div>

        <div class="table second" v-if="nowTabIndex == 1">
          <div class="list" v-if="unitList.length > 0">
            <!-- <div class="item"
                            :class="{'orange': item.speciCot > 0, 'yellow': item.tanetCot > 0, 'red': item.partyCot > 0}"
            v-for="(item, index) in unitList" @click="changeUnit(index)">-->
            <div class="item" v-for="(item, index) in unitList" @click="changeUnit(index)" :key="index">
              <div class="unit" v-text="item.houseName"></div>
              <div class="icon_room">
                <div class="icon-item">
                  <div class="value-room" v-if="item.partyCot > 0">
                    <span class="iconfont icondanghui red"></span>
                    <span class="red" v-text="item.partyCot"></span>
                  </div>
                  <div class="nodata-line red" v-else>-</div>
                </div>

                <div class="icon-item">
                  <div class="value-room" v-if="item.speciCot > 0">
                    <span class="iconfont iconzhongdianrenyuan yellow"></span>
                    <span class="yellow" v-text="item.speciCot"></span>
                  </div>
                  <div class="nodata-line yellow" v-else>-</div>
                </div>

                <div class="icon-item">
                  <div class="value-room" v-if="item.resdtCot > 0">
                    <span class="iconfont iconwo blue"></span>
                    <span class="blue" v-text="item.resdtCot"></span>
                  </div>
                  <div class="nodata-line blue" v-else>-</div>
                </div>

                <div class="icon-item">
                  <div class="value-room" v-if="item.tanetCot > 0">
                    <span class="iconfont iconzufang orange"></span>
                    <span class="orange" v-text="item.tanetCot"></span>
                  </div>
                  <div class="nodata-line orange" v-else>-</div>
                </div>
              </div>
            </div>
          </div>

          <div class="no_data_tip" v-if="unitList.length == 0">
            <div class="text">暂无数据</div>
          </div>
        </div>

        <div class="table third" :class="{ third_2: searchChooseIndex == 1 }" v-if="nowTabIndex == 2 || searchChooseIndex == 1">
          <div class="list" v-if="houseList.length > 0">
            <div class="item" :class="{ choose_item: houseChooseIndex == index }" v-for="(item, index) in houseList" @click="changeHouse(index, item.local)" :value="item.local" :key="index">
              <div class="left">
                <div class="info">
                  <div class="name" v-text="item.name_hidden" @click="changeInputPasswordDom(1, index)" v-if="item.speciFlag == '1' && !item.hasShowFullInfo"></div>
                  <div class="name" v-text="item.userName" v-else></div>
                  <div class="sexual" v-text="item.sex == '1' ? '男' : '女'"></div>
                </div>
                <div class="icon_room">
                  <div class="iconfont icondanghui icon-item red" v-if="item.partyFlag == '1'"></div>
                  <div class="iconfont iconzhongdianrenyuan icon-item yellow" v-if="item.speciFlag == '1'"></div>
                  <div class="iconfont iconwo icon-item blue" v-if="item.resdtFlag == '1'"></div>
                  <div class="iconfont iconzufang icon-item orange" v-if="item.tanetFlag == '1'"></div>
                </div>
              </div>

              <div class="cut_line"></div>

              <div class="right">
                <div class="info">
                  <!-- <img class="image" src="./img/icons/shenfenzheng@2x.png" alt=""> -->
                  <i class="iconfont iconshenfenzheng"></i>
                  <div class="value" @click="changeInputPasswordDom(1, index)" v-if="!item.hasShowFullInfo" v-text="item.cad_hidden"></div>
                  <div class="value" v-else v-text="item.cad"></div>
                </div>

                <div class="info">
                  <!-- <img class="image" src="./img/icons/shoujihao@2x.png" alt=""> -->
                  <i class="iconfont iconshoujihao"></i>
                  <div class="value" @click="changeInputPasswordDom(1, index)" v-if="!item.hasShowFullInfo" v-text="item.pho_hidden"></div>
                  <div class="value" v-else v-text="item.pho"></div>
                </div>

                <div class="info">
                  <!-- <img class="image" src="./img/icons/huji@2x.png" alt=""> -->
                  <i class="iconfont iconhuji"></i>
                  <div class="value" v-text="searchChooseIndex == 0 ? item.addr : item.native"></div>
                </div>

                <div class="info">
                  <!-- <img class="image" src="./img/icons/jiezhishijian@2x.png" alt=""> -->
                  <i class="iconfont iconjiezhiriqi"></i>
                  <div class="value" v-text="item.dat"></div>
                </div>

                <div class="info info_long" v-if="searchChooseIndex == 1">
                  <!-- <img class="image" src="./img/icons/ditudian@2x.png" alt=""> -->
                  <i class="iconfont iconjuzhudizhi"></i>
                  <div class="value" v-text="item.addr"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="no_data_tip" v-if="houseList.length == 0">
            <div class="text">暂无数据</div>
          </div>
        </div>
      </div>

      <div class="password_input_room" :class="{ password_input_room_show: showInputPasswordDom }" @click="changeInputPasswordDom(0)" v-show="showInputPasswordDom">
        <div class="room" @click.stop="changeInputPasswordDom(1)">
          <div class="room_title">查看该信息需要更高权限</div>
          <div class="input_room">
            <input type="password" class="input" placeholder="请输入密码" :value="inputPasswordValue" @input="inputPassword($event)" @keyup.enter="judgePassword($event)" />
          </div>
          <div class="ctrl_btn">
            <div class="btn" @click.stop="changeInputPasswordDom(0)">取消</div>
            <div class="btn" @click.stop="surePassword">确定</div>
          </div>
        </div>
      </div>
      <div id="playWind" class="playWind">
        <div>
          <img src="@/assets/img/popup/popup1@2x.png" class="popup1" />
        </div>
        <div id="playWindContent"></div>
        <div>
          <img src="@/assets/img/popup/popup2@2x.png" class="popup2" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import 'cesium/Source/Widgets/widgets.css';
import { CesiumMapContext, MapContextHolder, CesiumViewerFactory } from '@/assets/js/map';
import CesiumToolBox from '@/components/CesiumToolBox';
import Progress from 'easy-circular-progress';
var path = require('path');
const modifyHtmlImgTagSrc = (html, src) => html.replace(/(<img [^>]*src=)['"]([^'"]+)[^>]*(>)/gi, (match, $1, $2, $3) => `${$1}${require('@/assets/img/demo/' + path.basename($2))}${$3}`);
export default {
  components: { CesiumToolBox, Progress },
  data: function () {
    return {
      buildingAllInfo: {},
      searchList: [
        {
          title: '房找人',
          focusIndex: -1, // 当前获取焦点下标
          type: 'select', // 输入类型
          itemList: [
            {
              title: '',
              defaultTitle: '楼栋',
              list: [],
              chooseIndex: -1,
            },
            {
              title: '',
              defaultTitle: '单元',
              list: [],
              chooseIndex: -1,
            },
            {
              title: '',
              defaultTitle: '房号',
              list: [],
              chooseIndex: -1,
            },
          ],
        },
        {
          title: '人找房',
          focusIndex: -1, // 同上
          type: 'input', // 输入类型
          itemList: [
            {
              title: '姓名: ',
              placeholder: '请输入姓名',
              type: 'text',
              value: '',
            },
            {
              title: '手机号: ',
              placeholder: '请输入手机号',
              type: 'text',
              value: '',
            },
            {
              title: '身份证: ',
              placeholder: '请输入身份证',
              type: 'text',
              value: '',
            },
          ],
        },
      ],
      searchChooseIndex: 0,
      showSearchDom: true, // 是否显示搜索
      tabList: [],
      showTableDom: false, // 是否显示右侧信息表格
      nowTabIndex: 0, // 右侧信息表格导航栏当前下标
      buildList: [],
      buildInfo: {}, // 楼栋信息汇总
      buildChooseIndex: -1,
      unitList: [],
      unitChooseIndex: -1,
      houseList: [],
      houseChooseIndex: -1,
      // hasShowFullInfo: false, // 是否显示所有信息
      showFullInfoPassword: '123456',
      inputPasswordValue: '',
      showInputPasswordDom: false,
      showInputPasswordIndex: -1, // 所选人员信息下标
      x: 8,
      y: -7,
      z: 16,
      /**
       * 图层瓦皮加载进度
       */
      tileLoadProgress: 0,
    };
  },
  mounted() {
    this.getAllMemberInfo();
    // 初始化cesium
    const viewer = CesiumViewerFactory.getDefaultMap('cesiumContainer');
    this.viewer = viewer;
    this.initTileLoadProgressListener();
    const cesiumMapContext = new CesiumMapContext(viewer);
    MapContextHolder.setContext(cesiumMapContext);

    let that = this;
    cesiumMapContext.addEnityClickedListener((e, pick) => {
      var playWind = document.getElementById('playWind');
      if (pick && pick.id) {
        var playWindContent = document.getElementById('playWindContent');

        var content = '';

        if (pick.id.code == 8888 || pick.id.code == 9999) {
          // 党员活动中心8888居民活动中心9999
          content += pick.id.description;
          playWindContent.innerHTML = modifyHtmlImgTagSrc(content);
          playWind.style.display = 'block';
          playWind.style.left = e.position.x + 'px';
          playWind.style.top = e.position.y + 'px';
        } else {
          that.clickMapToShowTable(0, pick.id);
        }
      } else {
        playWind.style.display = 'none';
      }
    });
  },
  beforeDestroy() {
    MapContextHolder.clearContext();
  },
  methods: {
    /**
     * 初始化瓦片加载监听
     */
    initTileLoadProgressListener() {
      let totalLength = 0;
      let that = this;
      this.viewer.scene.globe.tileLoadProgressEvent.addEventListener((length) => {
        if (length > totalLength || length == 0) {
          totalLength = length;
        }
        if (length != 0) {
          that.tileLoadProgress = (((totalLength - length) / totalLength) * 100).toFixed(2);
        } else {
          that.tileLoadProgress = 100.0;
        }
      });
    },

    clickMapToShowTable(tableIndex = 0, params) {
      // 点击地图标记点显示右侧信息汇总表格
      this.searchInfo(5, params);
    },
    async getAllMemberInfo() {
      // 获取汇总信息
      let _this = this;

      let resp = await this.$get('http://nbol.liaodukeji.com/api_bright/buildingList', {
        org_id: '57fde62fceb011e9aa9100163e0d9e7f',
      });

      if (resp.code == 1) {
        _this.buildingAllInfo = resp.data;
      }
    },
    searchInput(e, index) {
      // 搜索输入框输入内容
      let { itemList } = this.searchList[1];

      itemList[index].value = e.target.value;
    },
    changeSearchDomShow() {
      // 搜索DOM是否显示
      this.showSearchDom = !this.showSearchDom;
    },
    changeSearchTab(index) {
      // 改变搜索选项
      this.searchChooseIndex = index;
      this.showTableDom = false;
      this.tabList = [];
    },
    async openSelect(index) {
      // 选择select
      let { searchList, searchChooseIndex } = this;

      let list = [];
      let lastSelectInfo = {};
      if (index > 0) {
        lastSelectInfo = searchList[searchChooseIndex].itemList[index - 1];
      }
      switch (index) {
        case 0: // 楼栋
          let resp = await this.$get('http://nbol.liaodukeji.com/api_snow/buildingList', {
            org_id: '57fde62fceb011e9aa9100163e0d9e7f',
          });
          if (resp.code == 1) {
            list = resp.data.building;
          }
          break;
        case 1: // 单元
          if (lastSelectInfo.chooseIndex < 0) {
            this.$msg('请选择楼栋');
          } else {
            let resp = await this.$get('http://nbol.liaodukeji.com/api_snow/cellList', {
              buildingId: lastSelectInfo.list[lastSelectInfo.chooseIndex].id,
            });
            if (resp.code == 1) {
              list = resp.data.cell;
            }
          }
          break;
        case 2: // 户
          if (lastSelectInfo.chooseIndex < 0) {
            this.$msg('请选择单元');
          } else {
            let resp = await this.$get('http://nbol.liaodukeji.com/api_snow/roomList', {
              cellId: lastSelectInfo.list[lastSelectInfo.chooseIndex].id,
            });
            if (resp.code == 1) {
              list = resp.data.room;
            }
          }

          break;
      }

      if (lastSelectInfo.chooseIndex >= 0 || index == 0) {
        searchList[searchChooseIndex].itemList[index].list = list;
        searchList[searchChooseIndex].focusIndex = index === searchList[searchChooseIndex].focusIndex ? -1 : index;
      }
    },
    chooseSelectOptions(selectIndex, optionIndex) {
      // 选择房找人搜素下拉选项
      let { itemList } = this.searchList[0];

      itemList.forEach((item, index) => {
        if (index == selectIndex) {
          itemList[selectIndex].chooseIndex = optionIndex;
          itemList[selectIndex].title = itemList[selectIndex].list[optionIndex].name;
        } else if (index > selectIndex) {
          item.list = [];
          item.chooseIndex = -1;
          item.title = '';
        }
      });

      this.searchList[0].focusIndex = -1;
    },

    /*
                @searchType: 搜索信息模式 => 1: 点击 "检索" 按钮(房找人模式)
                                            2: 改变信息表导航栏下标
                                            3: 点击表格子选项
                                            4: 点击 "检索" 按钮(人找房模式)
                                            5: 点击地图标识点

                @funcParams: 传递参数
            */
    searchInfo(searchType = 1, funcParams = {}) {
      // 搜索信息
      let _this = this;
      let { showTableDom, nowTabIndex, searchList, searchChooseIndex, buildInfo, buildChooseIndex, unitList, unitChooseIndex, houseList, houseChooseIndex } = this;

      let showIndex = -1;

      switch (searchType) {
        case 4: // 点击 "检索" 按钮(人找房模式)
          let canGetApi = true;

          let params = {
            userName: searchList[1].itemList[0].value,
            phone: searchList[1].itemList[1].value,
            cardNo: searchList[1].itemList[2].value,
          };

          let isPhone = this.isMobileNumber(params.phone);
          let isIdCode = this.judgeIdCode(params.cardNo);

          if ((params.phone && !isPhone) || (params.cardNo && !isIdCode)) {
            if (!isPhone) {
              this.$msg('请输入正确格式手机号');
            } else if (!isIdCode) {
              this.$msg('请输入正确格式身份证');
            }
          } else if (!params.userName && !params.phone && !params.cardNo) {
            this.$msg('请输入搜索条件');
          } else {
            this.getFindPersonAPi(params).then((res) => {
              if (res.code == 1) {
                _this.nowTabIndex = -1;

                res.data.houseInfo.forEach((item) => {
                  if (item.cad) {
                    item.cad_hidden = item.cad.substring(0, 6) + '***' + item.cad.substring(15, 18);
                  }
                });

                _this.houseList = res.data.houseInfo;
                _this.showTableDom = true;
              }
            });
          }
          break;
        case 5: // 点击地图标识点
          console.log(funcParams);

          _this
            .getBuildingInfo({
              buildId: funcParams.id,
            })
            .then((res) => {
              console.log(res);
              if (res.code == 1) {
                _this.tabList = [
                  {
                    title: funcParams.name + '信息汇总',
                  },
                ];

                _this.buildInfo = res.data;
                _this.buildChooseIndex = searchList[0].itemList[0].chooseIndex;

                _this.searchChooseIndex = 0;
                _this.unitList = [];
                _this.houseList = [];

                _this.nowTabIndex = 0;

                _this.showTableDom = true;
              }
            });
          break;
        default:
          if (searchType == 1) {
            searchList[0].itemList.forEach((item, index) => {
              if (item.chooseIndex > -1) {
                showIndex = index;

                if (_this.tabList.length > index) {
                  _this.tabList[index] = {
                    title: searchList[0].itemList[index].list[searchList[0].itemList[index].chooseIndex].name + (index == 0 ? '信息汇总' : ''),
                  };
                } else {
                  _this.tabList.push({
                    title: searchList[0].itemList[index].list[searchList[0].itemList[index].chooseIndex].name + (index == 0 ? '信息汇总' : ''),
                  });
                }
              } else {
                _this.tabList.splice(index, _this.tabList.length - index + 1);
              }
            });
          }

          // 主动改变表格
          showIndex = searchType == 2 && nowTabIndex > -1 ? nowTabIndex : showIndex;

          // 点击表格子选项
          showIndex = searchType == 3 && funcParams.itemClickIndex > -1 ? funcParams.itemClickIndex : showIndex;

          switch (showIndex) {
            case -1:
              this.$msg('请选择搜索条件');
              break;
            case 0: // 打开楼栋信息汇总
              _this
                .getBuildingInfo({
                  buildId: searchList[0].itemList[0].list[searchList[0].itemList[0].chooseIndex].id,
                })
                .then((res) => {
                  if (res.code == 1) {
                    _this.buildInfo = res.data;
                    _this.buildChooseIndex = searchList[0].itemList[0].chooseIndex;
                    console.log(_this.buildChooseIndex);
                  }
                });
              break;
            case 1: // 打开单元信息汇总
              _this
                .getCellInfo({
                  cellId: searchType == 3 ? buildInfo.cellInfo[buildChooseIndex].cellId : searchList[0].itemList[1].list[searchList[0].itemList[1].chooseIndex].id,
                })
                .then((res) => {
                  if (res.code == 1) {
                    _this.unitList = res.data.cellInfo;
                    _this.unitChooseIndex = searchList[0].itemList[1].chooseIndex;
                  }
                });
              break;
            case 2: // 打开户信息汇总
              _this
                .getRoomInfo({
                  houseId: searchType == 3 ? unitList[unitChooseIndex].houseId : searchList[0].itemList[2].list[searchList[0].itemList[2].chooseIndex].id,
                })
                .then((res) => {
                  if (res.code == 1) {
                    res.data.houseInfo.forEach((item) => {
                      item.hasShowFullInfo = false; // 初始化用户敏感化信息显示判断

                      if (item.userName) {
                        item.name_hidden = item.userName.substring(0, 1) + '**';
                      }

                      if (item.cad) {
                        item.cad_hidden = item.cad.substring(0, 6) + '***' + item.cad.substring(15, 18);
                      }

                      if (item.pho) {
                        item.pho_hidden = item.pho.substring(0, 3) + '****' + item.pho.substring(8, 11);
                      }
                    });

                    _this.houseList = res.data.houseInfo;
                    _this.houseChooseIndex = searchList[0].itemList[2].chooseIndex;
                  }
                });
              break;
          }

          _this.nowTabIndex = showIndex;

          if (showIndex > -1) {
            this.showTableDom = true;
          }
          break;
      }
    },
    getBuildingInfo(params) {
      // 获取楼栋信息汇总
      console.log(`楼栋信息接口参数: `, params);
      return this.$get('http://nbol.liaodukeji.com/api_snow/buildingInfo', {
        buildingId: params.buildId,
      });
    },

    getCellInfo(params) {
      // 获取单元信息汇总
      console.log(`单元信息接口参数: `, params);
      return this.$get('http://nbol.liaodukeji.com/api_snow/cellInfo', {
        cellId: params.cellId,
      });
    },
    getRoomInfo(params) {
      // 获取户信息汇总
      console.log(`户信息接口参数: `, params);
      return this.$get('http://nbol.liaodukeji.com/api_snow/houseInfo', {
        houseId: params.houseId,
      });
    },

    getFindPersonAPi(params) {
      return this.$get('http://nbol.liaodukeji.com/api_snow/findPerson', {
        userName: params.userName,
        phoNo: params.phone,
        cardNo: params.cardNo,
      });
    },

    closeAllInfoTable() {
      // 右上角关闭信息表格
      this.showTableDom = false;
    },
    changeInfoTable(index) {
      // 改变表格
      this.nowTabIndex = index;

      let { itemList } = this.searchList[0];

      switch (index) {
        case 0: // 楼栋表格
          this.buildChooseIndex = itemList[index].chooseIndex;
          break;
        case 1: // 单元表格
          this.unitChooseIndex = itemList[index].chooseIndex;
          break;
        case 2: // 户表格
          this.houseChooseIndex = itemList[index].chooseIndex;
          break;
      }

      this.searchInfo(2);
    },

    closeInfoTable(index) {
      // 关闭子表格
      let _this = this;

      _this.nowTabIndex = index - 1;
      _this.tabList.splice(index, _this.tabList.length - index);

      switch (index) {
        case 0:
          _this.showTableDom = false;
          _this.buildList = [];
          _this.unitList = [];
          _this.houseList = [];
          break;
        case 1:
          _this.unitList = [];
          _this.houseList = [];
          break;
        case 2:
          _this.houseList = [];
          break;
      }
    },
    changeBuild(index) {
      // 改变楼栋
      let { tabList, buildList, buildInfo } = this;

      this.buildChooseIndex = index;

      if (tabList.length == 1) {
        tabList.push({
          title: buildInfo.cellInfo[index].cellName,
        });
      } else {
        tabList[1] = {
          title: buildInfo.cellInfo[index].cellName,
        };
      }

      this.searchInfo(3, {
        itemClickIndex: 1,
      });

      this.nowTabIndex = 1;
      this.tabList.splice(2, 1);
    },
    changeUnit(index) {
      // 改变单元
      let { tabList, unitList } = this;

      this.unitChooseIndex = index;

      if (tabList.length > 2) {
        this.tabList[2] = {
          title: unitList[index].houseName,
        };
      } else {
        this.tabList.push({
          title: unitList[index].houseName,
        });
      }

      console.log(this.tabList);

      this.searchInfo(3, {
        itemClickIndex: 2,
      });

      this.nowTabIndex = 2;
    },
    changeHouse(index, local) {
      this.houseChooseIndex = index;
      var longitude = local.split(',')[0] * 1;
      var latitude = local.split(',')[1] * 1;
      MapContextHolder.getContext().then((context) => {
        context.flyToPeopleHouse(longitude, latitude);
      });
    },
    judgeIdCode(idcode) {
      // 判断身份证格式
      let isIdCode = true;
      if (idcode.length != 18 || !idcode || !idcode.match(/^[0-9]{17}[0-9xX]$/) || idcode == '111111111111111') {
        isIdCode = false;
      }

      return isIdCode;
    },
    isMobileNumber(phone) {
      // 检查是否为手机号
      let reg = /^1[3|4|5|7|8|9]\d{9}$/;
      return reg.test(phone);
    },
    changeInputPasswordDom(type, index) {
      // 改变密码输入框显示状态
      this.showInputPasswordIndex = index >= 0 ? index : this.showInputPasswordIndex;
      this.showInputPasswordDom = type != 0;
      this.inputPasswordValue = '';
    },
    inputPassword(e) {
      this.inputPasswordValue = e.target.value;
    },
    judgePassword(e) {
      let { showFullInfoPassword, houseList, showInputPasswordIndex } = this;

      if (showFullInfoPassword == e.target.value) {
        // this.hasShowFullInfo = true
        this.$msg('密码正确');
        this.showInputPasswordDom = false;
        this.houseList[showInputPasswordIndex].hasShowFullInfo = true;
      } else {
        // this.hasShowFullInfo = false
        this.houseList[showInputPasswordIndex].hasShowFullInfo = false;
        this.$msg('密码输入错误');
      }
    },
    surePassword() {
      let { inputPasswordValue, showFullInfoPassword, houseList, showInputPasswordIndex } = this;

      if (inputPasswordValue == showFullInfoPassword) {
        // this.hasShowFullInfo = true
        this.houseList[showInputPasswordIndex].hasShowFullInfo = true;
        this.$msg('密码正确');
        this.showInputPasswordDom = false;
      } else {
        // this.hasShowFullInfo = false
        this.houseList[showInputPasswordIndex].hasShowFullInfo = false;
        this.$msg('密码输入错误');
      }
    },
  },
};
</script>

<style>
.content {
  height: 100vh;
}
/** 罗盘 */
.compass {
  pointer-events: auto;
  position: absolute;
  right: 0px;
  top: 350px !important;
  width: 95px;
  height: 95px;
  overflow: hidden;
}
.navigation-controls {
  position: absolute;
  right: 30px;
  top: 477px !important;
  width: 30px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: 300;
  user-select: none;
  background-color: rgba(47, 53, 60, 0.8);
  border-radius: 10px;
  opacity: 0.7;
}
.navigation-controls:hover {
  opacity: 0.9;
}
/**标尺 */
.distance-legend {
  pointer-events: auto;
  position: absolute;
  border-radius: 15px;
  padding-left: 5px;
  padding-right: 5px;
  bottom: 60px;
  height: 30px;
  width: 125px;
  -webkit-box-sizing: content-box;
  box-sizing: content-box;
  right: 40px;
}
.vue-circular-progress {
  position: absolute;
  z-index: 1;
  font-size: 10px;
  bottom: 0px;
  height: 24px;
}
.vue-circular-progress .circle {
  height: 24px;
}
.vue-circular-progress .percent__int {
  font-size: 12px !important;
}
.vue-circular-progress .percent {
  top: 43% !important;
  left: 170% !important;
  height: 24px;
}
.vue-circular-progress .percent .content {
  height: 24px !important;
}
.vue-circular-progress .percent > .dot,
.percent__dec {
  display: none;
}
</style>
