import React, { Component } from 'react';
import styles from './styles.module.css';
import classnames from 'classnames';
import addProjectIcon from './combined-shape-copy.svg';
import deleteIcon from './delete.svg';
// import duplicateIcon from './duplicate.svg';
// import shareIcon from './share.svg';
import deleteDarkIcon from './delete-dark.svg';
// import duplicateDarkIcon from './duplicate-dark.svg';
// import shareDarkIcon from './share-dark.svg';
import checkedIcon from './checked.svg';
import { Search, Select, Pagination, ProcessLoading, Confirm } from 'components/Common';
import { inject, observer } from 'mobx-react';
import moment from 'moment';
import { observable, toJS } from 'mobx';
import EN from '../../constant/en';
import config from 'config'

const isEN = config.isEN;
@inject('routing', 'projectStore')
@observer
export default class Home extends Component {
  @observable ids = []
  @observable isShow = false
  @observable selected = false
  @observable deleteNames = []
  @observable deleteIds = []
  @observable visible = false
  @observable loading = false

  constructor(props) {
    super(props);
    //设置为英文
    if(!isEN){
      moment.defineLocale('zh-cn', {
        months : '一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月'.split('_'),
        monthsShort : '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
        weekdays : '星期日_星期一_星期二_星期三_星期四_星期五_星期六'.split('_'),
        weekdaysShort : '周日_周一_周二_周三_周四_周五_周六'.split('_'),
        weekdaysMin : '日_一_二_三_四_五_六'.split('_'),
        longDateFormat : {
          LT : 'Ah点mm分',
          LTS : 'Ah点m分s秒',
          L : 'YYYY-MM-DD',
          LL : 'YYYY年MMMD日',
          LLL : 'YYYY年MMMD日Ah点mm分',
          LLLL : 'YYYY年MMMD日ddddAh点mm分',
          l : 'YYYY-MM-DD',
          ll : 'YYYY年MMMD日',
          lll : 'YYYY年MMMD日Ah点mm分',
          llll : 'YYYY年MMMD日ddddAh点mm分'
        },
        meridiemParse: /凌晨|早上|上午|中午|下午|晚上/,
        meridiemHour: function (hour, meridiem) {
          if (hour === 12) {
            hour = 0;
          }
          if (meridiem === '凌晨' || meridiem === '早上' ||
            meridiem === '上午') {
            return hour;
          } else if (meridiem === '下午' || meridiem === '晚上') {
            return hour + 12;
          } else {
            // '中午'
            return hour >= 11 ? hour : hour + 12;
          }
        },
        meridiem : function (hour, minute, isLower) {
          var hm = hour * 100 + minute;
          if (hm < 600) {
            return '凌晨';
          } else if (hm < 900) {
            return '早上';
          } else if (hm < 1130) {
            return '上午';
          } else if (hm < 1230) {
            return '中午';
          } else if (hm < 1800) {
            return '下午';
          } else {
            return '晚上';
          }
        },
        calendar : {
          sameDay : function () {
            return this.minutes() === 0 ? '[今天]Ah[点整]' : '[今天]LT';
          },
          nextDay : function () {
            return this.minutes() === 0 ? '[明天]Ah[点整]' : '[明天]LT';
          },
          lastDay : function () {
            return this.minutes() === 0 ? '[昨天]Ah[点整]' : '[昨天]LT';
          },
          nextWeek : function () {
            var startOfWeek, prefix;
            startOfWeek = moment().startOf('week');
            prefix = this.unix() - startOfWeek.unix() >= 7 * 24 * 3600 ? '[下]' : '[本]';
            return this.minutes() === 0 ? prefix + 'dddAh点整' : prefix + 'dddAh点mm';
          },
          lastWeek : function () {
            var startOfWeek, prefix;
            startOfWeek = moment().startOf('week');
            prefix = this.unix() < startOfWeek.unix()  ? '[上]' : '[本]';
            return this.minutes() === 0 ? prefix + 'dddAh点整' : prefix + 'dddAh点mm';
          },
          sameElse : 'LL'
        },
        ordinalParse: /\d{1,2}(日|月|周)/,
        ordinal : function (number, period) {
          switch (period) {
            case 'd':
            case 'D':
            case 'DDD':
              return number + '日';
            case 'M':
              return number + '月';
            case 'w':
            case 'W':
              return number + '周';
            default:
              return number;
          }
        },
        relativeTime : {
          future : '%s内',
          past : '%s前',
          s : '几秒',
          m : '1 分钟',
          mm : '%d 分钟',
          h : '1 小时',
          hh : '%d 小时',
          d : '1 天',
          dd : '%d 天',
          M : '1 个月',
          MM : '%d 个月',
          y : '1 年',
          yy : '%d 年'
        },
        week : {
          // GB/T 7408-1994《数据元和交换格式·信息交换·日期和时间表示法》与ISO 8601:1988等效
          dow : 1, // Monday is the first day of the week.
          doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
      })
    }

    this.acts = {
      share: (ids) => {
        return;
      },
      duplicate: (ids) => {
        return;
      },
      delete: (ids) => {
        const deleteNames = this.props.projectStore.list.filter(project => {
          return ids.includes(project.id);
        }).map(project => project.name || "project-" + project.id);
        this.deleteNames = deleteNames
        this.deleteIds = ids
        this.visible = true
      }
    };
  }

  componentDidMount() {
    this.props.projectStore.clean()
  }

  selectId = (isSelect, id) => {
    let ids;
    if (isSelect) {
      ids = this.ids.filter(v => v !== id);
    } else {
      ids = [...this.ids, id];
    }
    this.ids = ids
    this.isShow = !!ids.length
  }

  toggleSelect = () => {
    this.selected = !this.selected
  }

  removeSelected = () => {
    this.ids = []
    this.isShow = false
  }

  actions = (act, ids) => {
    ids = toJS(ids)
    if (!Array.isArray(ids)) ids = [ids]
    console.log(act, ids);
    this.acts[act](ids);
  }

  handleOk = () => {
    const { ids, deleteIds } = this;
    this.props.projectStore.deleteProjects(deleteIds).then(() => {
      const newIds = ids.filter(id => !deleteIds.includes(id));

      this.visible = false
      this.deleteIds = []
      this.ids = newIds
      this.isShow = !!newIds.length
    })
  }

  handleCancel = () => {
    this.visible = false
  }

  handleAdd = () => {
    if (this.loading) return
    this.loading = true
    this.props.projectStore.addProject().then(data => {
      this.loading = false
      if (data.error) return alert(data.error)
      this.props.routing.push(`/project/${data.id}`);
    });
  }

  changeWords = v => {
    this.props.projectStore.keywords = v;
  }

  render() {
    const { projectStore } = this.props;
    const { toolsOption, total, sortList: sortProjects, changeOption, changePage, keywords } = projectStore;
    console.log(sortProjects , 'sortList')
    return <div className={classnames(styles.home)} >
      {this.loading && <ProcessLoading style={{ position: 'fixed' }} />}
      <Tools toolsOption={toolsOption} total={total} changeOption={changeOption} changePage={changePage} keywords={keywords} changeWords={this.changeWords} />
      <div className={classnames(styles.projects)}>
        <div className={classnames(styles.project, styles.newProject)} onClick={this.handleAdd}>
          <img src={addProjectIcon} alt="New Project" />
          <span>{EN.CreateProject}</span>
        </div>
        {sortProjects.filter(p => p.id.includes(keywords) || (p.name || "").includes(keywords)).map((project) => {
          return <Project project={project} selectId={this.selectId} actions={this.actions} key={"project-" + project.id} selected={this.ids.includes(project.id)} />
        })}
      </div>
      {this.isShow && <Bar toggleSelect={this.removeSelected} ids={this.ids} actions={this.actions} selected={this.selected} />}
      {<Confirm
        width="7em"
        title={EN.DeleteDialogTitle}
        visible={this.visible && !!this.deleteIds.length}
        onClose={this.handleCancel}
        onConfirm={this.handleOk}
        confirmText={EN.Yes}
        closeText={EN.Nop}
        content={this.deleteNames.length > 1 ? `${EN.ConfirmOfDeletManyProject}: ${this.deleteNames.map((name, k) => { return name.length > 40 ? name.slice(0, 40) + "..." : name })}?` :
          `${EN.Areyousuretodeleteproject} ${this.deleteNames.toString()}?`} />}
    </div>
  }
}

@inject('routing')
@observer
class Project extends Component {
  @observable cover = false

  hideCover = () => {
    this.cover = false
  }

  showCover = () => {
    this.cover = true
  }

  toggleSelect = () => {
    //统计总数
    this.props.selectId(this.props.selected, this.props.project.id);
  }

  handleOpen = () => {
    this.props.routing.push("/project/" + this.props.project.id);
  }

  render() {
    const { project, actions, selected } = this.props;
    return <div className={styles.project} onMouseEnter={this.showCover} onMouseLeave={this.hideCover}>
      <div className={styles.info}>
        <div className={styles.name}>{project.name}</div>
        <div className={styles.description}>{project.description}</div>
      </div>
      <div className={styles.sub}>
        <div className={styles.partner}>{project.id} {project.fileNames && project.fileNames.join(",")}</div>
        <div className={styles.time}>{EN.CreatedDate}: {moment.unix(project.createTime).fromNow()}</div>
      </div>
      <div className={classnames(styles.cover, {
        [styles.active]: this.cover || selected
      })}>
        <div className={styles.actionBox}>
          <div className={styles.select}>
            {
              this.props.selected ?
                <img className={styles.checked} onClick={this.toggleSelect} src={checkedIcon} alt="checked" /> :
                <div className={styles.circle} onClick={this.toggleSelect}></div>
            }
          </div>
          <div className={styles.action}>
            {/* <img onClick={actions.bind(null, "share", project.id)} src={shareIcon} alt="share" />
            <img onClick={actions.bind(null, "duplicate", project.id)} src={duplicateIcon} alt="duplicate" /> */}
            <img onClick={actions.bind(null, "delete", project.id)} src={deleteIcon} alt="delete" />
          </div>
        </div>
        <div className={styles.openBox}>
          <div className={styles.open} onClick={this.handleOpen}>
            <span>{EN.Open}</span>
          </div>
        </div>
      </div>
    </div>
  }
}

@observer
class Tools extends Component {
  render() {
    const { toolsOption, total, changeOption, changePage, keywords, changeWords } = this.props;
    return <div className={styles.tools}>
      <Search
        value={keywords}
        onChange={changeWords}
      />
      <Select
        title={EN.SortBy}
        autoWidth={null}
        options={{
          createTime: EN.LastCreated,
          updateTime: EN.LastModified,
          // progressUp: 'Progress 1 - 4',
          // progressDown: 'Progress 4 - 1',
          // aToz: 'A - Z',
          // zToa: 'Z - A'
        }}
        value={toolsOption.sort}
        onChange={changeOption.bind(null, "sort")}
      />
      <Select
        title={EN.ProPerPage}
        autoWidth
        options={{
          5: 5,
          10: 10,
          20: 20
        }}
        value={toolsOption.limit}
        onChange={(v) => {
          changeOption("limit",v );
          changePage(1)
        }
        }
      />
      <Pagination
        current={toolsOption.current}
        pageSize={toolsOption.limit}
        total={total}
        onChange={changePage}
        // hideOnSinglePage={true}
      />
    </div>
  }
}

@observer
class Bar extends Component {
  render() {
    const { toggleSelect, ids, actions } = this.props
    return <div className={styles.bar}>
      <div className={styles.select}>
        <img className={styles.checked} onClick={toggleSelect} src={checkedIcon} alt="checked" />
        <span><span className={styles.count}>{ids.length}</span> {EN.Project}{ids.length > 1 && EN.Ss} {EN.Selected}</span>
      </div>
      <div className={styles.action}>
        {/* <img onClick={actions.bind(null, "share", ids)} src={shareDarkIcon} alt="share" />
        <img onClick={actions.bind(null, "duplicate", ids)} src={duplicateDarkIcon} alt="duplicate" /> */}
        <img onClick={actions.bind(null, "delete", ids)} src={deleteDarkIcon} alt="delete" />
      </div>
    </div>
  }
}
