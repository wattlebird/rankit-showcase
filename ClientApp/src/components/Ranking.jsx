import React from 'react';
import { Table, Input, message } from 'antd';
import styled from 'styled-components';
import API from '../api';

const Content = styled.div`
  margin: 4em auto 0;
  width: 67vw;
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

  render() {
    const { name, updateDate, dataSource, isLoading } = this.state;
    const columns = [
      {
        title: '番剧',
        dataIndex: 'name',
        key: 'name',
        render: (itm, rec) => (
          <a href={`http://chii.in/subject/${rec.id}`}>{itm}</a>
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
      <Content>
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
          }}
        />
      </Content>
    );
  }
}

export default Ranking;
