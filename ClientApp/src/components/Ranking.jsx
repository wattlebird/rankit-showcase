  import React from 'react'
  import { Table, Input, message } from 'antd'
  import styled from 'styled-components';
  import API from './../api'

  const Search = Input.Search;

  const Content = styled.div`
    margin: 4em auto 0;
    width: 67vw;
  `;

  const SearchBar = styled.div`
    display: flex;
    align-items: baseline;
  `;

  const Label = styled.span`
    flex-basis: 120px;
  `;

  class Ranking extends React.Component {
    state = {
      dataSource: [],
      isLoading: true,
      name: null
    }

    componentDidMount() {
      this.setState({
        isLoading: true
      })
      API.ReadAll().then(data => {
        this.setState({
          dataSource: data,
          isLoading: false
        })
        
      }, err => {
        this.setState({
          isLoading: false
        })
        message.error("加载失败，可能是网络问题，请稍后重试。")
        console.log(err)
      })
    }

    onSearch = (e) => {
      this.setState({
        name: e.target.value
      })
    }

    render() {
      const columns=[
        { title: '番剧', dataIndex: 'name', key: 'name', render: (itm, rec) => <a href={`http://chii.in/subject/${rec.id}`}>{itm}</a> },
        { title: '本站排名', dataIndex: 'rank', key: 'rank', sorter: (a, b) => a.rank - b.rank, width: 120 },
        { title: 'Bangumi 番组计划排名', dataIndex: 'bgmrank', key: 'bgmrank', sorter: (a, b) => a.bgmrank - b.bgmrank, width: 240 }
      ]
      return (<Content>
        <SearchBar>
          <Label>番剧名称：</Label><Input value={this.state.name} onChange={this.onSearch} />
        </SearchBar>
        <Table dataSource={this.state.name ? this.state.dataSource.filter(itm => itm.name.includes(this.state.name)) : this.state.dataSource}
          columns={columns}
          loading={this.state.isLoading}
          pagination={{
            pageSize:20,
            pageSizeOptions:['20', '50', '100'],
            showQuickJumper:true,
            showSizeChanger:true
          }}
        />
      </Content>)
    }
  }

  export default Ranking;