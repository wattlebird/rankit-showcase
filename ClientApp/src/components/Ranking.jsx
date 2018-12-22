import React from 'react';
import { Card, Table, Input, message } from 'antd';
import styled from 'styled-components';
import raf from 'raf';
import API from '../api';

const Content = styled(Card).attrs({
  bordered: false
})`
  width: 67vw;
  &.ant-card {
    margin: 4em auto 2em;
    background-color: rgba(255, 255, 255, 0.85);
    color: #111517;
  }
`;

const SearchBar = styled.div`
  display: flex;
  align-items: baseline;
  margin-bottom: 1em;
`;

const DateLabel = styled.div`
  flex-shrink: 0;
  margin-left: 1em;
`;

const easeInOutCubic = (t, b, c, d) => {
  const cc = c - b;
  t /= d / 2;
  if (t < 1) {
    return (cc / 2) * t * t * t + b;
  } else {
    return (cc / 2) * ((t -= 2) * t * t + 2) + b;
  }
};

class Ranking extends React.Component {
  state = {
    dataSource: [],
    updateDate: null,
    isLoading: true,
    name: null,
  };

  componentDidMount() {
    this.setState({
      isLoading: true,
    });
    const promises = [API.ReadAll(), API.Date()];
    Promise.all(promises).then(
      data => {
        this.setState({
          dataSource: data[0],
          updateDate: data[1],
          isLoading: false,
        });
      },
      err => {
        this.setState({
          isLoading: false,
        });
        message.error('加载失败，可能是网络问题，请稍后重试。');
        console.log(err);
      },
    );
  }

  onSearch = e => {
    this.setState({
      name: e.target.value,
    });
  };

  onScrollToTop = () => {
    const self = document.getElementById("content")
    const pageScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const contentScrollTop = self.offsetTop;
    if (contentScrollTop < pageScrollTop) {
      const start = Date.now()
      const frame = () => {
        const current = Date.now()
        const delta = current - start;
        const next = easeInOutCubic(delta, pageScrollTop, contentScrollTop, 450);
        document.body.scrollTop = next;
        document.documentElement.scrollTop = next;
        if (delta < 450) {
          raf(frame)
        } else {
          document.body.scrollTop = contentScrollTop;
          document.documentElement.scrollTop = contentScrollTop;
        }
      }
      raf(frame);
    }
  }

  render() {
    const { name, updateDate, dataSource, isLoading } = this.state;
    const columns = [
      {
        title: '番剧',
        dataIndex: 'name',
        key: 'name',
        render: (itm, rec) => (
          <a href={`https://chii.in/subject/${rec.id}`} target="_blank">{itm}</a>
        ),
      },
      {
        title: '本站排名',
        dataIndex: 'rank',
        key: 'rank',
        sorter: (a, b) => a.rank - b.rank,
        width: 120,
      },
      {
        title: 'Bangumi 番组计划排名',
        dataIndex: 'bgmrank',
        key: 'bgmrank',
        sorter: (a, b) => a.bgmrank - b.bgmrank,
        width: 240,
      },
    ];
    return (
      <Content id="content">
        <SearchBar>
          <Input
            value={name}
            onChange={this.onSearch}
            placeholder="想要搜索的番剧名称，如“莉兹与青鸟”"/>
          {updateDate && (
            <DateLabel>
              排名更新时间：
              {updateDate}
            </DateLabel>
          )}
        </SearchBar>
        <Table
          dataSource={
            name
              ? dataSource.filter(itm =>
                itm.name.includes(name),
              )
              : dataSource
          }
          columns={columns}
          loading={isLoading}
          pagination={{
            pageSize: 20,
            pageSizeOptions: ['20', '50', '100'],
            showQuickJumper: true,
            showSizeChanger: true,
            onChange: this.onScrollToTop
          }}
        />
      </Content>
    );
  }
}

export default Ranking;
